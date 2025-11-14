# 🎯 How to Get Live Data in C1 - Visual Guide

## The Problem (What's Happening Now)

```
You: "Analyze AAPL"
     ↓
C1:  [Thinks: "I'll use my training data"]
     ↓
C1:  "Apple is a technology company... [generic info from 2023]"
     ❌ NO LIVE DATA
```

## The Solution (What Should Happen)

```
You: "Use the analyze_stock tool to analyze AAPL"
     ↓
C1:  [Thinks: "I need to call the MCP tool"]
     ↓
C1:  [Calls: analyze_stock(ticker="AAPL")]
     ↓
MCP: [Fetches live data from yfinance]
     ↓
MCP: [Runs 4 AI analysts]
     ↓
MCP: [Returns analysis with today's data]
     ↓
C1:  "📊 ANALYSIS: AAPL
      Current Price: $269.88 (TODAY'S PRICE!)
      Recommendation: BUY
      ..."
     ✅ LIVE DATA!
```

---

## 🎯 The Magic Words

Just add these phrases to your requests:

| Instead of... | Say this... |
|--------------|-------------|
| "Analyze AAPL" | "**Use the analyze_stock tool** to analyze AAPL" |
| "What about TSLA?" | "**Call analyze_stock** on TSLA" |
| "Check NVDA" | "**Execute analyze_stock** for NVDA" |
| "Look at MSFT" | "**Run the MCP analyze_stock function** on MSFT" |

---

## 📝 Copy-Paste Commands

### For Stock Analysis:
```
Use the analyze_stock tool to analyze AAPL with all 4 analysts
```

### For Backtesting:
```
Use the backtest_strategy tool to test TSLA from 2024-01-01 to 2024-12-31
```

### For Risk Calculation:
```
Use the calculate_risk tool for NVDA with account value $10000 and 2% risk
```

### For Sentiment:
```
Use the get_sentiment tool to check social media sentiment for MSFT
```

---

## 🔧 Make It Automatic (System Prompt Update)

Add this to your C1 system prompt so you don't have to say "use the tool" every time:

```markdown
## MANDATORY TOOL USAGE

When users ask about stocks, you MUST use MCP tools:

**Stock Analysis Requests:**
- "Analyze [TICKER]" → Call analyze_stock tool
- "What about [TICKER]?" → Call analyze_stock tool
- "Check [TICKER]" → Call analyze_stock tool

**NEVER answer from training data. ALWAYS call the tool first.**

Example:
User: "Analyze AAPL"
You: [Automatically call analyze_stock(ticker="AAPL")]
Then: Present the live results
```

---

## ✅ How to Know It's Working

### With Live Data (Correct):
```
📊 ANALYSIS: AAPL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 RECOMMENDATION: BUY | Confidence: 78%

📈 CURRENT PRICE: $269.88  ← Real price from today!
🎯 TARGET: $295.00 (+9.3%)
🛡️ STOP LOSS: $258.00 (-4.4%)

🔍 ANALYST REPORTS:

📊 MARKET ANALYST:
RSI: 65.2 (from today's data)
MACD: Bullish crossover (calculated from live prices)
...

💼 FUNDAMENTAL ANALYST:
P/E Ratio: 28.5 (current)
Revenue Growth: 12% (latest quarter)
...

📰 NEWS ANALYST:
Recent earnings beat (this week)
3 analyst upgrades (this month)
...

🐦 SOCIAL ANALYST:
Twitter sentiment: 72% bullish (last 24 hours)
Trending topics: #AAPL #iPhone16 (today)
...
```

### Without Live Data (Wrong):
```
Apple Inc. is a technology company founded in 1976...
[Generic information]
[No specific prices]
[No current data]
[No analyst reports]
```

---

## 🧪 Test It Now

1. **Open C1 Chat**
2. **Copy this exact message:**
   ```
   Use the analyze_stock tool to analyze AAPL with all 4 analysts
   ```
3. **Paste and send**
4. **Wait 30-60 seconds** (it's running 4 AI analysts)
5. **Check the results** - you should see today's price and data!

---

## 🎯 Quick Troubleshooting

### If C1 says "I don't have that tool":
- Check MCP server status in C1 settings
- Restart C1 to reconnect MCP
- Verify MCP server is running

### If C1 ignores your request:
- Be more explicit: "You MUST use the analyze_stock tool"
- Update system prompt to make tool usage mandatory
- Try: "Call the MCP function analyze_stock"

### If it takes too long:
- Normal! Full analysis takes 30-60 seconds
- It's running 4 AI analysts + debate rounds
- You can reduce analysts: "Use analyze_stock with just market analyst"

---

## 📊 Available Tools

| Tool | What It Does | Example |
|------|-------------|---------|
| `analyze_stock` | Full multi-agent analysis | "Use analyze_stock for AAPL" |
| `backtest_strategy` | Test strategy on history | "Backtest TSLA from 2024-01-01 to 2024-12-31" |
| `calculate_risk` | Position sizing | "Calculate risk for NVDA with $10k account" |
| `get_sentiment` | Social media sentiment | "Get sentiment for MSFT" |

---

## 🎉 That's It!

Your system has live data. You just need to tell C1 to use it!

**The magic phrase:** "Use the [tool_name] tool"

Try it now! 🚀
