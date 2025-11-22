import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { transformStream } from "@crayonai/stream";
import { DBMessage, getMessageStore } from "./messageStore";
import { tools } from "./tools";
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
  
  // 🚀 AUTO-DETECT STOCK ANALYSIS REQUESTS - SUPPORT SINGLE & MULTIPLE STOCKS
  const userMessage = typeof prompt.content === 'string' ? prompt.content : '';
  console.log(`📝 User message: "${userMessage}"`);
  
  // Extract text from XML tags if present (C1 format: <content>text</content>)
  const textContent = userMessage.match(/<content>(.*?)<\/content>/i)?.[1] || userMessage;
  console.log(`📝 Extracted text: "${textContent}"`);
  
  // Find all ticker symbols in the message (supports comparisons)
  const tickerMatches = textContent.match(/\b([A-Z]{2,5}(-USD)?)\b/g);
  
  if (tickerMatches && tickerMatches.length > 0) {
    const tickers = [...new Set(tickerMatches)]; // Remove duplicates
    console.log(`🎯 FOUND ${tickers.length} TICKER(S): ${tickers.join(', ')}`);
    
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      
      // Limit to max 3 tickers to prevent timeout
      const limitedTickers = tickers.slice(0, 3);
      if (tickers.length > 3) {
        console.log(`⚠️ Too many tickers (${tickers.length}), limiting to first 3: ${limitedTickers.join(', ')}`);
      }
      
      // Check if this is a simple price question (use quick quote endpoint)
      const isSimplePriceQuestion = /\b(price|current|quote|trading at|worth)\b/i.test(textContent);
      
      // Fetch data for tickers in parallel with timeout
      // CRITICAL: Preserve the requested ticker symbol to prevent mixing
      const dataPromises = limitedTickers.map(requestedTicker =>
        Promise.race([
          isSimplePriceQuestion
            ? // Use quick quote endpoint for simple price questions
              fetch(`${baseUrl}/api/quote?symbol=${requestedTicker}&_t=${Date.now()}`, {
                headers: { 'Content-Type': 'application/json' },
                cache: 'no-store',
              }).then(res => res.ok ? res.json().then(data => ({
                ticker: requestedTicker, // Use requested ticker, not response ticker
                current_price: data.price,
                final_decision: 'HOLD',
                confidence: 50,
                target_price: data.price,
                stop_loss: data.price * 0.95,
                quote: data,
              })) : null)
            : // Use full analysis for complex questions
              fetch(`${baseUrl}/api/analyze?_t=${Date.now()}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ticker: requestedTicker }),
                cache: 'no-store',
              }).then(res => res.ok ? res.json().then(data => ({
                ...data,
                ticker: requestedTicker, // Ensure ticker matches request
              })) : null),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), isSimplePriceQuestion ? 5000 : 15000))
        ]).catch(err => {
          console.error(`Failed to fetch ${requestedTicker}:`, err.message);
          return null;
        })
      );
      
      const allData = await Promise.all(dataPromises);
      
      // Inject real-time data for all tickers
      const validData = allData.filter(d => d !== null);
      
      if (validData.length > 0) {
        // CRITICAL: Remove any old price data from message store to prevent stale data
        const messages = messageStore.messageList;
        const oldDataIndices: number[] = [];
        messages.forEach((m, i) => {
          if (m.role === 'system' && typeof m.content === 'string' && m.content.includes('🚨 REAL-TIME DATA')) {
            oldDataIndices.push(i);
          }
        });
        // Remove in reverse order to maintain indices
        oldDataIndices.reverse().forEach(i => {
          messages.splice(i, 1);
          console.log(`🗑️ Removed old price data at index ${i}`);
        });
        
        const dataMessage: DBMessage = {
          role: 'system',
          content: `🚨 REAL-TIME DATA (${new Date().toISOString()}) 🚨

${validData.map(data => `
${data.ticker}:
- Current Price: $${data.current_price}
- Recommendation: ${data.final_decision}
- Confidence: ${data.confidence}%
- Target: $${data.target_price}
- Stop Loss: $${data.stop_loss}

<StockCard ticker="${data.ticker}" price={${data.current_price}} recommendation="${data.final_decision}" confidence={${data.confidence}} target={${data.target_price}} stopLoss={${data.stop_loss}} />
`).join('\n')}

CRITICAL: Use these EXACT prices in your response! This is real-time market data.

Full analysis data: ${JSON.stringify(validData, null, 2)}`,
        };
        
        messageStore.addMessage(dataMessage);
        console.log(`✅ Injected data for ${validData.length} ticker(s): ${validData.map(d => `${d.ticker}=$${d.current_price}`).join(', ')}`);
      }
    } catch (error) {
      console.error('Error fetching stock data:', error);
    }
  }

  // 🔧 Add Financial Datasets tool for automatic data fetching
  const availableTools = [
    financialDatasetsTool,
  ];

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
