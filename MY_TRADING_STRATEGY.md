# My Trading Strategy

> **Template:** Fill in each section with your specific strategy details.
> This document helps you stay consistent and disciplined in your trading approach.

---

## 📋 Strategy Overview

### Trading Style
- [ ] Day Trading (intraday positions)
- [ ] Swing Trading (2-10 days)
- [ ] Position Trading (weeks to months)
- [ ] Long-Term Investing (months to years)

**My chosen style:** _[Fill in]_

**Why this style fits me:**
- _[e.g., Available time, risk tolerance, account size]_

---

## 🎯 Stock Selection Criteria

### Universe of Stocks

**Primary Watchlist (5-10 stocks):**
1. _[e.g., AAPL - Tech leader, high liquidity]_
2. _[e.g., MSFT - Stable growth]_
3. _[e.g., NVDA - AI/semiconductor exposure]_
4. _[Add more...]_

**Sector Focus:**
- [ ] Technology
- [ ] Healthcare
- [ ] Finance
- [ ] Energy
- [ ] Consumer
- [ ] Other: _______

**Stock Criteria:**
- **Market Cap:** Minimum $_____ billion
- **Average Volume:** Minimum _____ shares/day
- **Price Range:** $_____ to $_____
- **Volatility:** [ ] Low [ ] Medium [ ] High

**Exclusions (stocks I avoid):**
- _[e.g., Penny stocks, highly leveraged companies, etc.]_

---

## 📅 Analysis Schedule

### When I Run Analysis

**Frequency:**
- [ ] Daily (before market open)
- [ ] Daily (after market close)
- [ ] Weekly (specify day: _____)
- [ ] Bi-weekly
- [ ] Monthly
- [ ] Event-driven (earnings, news, etc.)

**My Schedule:**
```
Monday:    [e.g., Review weekend news, run analysis on watchlist]
Tuesday:   [e.g., Monitor open positions]
Wednesday: [e.g., Mid-week analysis on top 3 stocks]
Thursday:  [e.g., Monitor positions, prepare for Friday]
Friday:    [e.g., Weekly review, plan next week]
```

**Time Commitment:**
- Analysis per stock: _____ minutes
- Total weekly time: _____ hours

---

## 🔍 Configuration Settings

### System Configuration

**Preset Used:**
```python
from examples.config_presets import get_config

config = get_config("_____")  # day_trading, swing_trading, long_term, etc.
```

**Customizations:**
```python
config["selected_analysts"] = [_____]  # market, fundamentals, news, social
config["max_debate_rounds"] = _____    # 1, 2, or 3
config["deep_think_llm"] = "_____"     # gpt-4o-mini or gpt-4o
```

**Estimated Cost Per Decision:** $_____

---

## 📊 Interpreting Results

### Understanding the Output

**Final Decision Format:**
The system provides a final decision in `state['final_trade_decision']`:

**What I look for:**
1. **Clear Signal:**
   - BUY/LONG = _[My action: e.g., Enter position]_
   - SELL/SHORT = _[My action: e.g., Exit or avoid]_
   - HOLD = _[My action: e.g., Wait for better setup]_

2. **Confidence Level:**
   - High confidence = _[e.g., Full position size]_
   - Medium confidence = _[e.g., Half position size]_
   - Low confidence = _[e.g., Skip or paper trade]_

3. **Risk Assessment:**
   - Check `risk_metrics` for position size and stop-loss
   - Verify risk-reward ratio meets my minimum: _____:1

**Key Reports I Review:**
- [ ] Market Report (technical analysis)
- [ ] Fundamentals Report (financial health)
- [ ] News Report (catalysts and sentiment)
- [ ] Risk Metrics (position sizing, stops)

