# Data Caching Guide

> **Key Insight:** Cached data is FREE. Only new API calls cost money.

---

## 🎯 Understanding the Cache System

### What Gets Cached?

The TradingAgents system automatically caches:
- **Stock price data** (OHLCV - Open, High, Low, Close, Volume)
- **Technical indicators** (MACD, RSI, Bollinger Bands, etc.)
- **Fundamental data** (Balance sheets, income statements, cash flow)
- **News articles** and sentiment data
- **Insider transactions**
- **Company information**

### Where is Data Cached?

**Cache Location:** `tradingagents/dataflows/data_cache/`

**Cache Structure:**
```
tradingagents/dataflows/data_cache/
├── AAPL_price_data.json
├── AAPL_fundamentals.json
├── MSFT_price_data.json
├── MSFT_fundamentals.json
└── ...
```

---

## 💰 Cost Implications

### API Costs (Alpha Vantage)
- **Free Tier:** 25 API calls per day
- **Premium Tier:** 75+ calls per day (paid)

### LLM Costs (OpenAI)
- **Data retrieval:** FREE if cached
- **Analysis:** Costs apply (but reduced with cached data)

### Example Cost Comparison

**Without Cache (First Analysis):**
```
Stock: AAPL
API Calls: 5 (price, indicators, fundamentals, news, insider)
LLM Analysis: $0.20
Total: 5 API calls + $0.20
```

**With Cache (Subsequent Analysis):**
```
Stock: AAPL
API Calls: 0 (all data from cache)
LLM Analysis: $0.20
Total: 0 API calls + $0.20
```

**Savings:** 5 API calls saved! This is huge for free tier users.

---

## 🚀 Maximizing Cache Usage

### Strategy 1: Analyze Same Stocks Repeatedly

**Bad Approach (High Cost):**
```python
# Analyzing different stocks every day
day_1 = ["AAPL", "MSFT", "GOOGL"]
day_2 = ["TSLA", "NVDA", "AMD"]
day_3 = ["META", "AMZN", "NFLX"]
# Result: 45 API calls over 3 days
```

**Good Approach (Low Cost):**
```python
# Analyzing same stocks every day
watchlist = ["AAPL", "MSFT", "GOOGL"]
day_1 = watchlist  # 15 API calls (initial)
day_2 = watchlist  # 0 API calls (cached!)
day_3 = watchlist  # 0 API calls (cached!)
# Result: 15 API calls over 3 days (67% savings)
```

---

### Strategy 2: Batch Analysis on Same Day

**Scenario:** You want to analyze AAPL multiple times today

**First Analysis (Morning):**
```python
# 9:00 AM - Before market open
graph.propagate("AAPL", "2024-01-15")
# API calls: 5 (data fetched and cached)
```

**Second Analysis (Midday):**
```python
# 12:00 PM - Mid-day check
graph.propagate("AAPL", "2024-01-15")
# API calls: 0 (uses cached data from morning)
```

**Third Analysis (Close):**
```python
# 4:00 PM - After market close
graph.propagate("AAPL", "2024-01-15")
# API calls: 0 (still using cached data)
```

**Total API Calls:** 5 instead of 15 (67% savings)

---

### Strategy 3: Focus on a Core Watchlist

**Recommended Approach:**

```python
# Define your core watchlist (5-10 stocks)
CORE_WATCHLIST = [
    "AAPL",   # Tech
    "MSFT",   # Tech
    "JPM",    # Finance
    "JNJ",    # Healthcare
    "XOM",    # Energy
]

# Analyze these stocks regularly
# First time: 25 API calls (5 stocks × 5 calls each)
# Subsequent times: 0 API calls (all cached)
```

**Benefits:**
- Deep familiarity with these stocks
- Minimal API usage after initial fetch
- Better trading decisions from repeated analysis

---

### Strategy 4: Weekly Deep Dive + Daily Quick Check

**Sunday (Deep Analysis):**
```python
# Full analysis with all analysts
config = get_config("long_term")
for stock in watchlist:
    graph.propagate(stock, "2024-01-14")
# API calls: 25 (5 stocks × 5 calls)
# LLM cost: $5 (5 stocks × $1)
```

**Monday-Friday (Quick Check):**
```python
# Quick check with cached data
config = get_config("day_trading")
for stock in watchlist:
    graph.propagate(stock, current_date)
# API calls: 0 (all cached from Sunday)
# LLM cost: $0.15 (5 stocks × $0.03)
```

