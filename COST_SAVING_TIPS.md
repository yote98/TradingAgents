# Cost-Saving Tips for TradingAgents

> **Goal:** Maximize value while minimizing costs. Smart configuration can reduce costs by 90%+ without sacrificing quality.

---

## 🎯 Quick Wins (Immediate Savings)

### 1. Use gpt-4o-mini Instead of gpt-4o
**Savings: 90%+ reduction in LLM costs**

```python
config = {
    "deep_think_llm": "gpt-4o-mini",    # $0.15/1M vs $2.50/1M
    "quick_think_llm": "gpt-4o-mini",   # 15x cheaper!
}
```

**When to use gpt-4o:**
- Large position sizes (>$10,000)
- Complex market conditions
- High-stakes decisions
- Otherwise, stick with gpt-4o-mini

---

### 2. Reduce Number of Analysts
**Savings: 50-75% reduction per decision**

```python
# Expensive (4 analysts)
config["selected_analysts"] = ["market", "fundamentals", "news", "social"]
# Cost: ~$0.30-0.50 per decision

# Balanced (2 analysts) ⭐ RECOMMENDED
config["selected_analysts"] = ["market", "fundamentals"]
# Cost: ~$0.10-0.20 per decision

# Minimal (1 analyst)
config["selected_analysts"] = ["market"]
# Cost: ~$0.02-0.05 per decision
```

**Best combinations:**
- **Day Trading:** Market only
- **Swing Trading:** Market + Fundamentals
- **Long-Term:** Market + Fundamentals + News

---

### 3. Limit Debate Rounds
**Savings: 50% per round eliminated**

```python
# Expensive
config["max_debate_rounds"] = 3  # ~$0.045 in debate costs

# Balanced ⭐ RECOMMENDED
config["max_debate_rounds"] = 1  # ~$0.015 in debate costs

# Minimal
config["max_debate_rounds"] = 1  # Same as balanced
```

**Reality:** 1 round is usually sufficient. More rounds rarely change the decision significantly.

---

### 4. Disable Coaches During Testing
**Savings: Minimal cost but simplifies setup**

```python
config["enable_coaches"] = False
config["selected_coaches"] = []
```

**Enable coaches only when:**
- You have Discord webhooks set up
- You're actively posting daily plans
- You want external human guidance

---

## 💰 Cost Breakdown by Configuration

### Ultra Low Cost
```python
config = {
    "deep_think_llm": "gpt-4o-mini",
    "selected_analysts": ["market"],
    "max_debate_rounds": 1,
}
```
**Cost per decision:** $0.005-0.02
**Best for:** Testing, learning, high-frequency analysis

---

### Day Trading (Recommended for Active Traders)
```python
config = {
    "deep_think_llm": "gpt-4o-mini",
    "selected_analysts": ["market"],
    "max_debate_rounds": 1,
}
```
**Cost per decision:** $0.01-0.05
**Best for:** Intraday trades, quick decisions

---

### Swing Trading (Best Balance) ⭐
```python
config = {
    "deep_think_llm": "gpt-4o-mini",
    "selected_analysts": ["market", "fundamentals"],
    "max_debate_rounds": 1,
}
```
**Cost per decision:** $0.10-0.30
**Best for:** Most traders, multi-day holds

---

### Long-Term (Quality Focus)
```python
config = {
    "deep_think_llm": "gpt-4o",
    "selected_analysts": ["market", "fundamentals", "news"],
    "max_debate_rounds": 2,
}
```
**Cost per decision:** $0.50-1.50
**Best for:** Important decisions, large positions

---

## 📊 Monthly Cost Estimates

### By Trading Frequency

**Daily Analysis (20 trading days/month):**
| Config | Cost/Decision | Monthly Cost |
|--------|---------------|--------------|
| Ultra Low Cost | $0.01 | $0.20 |
| Day Trading | $0.03 | $0.60 |
| Swing Trading | $0.20 | $4.00 |
| Long-Term | $1.00 | $20.00 |

