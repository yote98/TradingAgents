# Customizing C1Chat - Complete Guide

## Overview

The C1Chat component from Thesys is highly customizable. This guide covers all customization options, from basic theming to advanced integrations.

## Table of Contents

1. [Basic Setup](#basic-setup)
2. [Visual Customization](#visual-customization)
3. [Functional Customization](#functional-customization)
4. [Advanced Features](#advanced-features)
5. [Integration Patterns](#integration-patterns)
6. [Best Practices](#best-practices)

---

## Basic Setup

### Installation

```bash
npm install @thesysai/genui-sdk
# or
yarn add @thesysai/genui-sdk
```

### Minimal Implementation

```tsx
import { C1Chat } from "@thesysai/genui-sdk";

export default function ChatPage() {
  return <C1Chat />;
}
```

This minimal setup:
- Auto-detects `/api/chat` route
- Uses default styling
- Handles message processing automatically

---

## Visual Customization

### Method 1: CSS Variables (Recommended)

Apply CSS variables to the parent container:

```tsx
<div 
  style={{
    flex: 1,
    ['--c1-primary-color' as string]: '#14b8a6',
    ['--c1-background-color' as string]: '#0d1b1b',
    ['--c1-text-color' as string]: '#ffffff',
    ['--c1-input-background' as string]: 'rgba(255, 255, 255, 0.95)',
    ['--c1-message-background' as string]: 'rgba(20, 184, 166, 0.15)',
  } as React.CSSProperties}
>
  <C1Chat />
</div>
```

### Available CSS Variables

#### Core Colors
```css
--c1-primary-color: #14b8a6;           /* Main accent color */
--c1-background-color: #0d1b1b;        /* Chat background */
--c1-text-color: #ffffff;              /* Text color */
--c1-secondary-color: #64748b;         /* Secondary elements */
--c1-border-color: rgba(255,255,255,0.1); /* Borders */
--c1-hover-color: rgba(255,255,255,0.05); /* Hover states */
--c1-error-color: #ef4444;             /* Error messages */
--c1-success-color: #10b981;           /* Success messages */
```

#### Input Styling
```css
--c1-input-background: rgba(255,255,255,0.95);
--c1-input-text-color: #1a1a1a;
--c1-input-border-color: rgba(255,255,255,0.2);
--c1-input-border-radius: 12px;
--c1-input-padding: 12px 16px;
--c1-input-font-size: 14px;
--c1-input-shadow: 0 2px 8px rgba(0,0,0,0.1);
--c1-input-focus-border: #14b8a6;
--c1-input-placeholder-color: #9ca3af;
```

#### Message Bubbles
```css
--c1-user-message-bg: rgba(20,184,166,0.2);
--c1-user-message-color: #ffffff;
--c1-user-message-border-radius: 18px 18px 4px 18px;
--c1-assistant-message-bg: rgba(255,255,255,0.08);
--c1-assistant-message-color: #ffffff;
--c1-assistant-message-border-radius: 18px 18px 18px 4px;
--c1-message-padding: 12px 16px;
--c1-message-max-width: 80%;
--c1-message-spacing: 12px;
--c1-message-shadow: 0 2px 4px rgba(0,0,0,0.1);
```

#### Typography
```css
--c1-font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--c1-font-size: 14px;
--c1-line-height: 1.5;
--c1-heading-font-family: 'Poppins', sans-serif;
--c1-heading-font-weight: 600;
--c1-code-font-family: 'Fira Code', 'Courier New', monospace;
--c1-code-font-size: 13px;
```

#### Buttons
```css
--c1-button-bg: linear-gradient(90deg, #14b8a6 0%, #0d9488 100%);
--c1-button-color: #ffffff;
--c1-button-border-radius: 8px;
--c1-button-padding: 8px 16px;
--c1-button-font-weight: 600;
--c1-button-hover-shadow: 0 4px 12px rgba(20,184,166,0.4);
--c1-button-disabled-opacity: 0.5;
```

#### Scrollbar
```css
--c1-scrollbar-width: 8px;
--c1-scrollbar-track: rgba(20,184,166,0.05);
--c1-scrollbar-thumb: rgba(20,184,166,0.2);
--c1-scrollbar-thumb-hover: rgba(20,184,166,0.3);
--c1-scrollbar-border-radius: 4px;
```

#### Spacing & Layout
```css
--c1-container-padding: 16px;
--c1-border-radius: 12px;
--c1-header-height: 60px;
--c1-footer-height: 80px;
--c1-sidebar-width: 280px;
```

#### Animations
```css
--c1-transition-speed: 0.2s;
--c1-animation-easing: cubic-bezier(0.4, 0, 0.2, 1);
--c1-message-fade-in: fadeIn 0.3s ease-in;
--c1-typing-indicator-speed: 1.4s;
```

### Method 2: Pre-built Themes

#### Jade Theme (Your Implementation)
```tsx
const jadeTheme = {
  ['--c1-primary-color' as string]: '#14b8a6',
  ['--c1-background-color' as string]: '#0d1b1b',
  ['--c1-text-color' as string]: '#ffffff',
  ['--c1-input-background' as string]: 'rgba(255,255,255,0.95)',
  ['--c1-user-message-bg' as string]: 'rgba(20,184,166,0.2)',
  ['--c1-assistant-message-bg' as string]: 'rgba(255,255,255,0.05)',
};

<div style={{ ...jadeTheme, background: 'linear-gradient(180deg, #0a2e2e 0%, #0d3d3d 100%)' }}>
  <C1Chat />
</div>
```

#### Carbon Theme (Dark)
```tsx
const carbonTheme = {
  ['--c1-primary-color' as string]: '#000000',
  ['--c1-background-color' as string]: '#0a0a0a',
  ['--c1-text-color' as string]: '#ffffff',
  ['--c1-input-background' as string]: '#1a1a1a',
  ['--c1-user-message-bg' as string]: '#2a2a2a',
  ['--c1-assistant-message-bg' as string]: '#1a1a1a',
};
```

#### Classic Theme (Blue)
```tsx
const classicTheme = {
  ['--c1-primary-color' as string]: '#3b82f6',
  ['--c1-background-color' as string]: '#0f172a',
  ['--c1-text-color' as string]: '#f1f5f9',
  ['--c1-input-background' as string]: '#1e293b',
  ['--c1-user-message-bg' as string]: 'rgba(59,130,246,0.2)',
  ['--c1-assistant-message-bg' as string]: '#1e293b',
};
```

#### Light Theme
```tsx
const lightTheme = {
  ['--c1-primary-color' as string]: '#14b8a6',
  ['--c1-background-color' as string]: '#ffffff',
  ['--c1-text-color' as string]: '#1e293b',
  ['--c1-input-background' as string]: '#f8fafc',
  ['--c1-input-text-color' as string]: '#1e293b',
  ['--c1-user-message-bg' as string]: 'rgba(20,184,166,0.1)',
  ['--c1-assistant-message-bg' as string]: '#f1f5f9',
};
```

### Method 3: Global CSS Overrides

In your `globals.css`:

```css
/* Target C1Chat container */
.chat-container {
  /* Override input styling */
  input[type="text"],
  textarea {
    background: rgba(255, 255, 255, 0.95) !important;
    color: #1a1a1a !important;
    border-radius: 12px !important;
    padding: 12px 16px !important;
    font-size: 14px !important;
    border: 1px solid rgba(20, 184, 166, 0.3) !important;
  }

  /* Input focus state */
  input:focus,
  textarea:focus {
    outline: none !important;
    border-color: #14b8a6 !important;
    box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1) !important;
  }

  /* Message bubbles */
  [role="log"] > div {
    border-radius: 12px !important;
    padding: 12px 16px !important;
    margin-bottom: 12px !important;
  }

  /* Send button */
  button[type="submit"] {
    background: linear-gradient(90deg, #14b8a6 0%, #0d9488 100%) !important;
    color: white !important;
    border: none !important;
    border-radius: 8px !important;
    padding: 10px 20px !important;
    font-weight: 600 !important;
    cursor: pointer !important;
    transition: all 0.2s ease !important;
  }

  button[type="submit"]:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 6px 16px rgba(20, 184, 166, 0.4) !important;
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: rgba(20, 184, 166, 0.05);
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(20, 184, 166, 0.2);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: rgba(20, 184, 166, 0.3);
  }
}
```

---

## Functional Customization

### Custom Message Processing

#### Option 1: processMessage Function

```tsx
<C1Chat 
  processMessage={async ({ messages, threadId, abortController }) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, threadId }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error('Failed to process message');
      }

      return response;
    } catch (error) {
      console.error('Chat error:', error);
      throw error;
    }
  }}
/>
```

#### Option 2: Custom API Route (Your Approach)

```typescript
// aiapp/src/app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { messages, threadId } = await request.json();

    // Connect to your backend (MCP server, etc.)
    const response = await fetch('http://localhost:8000/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, threadId }),
    });

    if (!response.ok) {
      throw new Error('Backend error');
    }

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('API route error:', error);
    
    // Fallback response
    return NextResponse.json({
      message: 'I apologize, but I encountered an error. Please try again.',
      error: true,
    }, { status: 500 });
  }
}
```

### Streaming Responses

```tsx
<C1Chat 
  processMessage={async ({ messages }) => {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, stream: true }),
    });

    // Return streaming response
    return response;
  }}
/>
```

### Custom System Prompt

```tsx
<C1Chat 
  processMessage={async ({ messages }) => {
    // Prepend system message
    const messagesWithSystem = [
      {
        role: 'system',
        content: 'You are a financial trading assistant specialized in market analysis.',
      },
      ...messages,
    ];

    const response = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: messagesWithSystem }),
    });

    return response;
  }}
/>
```

### Thread Management

```tsx
const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);

<C1Chat 
  threadId={currentThreadId}
  onThreadChange={(newThreadId) => {
    setCurrentThreadId(newThreadId);
    // Save to localStorage or database
    localStorage.setItem('lastThreadId', newThreadId);
  }}
/>
```

---

## Advanced Features

### 1. Custom Sidebar Integration

```tsx
export default function ChatWithSidebar() {
  const [showSidebar, setShowSidebar] = useState(true);

  return (
    <div className="flex h-screen">
      {/* Custom Sidebar */}
      {showSidebar && (
        <aside className="w-80 bg-gray-900 p-4">
          <h2>Analysts</h2>
          <ul>
            <li>Market Analyst</li>
            <li>Fundamentals Analyst</li>
            <li>News Analyst</li>
            <li>Social Analyst</li>
          </ul>
          
          <h2>Coaches</h2>
          <ul>
            <li>Technical Coach</li>
            <li>Fundamental Coach</li>
            <li>Sentiment Coach</li>
          </ul>
        </aside>
      )}

      {/* Chat Container */}
      <div 
        style={{ 
          flex: 1,
          ['--c1-primary-color' as string]: '#14b8a6',
        } as React.CSSProperties}
      >
        <C1Chat />
      </div>
    </div>
  );
}
```

### 2. Tool Integration (MCP)

```tsx
<C1Chat 
  processMessage={async ({ messages, tools }) => {
    // Tools are automatically detected from MCP server
    const response = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ 
        messages,
        tools: [
          'analyze_stock',
          'calculate_risk',
          'backtest_strategy',
          'get_sentiment',
        ],
      }),
    });

    return response;
  }}
/>
```

### 3. Custom Welcome Message

```tsx
const [messages, setMessages] = useState([
  {
    role: 'assistant',
    content: 'Welcome to TradingAgents! I can help you analyze stocks, calculate risk, backtest strategies, and more. What would you like to explore?',
  },
]);

<C1Chat 
  initialMessages={messages}
/>
```

### 4. Message Formatting

```tsx
<C1Chat 
  processMessage={async ({ messages }) => {
    const response = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages }),
    });

    const data = await response.json();

    // Format response with markdown, code blocks, etc.
    return {
      ...data,
      message: formatMessage(data.message),
    };
  }}
/>
```

### 5. Error Handling

```tsx
<C1Chat 
  processMessage={async ({ messages }) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return response;
    } catch (error) {
      // Return user-friendly error
      return new Response(
        JSON.stringify({
          message: 'I apologize, but I encountered an error. Please try again or contact support if the issue persists.',
          error: true,
          details: error.message,
        }),
        { 
          status: 200,  // Return 200 to display message
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }}
/>
```

### 6. Loading States

```tsx
const [isLoading, setIsLoading] = useState(false);

<C1Chat 
  processMessage={async ({ messages }) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ messages }),
      });
      
      return response;
    } finally {
      setIsLoading(false);
    }
  }}
/>

{isLoading && <LoadingIndicator />}
```

### 7. Rate Limiting

```tsx
import { RateLimiter } from '@/lib/rateLimiter';

const rateLimiter = new RateLimiter(10, 60000); // 10 requests per minute

<C1Chat 
  processMessage={async ({ messages }) => {
    if (!rateLimiter.tryAcquire()) {
      return new Response(
        JSON.stringify({
          message: 'Rate limit exceeded. Please wait a moment before sending another message.',
        }),
        { status: 429 }
      );
    }

    const response = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages }),
    });

    return response;
  }}
/>
```

---

## Integration Patterns

### Pattern 1: Landing Page with Launch Button (Your Implementation)

```tsx
// Landing page
export default function Home() {
  const [showChat, setShowChat] = useState(false);

  if (showChat) {
    return <ChatInterface />;
  }

  return (
    <div className="landing-page">
      <h1>TradingAgents</h1>
      <p>AI-powered trading analysis</p>
      <button onClick={() => setShowChat(true)}>
        Launch AI
      </button>
    </div>
  );
}

// Chat interface
function ChatInterface() {
  return (
    <div style={{ 
      display: 'flex',
      height: '100vh',
      ['--c1-primary-color' as string]: '#14b8a6',
    } as React.CSSProperties}>
      <Sidebar />
      <C1Chat />
    </div>
  );
}
```

### Pattern 2: Dashboard Integration

```tsx
export default function Dashboard() {
  return (
    <div className="dashboard">
      <Header />
      <div className="content">
        <Sidebar />
        <main>
          <AnalysisSection />
          <ChartSection />
          <C1Chat />  {/* Embedded in dashboard */}
        </main>
      </div>
    </div>
  );
}
```

### Pattern 3: Modal/Popup Chat

```tsx
export default function App() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      <YourMainApp />
      
      {/* Floating chat button */}
      <button 
        className="fixed bottom-4 right-4"
        onClick={() => setChatOpen(true)}
      >
        💬 Chat
      </button>

      {/* Modal chat */}
      {chatOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="w-full max-w-2xl h-[600px] bg-white rounded-lg">
            <C1Chat />
            <button onClick={() => setChatOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}
```

### Pattern 4: Full-Screen Chat

```tsx
export default function ChatPage() {
  return (
    <div style={{ 
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      ['--c1-primary-color' as string]: '#14b8a6',
    } as React.CSSProperties}>
      <C1Chat />
    </div>
  );
}
```

---

## Best Practices

### 1. Performance Optimization

```tsx
// Lazy load C1Chat
import dynamic from 'next/dynamic';

const C1Chat = dynamic(
  () => import('@thesysai/genui-sdk').then(mod => mod.C1Chat),
  { ssr: false, loading: () => <ChatSkeleton /> }
);
```

### 2. Responsive Design

```tsx
const isMobile = useMediaQuery('(max-width: 768px)');

<div style={{
  ['--c1-font-size' as string]: isMobile ? '13px' : '14px',
  ['--c1-message-max-width' as string]: isMobile ? '90%' : '80%',
  ['--c1-container-padding' as string]: isMobile ? '12px' : '16px',
} as React.CSSProperties}>
  <C1Chat />
</div>
```

### 3. Accessibility

```tsx
<div 
  role="region"
  aria-label="AI Chat Assistant"
  style={{ 
    ['--c1-primary-color' as string]: '#14b8a6',
  } as React.CSSProperties}
>
  <C1Chat />
</div>
```

### 4. Error Boundaries

```tsx
import { ErrorBoundary } from 'react-error-boundary';

<ErrorBoundary
  fallback={<ChatErrorFallback />}
  onError={(error) => console.error('Chat error:', error)}
>
  <C1Chat />
</ErrorBoundary>
```

### 5. Theme Persistence

```tsx
const [theme, setTheme] = useState(() => {
  return localStorage.getItem('chat-theme') || 'jade';
});

useEffect(() => {
  localStorage.setItem('chat-theme', theme);
}, [theme]);

<div style={themes[theme]}>
  <C1Chat />
</div>
```

### 6. Analytics Integration

```tsx
<C1Chat 
  processMessage={async ({ messages }) => {
    // Track message sent
    analytics.track('chat_message_sent', {
      messageCount: messages.length,
      timestamp: Date.now(),
    });

    const response = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages }),
    });

    // Track response received
    analytics.track('chat_response_received', {
      status: response.status,
    });

    return response;
  }}
/>
```

---

## Complete Example: Your Implementation

```tsx
// aiapp/src/app/page.tsx
'use client';

import { useState } from 'react';
import { C1Chat } from '@thesysai/genui-sdk';

export default function Home() {
  const [showChat, setShowChat] = useState(false);

  if (showChat) {
    return (
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="w-80 bg-gray-900 p-6 overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">Analysts</h2>
          <div className="space-y-2">
            <AnalystCard name="Market Analyst" icon="📊" />
            <AnalystCard name="Fundamentals" icon="📈" />
            <AnalystCard name="News Analyst" icon="📰" />
            <AnalystCard name="Social Analyst" icon="💬" />
          </div>

          <h2 className="text-xl font-bold mt-6 mb-4">Coaches</h2>
          <div className="space-y-2">
            <CoachCard name="Technical Coach" icon="📉" />
            <CoachCard name="Fundamental Coach" icon="💼" />
            <CoachCard name="Sentiment Coach" icon="🎯" />
          </div>
        </aside>

        {/* Chat */}
        <div 
          style={{ 
            flex: 1,
            background: 'linear-gradient(180deg, #0a2e2e 0%, #0d3d3d 100%)',
            ['--c1-primary-color' as string]: '#14b8a6',
            ['--c1-background-color' as string]: '#0d1b1b',
            ['--c1-text-color' as string]: '#ffffff',
            ['--c1-input-background' as string]: 'rgba(255, 255, 255, 0.95)',
            ['--c1-input-text-color' as string]: '#0f172a',
            ['--c1-user-message-bg' as string]: 'rgba(20, 184, 166, 0.2)',
            ['--c1-assistant-message-bg' as string]: 'rgba(255, 255, 255, 0.05)',
          } as React.CSSProperties}
        >
          <C1Chat />
        </div>
      </div>
    );
  }

  return (
    <div className="landing-page">
      {/* Your beautiful landing page */}
      <button 
        onClick={() => setShowChat(true)}
        className="launch-button"
      >
        Launch AI
      </button>
    </div>
  );
}
```

---

## Resources

**Official Documentation:**
- Thesys Docs: https://docs.thesys.dev
- C1Chat API: https://docs.thesys.dev/components/c1-chat
- Playground: https://console.thesys.dev/playground

**Your Implementation:**
- Landing Page: `aiapp/src/app/page.tsx`
- API Route: `aiapp/src/app/api/chat/route.ts`
- Global Styles: `aiapp/src/app/globals.css`
- MCP Server: `mcp_http_server.py`

**Related Guides:**
- [THESYS_C1_OVERVIEW.md](./THESYS_C1_OVERVIEW.md)
- [THESYS_THEMING_GUIDE.md](./THESYS_THEMING_GUIDE.md)
- [THESYS_CSS_OVERRIDE_GUIDE.md](./THESYS_CSS_OVERRIDE_GUIDE.md)

---

## Summary

C1Chat is highly customizable through:

✅ **CSS Variables** - Theme colors, spacing, typography
✅ **Global CSS** - Override specific elements
✅ **processMessage** - Custom message handling
✅ **API Routes** - Backend integration
✅ **Sidebar Integration** - Custom layouts
✅ **Tool Support** - MCP server integration
✅ **Streaming** - Real-time responses
✅ **Error Handling** - Graceful fallbacks

Your Jade-themed implementation with sidebar navigation is production-ready! 🚀
