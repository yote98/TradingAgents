# 🚀 DEPLOY TODAY - Quick Checklist

## ✅ What's Already Done

- ✅ Discord webhook tested and working
- ✅ Discord bot configured for Coach N
- ✅ MCP Server built and tested
- ✅ Live data verified (BTC showing $103k+)
- ✅ C1 Chat integration working
- ✅ Dashboard built and tested
- ✅ All agents validated

## 🎯 Final Steps Before Deployment (30 minutes)

### Step 1: Enable Message Content Intent (2 min)
**CRITICAL for Discord bot to work!**

1. Go to: https://discord.com/developers/applications
2. Click "Assets Screener"
3. Go to "Bot" section
4. Scroll to "Privileged Gateway Intents"
5. ✅ Enable "MESSAGE CONTENT INTENT"
6. Click "Save Changes"

### Step 2: Start Discord Bot (1 min)
```bash
python discord_to_coach_n.py
```
Leave it running in background - it will capture Unusual Whales signals

### Step 3: Quick System Test (5 min)
```bash
# Test live data
python verify_live_prices_now.py

# Test MCP connection
python test_c1_mcp_connection.py
```

### Step 4: Start Dashboard (Optional - 2 min)
```bash
cd aiapp
npm run dev
```
Access at: http://localhost:3000

### Step 5: Test C1 Chat (5 min)
1. Open C1 Chat
2. Ask: "Use analyze_stock tool for AAPL"
3. Verify: Shows real live price with timestamp
4. Verify: Says "Live data from yfinance"

### Step 6: Test Coach N Integration (5 min)
1. Post a test message in your Unusual Whales channel
2. Check `coach_n_signals.json` file is created
3. Verify message was captured

## 🎉 YOU'RE DEPLOYED!

Once all steps pass, you're live with:
- ✅ Real-time stock analysis
- ✅ Discord integration for Coach N
- ✅ C1 Chat interface
- ✅ Dashboard (optional)
- ✅ Live data (no synthetic)

## 📊 What You Can Do Now

1. **Analyze any stock:**
   - "Analyze TSLA"
   - "What's the risk for NVDA?"
   - "Backtest a strategy for AAPL"

2. **Get Unusual Whales signals:**
   - Bot automatically captures them
   - Coach N uses them in analysis

3. **Use the dashboard:**
   - Visual charts
   - Risk metrics
   - Backtest results

## 🆘 If Something Goes Wrong

**Discord bot not working?**
- Check MESSAGE CONTENT INTENT is enabled
- Verify bot token is correct
- Check channel ID is correct

**C1 showing synthetic data?**
- Make sure to say "Use analyze_stock tool"
- Check MCP server is running
- Restart C1

**Dashboard not loading?**
- Run `npm install` first
- Check port 3000 is available
- Try `npm run build` then `npm start`

## 🎯 Success Metrics

You'll know it's working when:
- ✅ BTC shows $103k+ (not $67k)
- ✅ Discord bot captures messages
- ✅ C1 uses MCP tools
- ✅ All prices have timestamps
- ✅ No "synthetic data" warnings

---

**Ready to deploy? Let's do this! 🚀**