**Weekly Total:**
- API calls: 25 (only on Sunday)
- LLM cost: $5.75 ($5 + $0.75)
- vs. Daily deep dive: 125 API calls, $35

---

## 📅 Cache Expiration

### When Does Cache Expire?

**Daily Data:**
- Expires at market close (4:00 PM ET)
- Fresh data needed next trading day

**Fundamental Data:**
- Expires quarterly (after earnings)
- Can be reused for weeks

**News Data:**
- Expires daily
- Fresh news needed each day

### Cache Refresh Strategy

**Automatic Refresh:**
The system automatically fetches new data when:
- Date changes
- Cache is older than 24 hours
- Data is missing

**Manual Cache Management:**
```python
# Clear cache for a specific stock
import os
cache_file = "tradingagents/dataflows/data_cache/AAPL_price_data.json"
if os.path.exists(cache_file):
    os.remove(cache_file)

# Clear entire cache (fresh start)
import shutil
shutil.rmtree("tradingagents/dataflows/data_cache/")
os.makedirs("tradingagents/dataflows/data_cache/")
```

---

## 🎓 Best Practices

### 1. Morning Routine (Optimal)

**Before Market Open (8:00-9:30 AM ET):**
```python
# Fetch fresh data for your watchlist
config = get_config("swing_trading")
for stock in CORE_WATCHLIST:
    graph.propagate(stock, today)
# This populates cache for the day
```

**During Market Hours:**
```python
# Use cached data for quick checks
# No additional API calls needed
```

---

### 2. Weekend Preparation

**Saturday/Sunday:**
```python
# Analyze your watchlist for the week ahead
# Use historical data (already cached)
for stock in CORE_WATCHLIST:
    graph.propagate(stock, last_trading_day)
# API calls: 0 (using cached data from Friday)
```

---

### 3. Backtesting (Maximum Cache Benefit)

**Scenario:** Testing strategy on historical data

```python
# First backtest
backtest_dates = ["2024-01-01", "2024-01-02", ..., "2024-01-31"]
for date in backtest_dates:
    graph.propagate("AAPL", date)
# API calls: 155 (31 days × 5 calls)

# Second backtest (different config)
for date in backtest_dates:
    graph.propagate("AAPL", date)
# API calls: 0 (all data cached from first run!)
```

**Benefit:** Test multiple strategies on same data with zero additional API costs.

---

## 📊 Cache Monitoring

### Check Your Cache

**View cached files:**
```python
import os

cache_dir = "tradingagents/dataflows/data_cache/"
cached_files = os.listdir(cache_dir)

print(f"Cached files: {len(cached_files)}")
for file in cached_files:
    print(f"  - {file}")
```

**Check cache size:**
```python
import os

def get_cache_size(directory):
    total_size = 0
    for dirpath, dirnames, filenames in os.walk(directory):
        for filename in filenames:
            filepath = os.path.join(dirpath, filename)
            total_size += os.path.getsize(filepath)
    return total_size / (1024 * 1024)  # Convert to MB

cache_size = get_cache_size("tradingagents/dataflows/data_cache/")
print(f"Cache size: {cache_size:.2f} MB")
```

---

## 💡 Advanced Caching Strategies

### Strategy 1: Pre-populate Cache

**Before starting live trading:**
```python
# Pre-fetch data for your entire watchlist
WATCHLIST = ["AAPL", "MSFT", "GOOGL", "TSLA", "NVDA"]

print("Pre-populating cache...")
for stock in WATCHLIST:
    print(f"Fetching {stock}...")
    graph.propagate(stock, today)
    
print("Cache populated! Future analyses will be faster and cheaper.")
```

---

### Strategy 2: Shared Cache for Multiple Strategies

**Scenario:** Testing different configurations

```python
# Strategy 1: Day trading config
config_1 = get_config("day_trading")
graph_1 = TradingAgentsGraph(config=config_1)
graph_1.propagate("AAPL", today)  # Fetches and caches data

# Strategy 2: Swing trading config
config_2 = get_config("swing_trading")
graph_2 = TradingAgentsGraph(config=config_2)
graph_2.propagate("AAPL", today)  # Uses cached data!

# Both strategies share the same cache
# API calls: 5 (only from first strategy)
```

