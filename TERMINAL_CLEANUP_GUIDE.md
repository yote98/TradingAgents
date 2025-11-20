# Terminal Cleanup Guide

## Current System Status

### What You Need Running
1. **Frontend (c1-template)** - Port 3000
2. **Backend (Python API)** - Running on Render (deployed)

### What You DON'T Need Running Locally
- ❌ Local Python backend (since it's deployed on Render)
- ❌ Multiple test scripts
- ❌ Old development servers

## How to Clean Up Terminals

### Step 1: Identify What's Running
In each terminal, press `Ctrl+C` to stop any running process, then check:
```bash
# Check if anything is using port 3000 (frontend)
netstat -ano | findstr :3000

# Check if anything is using port 5000 (backend)
netstat -ano | findstr :5000
```

### Step 2: Close Unnecessary Terminals
Close any terminal that shows:
- Old test runs
- Stopped processes
- Error messages
- Completed scripts

### Step 3: Keep Only These Open

#### Terminal 1: Frontend Development
```bash
cd c1-template
npm run dev
```
Should show: `Ready on http://localhost:3000`

#### Terminal 2: Optional - For Testing
Keep one terminal free for running quick tests like:
```bash
python test_tsla_price.py
```

## Quick Start Commands

### Start Frontend Only (Recommended)
```bash
cd c1-template
npm run dev
```

Then visit: http://localhost:3000

The backend is already running on Render at:
https://tradingagents-api-tacj.onrender.com

### Test Backend Connection
```bash
python test_tsla_price.py
```

## Environment Variables Check

Make sure these files exist and are correct:
- ✅ `c1-template/.env` - Has NEXT_PUBLIC_BACKEND_URL
- ✅ `.env` (root) - Has all API keys

## Current Configuration

**Frontend**: http://localhost:3000
**Backend**: https://tradingagents-api-tacj.onrender.com (deployed)

**API Keys Configured**:
- ✅ OpenAI
- ✅ MarketData.app
- ✅ Alpha Vantage
- ✅ Thesys C1
- ✅ Stripe

## Troubleshooting

### If Frontend Won't Start
```bash
cd c1-template
rm -rf .next
npm run dev
```

### If Prices Don't Show
1. Check backend is running: https://tradingagents-api-tacj.onrender.com/health
2. Check NEXT_PUBLIC_BACKEND_URL in c1-template/.env
3. Restart frontend: `Ctrl+C` then `npm run dev`

### If You See Port Already in Use
```bash
# Kill process on port 3000
netstat -ano | findstr :3000
# Note the PID (last column)
taskkill /PID <PID> /F
```

## Summary

**You only need 1 terminal running:**
- Frontend dev server in `c1-template`

**Backend is deployed and doesn't need a local terminal.**

Close all other terminals to reduce confusion!
