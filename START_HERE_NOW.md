# 🎯 START C1 RIGHT NOW

You're ready! Here's exactly what to do:

## Step 1: Double-Click This File
```
start_c1.bat
```

That's it! It will:
- ✅ Start the TradingAgents API
- ✅ Start the C1 frontend  
- ✅ Open your browser

## Step 2: Wait 20 Seconds

You'll see two command windows open. Wait for:
- Window 1: "✅ TradingAgents initialized successfully"
- Window 2: "Local: http://localhost:3000"

## Step 3: Try It!

In the C1 chat, type:
```
Analyze AAPL stock
```

You should see:
- 📊 Market analysis
- 📈 Fundamentals
- 📰 News sentiment
- 💬 Social media buzz
- 🎯 Buy/Sell/Hold recommendation

---

## If Something Goes Wrong

### Test Everything First:
```bash
python test_c1_setup.py
```

This will tell you exactly what's broken.

### Or Test Just the API:
```bash
python test_api_quick.py
```

This runs a full analysis test (takes 60 seconds).

---

## Manual Start (If Batch File Doesn't Work)

### Terminal 1:
```bash
python tradingagents_api.py
```

### Terminal 2:
```bash
cd c1-template
npm run dev
```

### Browser:
```
http://localhost:3000
```

---

## What's Already Set Up

✅ Your OpenAI API key (in `.env`)  
✅ Your Thesys API key (in `c1-template/.env`)  
✅ TradingAgents API server (`tradingagents_api.py`)  
✅ C1 frontend with tools configured  
✅ All dependencies installed  

---

## You're 30 Seconds Away!

Just run:
```
start_c1.bat
```

Or if you want to be extra sure first:
```
python test_api_quick.py
```

That's it! 🚀
