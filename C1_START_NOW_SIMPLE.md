# 🚀 Start C1 Right Now - Simple Guide

## What You Need

✅ OpenAI API Key (you have it in `.env`)  
✅ Thesys API Key (you have it in `c1-template/.env`)  
✅ Node.js installed (you have v24.10.0)  
✅ Python installed  

## Option 1: Automatic Start (Easiest)

Just double-click this file:
```
start_c1.bat
```

It will:
1. Start the TradingAgents API on port 5000
2. Start the C1 frontend on port 3000
3. Open your browser automatically

Wait 15-20 seconds for everything to load, then try:
- "Analyze AAPL stock"
- "What's the sentiment on TSLA?"
- "Backtest NVDA from 2024-01-01 to 2024-12-01"

---

## Option 2: Manual Start (More Control)

### Terminal 1 - Start API:
```bash
python tradingagents_api.py
```

Wait until you see: `✅ TradingAgents initialized successfully`

### Terminal 2 - Start Frontend:
```bash
cd c1-template
npm run dev
```

Wait until you see: `Local: http://localhost:3000`

### Open Browser:
Go to: http://localhost:3000

---

## Option 3: Test First (Recommended if unsure)

Run this to verify everything works:
```bash
python test_api_quick.py
```

This will:
- Check your API keys
- Initialize TradingAgents
- Run a quick test analysis on AAPL
- Tell you if anything is broken

Takes about 60 seconds. If it passes, you're 100% ready!

---

## Troubleshooting

### "API not initialized"
- Make sure `OPENAI_API_KEY` is in your `.env` file
- Check the API terminal for error messages

### "Connection refused"
- Make sure the API is running (Terminal 1)
- Check it's on port 5000: http://localhost:5000/health

### "Thesys error"
- Check your `THESYS_API_KEY` in `c1-template/.env`
- Get a new key: https://chat.thesys.dev/console/keys

### Frontend won't start
- Try: `cd c1-template && npm install`
- Then: `npm run dev`

---

## What You Can Ask C1

**Stock Analysis:**
- "Analyze AAPL stock"
- "What do you think about Tesla?"
- "Should I buy NVDA?"

**Backtesting:**
- "Backtest AAPL from 2024-01-01 to 2024-12-01"
- "Show me historical performance of TSLA"

**Risk Management:**
- "Calculate risk for AAPL at $180 with $100k account"
- "What position size for 2% risk on NVDA?"

**Sentiment:**
- "What's the social sentiment on Bitcoin?"
- "How do people feel about TSLA on Twitter?"

---

## Quick Status Check

Run this anytime to check what's working:
```bash
python test_c1_setup.py
```

---

## Need Help?

1. Check the Discord (you joined it!)
2. Look at the API terminal for errors
3. Check browser console (F12) for frontend errors
4. Run `test_c1_setup.py` to diagnose

---

## Files You Need

- `.env` - Your OpenAI key (root folder)
- `c1-template/.env` - Your Thesys key
- `tradingagents_api.py` - The API server
- `c1-template/` - The frontend

Everything else is already set up!

---

## Ready? Let's Go!

**Easiest way:**
```
Double-click: start_c1.bat
```

**Or manually:**
```bash
# Terminal 1
python tradingagents_api.py

# Terminal 2
cd c1-template
npm run dev

# Browser
http://localhost:3000
```

That's it! 🎉
