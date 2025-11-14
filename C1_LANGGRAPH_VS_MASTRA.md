# C1 with LangGraph vs Mastra

## Overview

Both **LangGraph** (your current system) and **Mastra** are agent orchestration frameworks that can integrate with Thesys C1 for Generative UI. This guide compares them and shows how your TradingAgents system already has the foundation for C1 integration.

## Architecture Comparison

### Your TradingAgents (LangGraph)
```
User Query
    ↓
LangGraph Workflow
    ↓
Multiple Agents (Market, Fundamentals, News, Social)
    ↓
Debate & Decision
    ↓
Trading Recommendation
```

### Mastra Example (from docs)
```
User Query
    ↓
Mastra Agent
    ↓
Tools (Weather API)
    ↓
Response
```

## Key Differences

| Feature | LangGraph (Your System) | Mastra |
|---------|------------------------|--------|
| **Orchestration** | Graph-based workflows | Agent-based |
| **Complexity** | Multi-agent debates | Single agent + tools |
| **State Management** | Typed state objects | Message history |
| **Your Use Case** | ✅ Already implemented | Would need rebuild |
| **C1 Integration** | Same approach | Same approach |

## Why Your System is Better for Trading

### 1. Multi-Agent Architecture
```python
# Your TradingAgents system
agents = {
    "market_analyst": MarketAnalyst(),
    "fundamentals_analyst": FundamentalsAnalyst(),
    "news_analyst": NewsAnalyst(),
    "social_analyst": SocialAnalyst(),
    "bull_researcher": BullResearcher(),
    "bear_researcher": BearResearcher(),
    "trader": Trader(),
    "risk_manager": RiskManager(),
}
```

### 2. Structured Debates
```python
# Bull vs Bear debate
bull_argument = bull_researcher.analyze(state)
bear_argument = bear_researcher.analyze(state)
final_decision = debate_and_decide(bull_argument, bear_argument)
```

### 3. Risk Management Layer
```python
# Multi-perspective risk evaluation
risk_assessment = risk_manager.evaluate(trading_decision)
portfolio_approval = portfolio_manager.approve(risk_assessment)
```

## C1 Integration: Same Approach for Both

The good news: **C1 integration is the same** whether you use LangGraph or Mastra!

### Core Pattern (Works for Both)

```typescript
// 1. User sends message
const userMessage = { role: "user", content: "Analyze AAPL" };

// 2. Your backend calls your agent system
const response = await yourAgentSystem.run(userMessage);

// 3. Stream response to C1
return streamToC1(response);
```

## Your TradingAgents + C1 Integration

### Current Architecture
```
User → SimpleChat → OpenAI API → Text Response
```

### With C1 (Recommended)
```
User → C1Chat → Your Backend → TradingAgents (LangGraph) → C1 DSL → Interactive UI
```

### Implementation (Adapting Mastra Example)

#### Step 1: Create TradingAgents Wrapper

Create `aiapp/src/server/tradingagents-wrapper.ts`:

```typescript
import { TradingAgentsGraph } from "../../../tradingagents/graph/trading_graph";

export class TradingAgentsWrapper {
  private graph: TradingAgentsGraph;

  constructor() {
    this.graph = new TradingAgentsGraph({
      debug: false,
      max_debate_rounds: 2,
    });
  }

  async analyze(ticker: string, analysts?: string[]) {
    const result = await this.graph.run({
      ticker,
      analysts: analysts || ["market", "fundamentals", "news", "social"],
    });

    return {
      ticker,
      analysis: result.final_report,
      recommendation: result.trading_decision,
      risk_assessment: result.risk_evaluation,
      timestamp: new Date().toISOString(),
    };
  }

  async getSentiment(ticker: string, timeRange: string = "24h") {
    // Call your social analyst directly
    const result = await this.graph.runSocialAnalyst({
      ticker,
      time_range: timeRange,
    });

    return result;
  }

  async backtest(ticker: string, startDate: string, endDate: string) {
    // Call your backtesting system
    const result = await this.graph.runBacktest({
      ticker,
      start_date: startDate,
      end_date: endDate,
    });

    return result;
  }

  async calculateRisk(params: {
    ticker: string;
    accountValue: number;
    riskPerTrade: number;
    currentPrice: number;
  }) {
    // Call your risk calculator
    const result = await this.graph.calculateRisk(params);

    return result;
  }
}

// Singleton instance
export const tradingAgents = new TradingAgentsWrapper();
```

