# 🎯 C1 Template + TradingAgents Integration Guide

## What You Found

You discovered the **official Thesys C1 Next.js template** - this is MUCH better than building from scratch!

## Why This is Perfect

✅ **Professional C1 Chat UI** - Already built and styled
✅ **Tool System** - Easy to add your TradingAgents tools
✅ **Streaming** - Real-time responses built-in
✅ **Theme System** - Beautiful light/dark themes
✅ **Production Ready** - Maintained by Thesys

## How C1 Template Works

```
User types message
    ↓
C1Chat component (frontend)
    ↓
/api/chat route (backend)
    ↓
OpenAI with tools
    ↓
Your TradingAgents functions
    ↓
Stream response back to user
```

## Integration Strategy

Instead of using MCP Server, we'll **integrate TradingAgents directly** into the C1 template as tools!

### Current Tools (in template):
- `googleImageTool` - Fetches images
- `weatherTool` - Gets weather data

### Your New Tools (to add):
- `analyzeStockTool` - Full multi-agent analysis
- `backtestStrategyTool` - Run backtests
- `calculateRiskTool` - Risk metrics
- `getSentimentTool` - Social sentiment

---

## Step-by-Step Integration

### Step 1: Copy C1 Template to Your Project

```bash
# You already did this! The template is in c1-template/
```

### Step 2: Install Dependencies

```bash
cd c1-template
pnpm install
```

### Step 3: Set Up Environment Variables

Create `.env` file:

```env
# Thesys API Key (get from https://chat.thesys.dev/console/keys)
THESYS_API_KEY=your_thesys_api_key_here

# Optional (for image search and summarization)
GOOGLE_API_KEY=your_google_key
GOOGLE_CX_KEY=your_google_cx
GEMINI_API_KEY=your_gemini_key

# Your existing keys (if needed)
OPENAI_API_KEY=your_openai_key
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
```

### Step 4: Create TradingAgents Tools

Create `c1-template/src/app/api/chat/tools/tradingagents.ts`:

```typescript
import { RunnableToolFunctionWithParse } from "openai/lib/RunnableFunction.mjs";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

// Import your TradingAgents system
// We'll need to make it accessible from Node.js
// For now, we'll call your Python backend via HTTP

const TRADINGAGENTS_API = "http://localhost:5000"; // Your Python API

/**
 * Analyze Stock Tool
 * Runs comprehensive multi-agent analysis on a stock
 */
export const analyzeStockTool: RunnableToolFunctionWithParse<{
  ticker: string;
  max_debate_rounds?: number;
}> = {
  type: "function",
  function: {
    name: "analyze_stock",
    description: "Run comprehensive stock analysis using TradingAgents multi-agent system with market, fundamentals, news, and social analysts",
    parameters: zodToJsonSchema(
      z.object({
        ticker: z.string().describe("Stock ticker symbol (e.g., AAPL, TSLA, BTC-USD)"),
        max_debate_rounds: z.number().optional().describe("Number of debate rounds between bull and bear researchers (default: 1)"),
      })
    ),
    parse: (args: string) => {
      return JSON.parse(args);
    },
    function: async ({ ticker, max_debate_rounds = 1 }) => {
      try {
        const response = await fetch(`${TRADINGAGENTS_API}/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ticker, max_debate_rounds }),
        });

        if (!response.ok) {
          throw new Error(`Analysis failed: ${response.statusText}`);
        }

        const result = await response.json();
        
        // Format the response for C1
        return JSON.stringify({
          ticker: result.ticker,
          recommendation: result.final_decision,
          current_price: result.market_data?.current_price,
          analysts: {
            market: result.market_report,
            fundamentals: result.fundamentals_report,
            news: result.news_report,
            social: result.social_report,
          },
          timestamp: new Date().toISOString(),
        }, null, 2);
      } catch (error) {
        return JSON.stringify({
          error: "Failed to analyze stock",
          details: error instanceof Error ? error.message : String(error),
        });
      }
    },
  },
};

/**
 * Backtest Strategy Tool
 */
export const backtestStrategyTool: RunnableToolFunctionWithParse<{
  ticker: string;
  start_date: string;
  end_date: string;
  initial_capital?: number;
}> = {
  type: "function",
  function: {
    name: "backtest_strategy",
    description: "Run backtesting on a trading strategy with historical data",
    parameters: zodToJsonSchema(
      z.object({
        ticker: z.string().describe("Stock ticker symbol"),
        start_date: z.string().describe("Start date in YYYY-MM-DD format"),
        end_date: z.string().describe("End date in YYYY-MM-DD format"),
        initial_capital: z.number().optional().describe("Initial capital amount (default: 100000)"),
      })
    ),
    parse: (args: string) => JSON.parse(args),
    function: async ({ ticker, start_date, end_date, initial_capital = 100000 }) => {
      try {
        const response = await fetch(`${TRADINGAGENTS_API}/backtest`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ticker, start_date, end_date, initial_capital }),
        });

        const result = await response.json();
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return JSON.stringify({
          error: "Backtest failed",
          details: error instanceof Error ? error.message : String(error),
        });
      }
    },
  },
};

/**
 * Calculate Risk Tool
 */