---

### Strategy 3: Historical Data Archive

**Build a historical data archive:**
```python
# Fetch and cache historical data once
import pandas as pd

start_date = "2023-01-01"
end_date = "2023-12-31"
dates = pd.date_range(start_date, end_date, freq='B')  # Business days

for stock in CORE_WATCHLIST:
    print(f"Archiving {stock}...")
    for date in dates:
        graph.propagate(stock, date.strftime("%Y-%m-%d"))
        
print("Historical archive complete!")
print("You can now backtest any strategy with zero API costs.")
```

---

## 🚨 Common Pitfalls

### Pitfall 1: Analyzing Too Many Different Stocks

**Problem:**
```python
# Different stocks every day
day_1 = ["AAPL", "MSFT", "GOOGL"]
day_2 = ["TSLA", "NVDA", "AMD"]
day_3 = ["META", "AMZN", "NFLX"]
# Cache is never reused!
```

**Solution:**
```python
# Same stocks every day
WATCHLIST = ["AAPL", "MSFT", "GOOGL"]
# Cache is reused daily
```

---

### Pitfall 2: Clearing Cache Too Often

**Problem:**
```python
# Clearing cache before every analysis
shutil.rmtree("tradingagents/dataflows/data_cache/")
graph.propagate("AAPL", today)
# Defeats the purpose of caching!
```

**Solution:**
```python
# Let the system manage cache automatically
# Only clear when necessary (e.g., corrupted data)
```

---

### Pitfall 3: Not Leveraging Cache for Backtesting

**Problem:**
```python
# Running backtest without pre-populating cache
# Each backtest fetches data again
```

**Solution:**
```python
# Pre-populate cache once
# Run multiple backtests with different configs
# All use the same cached data
```

---

## 📈 ROI of Good Caching

### Example: Active Trader

**Without Cache Optimization:**
- 10 different stocks per day
- 20 trading days per month
- 10 × 20 × 5 = 1,000 API calls/month
- Exceeds free tier by 975 calls!

**With Cache Optimization:**
- 5 core stocks (cached after first fetch)
- 20 trading days per month
- 5 × 5 = 25 API calls/month (first day only)
- Stays within free tier!

**Savings:** 975 API calls = $0 vs potential premium tier costs

---

## ✅ Cache Optimization Checklist

**Daily:**
- [ ] Analyze same core watchlist
- [ ] Fetch data once in the morning
- [ ] Reuse cached data throughout the day

**Weekly:**
- [ ] Review cache usage
- [ ] Ensure core stocks are cached
- [ ] Clear old/unused cache files if needed

**Monthly:**
- [ ] Audit API usage
- [ ] Optimize watchlist size
- [ ] Archive historical data if backtesting

---

## 🎯 Quick Reference

### Cache Benefits Summary

| Action | API Calls | Cost |
|--------|-----------|------|
| First analysis (AAPL) | 5 | Free tier |
| Second analysis (AAPL, same day) | 0 | FREE |
| Third analysis (AAPL, same day) | 0 | FREE |
| Analysis (MSFT, first time) | 5 | Free tier |
| Analysis (MSFT, same day) | 0 | FREE |

### Optimal Workflow

1. **Morning:** Fetch fresh data for core watchlist (5-10 stocks)
2. **Day:** Analyze using cached data (unlimited, free)
3. **Evening:** Review results, plan next day
4. **Repeat:** Same stocks = maximum cache benefit

---

## 📚 Related Resources

- `COST_SAVING_TIPS.md` - General cost optimization
- `CONFIG_OPTIMIZATION_GUIDE.md` - Configuration strategies
- `MY_TRADING_STRATEGY.md` - Document your approach

---

## 💡 Key Takeaways

1. **Cache is your friend:** Reusing cached data is completely FREE
2. **Consistency pays:** Analyzing same stocks repeatedly maximizes cache benefit
3. **Morning fetch:** Get fresh data once, use all day
4. **Small watchlist:** 5-10 stocks is optimal for cache efficiency
5. **Backtesting gold:** Historical data cached once, reused infinitely
6. **Free tier friendly:** Good caching keeps you within 25 calls/day limit

---

**Remember:** The best API call is the one you don't make. Cache everything, reuse often! 🚀

---

**Last Updated:** 2024
