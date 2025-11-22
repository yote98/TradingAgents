# marketdata.app Testing Guide

## Test These 5 Prompts on Vercel

**Your Vercel URL:** https://trading-agents.vercel.app (or check deployment)

### Test 1: Multi-Stock Comparison (The Hallucination Test)
```
Compare AAPL, AMZN, and META prices
```

**Expected Results:**
- AAPL: ~$230-240
- AMZN: ~$210-220  
- META: ~$570-590

**Previous Issue:** All showing $180.45 ❌
**Should Now Show:** Distinct, accurate prices ✅

---

### Test 2: Financial Stocks
```
Show me JPM, BAC, and WFC prices
```

**Expected Results:**
- JPM: ~$298
- BAC: ~$45-50
- WFC: ~$70-75

**Previous Issue:** JPM showing wrong price
**Should Now Show:** All accurate ✅

---

### Test 3: Consumer Stocks
```
Compare DIS, NKE, and COST
```

**Expected Results:**
- DIS: ~$110-120
- NKE: ~$62-65
- COST: ~$895-905

**Previous Issue:** NKE and COST wrong prices
**Should Now Show:** All accurate ✅

---

### Test 4: Full Analysis (Should Work)
```
Give me complete analysis of AMZN with all 5 analysts
```

**Expected Results:**
- Accurate AMZN price (~$210-220)
- All 5 analysts run
- Market, Fundamental, News, Social, Options analysis

**Previous Status:** Working ✅
**Should Still Work:** Yes ✅

---

### Test 5: Index ETFs
```
Show SPY, QQQ, and DIA prices
```

**Expected Results:**
- SPY: ~$600-610
- QQQ: ~$510-520
- DIA: ~$440-450

**Previous Issue:** SPY and DIA showing $180.45
**Should Now Show:** All accurate ✅

---

## How to Check Results

### 1. Check Prices in Chat
Look at the StockCard components - prices should be distinct and accurate.

### 2. Check Vercel Logs
Go to: https://vercel.com/your-project/logs

Look for:
```
📊 Fetching AAPL from marketdata.app (PRIMARY)
✅ marketdata.app success: AAPL = $230.45
```

If you see:
```
⚠️ marketdata.app failed, trying fallback
```
Then it's using Yahoo Finance as backup.

### 3. Compare with Real Prices
Check against:
- Google Finance
- Yahoo Finance
- TradingView

Prices should be within $0-2 variance.

---

## Success Criteria

✅ **All 5 tests pass** with accurate, distinct prices
✅ **No $180.45 hallucinations**
✅ **Vercel logs show marketdata.app as primary source**
✅ **Prices match real market data (within $2)**

---

## If Tests Fail

### Scenario 1: Still seeing $180.45
**Cause:** AI still hallucinating
**Fix:** Need to strengthen system prompts further

### Scenario 2: All prices are $0.00
**Cause:** marketdata.app API key not set in Vercel
**Fix:** Add `MARKETDATA_API_KEY` to Vercel environment variables

### Scenario 3: Prices are close but not exact
**Cause:** Using Yahoo Finance fallback (15-min delay)
**Fix:** Check Vercel logs - if marketdata.app failing, check API key

### Scenario 4: Some stocks work, others don't
**Cause:** Mixed sources (some from marketdata.app, some from Yahoo)
**Fix:** This is actually OK - fallback is working as designed

---

## After Testing

### If All Tests Pass ✅
1. Document which source was used (check logs)
2. Note any price variances
3. Monitor for 24 hours
4. Consider removing fallback if 100% reliable

### If Tests Fail ❌
1. Share the exact prices you got
2. Share Vercel logs
3. We'll debug together

---

## Quick Test Command

Run this to test all 5 at once:

```bash
python test_marketdata_primary.py
```

This will hit the API directly and show which source is being used.

---

## Current Setup

**Primary:** marketdata.app (paid trial, real-time)
**Fallback:** Yahoo Finance (free, 15-min delay)
**Emergency:** Backend API (if running)

**Data Flow:**
```
User Query → /api/chat → Auto-fetch data → marketdata.app
                                              ↓ if fails
                                          Yahoo Finance
                                              ↓ if fails
                                          Backend API
                                              ↓ if fails
                                          Error
```

---

## Ready to Test?

1. Open https://trading-agents.vercel.app
2. Test all 5 prompts above
3. Report back with results!

Good luck! 🚀