export const calculateRiskTool: RunnableToolFunctionWithParse<{
  ticker: string;
  account_value: number;
  risk_per_trade_pct: number;
  current_price: number;
}> = {
  type: "function",
  function: {
    name: "calculate_risk",
    description: "Calculate position sizing and risk metrics for a trade",
    parameters: zodToJsonSchema(
      z.object({
        ticker: z.string().describe("Stock ticker symbol"),
        account_value: z.number().describe("Total account value in dollars"),
        risk_per_trade_pct: z.number().describe("Risk per trade as percentage (0.1-10.0)"),
        current_price: z.number().describe("Current stock price"),
      })
    ),
    parse: (args: string) => JSON.parse(args),
    function: async ({ ticker, account_value, risk_per_trade_pct, current_price }) => {
      try {
        const response = await fetch(`${TRADINGAGENTS_API}/risk`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ticker, account_value, risk_per_trade_pct, current_price }),
        });

        const result = await response.json();
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return JSON.stringify({
          error: "Risk calculation failed",
          details: error instanceof Error ? error.message : String(error),
        });
      }
    },
  },
};

/**
 * Get Sentiment Tool
 */
export const getSentimentTool: RunnableToolFunctionWithParse<{
  ticker: string;
}> = {
  type: "function",
  function: {
    name: "get_sentiment",
    description: "Get social media sentiment analysis for a stock from Twitter, StockTwits, and Reddit",
    parameters: zodToJsonSchema(
      z.object({
        ticker: z.string().describe("Stock ticker symbol"),
      })
    ),
    parse: (args: string) => JSON.parse(args),
    function: async ({ ticker }) => {
      try {
        const response = await fetch(`${TRADINGAGENTS_API}/sentiment/${ticker}`);
        const result = await response.json();
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return JSON.stringify({
          error: "Sentiment analysis failed",
          details: error instanceof Error ? error.message : String(error),
        });
      }
    },
  },
};
```

### Step 5: Register Your Tools

Update `c1-template/src/app/api/chat/tools.ts`:

```typescript
import type { RunnableToolFunctionWithParse } from "openai/lib/RunnableFunction.mjs";
import type { RunnableToolFunctionWithoutParse } from "openai/lib/RunnableFunction.mjs";
import { googleImageTool } from "./tools/googleImage";
import { weatherTool } from "./tools/weather";
import { 
  analyzeStockTool, 
  backtestStrategyTool, 
  calculateRiskTool, 
  getSentimentTool 
} from "./tools/tradingagents";

export const tools: (
  | RunnableToolFunctionWithoutParse
  | RunnableToolFunctionWithParse<any>
)[] = [
  googleImageTool, 
  weatherTool,
  // Your TradingAgents tools
  analyzeStockTool,
  backtestStrategyTool,
  calculateRiskTool,
  getSentimentTool,
];
```

### Step 6: Create Python API Backend

Create `tradingagents_api.py` in your root directory:

```python
from flask import Flask, request, jsonify
from flask_cors import CORS
from tradingagents.graph.trading_graph import TradingAgentsGraph
from tradingagents.default_config import DEFAULT_CONFIG

app = Flask(__name__)
CORS(app)

# Initialize TradingAgents
config = DEFAULT_CONFIG.copy()
config["quick_think_llm"] = "gpt-4o-mini"
config["max_debate_rounds"] = 1
graph = TradingAgentsGraph(config=config)

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    ticker = data.get('ticker')
    max_debate_rounds = data.get('max_debate_rounds', 1)
    
    try:
        result = graph.run(ticker=ticker, timeframe="1mo")
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/backtest', methods=['POST'])
def backtest():
    # Implement backtest logic
    pass

@app.route('/risk', methods=['POST'])
def calculate_risk():
    # Implement risk calculation
    pass

@app.route('/sentiment/<ticker>', methods=['GET'])
def get_sentiment(ticker):
    # Implement sentiment analysis
    pass

if __name__ == '__main__':
    app.run(port=5000, debug=True)
```

### Step 7: Run Everything

**Terminal 1 - Python API:**
```bash
python tradingagents_api.py
```

**Terminal 2 - C1 Frontend:**
```bash
cd c1-template
pnpm run dev
```

**Open:** http://localhost:3000

---

## How to Use

Once running, just chat naturally:

```
"Analyze AAPL stock"
"What's the sentiment for Tesla?"
"Backtest a strategy on NVDA from 2024-01-01 to 2024-12-01"
"Calculate risk for buying 100 shares of MSFT at $420"
```

C1 will automatically:
1. Detect which tool to use
2. Call your TradingAgents backend
3. Format and display the results beautifully

---

## Advantages Over MCP

| Feature | MCP Approach | C1 Template Approach |
|---------|--------------|---------------------|
| Setup | Complex protocol | Simple HTTP calls |
| Maintenance | Two systems | One integrated system |
| Debugging | Harder | Easier |
| Customization | Limited | Full control |
| UI Quality | Basic | Professional |
| Deployment | Complicated | Standard Next.js |

---

## Next Steps

1. ✅ Get Thesys API key from https://chat.thesys.dev/console/keys
2. ✅ Set up `.env` file
3. ✅ Create the TradingAgents tools file
4. ✅ Create the Python API backend
5. ✅ Run both servers
6. ✅ Test in browser

Want me to help you implement any of these steps?
