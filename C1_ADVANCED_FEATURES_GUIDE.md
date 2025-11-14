# C1 Advanced Features Guide

## Overview

This guide covers advanced C1 features to enhance your trading chat interface:
- **Thread Persistence**: Save conversation history
- **Thread Sharing**: Generate shareable links
- **Custom Components**: Sidebar, thread list, custom header
- **Message Storage**: Database integration

## Architecture

```
User Chat
    ↓
Thread Manager (manages current conversation)
    ↓
Thread List Manager (manages all conversations)
    ↓
Message Store (persists to database)
    ↓
Share Thread (generates shareable links)
```

## Implementation

### Step 1: Create Message Store

Create `aiapp/src/lib/messageStore.ts`:

```typescript
import type { Message } from "@crayonai/react-core";

// In-memory store (replace with database in production)
const messagesStore: {
  [threadId: string]: Message[];
} = {};

export interface MessageStore {
  addMessage: (message: Message) => void;
  messageList: Message[];
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  deleteMessage: (messageId: string) => void;
}

export const getMessageStore = (threadId: string): MessageStore => {
  // Initialize thread if it doesn't exist
  if (!messagesStore[threadId]) {
    messagesStore[threadId] = [];
  }

  return {
    addMessage: (message: Message) => {
      messagesStore[threadId].push(message);
      // TODO: Save to database
      // await db.messages.create({ threadId, ...message });
    },
    
    messageList: messagesStore[threadId],
    
    updateMessage: (messageId: string, updates: Partial<Message>) => {
      const index = messagesStore[threadId].findIndex(m => m.id === messageId);
      if (index !== -1) {
        messagesStore[threadId][index] = {
          ...messagesStore[threadId][index],
          ...updates
        };
        // TODO: Update in database
      }
    },
    
    deleteMessage: (messageId: string) => {
      messagesStore[threadId] = messagesStore[threadId].filter(
        m => m.id !== messageId
      );
      // TODO: Delete from database
    }
  };
};

// Get all thread IDs (for thread list)
export const getAllThreadIds = (): string[] => {
  return Object.keys(messagesStore);
};

// Get thread metadata
export const getThreadMetadata = (threadId: string) => {
  const messages = messagesStore[threadId] || [];
  const firstMessage = messages.find(m => m.role === "user");
  
  return {
    id: threadId,
    title: firstMessage?.content?.substring(0, 50) || "New Chat",
    lastMessage: messages[messages.length - 1]?.content || "",
    timestamp: messages[messages.length - 1]?.timestamp || Date.now(),
    messageCount: messages.length
  };
};
```

### Step 2: Create Thread Managers

Create `aiapp/src/lib/threadManagers.ts`:

```typescript
import { useState, useCallback } from "react";
import type { Message } from "@crayonai/react-core";
import { getMessageStore, getAllThreadIds, getThreadMetadata } from "./messageStore";

export const useThreadManager = (threadId: string) => {
  const messageStore = getMessageStore(threadId);
  const [messages, setMessages] = useState<Message[]>(messageStore.messageList);

  const addMessage = useCallback((message: Message) => {
    messageStore.addMessage(message);
    setMessages([...messageStore.messageList]);
  }, [messageStore]);

  const updateMessage = useCallback((messageId: string, updates: Partial<Message>) => {
    messageStore.updateMessage(messageId, updates);
    setMessages([...messageStore.messageList]);
  }, [messageStore]);

  const deleteMessage = useCallback((messageId: string) => {
    messageStore.deleteMessage(messageId);
    setMessages([...messageStore.messageList]);
  }, [messageStore]);

  return {
    messages,
    addMessage,
    updateMessage,
    deleteMessage
  };
};

export const useThreadListManager = () => {
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [threads, setThreads] = useState(() => {
    return getAllThreadIds().map(id => getThreadMetadata(id));
  });

  const createNewThread = useCallback(() => {
    const newThreadId = `thread_${Date.now()}`;
    setSelectedThreadId(newThreadId);
    setThreads(prev => [...prev, getThreadMetadata(newThreadId)]);
    return newThreadId;
  }, []);

  const selectThread = useCallback((threadId: string) => {
    setSelectedThreadId(threadId);
  }, []);

  const deleteThread = useCallback((threadId: string) => {
    setThreads(prev => prev.filter(t => t.id !== threadId));
    if (selectedThreadId === threadId) {
      setSelectedThreadId(null);
    }
  }, [selectedThreadId]);

  const refreshThreads = useCallback(() => {
    setThreads(getAllThreadIds().map(id => getThreadMetadata(id)));
  }, []);

  return {
    threads,
    selectedThreadId,
    createNewThread,
    selectThread,
    deleteThread,
    refreshThreads
  };
};
```

