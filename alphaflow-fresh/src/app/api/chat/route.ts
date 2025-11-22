import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { transformStream } from "@crayonai/stream";
import { DBMessage, getMessageStore } from "./messageStore";
import { getAlphaVantageMCP } from "./mcp";

const SYSTEM_PROMPT = `You are AlphaFlow AI, a real-time stock analysis assistant powered by 5 specialized analysts.

When users ask about stock prices or analysis:
1. Use the mcp_alphavantage_GLOBAL_QUOTE tool to get real-time stock prices
2. Always show the EXACT price from the tool response
3. Never make up or estimate prices

Available MCP Tools:
- mcp_alphavantage_GLOBAL_QUOTE: Get real-time stock quotes (price, volume, change)
- mcp_alphavantage_COMPANY_OVERVIEW: Get company fundamentals
- mcp_alphavantage_NEWS_SENTIMENT: Get news and sentiment

Example: When asked "what's NVDA price?", call mcp_alphavantage_GLOBAL_QUOTE with symbol="NVDA" and report the exact price.

Be concise, accurate, and always use real-time data from MCP tools.`;

export async function POST(req: NextRequest) {
  const { prompt, threadId, responseId } = (await req.json()) as {
    prompt: DBMessage;
    threadId: string;
    responseId: string;
  };
  const client = new OpenAI({
    baseURL: "https://api.thesys.dev/v1/embed/",
    apiKey: process.env.THESYS_API_KEY,
  });
  const messageStore = getMessageStore(threadId);

  // Add system prompt if this is a new thread
  if (messageStore.messageList.length === 0) {
    messageStore.addMessage({
      role: "system",
      content: SYSTEM_PROMPT,
    });
  }

  messageStore.addMessage(prompt);

  // Auto-detect stock symbols and fetch real-time data
  const userMessage = typeof prompt.content === 'string' ? prompt.content : '';
  const tickerMatch = userMessage.match(/\b([A-Z]{2,5})\b/);
  
  if (tickerMatch) {
    const ticker = tickerMatch[1];
    console.log(`🎯 Detected ticker: ${ticker}`);
    
    try {
      // Fetch real-time quote from our MCP proxy
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3002';
      const quoteResponse = await fetch(`${baseUrl}/api/mcp/quote?symbol=${ticker}`);
      
      if (quoteResponse.ok) {
        const quoteData = await quoteResponse.json();
        console.log(`✅ Got real-time price for ${ticker}: $${quoteData.price}`);
        
        // Inject real-time data into conversation
        messageStore.addMessage({
          role: 'system',
          content: `REAL-TIME DATA for ${ticker}:
- Current Price: $${quoteData.price}
- Change: ${quoteData.change > 0 ? '+' : ''}${quoteData.change} (${quoteData.changePercent}%)
- Volume: ${quoteData.volume.toLocaleString()}
- Timestamp: ${quoteData.timestamp}

USE THIS EXACT PRICE IN YOUR RESPONSE. This is live market data.`,
        });
      }
    } catch (error) {
      console.error('Failed to fetch quote:', error);
    }
  }

  const llmStream = await client.chat.completions.create({
    model: "c1/openai/gpt-5/v-20250915",
    messages: messageStore.getOpenAICompatibleMessageList(),
    stream: true,
  });

  const responseStream = transformStream(
    llmStream,
    (chunk) => {
      return chunk.choices?.[0]?.delta?.content ?? "";
    },
    {
      onEnd: ({ accumulated }) => {
        const message = accumulated.filter((message) => message).join("");
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
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
