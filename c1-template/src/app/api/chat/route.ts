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
  price: z.number().describe("Current stock price from MarketData.app"),
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