### Step 3: Update Chat API with Message Persistence

Update `aiapp/src/app/api/chat/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { systemPrompt } from "./systemPrompt";
import { tools } from "./tools";
import { getMessageStore } from "@/lib/messageStore";

const client = new OpenAI({
  apiKey: process.env.THESYS_API_KEY,
  baseURL: 'https://api.thesys.dev/v1/embed',
});

export async function POST(req: NextRequest) {
  try {
    const { messages, threadId } = await req.json();

    if (!threadId) {
      return NextResponse.json(
        { error: "Thread ID is required" },
        { status: 400 }
      );
    }

    // Get message store for this thread
    const messageStore = getMessageStore(threadId);

    // Save user message
    const userMessage = messages[messages.length - 1];
    messageStore.addMessage({
      id: `msg_${Date.now()}`,
      role: "user",
      content: userMessage.content,
      timestamp: Date.now()
    });

    // Call C1 API with tools and streaming
    const llmStream = await client.beta.chat.completions.runTools({
      model: "c1/anthropic/claude-sonnet-4/v-20250617",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages
      ],
      tools,
      stream: true,
    });

    // Accumulate assistant response for storage
    let assistantResponse = "";

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of llmStream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              assistantResponse += content;
              controller.enqueue(new TextEncoder().encode(content));
            }
          }

          // Save complete assistant message
          messageStore.addMessage({
            id: `msg_${Date.now()}`,
            role: "assistant",
            content: assistantResponse,
            timestamp: Date.now()
          });

          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new NextResponse(stream, {
      headers: { 
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}
```

### Step 4: Create Share Thread API

Create `aiapp/src/app/api/share/[threadId]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getMessageStore } from "@/lib/messageStore";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const { threadId } = await params;

    if (!threadId) {
      return NextResponse.json(
        { error: "Thread ID is required" },
        { status: 400 }
      );
    }

    const messageStore = getMessageStore(threadId);

    if (!messageStore.messageList || messageStore.messageList.length === 0) {
      return NextResponse.json(
        { error: "Thread not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(messageStore.messageList);
  } catch (error) {
    console.error("Share API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch thread" },
      { status: 500 }
    );
  }
}
```

### Step 5: Create Shared Thread Viewer

Create `aiapp/src/app/shared/[threadId]/page.tsx`:

```typescript
"use client";

import { use, useEffect, useState } from "react";
import type { Message } from "@crayonai/react-core";
import { C1ChatViewer, ThemeProvider } from "@thesysai/genui-sdk";
import "@crayonai/react-ui/styles/index.css";

function Loader() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-900">
      <div className="text-center">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
        <p className="text-gray-400">Loading conversation...</p>
      </div>
    </div>
  );
}

export default function ViewSharedPage({
  params,
}: {
  params: Promise<{ threadId: string }>;
}) {
  const { threadId } = use(params);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/share/${threadId}`);
        
        if (!response.ok) {
          throw new Error("Failed to load conversation");
        }
        
        const data = await response.json();
        setMessages(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [threadId]);

  if (loading) return <Loader />;
  
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <a href="/" className="text-green-500 hover:underline">
            Go back home
          </a>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider
      theme={{
        colors: {
          primary: "#10b981",
          background: "#111827",
          surface: "#1f2937",
          text: "#f9fafb",
        },
      }}
    >
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900">
        <C1ChatViewer messages={messages} />
      </div>
    </ThemeProvider>
  );
}
```

### Step 6: Update Main Chat Page with Full Features

Update `aiapp/src/app/page.tsx`:

```typescript
"use client";

