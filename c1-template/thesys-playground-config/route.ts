import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { transformStream } from "@crayonai/stream";
import { DBMessage, getMessageStore } from "./messageStore";
import { tools } from "./tools";

export async function POST(req: NextRequest) {
  const { prompt, threadId, responseId } = (await req.json()) as {
    prompt: DBMessage;
    threadId: string;
    responseId: string;
  };
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    // No baseURL needed - defaults to OpenAI
  });
  const messageStore = getMessageStore(threadId);

  messageStore.addMessage(prompt);

  const llmStream = await client.beta.chat.completions.runTools({
    model: "gpt-4o", // OpenAI's flagship model
    temperature: 0.1, // Low for factual responses
    messages: messageStore.getOpenAICompatibleMessageList(),
    stream: true,
    tool_choice: tools.length > 0 ? "auto" : "none",
    tools,
  });

  const responseStream = transformStream(
    llmStream,
    (chunk) => {
      return chunk.choices?.[0]?.delta?.content ?? "";
    },
    {
      onEnd: ({ accumulated }) => {
        const message = accumulated.filter((message) => {
          return message;
        }).join("");
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