**Weekly Analysis (4 times/month):**
| Config | Cost/Decision | Monthly Cost |
|--------|---------------|--------------|
| Ultra Low Cost | $0.01 | $0.04 |
| Day Trading | $0.03 | $0.12 |
| Swing Trading | $0.20 | $0.80 |
| Long-Term | $1.00 | $4.00 |

**Monthly Analysis (1 time/month):**
| Config | Cost/Decision | Monthly Cost |
|--------|---------------|--------------|
| Any | $0.01-1.00 | $0.01-1.00 |

---

## 🎓 Advanced Cost Optimization

### 1. Batch Your Analysis
**Instead of:** Analyzing 5 stocks daily
**Do this:** Analyze 5 stocks weekly

**Savings:** 75% reduction
- Daily: 5 stocks × 20 days = 100 analyses/month
- Weekly: 5 stocks × 4 weeks = 20 analyses/month

---

### 2. Use Tiered Analysis
**Strategy:** Different configs for different situations

```python
# Quick scan (cheap)
quick_config = get_config("day_trading")
# Use for: Initial screening, low-conviction ideas

# Deep dive (expensive)
deep_config = get_config("long_term")
# Use for: High-conviction trades, large positions
```

**Example workflow:**
1. Screen 10 stocks with quick_config ($0.30 total)
2. Deep dive on top 2 with deep_config ($2.00 total)
3. **Total:** $2.30 vs $15.00 (85% savings)

---

### 3. Cache and Reuse Analysis
**Don't re-analyze the same stock multiple times per day**

```python
# Bad: Analyze AAPL 3 times today
for time in ["morning", "midday", "close"]:
    analyze("AAPL")  # $0.60 total

# Good: Analyze once, review throughout day
morning_analysis = analyze("AAPL")  # $0.20 total
# Review same analysis at midday and close
```

---

### 4. Focus Your Watchlist
**Smaller watchlist = Lower costs**

```python
# Expensive: 20 stocks × daily × $0.20 = $80/month
watchlist = ["AAPL", "MSFT", "GOOGL", ... 20 stocks]

# Optimal: 5 stocks × daily × $0.20 = $20/month ⭐
watchlist = ["AAPL", "MSFT", "NVDA", "TSLA", "SPY"]
```

**Quality > Quantity:** Better to deeply understand 5 stocks than superficially track 20.

---

### 5. Use Alpha Vantage Free Tier Wisely
**Free tier limits:** 25 API calls/day

**Optimization strategies:**
- Cache historical data locally
- Batch requests for multiple stocks
- Use daily data instead of intraday when possible
- Spread analysis across the week

---

## 🔧 Configuration Optimization Examples

### Example 1: Weekend Swing Trader
**Profile:** Analyze 5 stocks every Sunday for the week ahead

```python
config = get_config("swing_trading")
# 5 stocks × 4 Sundays = 20 analyses/month
# Cost: 20 × $0.20 = $4.00/month
```

---

### Example 2: Daily Day Trader
**Profile:** Quick morning analysis on 3 stocks before market open

```python
config = get_config("day_trading")
# 3 stocks × 20 days = 60 analyses/month
# Cost: 60 × $0.03 = $1.80/month
```

---

### Example 3: Monthly Investor
**Profile:** Deep analysis on 10 stocks once per month

```python
config = get_config("long_term")
# 10 stocks × 1 time = 10 analyses/month
# Cost: 10 × $1.00 = $10.00/month
```

---

### Example 4: Hybrid Approach (Recommended)
**Profile:** Mix of quick scans and deep dives

```python
# Weekly quick scan
quick_config = get_config("day_trading")
# 10 stocks × 4 weeks = 40 analyses
# Cost: 40 × $0.03 = $1.20

# Monthly deep dive
deep_config = get_config("long_term")
# 3 stocks × 1 time = 3 analyses
# Cost: 3 × $1.00 = $3.00

# Total: $4.20/month for comprehensive coverage
```

