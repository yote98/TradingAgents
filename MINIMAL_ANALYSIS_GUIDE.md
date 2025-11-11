# Minimal Analysis Guide

> **Ultra-Fast, Ultra-Cheap:** Get trading signals in 10-20 seconds for just $0.01-0.05 per stock.

---

## 🎯 What is Minimal Analysis?

Minimal analysis uses **only 1 analyst** (Market Analyst) with the **cheapest model** (gpt-4o-mini) to provide quick technical analysis.

### Perfect For:
- ✅ Quick checks throughout the day
- ✅ Scanning large watchlists
- ✅ High-frequency analysis
- ✅ Budget-conscious traders
- ✅ Testing and learning
- ✅ Pre-screening before deep dive

### Not Ideal For:
- ❌ Large position sizes (>$10,000)
- ❌ Complex market conditions
- ❌ Fundamental analysis needs
- ❌ Long-term investment decisions

---

## 🚀 Quick Start

### Single Stock Analysis

```bash
python examples/analyze_minimal.py AAPL
```

**Output:**
```
============================================================
MINIMAL ANALYSIS: AAPL
============================================================
Date: 2024-01-15
Config: Market analyst only (minimal cost)
Model: gpt-4o-mini (fastest)
============================================================

============================================================
RESULT: AAPL
============================================================
Signal: BUY

Final Decision:
Based on technical analysis, AAPL shows bullish momentum...

Market Analysis:
AAPL is trading above key moving averages with strong RSI...
============================================================

Estimated cost: $0.03
```

---

### Multiple Stocks (Batch)

```bash
python examples/analyze_minimal.py AAPL MSFT GOOGL NVDA TSLA
```

**Output:**
```
============================================================
MINIMAL BATCH ANALYSIS
============================================================
Stocks: AAPL, MSFT, GOOGL, NVDA, TSLA
Date: 2024-01-15
Config: Minimal (market analyst only)
============================================================

[1/5] Analyzing AAPL...
  ✓ AAPL: BUY
[2/5] Analyzing MSFT...
  ✓ MSFT: HOLD
[3/5] Analyzing GOOGL...
  ✓ GOOGL: BUY
[4/5] Analyzing NVDA...
  ✓ NVDA: BUY
[5/5] Analyzing TSLA...
  ✓ TSLA: SELL

============================================================
SUMMARY
============================================================
Total: 5 stocks
  BUY:  3
  SELL: 1
  HOLD: 1
============================================================

Estimated cost: $0.15 (5 stocks × $0.03)
```

---

## 📊 Cost & Speed Comparison

### Minimal vs Standard vs Full

| Config | Analysts | Model | Time | Cost | Best For |
|--------|----------|-------|------|------|----------|
| **Minimal** | Market only | gpt-4o-mini | 10-20s | $0.01-0.05 | Quick checks |
| **Standard** | Market + Fundamentals | gpt-4o-mini | 30-60s | $0.10-0.30 | Most trades |
| **Full** | All 4 analysts | gpt-4o | 2-5min | $0.50-1.50 | Large positions |

### When to Use Each

**Use Minimal When:**
- Quick intraday check
- Scanning 10+ stocks
- Budget is tight
- Speed is priority
- Testing the system

**Use Standard When:**
- Planning actual trades
- Need fundamental context
- Moderate position sizes
- Balanced approach

**Use Full When:**
- Large position sizes
- Complex decisions
- Long-term holds
- Maximum confidence needed

---

## 💡 Usage Examples

### Example 1: Morning Quick Scan

```bash
# Scan your watchlist before market open
python examples/analyze_minimal.py AAPL MSFT GOOGL NVDA TSLA AMD META AMZN NFLX GOOG

# Cost: 10 stocks × $0.03 = $0.30
# Time: ~2-3 minutes total
```

---

### Example 2: Intraday Check

```bash
# Quick check on a position you're watching
python examples/analyze_minimal.py AAPL

# Cost: $0.03
# Time: ~15 seconds
```

---

### Example 3: Compare Minimal vs Full

```bash
# See the difference between minimal and full analysis
python examples/analyze_minimal.py --compare AAPL
```

**Output:**
```
============================================================
COMPARISON: Minimal vs Full Analysis
============================================================
Stock: AAPL
Date: 2024-01-15
============================================================

Running MINIMAL analysis...
  Config: Market analyst only
  Cost: ~$0.01-0.05
  Time: 12.3 seconds
  Signal: BUY

Running FULL analysis...
  Config: All analysts
  Cost: ~$0.50-1.00
  Time: 156.7 seconds
  Signal: BUY

============================================================
COMPARISON RESULTS
============================================================
Minimal: BUY (12.3s, ~$0.03)
Full:    BUY (156.7s, ~$0.75)

Speed improvement: 12.7x faster
Cost savings: 25.0x cheaper

Signals match: ✓ Yes
============================================================
```