import { useState, useEffect } from "react";
import {
  C1Chat,
  ChatProvider,
  Container,
  SidebarContainer,
  SidebarHeader,
  SidebarContent,
  NewChatButton,
  SidebarSeparator,
  ThreadList,
  ThreadContainer,
  MobileHeader,
  ScrollArea,
  Messages,
  Composer,
  C1ShareThread,
  ThemeProvider
} from "@thesysai/genui-sdk";
import "@crayonai/react-ui/styles/index.css";
import { useThreadManager, useThreadListManager } from "@/lib/threadManagers";

export default function Home() {
  const threadListManager = useThreadListManager();
  const selectedThreadId = threadListManager.selectedThreadId;
  
  // Create initial thread if none exists
  useEffect(() => {
    if (!selectedThreadId && threadListManager.threads.length === 0) {
      threadListManager.createNewThread();
    }
  }, []);

  const threadManager = useThreadManager(selectedThreadId || "");

  return (
    <ThemeProvider
      theme={{
        colors: {
          primary: "#10b981",
          background: "#111827",
          surface: "#1f2937",
          text: "#f9fafb",
        },
        typography: {
          fontFamily: "Inter, system-ui, sans-serif",
        },
      }}
    >
      <ChatProvider
        threadListManager={threadListManager}
        threadManager={threadManager}
      >
        <Container
          logoUrl="/logo.png"
          agentName="TradingAgents AI"
        >
          {/* Sidebar with thread list */}
          <SidebarContainer>
            <SidebarHeader />
            <SidebarContent>
              <NewChatButton />
              <SidebarSeparator />
              <ThreadList />
            </SidebarContent>
          </SidebarContainer>

          {/* Main chat area */}
          <ThreadContainer>
            <MobileHeader />
            
            {/* Share button in header */}
            <div className="flex w-full items-center justify-end p-4 border-b border-gray-800">
              <C1ShareThread
                generateShareLink={
                  !selectedThreadId
                    ? undefined
                    : async () => {
                        const baseUrl = window.location.origin;
                        return `${baseUrl}/shared/${selectedThreadId}`;
                      }
                }
              />
            </div>

            {/* Messages area */}
            <ScrollArea>
              <Messages />
            </ScrollArea>

            {/* Input composer */}
            <Composer 
              placeholder="Ask me to analyze a stock... (e.g., 'Analyze AAPL')"
            />
          </ThreadContainer>
        </Container>
      </ChatProvider>
    </ThemeProvider>
  );
}
```

### Step 7: Add Database Integration (Production)

For production, replace the in-memory store with a real database:

```typescript
// Example with Prisma
// prisma/schema.prisma

model Thread {
  id        String    @id @default(cuid())
  title     String
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  messages  Message[]
}

