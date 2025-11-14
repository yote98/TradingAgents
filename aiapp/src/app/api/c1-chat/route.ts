import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { transformStream } from "@crayonai/stream";

// Simple in-memory message store for this demo
const messagesStore: {
  [threadId: string]: any[];
} = {};

function getMessageStore(threadId: string) {
  if (!messagesStore[threadId]) {
    messagesStore[threadId] = [{
      role: "system",
      content: "You are a helpful AI trading assistant powered by TradingAgents."
    }];
  }
  return messagesStore[threadId];
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, threadId, responseId } = await req.json();
    
    const client = new OpenAI({
      baseURL: "https://api.thesys.dev/v1/embed",
      apiKey: process.env.THESYS_API_KEY,
    });
    
    const messages = getMessageStore(threadId);
    messages.push(prompt);

    const llmStream = await client.chat.completions.create({
      model: "c1/anthropic/claude-sonnet-4/v-20250617",
      messages: messages,
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
          messages.push({
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
  } catch (error) {
    console.error("C1 Chat Error:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}