---

## 🎓 Best Practices

### 1. Use for Pre-Screening

**Workflow:**
```bash
# Step 1: Quick scan with minimal (cheap)
python examples/analyze_minimal.py AAPL MSFT GOOGL NVDA TSLA AMD META AMZN NFLX GOOG
# Identifies: AAPL, NVDA, META as BUY signals
# Cost: $0.30

# Step 2: Deep dive on BUY signals only (expensive)
python examples/run_analysis.py AAPL NVDA META --config long_term
# Cost: $3.00

# Total: $3.30 vs $10.00 (if all deep dive)
# Savings: 67%
```

---

### 2. Combine with Batch Analysis

```python
from examples.analyze_minimal import analyze_multiple
from examples.batch_analysis import run_batch_analysis

# Quick scan first
quick_results = analyze_multiple(["AAPL", "MSFT", "GOOGL", "NVDA", "TSLA"])

# Identify interesting signals
buy_signals = [ticker for ticker, result in quick_results.items()
               if "BUY" in result.get("signal", "")]

# Deep dive on interesting ones
if buy_signals:
    detailed_results = run_batch_analysis(
        watchlist=buy_signals,
        config_preset="swing_trading"
    )
```

---

### 3. High-Frequency Monitoring

**Use Case:** Monitor positions throughout the day

```bash
# 9:30 AM - Market open
python examples/analyze_minimal.py AAPL MSFT

# 12:00 PM - Mid-day check
python examples/analyze_minimal.py AAPL MSFT

# 3:00 PM - Before close
python examples/analyze_minimal.py AAPL MSFT

# Cost: 6 analyses × $0.03 = $0.18
# vs Standard: 6 × $0.20 = $1.20
# Savings: 85%
```

---

## 📈 Real-World Workflows

### Workflow 1: Day Trader

**Morning Routine:**
```bash
# 8:30 AM - Quick scan of 20 stocks
python examples/analyze_minimal.py AAPL MSFT GOOGL NVDA TSLA AMD META AMZN NFLX GOOG JPM BAC GS WFC XOM CVX JNJ PFE UNH ABBV

# Cost: $0.60
# Time: 5 minutes
# Identifies: 5 potential trades
```

**Throughout Day:**
```bash
# Quick checks on active positions (free if cached!)
python examples/analyze_minimal.py AAPL  # Position 1
python examples/analyze_minimal.py NVDA  # Position 2
python examples/analyze_minimal.py META  # Position 3

# Cost: $0 (using cached data from morning)
```

**Daily Total:** $0.60

---

### Workflow 2: Swing Trader

**Weekly Scan:**
```bash
# Sunday evening - Scan 30 stocks
python examples/analyze_minimal.py [30 tickers]

# Cost: $0.90
# Identifies: 8 interesting setups
```

**Deep Dive:**
```bash
# Detailed analysis on 8 interesting stocks
python examples/batch_analysis.py [8 tickers] --config swing_trading

# Cost: $1.60
```

**Weekly Total:** $2.50

---

### Workflow 3: Position Trader

**Monthly Scan:**
```bash
# Scan 50 stocks for opportunities
python examples/analyze_minimal.py [50 tickers]

# Cost: $1.50
# Identifies: 10 potential long-term holds
```

**Quarterly Deep Dive:**
```bash
# Thorough analysis on 10 stocks
python examples/batch_analysis.py [10 tickers] --config long_term

# Cost: $10.00
```

**Monthly Average:** $4.83

---

## 🔧 Python Integration

### Use in Your Own Scripts

```python
from examples.analyze_minimal import analyze_quick, quick_check

# Quick analysis with details
state, signal = analyze_quick("AAPL")
print(f"Signal: {signal}")
print(f"Decision: {state['final_trade_decision']}")

# Ultra-quick check (signal only)
signal = quick_check("MSFT")
print(f"MSFT: {signal}")

# Scan watchlist
from examples.analyze_minimal import scan_watchlist

watchlist = ["AAPL", "MSFT", "GOOGL", "NVDA", "TSLA"]
scan_watchlist(watchlist)
```

**Output:**
```
============================================================
QUICK WATCHLIST SCAN
============================================================
🟢 AAPL   → BUY
⚪ MSFT   → HOLD
🟢 GOOGL  → BUY
🟢 NVDA   → BUY
🔴 TSLA   → SELL
============================================================
```

