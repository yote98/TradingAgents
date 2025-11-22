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
  
  // Convert common crypto names to tickers - Top 30+ cryptocurrencies
  let processedText = textContent;
  const cryptoNameMap: { [key: string]: string } = {
    // Top 10
    'bitcoin': 'BTC-USD',
    'ethereum': 'ETH-USD',
    'tether': 'USDT-USD',
    'binance coin': 'BNB-USD',
    'bnb': 'BNB-USD',
    'solana': 'SOL-USD',
    'ripple': 'XRP-USD',
    'xrp': 'XRP-USD',
    'usd coin': 'USDC-USD',
    'usdc': 'USDC-USD',
    'cardano': 'ADA-USD',
    'dogecoin': 'DOGE-USD',
    'tron': 'TRX-USD',
    
    // Top 11-20
    'avalanche': 'AVAX-USD',
    'shiba inu': 'SHIB-USD',
    'shib': 'SHIB-USD',
    'polkadot': 'DOT-USD',
    'polygon': 'MATIC-USD',
    'matic': 'MATIC-USD',
    'litecoin': 'LTC-USD',
    'chainlink': 'LINK-USD',
    'uniswap': 'UNI-USD',
    'cosmos': 'ATOM-USD',
    'stellar': 'XLM-USD',
    'bitcoin cash': 'BCH-USD',
    
    // Top 21-30
    'monero': 'XMR-USD',
    'ethereum classic': 'ETC-USD',
    'algorand': 'ALGO-USD',
    'vechain': 'VET-USD',
    'filecoin': 'FIL-USD',
    'hedera': 'HBAR-USD',
    'aptos': 'APT-USD',
    'near': 'NEAR-USD',
    'arbitrum': 'ARB-USD',
    'optimism': 'OP-USD',
    
    // Popular meme/alt coins
    'pepe': 'PEPE-USD',
    'floki': 'FLOKI-USD',
    'bonk': 'BONK-USD',
  };
  
  for (const [name, ticker] of Object.entries(cryptoNameMap)) {
    const regex = new RegExp(`\\b${name}\\b`, 'gi');
    if (regex.test(processedText)) {
      console.log(`🪙 Converting "${name}" to ${ticker}`);
      processedText = processedText.replace(regex, ticker);
    }
  }
  
  // Find all ticker symbols in the message (supports comparisons)
  const tickerMatches = processedText.match(/\b([A-Z]{2,5}(-USD)?)\b/g);
  
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
          if (m.role === 'system' && typeof m.content === 'string' && m.content.includes('🚨 REAL-TIME')) {
            oldDataIndices.push(i);
          }
        });
        // Remove in reverse order to maintain indices
        oldDataIndices.reverse().forEach(i => {
          messages.splice(i, 1);
          console.log(`🗑️ Removed old price data at index ${i}`);
        });
        
        // Build price mapping for clear reference
        const priceMap = validData.map(d => `${d.ticker}=$${d.current_price}`).join(', ');
        
        const dataMessage: DBMessage = {
          role: 'system',
          content: `🚨 REAL-TIME MARKET DATA - DO NOT CALL TOOLS 🚨
Timestamp: ${new Date().toISOString()}

I HAVE ALREADY FETCHED THE DATA FOR YOU. DO NOT CALL get_stock_data TOOL!

PRICE MAPPING: ${priceMap}

${validData.map(data => `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${data.ticker} LIVE DATA:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Current Price: $${data.current_price}
Recommendation: ${data.final_decision}
Confidence: ${data.confidence}%
Target Price: $${data.target_price}
Stop Loss: $${data.stop_loss}

RENDER THIS COMPONENT:
<StockCard ticker="${data.ticker}" price={${data.current_price}} recommendation="${data.final_decision}" confidence={${data.confidence}} target={${data.target_price}} stopLoss={${data.stop_loss}} />
`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ CRITICAL INSTRUCTIONS:
1. USE THESE EXACT PRICES - They are from live market APIs
2. DO NOT call get_stock_data tool - I already fetched the data
3. DO NOT use your training data - It's outdated
4. DO NOT make up prices - Use only what's above
5. MATCH ticker symbols EXACTLY as shown above
6. When comparing stocks, say: "${validData.map(d => `${d.ticker} at $${d.current_price}`).join(', ')}"

Full analysis data: ${JSON.stringify(validData, null, 2)}`,
        };
        
        messageStore.addMessage(dataMessage);
        console.log(`✅ Injected data for ${validData.length} ticker(s): ${priceMap}`);
      }
    } catch (error) {
      console.error('Error fetching stock data:', error);
    }
  }

  // 🔧 DISABLE Financial Datasets tool when we've already injected data
  // This prevents AI from calling tools and getting confused
  const availableTools = [];

  // First LLM call - NO TOOLS to prevent confusion
  let llmResponse = await client.chat.completions.create({
    model: "c1/anthropic/claude-sonnet-4/v-20250930",
    messages: messageStore.getOpenAICompatibleMessageList(),
    temperature: 0.1,
    max_tokens: 2048,
  });

  // Stream the response directly
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