#### Step 2: Create Chat Endpoint (Like Mastra Example)

Create `aiapp/src/app/api/chat/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { tradingAgents } from "@/server/tradingagents-wrapper";
import { getMessageStore } from "./messageStore";

export async function POST(req: NextRequest) {
  try {
    const { prompt, threadId } = await req.json();
    
    const messageStore = getMessageStore(threadId);

    // Add user message
    const userMessage = {
      id: crypto.randomUUID(),
      role: "user" as const,
      content: prompt.content,
      createdAt: new Date(),
    };
    messageStore.addMessage(userMessage);

    // Detect intent and route to appropriate TradingAgents function
    const intent = detectIntent(prompt.content);
    
    let result;
    switch (intent.type) {
      case "analyze":
        result = await tradingAgents.analyze(intent.ticker, intent.analysts);
        break;
      case "sentiment":
        result = await tradingAgents.getSentiment(intent.ticker, intent.timeRange);
        break;
      case "backtest":
        result = await tradingAgents.backtest(
          intent.ticker,
          intent.startDate,
          intent.endDate
        );
        break;
      case "risk":
        result = await tradingAgents.calculateRisk(intent.params);
        break;
      default:
        result = { error: "Unknown intent" };
    }

    // Format response for C1
    const c1Response = formatForC1(result, intent.type);

    // Save assistant message
    const assistantMessage = {
      id: crypto.randomUUID(),
      role: "assistant" as const,
      content: c1Response,
      createdAt: new Date(),
    };
    messageStore.addMessage(assistantMessage);

    // Stream response
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(c1Response));
        controller.close();
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

// Intent detection
function detectIntent(prompt: string) {
  const lowerPrompt = prompt.toLowerCase();
  
  // Extract ticker
  const tickerMatch = prompt.match(/\b([A-Z]{1,5})\b/);
  const ticker = tickerMatch ? tickerMatch[1] : null;

  if (lowerPrompt.includes("analyze") || lowerPrompt.includes("analysis")) {
    return { type: "analyze", ticker };
  }
  
  if (lowerPrompt.includes("sentiment") || lowerPrompt.includes("social")) {
    return { type: "sentiment", ticker };
  }
  
  if (lowerPrompt.includes("backtest")) {
    // Extract dates if present
    const dateMatch = prompt.match(/(\d{4}-\d{2}-\d{2})/g);
    return {
      type: "backtest",
      ticker,
      startDate: dateMatch?.[0],
      endDate: dateMatch?.[1],
    };
  }
  
  if (lowerPrompt.includes("risk") || lowerPrompt.includes("position size")) {
    return { type: "risk", ticker };
  }

  return { type: "analyze", ticker };
}

// Format for C1 DSL
function formatForC1(result: any, type: string) {
  // This would generate C1 DSL based on your result
  // For now, return JSON that C1 can render
  return JSON.stringify({
    type: "analysis_result",
    data: result,
    ui_type: type,
  });
}
```

#### Step 3: Frontend (Same as Mastra)

```typescript
// aiapp/src/app/page.tsx
"use client";

import { C1Chat } from "@thesysai/genui-sdk";
import "@crayonai/react-ui/styles/index.css";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900">
      <C1Chat 
        apiUrl="/api/chat"
        placeholder="Ask me to analyze a stock... (e.g., 'Analyze AAPL')"
      />
    </div>
  );
}
```

