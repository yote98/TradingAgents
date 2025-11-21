import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { transformStream } from "@crayonai/stream";
import { DBMessage, getMessageStore } from "./messageStore";
import { tools } from "./tools";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

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

export async function POST(req: NextRequest) {
  const { prompt, threadId, responseId } = (await req.json()) as {
    prompt: DBMessage;
    threadId: string;
    responseId: string;
  };

  const client = new OpenAI({
    baseURL: "https://api.thesys.dev/v1/embed",
    apiKey: process.env.THESYS_API_KEY,
  });

  const messageStore = getMessageStore(threadId);
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
      const dataPromises = limitedTickers.map(ticker =>
        Promise.race([
          isSimplePriceQuestion
            ? // Use quick quote endpoint for simple price questions
              fetch(`${baseUrl}/api/quote?symbol=${ticker}`, {
                headers: { 'Content-Type': 'application/json' },
              }).then(res => res.ok ? res.json().then(data => ({
                ticker: data.symbol,
                current_price: data.price,
                final_decision: 'HOLD',
                confidence: 50,
                target_price: data.price,
                stop_loss: data.price * 0.95,
                quote: data,
              })) : null)
            : // Use full analysis for complex questions
              fetch(`${baseUrl}/api/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ticker }),
              }).then(res => res.ok ? res.json() : null),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), isSimplePriceQuestion ? 5000 : 15000))
        ]).catch(err => {
          console.error(`Failed to fetch ${ticker}:`, err.message);
          return null;
        })
      );
      
      const allData = await Promise.all(dataPromises);
      
      // Inject real-time data for all tickers
      const validData = allData.filter(d => d !== null);
      
      if (validData.length > 0) {
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

  const llmStream = await client.chat.completions.create({
    model: "c1/anthropic/claude-sonnet-4/v-20250617",
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
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