---

## 💰 Cost Analysis

### Monthly Cost Estimates

**High-Frequency Day Trader:**
- 20 stocks × 20 days × $0.03 = $12/month

**Active Swing Trader:**
- 10 stocks × 4 weeks × $0.03 = $1.20/month
- Plus deep dives: $10/month
- **Total: $11.20/month**

**Position Trader:**
- 50 stocks × 1 time × $0.03 = $1.50/month
- Plus quarterly deep dives: $10/quarter
- **Total: $4.83/month average**

---

## ⚡ Performance Tips

### 1. Cache is Your Friend

**First run (fetches data):**
```bash
python examples/analyze_minimal.py AAPL
# Time: 15 seconds
# API calls: 5
```

**Second run (uses cache):**
```bash
python examples/analyze_minimal.py AAPL
# Time: 10 seconds
# API calls: 0 (FREE!)
```

---

### 2. Batch Multiple Stocks

**Inefficient:**
```bash
python examples/analyze_minimal.py AAPL
python examples/analyze_minimal.py MSFT
python examples/analyze_minimal.py GOOGL
# 3 separate runs = slower
```

**Efficient:**
```bash
python examples/analyze_minimal.py AAPL MSFT GOOGL
# 1 batch run = faster
```

---

### 3. Morning Data Fetch

**Strategy:** Fetch data once in morning, analyze all day

```bash
# 8:00 AM - Fetch and cache data
python examples/analyze_minimal.py AAPL MSFT GOOGL NVDA TSLA

# Throughout day - Use cached data (FREE)
python examples/analyze_minimal.py AAPL  # 0 API calls
python examples/analyze_minimal.py MSFT  # 0 API calls
python examples/analyze_minimal.py GOOGL # 0 API calls
```

---

## 🎯 When Minimal is Enough

### Minimal Analysis is Sufficient When:

✅ **Quick intraday checks**
- "Should I hold or sell this position?"
- "Is there a technical setup forming?"

✅ **Screening large lists**
- "Which of these 20 stocks look interesting?"
- "Any breakouts in my watchlist?"

✅ **High-frequency monitoring**
- Checking positions multiple times per day
- Tracking fast-moving stocks

✅ **Budget constraints**
- Learning the system
- Paper trading
- Small account sizes

✅ **Technical analysis focus**
- Day trading based on charts
- Momentum trading
- Breakout strategies

---

## 🚨 When to Upgrade

### Use Standard/Full Analysis When:

❌ **Large positions**
- Position size > $5,000
- Need fundamental validation

❌ **Complex decisions**
- Earnings plays
- News-driven trades
- Sector rotation

❌ **Long-term holds**
- Multi-week/month positions
- Need comprehensive analysis

❌ **Unfamiliar stocks**
- New sectors
- International stocks
- Small caps

---

## ✅ Quick Reference

### Commands

```bash
# Single stock
python examples/analyze_minimal.py AAPL

# Multiple stocks
python examples/analyze_minimal.py AAPL MSFT GOOGL

# Compare minimal vs full
python examples/analyze_minimal.py --compare AAPL

# Help
python examples/analyze_minimal.py
```

### Cost Guide

| Stocks | Cost |
|--------|------|
| 1 | $0.03 |
| 5 | $0.15 |
| 10 | $0.30 |
| 20 | $0.60 |
| 50 | $1.50 |
| 100 | $3.00 |

### Speed Guide

| Stocks | Time |
|--------|------|
| 1 | 10-20s |
| 5 | 1-2min |
| 10 | 2-4min |
| 20 | 4-8min |

---

## 📚 Related Resources

- `examples/analyze_minimal.py` - Minimal analysis script
- `examples/batch_analysis.py` - Batch analysis for deeper dives
- `CONFIG_OPTIMIZATION_GUIDE.md` - All configuration options
- `COST_SAVING_TIPS.md` - More cost optimization strategies

---

## 🎓 Key Takeaways

1. **Minimal = Fast & Cheap:** 10-20 seconds, $0.01-0.05 per stock
2. **Perfect for screening:** Scan many stocks quickly
3. **Technical focus:** Market analyst provides chart-based signals
4. **Upgrade when needed:** Use full analysis for important decisions
5. **Cache is free:** Reuse data throughout the day
6. **Batch is better:** Analyze multiple stocks in one run

---

**Remember:** Minimal analysis is perfect for quick checks, but upgrade to standard or full analysis for trades that matter! 🚀

---

**Last Updated:** 2024
