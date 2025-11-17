# 📊 TradingAgents Data Flow - Where Prices Come From

## Current Issue
**Problem:** TSLA showing $358.64 instead of ~$404
**Root Cause:** Using yfinance which has 15-minute delayed data OR cached old data

---

## 🔄 Complete Data Flow

```
User Request (TSLA)
    ↓
Frontend (C1 Chat)
    ↓
API Call: POST /analyze
    ↓
tradingagents_api.py
    ↓
TradingAgentsGraph.run()
    ↓
Market Analyst Agent
    ↓
get_stock_data() tool
    ↓
route_to_vendor() [interface.py]
    ↓
Check config: "core_stock_apis"
    ↓
Current: "yfinance" ← THIS IS THE PROBLEM
    ↓
get_YFin_data_online() [y_finance.py]
    ↓
Yahoo Finance API (15-min delay)
    ↓
Returns price data
    ↓
Stored in result["current_price"]
    ↓
Returned to API
    ↓
Sent to Frontend
    ↓
Displayed to User
```

---

## 📍 Key Files in Data Flow

### 1. Configuration
**File:** `tradingagents/default_config.py`
```python
"data_vendors": {
    "core_stock_apis": "yfinance",  ← CHANGE THIS
}
```

### 2. Routing Logic
**File:** `tradingagents/dataflows/interface.py`
- Routes method calls to correct vendor
- Handles fallbacks if vendor fails
- Available vendors for stock data:
  - ✅ `marketdata` - Real-time (your paid API)
  - ✅ `alpha_vantage` - Free but rate limited
  - ✅ `yfinance` - Free but 15-min delayed
  - ✅ `local` - Cached data

### 3. Vendor Implementations
**Files:**
- `tradingagents/dataflows/marketdata.py` - MarketData.app (REAL-TIME)
- `tradingagents/dataflows/alpha_vantage.py` - Alpha Vantage
- `tradingagents/dataflows/y_finance.py` - Yahoo Finance (DELAYED)
- `tradingagents/dataflows/local.py` - Local cache

### 4. Tool Definition
**File:** `tradingagents/agents/utils/core_stock_tools.py`
```python
@tool
def get_stock_data(symbol, start_date, end_date):
    return route_to_vendor("get_stock_data", symbol, start_date, end_date)
```

### 5. API Response
**File:** `tradingagents_api.py`
```python
response = {
    "market_data": {
        "current_price": result.get("current_price"),  ← FROM VENDOR
    }
}
```

---

## 🔧 Solutions

### Option 1: Use MarketData.app (RECOMMENDED)
**Change in `default_config.py`:**
```python
"data_vendors": {
    "core_stock_apis": "marketdata",  # Real-time data
}
```

**Pros:**
- ✅ Real-time prices
- ✅ You're already paying for it
- ✅ Accurate data

**Cons:**
- ⚠️ API costs (but you have it)
- ⚠️ Rate limits (but generous)

---

### Option 2: Use Alpha Vantage
**Change in `default_config.py`:**
```python
"data_vendors": {
    "core_stock_apis": "alpha_vantage",  # Free, real-time
}
```

**Pros:**
- ✅ Real-time prices
- ✅ Free tier available

**Cons:**
- ⚠️ Rate limits (5 calls/min, 500/day)
- ⚠️ Need API key

---

### Option 3: Hybrid Approach
**Change in `default_config.py`:**
```python
"data_vendors": {
    "core_stock_apis": "marketdata,yfinance",  # Try marketdata first, fallback to yfinance
}
```

**Pros:**
- ✅ Real-time when available
- ✅ Fallback if rate limited

**Cons:**
- ⚠️ Complex logic
- ⚠️ May still show delayed data

---

## 🎯 Recommended Fix

**1. Update config to use MarketData.app:**
```python
# In tradingagents/default_config.py
"data_vendors": {
    "core_stock_apis": "marketdata",  # ← CHANGE THIS LINE
    "technical_indicators": "yfinance",
    "fundamental_data": "fmp",
    "news_data": "newsdata",
},
```

**2. Verify MarketData.app API key is set:**
```bash
# Check .env file has:
MARKETDATA_API_KEY=your_key_here
```

**3. Clear cache:**
```bash
python clear_cache.py
```

**4. Test locally:**
```bash
python test_api_quote.py TSLA
```

**5. Commit and deploy:**
```bash
git add tradingagents/default_config.py
git commit -m "Use MarketData.app for real-time stock prices"
git push origin main
```

---

## 🔍 Debugging Commands

### Check what vendor is being used:
```bash
# Look for this in logs:
DEBUG: get_stock_data - Primary: [yfinance]
```

### Test MarketData.app directly:
```bash
python test_marketdata_simple.py TSLA
```

### Check cache:
```bash
ls -la tradingagents/dataflows/data_cache/
```

---

## 📝 Notes

- **yfinance** is free but has 15-minute delay
- **MarketData.app** is real-time but costs money (you have it)
- **Alpha Vantage** is real-time but rate limited
- The system has automatic fallback if primary vendor fails
- Cache can cause stale data - clear it after config changes

---

## ✅ Quick Fix Summary

1. Open `tradingagents/default_config.py`
2. Change line 24: `"core_stock_apis": "yfinance"` → `"core_stock_apis": "marketdata"`
3. Save, commit, push
4. Wait for Render to redeploy
5. Test again - should show real-time prices!
