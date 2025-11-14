# 🎯 START HERE - C1 + TradingAgents

## ✅ Everything is Ready!

All files have been created. Follow these 4 simple steps:

---

## Step 1: Get Thesys API Key (2 minutes)

1. Go to: https://chat.thesys.dev/console/keys
2. Sign in or create account
3. Generate API key
4. Copy it

---

## Step 2: Add API Key (30 seconds)

Edit `c1-template/.env`:
```env
THESYS_API_KEY=paste_your_key_here
```

---

## Step 3: Install Dependencies (2 minutes)

```bash
cd c1-template
pnpm install
```

(Don't have pnpm? Run: `npm install -g pnpm`)

---

## Step 4: Start Both Servers

### Terminal 1 - Python API:
```bash
python tradingagents_api.py
```

### Terminal 2 - C1 Frontend:
```bash
cd c1-template
pnpm run dev
```

---

## Step 5: Open Browser

Go to: **http://localhost:3000**

Try: **"Analyze AAPL stock"**

---

## 🎉 That's It!

You now have a professional AI trading assistant powered by:
- Thesys C1 (beautiful UI)
- TradingAgents (multi-agent analysis)
- 4 specialized analysts
- Real-time data

Read `C1_QUICK_START_COMPLETE.md` for detailed guide!
