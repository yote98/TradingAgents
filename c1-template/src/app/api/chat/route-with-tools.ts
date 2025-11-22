import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { transformStream } from "@crayonai/stream";
import { DBMessage, getMessageStore } from "./messageStore";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { financialDatasetsTool, executeFinancialDatasetsTool } from "./tools/financialDatasets";

// Define StockCard component schema
const StockCardSchema = z.object({
  ticker: z.string().describe("Stock ticker symbol (e.g., AAPL, TSLA)"),
  price: z.number().describe("Current stock price (real-time)"),
  change: z.number().optional().describe("Price change in dollars"),
  changePercent: z.number().optional().describe("Price change percentage"),
  recommendation: z.enum(["BUY", "SELL", "HOLD"]).optional().describe("Trading recommendation"),
  confidence: z.number().optional().describe("Confidence level 0-100"),
  target: z.number().optional().describe("Target price"),
  stopLoss: z.number().optional().describe("Stop loss price"),
}).describe("Displays a stock analysis card with real-time price, recommendation, and trading levels. Use this component to show stock prices instead of typing them as text.");

const CUSTOM_COMPONENT_SCHEMAS = {
  StockCard: zodToJsonSchema(StockCardSchema),
};

// CRITICAL: Disable ALL caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function POST(req: NextRequest) {
  const { prompt, threadId, responseId } = (await req.json()) as {
    prompt: DBMessage;
    threadId: string;
    responseId: string;
  };

  // Thesys uses OpenAI-compatible API with their base URL
  const client = new OpenAI({
    apiKey: process.env.THESYS_API_KEY!,
    baseURL: "https://api.thesys.dev/v1/embed",
  });

  const messageStore = getMessageStore(threadId);
  
  // Add user message to store
  messageStore.addMessage(prompt);
  
  // 🔧 Add Financial Datasets tool for automatic data fetching
  const availableTools = [
    financialDatasetsTool,
  ];

  console.log(`📝 User message: "${typeof prompt.content === 'string' ? prompt.content : JSON.stringify(prompt.content)}"`);

  // First LLM call - may trigger tool calls
  let llmResponse = await client.chat.completions.create({
    model: "c1/anthropic/claude-sonnet-4/v-20250930",
    messages: messageStore.getOpenAICompatibleMessageList(),
    tools: availableTools, // 🎯 AI can now call tools automatically!
    temperature: 0.1,
    max_tokens: 2048,
  });

  // Check if AI wants to call tools
  const firstChoice = llmResponse.choices[0];
  
  if (firstChoice.finish_reason === 'tool_calls' && firstChoice.message.tool_calls) {
    console.log(`🔧 AI requested ${firstChoice.message.tool_calls.length} tool call(s)`);
    
    // Execute all tool calls
    const toolResults = await Promise.all(
      firstChoice.message.tool_calls.map(async (toolCall) => {
        console.log(`🔧 Executing tool: ${toolCall.function.name}`);
        console.log(`📊 Arguments:`, toolCall.function.arguments);
        
        try {
          const args = JSON.parse(toolCall.function.arguments);
          const result = await executeFinancialDatasetsTool(args);
          
          console.log(`✅ Tool result:`, result);
          
          return {
            tool_call_id: toolCall.id,
            role: 'tool' as const,
            name: toolCall.function.name,
            content: JSON.stringify(result),
          };
        } catch (error) {
          console.error(`❌ Tool execution failed:`, error);
          return {
            tool_call_id: toolCall.id,
            role: 'tool' as const,
            name: toolCall.function.name,
            content: JSON.stringify({ error: String(error) }),
          };
        }
      })
    );
    
    // Add assistant message with tool calls
    messageStore.addMessage({
      role: 'assistant',
      content: firstChoice.message.content || '',
      tool_calls: firstChoice.message.tool_calls,
    });
    
    // Add tool results
    toolResults.forEach(result => {
      messageStore.addMessage(result as any);
    });
    
    // Second LLM call with tool results - now stream the response
    const llmStream = await client.chat.completions.create({
      model: "c1/anthropic/claude-sonnet-4/v-20250930",
      messages: messageStore.getOpenAICompatibleMessageList(),
      stream: true,
      temperature: 0.1,
      max_tokens: 2048,
    });
    
    const responseStream = transformStream(
      llmStream,
      (chunk) => {
        return chunk.choices?.[0]?.delta?.content ?? "";
      },
      {
        onEnd: ({ accumulated }) => {
          const message = accumulated.filter((chunk) => chunk).join("");
          messageStore.addMessage({
            role: "assistant",
            content: message,
            id: responseId,
          });
        },
      }
    ) as ReadableStream<string>;

    return new NextResponse(responseStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        "Pragma": "no-cache",
        "Expires": "0",
        Connection: "keep-alive",
      },
    });
  }
  
  // No tool calls - stream the response directly
  const llmStream = await client.chat.completions.create({
    model: "c1/anthropic/claude-sonnet-4/v-20250930",
    messages: messageStore.getOpenAICompatibleMessageList(),
    tools: availableTools,
    stream: true,
    temperature: 0.1,
    max_tokens: 2048,
  });

  const responseStream = transformStream(
    llmStream,
    (chunk) => {
      return chunk.choices?.[0]?.delta?.content ?? "";
    },
    {
      onEnd: ({ accumulated }) => {
        const message = accumulated.filter((chunk) => chunk).join("");
        messageStore.addMessage({
          role: "assistant",
          content: message,
          id: responseId,
        });
      },
    }
  ) as ReadableStream<string>;

  return new NextResponse(responseStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      "Pragma": "no-cache",
      "Expires": "0",
      Connection: "keep-alive",
    },
  });
}