**Red Flags (when I DON'T trade):**
- _[e.g., Conflicting signals from analysts]_
- _[e.g., Risk-reward ratio below 2:1]_
- _[e.g., High correlation with existing positions]_
- _[Add more...]_

---

## 💰 Position Sizing Rules

### How Much to Trade

**Account Size:** $_____

**Risk Per Trade:**
- Maximum risk per trade: _____% of account
- Dollar amount: $_____

**Position Sizing Method:**
- [ ] Fixed Percentage (e.g., 1% risk per trade)
- [ ] Fixed Dollar Amount (e.g., $100 risk per trade)
- [ ] Kelly Criterion (optimal sizing based on win rate)
- [ ] Volatility-Based (ATR-based sizing)

**My Method:** _[Fill in]_

**Position Size Limits:**
- Minimum position: $_____ or _____ shares
- Maximum position: _____% of account
- Maximum per sector: _____% of account

**Example Calculation:**
```
Account: $10,000
Risk per trade: 1% = $100
Entry: $150
Stop-loss: $147
Risk per share: $3

Position size = $100 / $3 = 33 shares
Total investment = 33 × $150 = $4,950
```

---

## 🛡️ Risk Management Rules

### Protecting My Capital

**Stop-Loss Strategy:**
- [ ] Percentage-based (e.g., 2% below entry)
- [ ] ATR-based (e.g., 2× ATR below entry)
- [ ] Support/Resistance levels
- [ ] Time-based (exit after X days if no profit)

**My Stop-Loss Method:** _[Fill in]_

**Stop-Loss Rules:**
- Initial stop: _____% or $_____ from entry
- Never move stop-loss down (for longs)
- Trail stop when in profit: _[e.g., Move to breakeven at +5%]_

**Take-Profit Strategy:**
- Target 1: _____% gain (take _____ % of position)
- Target 2: _____% gain (take _____ % of position)
- Target 3: _____% gain (take remaining)

**Risk-Reward Requirements:**
- Minimum R:R ratio: _____:1
- Preferred R:R ratio: _____:1

**Portfolio-Level Risk:**
- Maximum total portfolio risk: _____% 
- Maximum open positions: _____
- Maximum per sector: _____%
- Maximum correlated positions: _____

**Daily/Weekly Limits:**
- Maximum daily loss: $_____
- Maximum weekly loss: $_____
- If hit, stop trading for: _[e.g., rest of day/week]_

---

## 📈 Trade Execution Plan

### Entry Rules

**I enter a trade when:**
1. System gives BUY/LONG signal
2. Risk-reward ratio ≥ _____:1
3. Position size calculated and within limits
4. Stop-loss level identified
5. _[Add your criteria]_

**Entry Timing:**
- [ ] Market open
- [ ] Mid-day (avoid volatility)
- [ ] Market close
- [ ] Limit order at specific price

**My Entry Method:** _[Fill in]_

### Exit Rules

**I exit a trade when:**
1. Stop-loss hit (automatic)
2. Target price reached
3. System gives SELL signal
4. _[Add your criteria]_

**Exit Timing:**
- [ ] Immediately on signal
- [ ] End of day
- [ ] Wait for confirmation

---

## 📝 Trade Journal Template

### Recording Each Trade

**For every trade, I record:**

```
Date: _____
Ticker: _____
Action: BUY/SELL
Entry Price: $_____
Position Size: _____ shares
Stop-Loss: $_____
Target: $_____
Risk Amount: $_____
R:R Ratio: _____:1

System Signal: [Copy from final_trade_decision]
Confidence: High/Medium/Low

Analyst Reports Summary:
- Market: _____
- Fundamentals: _____
- News: _____

Why I took this trade:
_____

Exit Date: _____
Exit Price: $_____
P&L: $_____
P&L %: _____%
Holding Period: _____ days

What went right:
_____

What went wrong:
_____

Lessons learned:
_____
```

---

## 📊 Performance Tracking

### Measuring My Success

**Weekly Review:**
- Total trades: _____
- Winning trades: _____
- Losing trades: _____
- Win rate: _____%
- Average win: $_____
- Average loss: $_____
- Net P&L: $_____

**Monthly Review:**
- Total return: _____%
- Best trade: $_____
- Worst trade: $_____
- Largest drawdown: _____%
- Sharpe ratio: _____
- System cost: $_____

**Quarterly Goals:**
- Target return: _____%
- Maximum drawdown: _____%
- Minimum win rate: _____%
- Maximum cost: $_____

---

## 🎓 Continuous Improvement

### Learning and Adapting

**Monthly Strategy Review:**
- [ ] Review all trades
- [ ] Identify patterns in wins/losses
- [ ] Adjust position sizing if needed
- [ ] Update watchlist
- [ ] Optimize configuration

**Questions to Ask:**
1. Is my win rate meeting expectations?
2. Are my losses staying within limits?
3. Is the system cost justified by returns?
4. Do I need to adjust my risk per trade?
5. Should I change analysts or debate rounds?

**When to Adjust Strategy:**
- After _____ consecutive losses
- If monthly return < _____%
- If drawdown > _____%
- If win rate < _____%

---

## 🚨 Emergency Rules

### When Things Go Wrong

**I stop trading immediately if:**
- [ ] Daily loss limit hit: $_____
- [ ] Weekly loss limit hit: $_____
- [ ] Monthly loss limit hit: $_____
- [ ] Emotional trading detected
- [ ] Not following my rules

**Recovery Plan:**
1. Stop all trading
2. Review what went wrong
3. Paper trade for _____ days
4. Reduce position size by _____%
5. Resume with strict discipline

---

## 💡 Personal Notes

### What Works for Me

**My strengths:**
- _[e.g., Patient, disciplined, good at risk management]_

**My weaknesses:**
- _[e.g., FOMO, holding losers too long]_

**Reminders to myself:**
- _[e.g., "Stick to the plan", "Small losses are okay"]_
- _[e.g., "Don't trade when tired or emotional"]_
- _[e.g., "The market will be here tomorrow"]_

---

## 📚 Resources

### My Trading Toolkit

**System Files:**
- Configuration: `examples/config_presets.py`
- Cost Guide: `CONFIG_OPTIMIZATION_GUIDE.md`
- Quick Reference: `QUICK_REFERENCE.md`

**External Resources:**
- Broker: _____
- Charting: _____
- News: _____
- Community: _____

---

## ✅ Pre-Trade Checklist

**Before every trade, I verify:**
- [ ] System gave clear signal
- [ ] Position size calculated
- [ ] Stop-loss identified
- [ ] Risk-reward ratio ≥ my minimum
- [ ] Within daily/weekly limits
- [ ] Not correlated with existing positions
- [ ] I understand why I'm taking this trade
- [ ] I'm calm and following my plan

---

## 📅 Strategy Version History

**Version 1.0** - _[Date]_
- Initial strategy created

**Version 1.1** - _[Date]_
- _[Changes made and why]_

---

**Last Updated:** _[Date]_

**Next Review Date:** _[Date]_
