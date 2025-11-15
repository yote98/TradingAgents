# Debugging Data Issues - Why NVDA Shows Old Data

## 🔍 Quick Diagnosis Checklist

### Step 1: Check Which Data Source Is Being Used

**In Render Logs**, look for these messages when analyzing NVDA:

```
[DEBUG] Fetched X rows for NVDA from 2024-XX-XX to 2024-XX-XX
[DEBUG] Latest date: 2024-XX-XX, Close: $XXX.XX
```

**What to look for:**
- ✅ Latest date should be today or yesterday (if after market close)
- ❌ If date is weeks/months old = using cached/old data

### Step 2: Verify API Keys in Render

Go to: **Render Dashboard → tradingagents-api → Environment**

Check these are set:
- [ ] `MARKETDATA_API_KEY` = your_key_here
- [ ] `FMP_API_KEY` = your_key_here  
- [ ] `NEWSDATA_API_KEY` = your_key_here
- [ ] `NEWSAPI_API_KEY` = your_key_here
- [ ] `OPENAI_API_KEY` = your_key_here
- [ ] `ALPHA_VANTAGE_API_KEY` = your_key_here

### Step 3: Check Deployment Status

**In Render Dashboard:**
- Is the latest deployment successful?
- Did it deploy the latest code (commit: 5a84f48)?
- Any errors in the build logs?

### Step 4: Test API Keys Locally

Run the test script:
```bash
python test_marketdata.py
```

Expected output:
```
✅ NVDA Price: $XXX.XX
✅ Updated: 2024-XX-XX XX:XX:XX
✅ Latest data: 2024-XX-XX - Close: $XXX.XX
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Still using yfinance instead of MarketData.app"

**Symptoms:**
- Data is 15 minutes delayed
- Logs show yfinance being called

**Cause:**
- `MARKETDATA_API_KEY` not set in Render
- API key is invalid/expired

**Solution:**
1. Add API key to Render environment
2. Redeploy the service
3. Wait 2-3 minutes for restart

### Issue 2: "Data is from weeks/months ago"

**Symptoms:**
- NVDA shows price from November 1st
- Logs show old dates

**Cause:**
- Using cached CSV files from local development
- Cache not being cleared

**Solution:**
1. Check if `data_cache_dir` has old files
2. Clear cache on Render (delete old deployments)
3. Force fresh fetch by changing date range

### Issue 3: "API returns error"

**Symptoms:**
- Error messages in logs
- "No data found" responses

**Possible Causes:**
- Rate limit hit (free trial limits)
- Invalid ticker symbol
- API key expired
- Network timeout

**Solution:**
1. Check API usage/limits in provider dashboard
2. Verify ticker symbol is correct (NVDA not NVIDIA)
3. Check API key is still valid
4. Increase timeout in code

### Issue 4: "Fallback to yfinance happening"

**Symptoms:**
- MarketData.app fails
- System automatically uses yfinance
- Data is delayed but working

**Cause:**
- This is actually GOOD - fallback is working!
- But means primary source failed

**Solution:**
1. Check why MarketData.app failed (logs)
2. Fix the primary issue
3. System will auto-switch back

---

## 🔧 Manual Testing Commands

### Test 1: Check if backend is using correct config

SSH into Render or check logs for:
```
INFO:tradingagents.dataflows.config:Using marketdata for core_stock_apis
INFO:tradingagents.dataflows.config:Using fmp for fundamental_data
INFO:tradingagents.dataflows.config:Using newsdata for news_data
```

### Test 2: Test MarketData.app API directly

```bash
curl "https://api.marketdata.app/v1/stocks/quotes/NVDA/?token=YOUR_API_KEY"
```

Expected response:
```json
{
  "s": "ok",
  "last": [XXX.XX],
  "updated": [timestamp]
}
```

### Test 3: Check cache directory

In Render shell (if available):
```bash
ls -la tradingagents/dataflows/data_cache/
```

Look for old NVDA CSV files and their timestamps.

---

## 📊 Expected Behavior

### When Working Correctly:

1. **User asks**: "Analyze NVDA"
2. **System calls**: MarketData.app API
3. **API returns**: Real-time data (within seconds of market close)
4. **System processes**: Latest price, volume, etc.
5. **User sees**: Current/recent data in analysis

### Current Flow:

```
User Request
    ↓
Market Analyst Agent
    ↓
get_stock_data() tool
    ↓
route_to_vendor("get_stock_data", "NVDA", start, end)
    ↓
Check config: "core_stock_apis" = "marketdata"
    ↓
Call: get_marketdata_stock("NVDA", start, end)
    ↓
API Request to MarketData.app
    ↓
Return CSV with latest data
```

---

## 🚨 Emergency Fallback

If MarketData.app isn't working and you need to launch NOW:

### Option A: Use yfinance temporarily
```python
# In default_config.py, change:
"core_stock_apis": "yfinance"  # 15-min delay but works
```

### Option B: Use Alpha Vantage
```python
# In default_config.py, change:
"core_stock_apis": "alpha_vantage"  # Only 25 calls/day
```

### Option C: Use multiple sources
```python
# Try MarketData first, fallback to yfinance
# This is already implemented in the routing logic!
```

---

## 📝 Debugging Checklist

Run through this list:

- [ ] API keys added to Render environment
- [ ] Latest code deployed (commit 5a84f48)
- [ ] Deployment successful (no errors)
- [ ] Test script passes locally
- [ ] Render logs show correct data source
- [ ] Render logs show recent dates
- [ ] No rate limit errors in logs
- [ ] Cache cleared (if needed)
- [ ] Tried analyzing different stocks (AAPL, TSLA, MSFT)
- [ ] Waited 2-3 minutes after deployment

---

## 🎯 Quick Fix Commands

### Force redeploy on Render:
```bash
git commit --allow-empty -m "Force redeploy"
git push
```

### Clear local cache:
```bash
rm -rf tradingagents/dataflows/data_cache/*
```

### Test specific stock locally:
```python
from tradingagents.dataflows.marketdata import get_marketdata_quote
print(get_marketdata_quote("NVDA"))
```

---

## 📞 Still Not Working?

If you've tried everything above:

1. **Check Render logs** - Copy the full error message
2. **Check API provider status** - Is MarketData.app down?
3. **Verify free trial** - Is it still active?
4. **Test with different stock** - Maybe NVDA specifically has issues?
5. **Use fallback** - Switch to yfinance temporarily

**Most likely causes:**
1. API key not set in Render (80% of cases)
2. Deployment didn't complete (15% of cases)
3. API rate limit hit (4% of cases)
4. API provider issue (1% of cases)

---

## ✅ Success Indicators

You'll know it's working when:

1. ✅ Render logs show: `[DEBUG] Latest date: 2024-11-15, Close: $XXX.XX`
2. ✅ NVDA analysis shows today's or yesterday's price
3. ✅ Price matches what you see on Yahoo Finance/Google
4. ✅ No "using mock data" or "data may be delayed" warnings
5. ✅ Analysis completes in 30-60 seconds

---

**Need help?** Share:
1. Render logs (last 50 lines)
2. Which stock you're testing
3. What price it's showing vs actual price
4. Screenshot of Render environment variables (hide the actual keys!)
