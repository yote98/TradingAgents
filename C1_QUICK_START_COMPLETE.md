# 🚀 C1 + TradingAgents - Quick Start Guide

## ✅ Setup Complete!

I've created all the files you need. Here's how to get it running:

---

## Step 1: Get Your Thesys API Key

1. Go to: **https://chat.thesys.dev/console/keys**
2. Sign in or create an account
3. Generate a new API key
4. Copy the key

---

## Step 2: Configure Environment

Edit `c1-template/.env` and add your Thesys API key:

```env
THESYS_API_KEY=your_actual_key_here
```

The other settings are already configured!

---

## Step 3: Install C1 Dependencies

```bash
cd c1-template
pnpm install
```

(If you don't have pnpm: `npm install -g pnpm`)

---

## Step 4: Start Both Servers

### Terminal 1 - Python API (TradingAgents Backend)

```bash
# From project root
python tradingagents_api.py
```

You should see:
```
============================================================
TradingAgents API Server
============================================================
Initializing TradingAgents...
✅ TradingAgents initialized successfully
============================================================

🚀 Starting TradingAgents API Server...
📍 Server will run on: http://localhost:5000
```

**Keep this terminal open!**

### Terminal 2 - C1 Frontend

```bash
cd c1-template
pnpm run dev
```

You should see:
```
  ▲ Next.js 15.2.4
  - Local:        http://localhost:3000
```

---

## Step 5: Open and Test!

1. Open your browser to: **http://localhost:3000**
2. You'll see the beautiful C1 chat interface
3. Try these commands:

### Test Commands:

**Analyze a stock:**
```
Analyze AAPL stock
```

**Get sentiment:**
```
What's the sentiment for Tesla?
```

**Calculate risk:**
```
Calculate risk for buying NVDA at $140 with a $100,000 account and 2% risk
```

**Backtest:**
```
Backtest MSFT from 2024-01-01 to 2024-12-01
```

---

## What You Should See

### ✅ Success Looks Like:

1. **C1 Chat loads** with a clean interface
2. **You type a message** about stocks
3. **C1 automatically calls** the right TradingAgents tool
4. **You get detailed analysis** with:
   - Current price
   - Analyst reports (Market, Fundamentals, News, Social)
   - Buy/Sell/Hold recommendation
   - Confidence score
   - Target price and stop loss

### ❌ If Something's Wrong:

**"Failed to analyze stock"**
- Check if Python API is running (Terminal 1)
- Make sure it's on port 5000
- Check for errors in the Python terminal

**"Invalid API key"**
- Check your Thesys API key in `.env`
- Make sure you copied it correctly
- Try generating a new key

**C1 doesn't call the tools**
- Be explicit: "Use the analyze_stock tool for AAPL"
- Or: "Call the TradingAgents analysis for Tesla"

---

## Architecture

```
User types in C1 Chat
    ↓
C1 detects stock query
    ↓
Calls analyze_stock tool
    ↓
HTTP request to localhost:5000
    ↓
TradingAgents runs analysis
    ↓
4 analysts gather data in parallel
    ↓
Bull vs Bear debate
    ↓
Final recommendation
    ↓
Response back to C1
    ↓
Beautiful formatted display
```

---

## Available Tools

C1 now has access to:

1. **analyze_stock** - Full multi-agent analysis
   - Market analyst (technical indicators)
   - Fundamentals analyst (financial metrics)
   - News analyst (news & insider data)
   - Social analyst (Twitter, Reddit sentiment)

2. **backtest_strategy** - Historical testing
   - Performance metrics
   - Win rate, Sharpe ratio
   - Max drawdown

3. **calculate_risk** - Position sizing
   - Recommended shares to buy
   - Stop loss price
   - Risk/reward ratio

4. **get_sentiment** - Social sentiment
   - Twitter, StockTwits, Reddit
   - Sentiment scores
   - Trending topics

---

## Customization

### Change the Theme

Edit `c1-template/src/theme.ts`:
- Light theme colors
- Dark theme colors
- Fonts and spacing

### Add More Tools

1. Create new tool in `c1-template/src/app/api/chat/tools/`
2. Add endpoint in `tradingagents_api.py`
3. Register in `c1-template/src/app/api/chat/tools.ts`

### Adjust Analysis Speed

In `tradingagents_api.py`, change:
```python
config["max_debate_rounds"] = 1  # Increase for deeper analysis
config["quick_think_llm"] = "gpt-4o"  # Use better model
```

---

## Troubleshooting

### Port Already in Use

**Python API (5000):**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <process_id> /F

# Then restart
python tradingagents_api.py
```

**C1 Frontend (3000):**
```bash
# Kill and restart
cd c1-template
pnpm run dev
```

### Dependencies Issues

**Python:**
```bash
pip install flask flask-cors
```

**Node:**
```bash
cd c1-template
rm -rf node_modules
pnpm install
```

---

## What's Next?

Once this is working, you can:

1. ✅ Deploy to production (Vercel for frontend, any server for Python)
2. ✅ Add more analysts (crypto, macro, options)
3. ✅ Implement real backtesting
4. ✅ Add real-time sentiment analysis
5. ✅ Create custom themes
6. ✅ Add authentication
7. ✅ Store analysis history

---

## Need Help?

Check these files:
- `C1_TEMPLATE_INTEGRATION_GUIDE.md` - Detailed integration guide
- `c1-template/README.md` - C1 template documentation
- `tradingagents_api.py` - API server code

---

## Summary

You now have:
- ✅ Professional C1 chat interface
- ✅ TradingAgents multi-agent system
- ✅ 4 analysis tools integrated
- ✅ Simple HTTP API connection
- ✅ Beautiful UI with themes
- ✅ Real-time streaming responses

**Just start both servers and open http://localhost:3000!** 🎉
