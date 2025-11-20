# Localhost Testing Guide

## Quick Start

### 1. Start Backend (Python API)
```bash
cd c1-template
python tradingagents_api.py
```
This starts the backend on `http://localhost:5000`

### 2. Start Frontend (Next.js)
Open a new terminal:
```bash
cd c1-template
npm run dev
```
This starts the frontend on `http://localhost:3000`

## What to Test

### Test 1: Landing Page
- Visit: http://localhost:3000/landing
- Check: Hero section, features, pricing cards load

### Test 2: Chat Interface
- Visit: http://localhost:3000/chat
- Try: "Analyze AAPL"
- Check: Price displays, AI responds

### Test 3: Manual Price Check
- In chat, type a stock symbol (e.g., "TSLA")
- Check: Real-time price shows in the display

### Test 4: Backend API
- Visit: http://localhost:5000/health
- Should return: `{"status": "healthy"}`

### Test 5: Stock Analysis
- In chat: "What's the latest on NVDA?"
- Check: Gets real data from MarketData/Alpaca

## Troubleshooting

### Backend won't start
```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Kill process if needed
taskkill /PID <process_id> /F
```

### Frontend won't start
```bash
# Clear cache and reinstall
cd c1-template
rm -rf .next node_modules
npm install
npm run dev
```

### API errors
- Check `.env` file has all keys
- Verify backend is running on port 5000
- Check browser console for errors

## Ready to Deploy?

If all tests pass:
1. ✅ Landing page loads
2. ✅ Chat works
3. ✅ Prices display correctly
4. ✅ AI analysis works
5. ✅ No console errors

Then you're ready to deploy to Vercel/Render!