model Message {
  id        String   @id @default(cuid())
  threadId  String
  thread    Thread   @relation(fields: [threadId], references: [id])
  role      String
  content   String   @db.Text
  timestamp DateTime @default(now())
}
```

```typescript
// lib/messageStore.ts (with Prisma)
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getMessageStore = (threadId: string) => {
  return {
    addMessage: async (message: Message) => {
      await prisma.message.create({
        data: {
          threadId,
          role: message.role,
          content: message.content,
          timestamp: new Date(message.timestamp)
        }
      });
    },
    
    messageList: await prisma.message.findMany({
      where: { threadId },
      orderBy: { timestamp: 'asc' }
    }),
    
    // ... other methods
  };
};
```

## Features Summary

### Thread Persistence
- ✅ Conversations saved automatically
- ✅ Resume conversations anytime
- ✅ Thread list in sidebar
- ✅ Create new threads

### Thread Sharing
- ✅ Generate shareable links
- ✅ View-only mode for shared threads
- ✅ Copy link to clipboard
- ✅ Share modal UI

### Custom Components
- ✅ Sidebar with thread list
- ✅ Custom header with share button
- ✅ Mobile-responsive layout
- ✅ Branded theme

### Message Storage
- ✅ In-memory store (development)
- ✅ Database integration (production)
- ✅ Message CRUD operations
- ✅ Thread metadata

## Testing

### Test Thread Persistence

1. Start a conversation: "Analyze AAPL"
2. Create a new thread (click "New Chat")
3. Start another conversation: "Analyze TSLA"
4. Switch between threads in sidebar
5. Verify messages persist

### Test Thread Sharing

1. Have a conversation with multiple messages
2. Click the share button in header
3. Copy the generated link
4. Open link in incognito/private window
5. Verify read-only view shows all messages

### Test Mobile Responsiveness

1. Open on mobile device or resize browser
2. Verify sidebar collapses to hamburger menu
3. Test thread switching on mobile
4. Verify share button works on mobile

## Production Checklist

- [ ] Replace in-memory store with database (Prisma, MongoDB, etc.)
- [ ] Add authentication (only share your own threads)
- [ ] Add thread privacy settings (public/private)
- [ ] Implement thread search
- [ ] Add thread deletion confirmation
- [ ] Set up database backups
- [ ] Add rate limiting on share endpoint
- [ ] Implement thread expiration (optional)
- [ ] Add analytics tracking
- [ ] Test with real users

## Advanced Customization

### Custom Share Button

```typescript
<C1ShareThread
  customTrigger={
    <button className="flex items-center gap-2 px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700">
      <ShareIcon />
      Share Analysis
    </button>
  }
  generateShareLink={async () => {
    // Your logic
  }}
/>
```

### Custom Thread List Item

```typescript
<ThreadList
  renderThreadItem={(thread) => (
    <div className="flex items-center justify-between p-3 hover:bg-gray-800 rounded-lg">
      <div>
        <h3 className="font-semibold">{thread.title}</h3>
        <p className="text-sm text-gray-400">{thread.messageCount} messages</p>
      </div>
      <button onClick={() => deleteThread(thread.id)}>
        <TrashIcon />
      </button>
    </div>
  )}
/>
```

### Custom Welcome Message

```typescript
<Composer 
  placeholder="Ask me anything about stocks..."
  welcomeMessage={
    <div className="text-center p-8">
      <h2 className="text-2xl font-bold mb-4">Welcome to TradingAgents AI</h2>
      <p className="text-gray-400 mb-6">
        I can analyze stocks, check sentiment, backtest strategies, and more.
      </p>
      <div className="grid grid-cols-2 gap-4">
        <button className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700">
          Analyze AAPL
        </button>
        <button className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700">
          Check TSLA sentiment
        </button>
      </div>
    </div>
  }
/>
```

## Next Steps

1. **Implement the basic features** from C1_COMPLETE_IMPLEMENTATION_GUIDE.md
2. **Add thread persistence** using this guide
3. **Enable thread sharing** for collaboration
4. **Customize the UI** to match your brand
5. **Deploy to production** with database

## Resources

- Main Implementation Guide: `C1_COMPLETE_IMPLEMENTATION_GUIDE.md`
- Thesys C1 Docs: https://docs.thesys.dev
- Example Project: https://github.com/thesysdev/examples/tree/main/sharing-generated-ui
- Your MCP Server: `mcp_server/`

## Summary

With these advanced features, your TradingAgents chat becomes a full-featured application:
- Users can save and resume conversations
- Share analysis with colleagues
- Professional UI with sidebar navigation
- Production-ready with database integration

This creates a complete, shareable trading analysis platform powered by AI.