## Advantages of Your LangGraph System

### 1. Already Built
You don't need to rebuild anything - just add C1 integration layer

### 2. More Sophisticated
- Multi-agent collaboration
- Structured debates
- Risk management layers
- Memory and reflection

### 3. Domain-Specific
Built specifically for trading analysis, not general-purpose

### 4. Proven
Already tested and working with your data sources

## Migration Path: Don't Switch to Mastra

**Recommendation: Keep LangGraph, Add C1**

### Why Not Switch?
1. ❌ Would require complete rebuild
2. ❌ Lose multi-agent architecture
3. ❌ Lose debate system
4. ❌ Lose risk management
5. ❌ Months of development time

### Why Keep LangGraph?
1. ✅ Already working
2. ✅ More sophisticated
3. ✅ Trading-specific
4. ✅ Just add C1 layer

## Implementation Strategy

### Phase 1: Basic C1 Integration (1 week)
```
Your TradingAgents (LangGraph)
    ↓
Wrapper Layer (new)
    ↓
C1 Chat Endpoint (new)
    ↓
C1 Frontend (new)
```

### Phase 2: Enhanced UI (1 week)
- Format responses as C1 DSL
- Add interactive charts
- Add action buttons
- Multi-step flows

### Phase 3: Advanced Features (2 weeks)
- Thread persistence
- Thread sharing
- Artifact editing
- Custom styling

## Code Comparison

### Mastra Approach (Simple)
```typescript
// Single agent with tools
const agent = new Agent({
  name: "Weather Agent",
  tools: { weatherTool },
  model: createOpenAI().chat("gpt-4"),
});

const response = await agent.stream(messages);
```

### Your LangGraph Approach (Sophisticated)
```python
# Multi-agent workflow
graph = TradingAgentsGraph()

# Parallel analysis
market_report = await market_analyst.analyze(state)
fundamentals_report = await fundamentals_analyst.analyze(state)
news_report = await news_analyst.analyze(state)
social_report = await social_analyst.analyze(state)

# Debate
bull_case = await bull_researcher.research(reports)
bear_case = await bear_researcher.research(reports)

# Decision
trading_decision = await trader.decide(bull_case, bear_case)

# Risk check
risk_assessment = await risk_manager.evaluate(trading_decision)
final_decision = await portfolio_manager.approve(risk_assessment)
```

## Summary

| Aspect | Mastra | Your LangGraph |
|--------|--------|----------------|
| **Complexity** | Simple | Sophisticated |
| **Use Case** | General | Trading-specific |
| **Your Situation** | Would need rebuild | Already built |
| **C1 Integration** | Same approach | Same approach |
| **Recommendation** | ❌ Don't switch | ✅ Keep and enhance |

## Next Steps

1. **Don't switch to Mastra** - you'd lose everything you've built
2. **Follow C1_COMPLETE_IMPLEMENTATION_GUIDE.md** - it works with LangGraph
3. **Create wrapper layer** - expose your TradingAgents to C1
4. **Add C1 frontend** - same as Mastra example
5. **Enjoy interactive UI** - with your sophisticated backend

## Key Insight

The Mastra documentation shows **how to integrate any agent system with C1**. The pattern is the same:

```
Agent System (Mastra OR LangGraph) → Wrapper → C1 Endpoint → C1 UI
```

Your LangGraph system is **more powerful** than the Mastra example. You just need to add the C1 integration layer, which is the same regardless of the underlying agent framework.

## Resources

- **Your Implementation**: `C1_COMPLETE_IMPLEMENTATION_GUIDE.md`
- **Mastra Example**: Reference for integration pattern
- **Your TradingAgents**: `tradingagents/graph/trading_graph.py`
- **C1 Docs**: https://docs.thesys.dev

**Bottom line:** Keep your LangGraph system, add C1 on top. Don't rebuild with Mastra.