---

## 📉 Cost vs Value Analysis

### When to Spend More

**Spend more (use premium config) when:**
- Position size > $10,000
- High-stakes decision
- Unfamiliar stock or sector
- Complex market conditions
- Earnings or major news event

**Save money (use cheap config) when:**
- Testing the system
- Paper trading
- Small position sizes (<$1,000)
- Familiar stocks
- Routine analysis

---

## 🎯 ROI Calculation

### Is the cost worth it?

**Example:**
- Monthly cost: $5
- Average monthly return improvement: 2%
- Account size: $10,000
- Additional profit: $200/month

**ROI:** ($200 - $5) / $5 = 3,900% return on system cost

**Break-even:** If system improves returns by just 0.05%, it pays for itself.

---

## 💡 Free Alternatives (0 Cost)

### 1. Manual Analysis
- Read analyst reports yourself
- Use free charting tools
- Follow financial news
- **Cost:** $0, but time-intensive

### 2. Paper Trading
- Test strategies without real money
- Learn the system
- Refine your approach
- **Cost:** $0 for analysis

### 3. Reduce Frequency
- Weekly instead of daily
- Monthly instead of weekly
- **Cost:** Proportionally lower

---

## 📋 Cost Optimization Checklist

**Before each analysis, ask:**
- [ ] Do I really need this analysis now?
- [ ] Can I wait until my scheduled analysis time?
- [ ] Is this a high-conviction trade worth the cost?
- [ ] Am I using the cheapest config that meets my needs?
- [ ] Have I already analyzed this stock recently?

**Monthly review:**
- [ ] Review total costs from OpenAI dashboard
- [ ] Calculate cost per trade
- [ ] Assess if costs are justified by returns
- [ ] Adjust configuration if needed

---

## 🚀 Recommended Starting Point

### For New Users

**Week 1-2: Testing Phase**
```python
config = get_config("ultra_low_cost")
# Goal: Learn the system, cost < $1
```

**Week 3-4: Paper Trading**
```python
config = get_config("day_trading")
# Goal: Test with realistic config, cost < $5
```

**Month 2+: Live Trading**
```python
config = get_config("swing_trading")
# Goal: Optimize for your style, cost $5-20
```

---

## 📊 Cost Tracking Template

### Monthly Cost Log

```
Month: _____
Configuration: _____

Total Analyses: _____
Cost per Analysis: $_____
Total Cost: $_____

Trades Taken: _____
Cost per Trade: $_____

Account Return: _____%
System ROI: _____%

Notes:
_____
```

---

## 🎓 Key Takeaways

1. **Start cheap:** Use ultra_low_cost or day_trading config initially
2. **gpt-4o-mini is enough:** 90% of the time, it's as good as gpt-4o
3. **Fewer analysts:** Market + Fundamentals covers most needs
4. **One debate round:** Rarely need more
5. **Batch analysis:** Weekly is often better than daily
6. **Small watchlist:** 5-10 stocks maximum
7. **Tiered approach:** Cheap scan, expensive deep dive
8. **Track costs:** Monitor and optimize monthly

---

## 💰 Bottom Line

**Realistic monthly costs:**
- **Testing:** $0.50-2
- **Active trading:** $5-20
- **Professional use:** $20-50

**Most users spend:** $5-10/month with swing_trading config

**Remember:** Even $50/month is cheap if it improves your trading by just 0.5% on a $10,000 account.

---

## 📚 Related Resources

- `CONFIG_OPTIMIZATION_GUIDE.md` - Detailed configuration guide
- `examples/config_presets.py` - Ready-to-use configurations
- `MY_TRADING_STRATEGY.md` - Document your approach
- OpenAI Pricing: https://openai.com/pricing

---

**Last Updated:** 2024
