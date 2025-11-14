# C1 Complete Implementation Guide

## Overview

This guide shows how to upgrade your TradingAgents chat interface from SimpleChat to Thesys C1's Generative UI system with full tool calling, streaming, and multi-step flows.

## What You'll Get

- **Interactive UI Components**: Charts, tables, cards, buttons (not just text)
- **Tool Calling**: AI calls your TradingAgents tools and displays results
- **Streaming**: Real-time progressive rendering
- **Multi-Step Flows**: Click buttons to drill deeper into analysis
- **Professional Styling**: Dark theme matching your brand

## Architecture

```
User: "Analyze AAPL"
    ↓
Frontend (C1Chat)
    ↓
Backend API (/api/chat)
    ↓
Thesys C1 API (with tools)
    ↓
Your TradingAgents System
    ↓
C1 DSL (UI specification)
    ↓
Interactive UI (charts, tables, buttons)
```

## Implementation Steps

### Step 1: Install Dependencies

```bash
cd aiapp
npm install @thesysai/genui-sdk @crayonai/react-ui zod zod-to-json-schema
```

### Step 2: Create Tools Definition

Create `aiapp/src/app/api/chat/tools.ts`:

```typescript
import { JSONSchema } from "openai/lib/jsonschema.mjs";
import { RunnableToolFunctionWithParse } from "openai/lib/RunnableFunction.mjs";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

const TRADINGAGENTS_API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const tools: RunnableToolFunctionWithParse<any>[] = [
  {
    type: "function",
    function: {
      name: "analyze_stock",
      description: "Run comprehensive AI agent analysis on a stock (market data, fundamentals, news, social sentiment)",
      parse: (input: string) => JSON.parse(input),
      parameters: zodToJsonSchema(z.object({
        ticker: z.string().describe("Stock ticker symbol (e.g., AAPL, TSLA, BTC)"),
        analysts: z.array(z.enum(["market", "fundamentals", "news", "social"]))
          .optional()
          .describe("Which analysts to include (default: all)")
      })) as JSONSchema,
      function: async ({ ticker, analysts }: { ticker: string; analysts?: string[] }) => {
        const response = await fetch(`${TRADINGAGENTS_API}/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ticker, analysts: analysts || ["market", "fundamentals", "news", "social"] })
        });
        const data = await response.json();
        return JSON.stringify(data);
      },
      strict: true,
    },
  },
  {
    type: "function",
    function: {
      name: "get_sentiment",
      description: "Get real-time social media sentiment analysis from Twitter and StockTwits",
      parse: (input: string) => JSON.parse(input),
      parameters: zodToJsonSchema(z.object({
        ticker: z.string().describe("Stock ticker symbol"),
        time_range: z.enum(["1h", "4h", "24h", "7d"])
          .optional()
          .describe("Time range for sentiment (default: 24h)")
      })) as JSONSchema,
      function: async ({ ticker, time_range }: { ticker: string; time_range?: string }) => {
        const response = await fetch(`${TRADINGAGENTS_API}/sentiment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ticker, time_range: time_range || "24h" })
        });
        const data = await response.json();
        return JSON.stringify(data);
      },
      strict: true,
    },
  },
  {
    type: "function",
    function: {
      name: "backtest_strategy",
      description: "Backtest a trading strategy on historical data with performance metrics",
      parse: (input: string) => JSON.parse(input),
      parameters: zodToJsonSchema(z.object({
        ticker: z.string().describe("Stock ticker symbol"),
        start_date: z.string().describe("Start date (YYYY-MM-DD)"),
        end_date: z.string().describe("End date (YYYY-MM-DD)"),
        initial_capital: z.number().optional().describe("Starting capital (default: 10000)")
      })) as JSONSchema,
      function: async ({ ticker, start_date, end_date, initial_capital }: any) => {
        const response = await fetch(`${TRADINGAGENTS_API}/backtest`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            ticker, 
            start_date, 
            end_date,
            strategy_config: { initial_capital: initial_capital || 10000 }
          })
        });
        const data = await response.json();
        return JSON.stringify(data);
      },
      strict: true,
    },
  },
  {
    type: "function",
    function: {
      name: "calculate_risk",
      description: "Calculate position sizing and risk metrics for a trade",
      parse: (input: string) => JSON.parse(input),
      parameters: zodToJsonSchema(z.object({
        ticker: z.string().describe("Stock ticker symbol"),
        account_value: z.number().describe("Total account value in dollars"),
        risk_per_trade_pct: z.number().describe("Risk percentage per trade (0.1-10.0)"),
        current_price: z.number().describe("Current stock price")
      })) as JSONSchema,
      function: async ({ ticker, account_value, risk_per_trade_pct, current_price }: any) => {
        const response = await fetch(`${TRADINGAGENTS_API}/risk`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ticker, account_value, risk_per_trade_pct, current_price })
        });
        const data = await response.json();
        return JSON.stringify(data);
      },
      strict: true,
    },
  },
];
```

### Step 3: Create System Prompt

Create `aiapp/src/app/api/chat/systemPrompt.ts`:

```typescript
export const systemPrompt = `You are a professional AI trading assistant powered by multi-agent analysis.

## Your Capabilities

You have access to sophisticated trading tools:

1. **analyze_stock**: Run full multi-agent analysis
   - Market Analyst: Technical indicators, price action, volume
   - Fundamentals Analyst: Financial metrics, earnings, valuation
   - News Analyst: Recent news sentiment and impact
   - Social Analyst: Twitter/StockTwits sentiment

2. **get_sentiment**: Real-time social media sentiment analysis

3. **backtest_strategy**: Test strategies on historical data

4. **calculate_risk**: Position sizing and risk management

## How to Respond

When users ask about stocks:
1. Use analyze_stock for comprehensive analysis
2. Present data in interactive charts and tables
3. Use cards for key metrics and insights
4. Add action buttons for drill-down (e.g., "View Detailed Fundamentals", "Check Social Sentiment")
5. Provide clear, actionable recommendations

## Presentation Style

- Use **charts** for price data, performance metrics
- Use **tables** for financial data, comparisons
- Use **cards** for key insights, recommendations
- Use **buttons** for multi-step flows
- Always cite data sources and timestamps
- Explain your reasoning clearly

## Example Interactions

User: "Analyze AAPL"
→ Call analyze_stock(ticker="AAPL")
→ Show: Overview card, price chart, key metrics table, sentiment gauge
→ Add buttons: "View Fundamentals", "Check Social Sentiment", "Backtest Strategy"

User clicks "View Fundamentals"
→ Show: Detailed financial metrics, earnings history, valuation analysis

Remember: You're helping traders make informed decisions. Be precise, data-driven, and actionable.`;
```

### Step 4: Create Chat API Route

Create `aiapp/src/app/api/chat/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { systemPrompt } from "./systemPrompt";
import { tools } from "./tools";

const client = new OpenAI({
  apiKey: process.env.THESYS_API_KEY,
  baseURL: 'https://api.thesys.dev/v1/embed',
});

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

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

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of llmStream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              controller.enqueue(new TextEncoder().encode(content));
            }
          }
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

### Step 5: Update Frontend

Update `aiapp/src/app/page.tsx`:

```typescript
import { C1Chat, ThemeProvider } from "@thesysai/genui-sdk";
import "@crayonai/react-ui/styles/index.css";

export default function Home() {
  return (
    <ThemeProvider
      theme={{
        colors: {
          primary: "#10b981", // Green
          background: "#111827", // Dark gray
          surface: "#1f2937",
          text: "#f9fafb",
        },
        typography: {
          fontFamily: "Inter, system-ui, sans-serif",
        },
      }}
    >
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900">
        <C1Chat 
          apiUrl="/api/chat"
          placeholder="Ask me to analyze a stock... (e.g., 'Analyze AAPL' or 'What's the sentiment on TSLA?')"
          welcomeMessage="👋 I'm your AI trading assistant. I can analyze stocks, check sentiment, backtest strategies, and calculate risk. What would you like to explore?"
        />
      </div>
    </ThemeProvider>
  );
}
```

### Step 6: Add Custom Styling (Optional)

Create `aiapp/src/styles/c1-custom.css`:

```css
/* Custom C1 styling for trading theme */

/* Make charts stand out */
.crayon-chart {
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

/* Style metric cards */
.crayon-card {
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  border: 1px solid rgba(16, 185, 129, 0.2);
}

/* Highlight action buttons */
.crayon-button-primary {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Style tables */
.crayon-table {
  border-radius: 8px;
  overflow: hidden;
}

.crayon-table-header {
  background: rgba(16, 185, 129, 0.1);
  font-weight: 700;
  text-transform: uppercase;
  font-size: 0.875rem;
  letter-spacing: 0.05em;
}
```

Import in `aiapp/src/app/globals.css`:

```css
@import '../styles/c1-custom.css';
```

### Step 7: Environment Variables

Update `aiapp/.env.local`:

```bash
# Thesys C1 API
THESYS_API_KEY=your_thesys_api_key_here

# Your TradingAgents API
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Testing

### 1. Start Your Services

```bash
# Terminal 1: Start TradingAgents MCP server
python -m mcp_server

# Terminal 2: Start Next.js app
cd aiapp
npm run dev
```

### 2. Test Queries

Try these in the chat:

- "Analyze AAPL" → Full multi-agent analysis
- "What's the sentiment on TSLA?" → Social sentiment
- "Backtest AAPL from 2024-01-01 to 2024-12-31" → Strategy backtest
- "Calculate risk for MSFT with $10000 account" → Risk metrics

### 3. Test Multi-Step Flows

1. Ask "Analyze AAPL"
2. Click "View Fundamentals" button
3. Click "Check Social Sentiment" button
4. Each click generates new interactive UI

## Key Features

### Tool Calling
- AI automatically calls your TradingAgents tools
- Real data from your backend
- No hallucinations

### Streaming
- Progressive rendering as data arrives
- Feels instant and responsive
- Better UX than waiting for complete response

### Multi-Step Flows
- Buttons trigger new analysis
- Drill down into details
- Complete interactive experience

### Interactive UI
- Charts for price data
- Tables for metrics
- Cards for insights
- Buttons for actions

## Comparison: SimpleChat vs C1

### SimpleChat (Current)
- ✅ Works with OpenAI
- ✅ Streaming text
- ❌ Text-only responses
- ❌ No interactive components
- ❌ No tool calling
- ❌ No multi-step flows

### C1 (Upgrade)
- ✅ Works with Thesys C1
- ✅ Streaming UI
- ✅ Interactive charts, tables, cards
- ✅ Tool calling (real data)
- ✅ Multi-step flows
- ✅ Professional styling

## Migration Path

### Option 1: Keep Both
```typescript
// page.tsx
const [useC1, setUseC1] = useState(true);

return useC1 ? (
  <C1Chat apiUrl="/api/chat" />
) : (
  <SimpleChat />
);
```

### Option 2: Full Upgrade
Replace SimpleChat completely with C1Chat (recommended)

### Option 3: Gradual Migration
1. Week 1: Set up C1 alongside SimpleChat
2. Week 2: Test with real users
3. Week 3: Switch default to C1
4. Week 4: Remove SimpleChat

## Cost Considerations

### C1 API Pricing
- Check Thesys pricing page
- Tool calls count as additional tokens
- Streaming doesn't cost extra

### Optimization Tips
1. Cache tool results when possible
2. Use specific analysts instead of all 4
3. Limit backtest date ranges
4. Set reasonable timeouts

## Troubleshooting

### Tools Not Being Called
- Check system prompt mentions tools
- Verify tool definitions are correct
- Ensure TRADINGAGENTS_API is accessible

### Streaming Not Working
- Check Content-Type header
- Verify async iteration works
- Test with simple text first

### UI Not Rendering
- Import C1 styles: `@crayonai/react-ui/styles/index.css`
- Check ThemeProvider wraps C1Chat
- Verify C1 DSL is valid

### Tool Errors
- Check TradingAgents server is running
- Verify API endpoints match
- Check CORS if needed

## Next Steps

1. **Get Thesys API Key**: Sign up at thesys.dev
2. **Implement Tools**: Copy code from this guide
3. **Test Locally**: Try example queries
4. **Customize Styling**: Match your brand
5. **Deploy**: Push to production

## Resources

- Thesys C1 Docs: https://docs.thesys.dev
- Your MCP Server: `mcp_server/`
- Example Queries: See "Testing" section above
- Support: Check Thesys Discord/docs

## Summary

This upgrade gives you:
- **Better UX**: Interactive UI vs plain text
- **Real Data**: Tool calling connects to your backend
- **Professional Look**: Charts, tables, styled components
- **Engagement**: Multi-step flows keep users exploring

The implementation is straightforward - mostly configuration and connecting existing pieces. Your TradingAgents system is already powerful; C1 just makes it beautiful and interactive.
