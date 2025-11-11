# Understanding the Coach System

## What Are Coaches?

The 4 Discord coaches (Coach D, I, S, N) are **EXTERNAL HUMAN COACHES** who provide independent daily trading guidance via Discord. They are **NOT** part of the TradingAgents internal analyst system.

## Key Distinction

### Internal Analysts (Built-in)
The TradingAgents framework has its own built-in analyst agents:
- **Market Analyst**: Analyzes technical indicators (MACD, RSI, etc.)
- **Fundamentals Analyst**: Evaluates company financials
- **News Analyst**: Monitors news and insider transactions
- **Social Media Analyst**: Analyzes sentiment from social media

These analysts are **automated agents** that fetch and analyze data programmatically.

### External Coaches (Discord-based)
The coach system adds 4 **human coaches** who post daily plans:
- **Coach D**: Daily trading insights with TradingView/TPO charts
- **Coach I**: Insights and analysis with supporting charts
- **Coach S**: Sentiment and positioning insights with charts
- **Coach N**: Narrative and market context with charts

These coaches are **real people** (or external services) who post their analysis in Discord.

## Why This Separation?

### Independence
- Coaches provide **external perspective** that may differ from internal analysis
- They offer **human intuition** and experience that complements algorithmic analysis
- Their insights are **independent** and not influenced by the system's data

### Flexibility
- Coaches can be **enabled/disabled** without affecting core functionality
- You can **subscribe** to different coaching services
- The system works **with or without** coach input

### Complementary Guidance
- Internal analysts provide **data-driven analysis**
- External coaches provide **experienced perspective**
- Together they offer **comprehensive market view**

## Workflow Comparison

### Without Coaches (Default)
```
Analysts → Researchers → Trader → Risk Mgmt → Decision
```

### With Coaches (Optional)
```
Analysts → Coaches (External Input) → Researchers → Trader → Risk Mgmt → Decision
                ↑
         Discord Plans
```

The coaches sit **between** the analysts and researchers, providing external context that the researchers can consider alongside the internal analysis.

## Example Scenario

### Morning: Coaches Post Plans
```
Coach D posts in Discord:
"!plan d: ES showing support at 5800. Watch for bounce to 5850. Stop below 5790."
[Attaches TradingView chart]

Coach I posts in Discord:
"!plan i: Tech earnings strong this week. Maintain long bias on dips."
[Attaches analysis chart]
```

### During Trading: System Runs
1. **Internal Analysts** gather and analyze market data
2. **External Coaches** plans are fetched from Discord
3. **Researchers** debate considering BOTH internal analysis AND external coach guidance
4. **Trader** proposes action informed by all inputs
5. **Risk Management** evaluates and approves/rejects

### Result
The final decision is informed by:
- ✅ Internal data analysis (analysts)
- ✅ External human perspective (coaches)
- ✅ Risk assessment (risk management)

## Configuration

### Disable Coaches (Use Only Internal Analysts)
```python
config["enable_coaches"] = False
```

### Enable Specific Coaches
```python
config["enable_coaches"] = True
config["selected_coaches"] = ["coach_d", "coach_s"]  # Only D and S
```

### Enable All Coaches
```python
config["enable_coaches"] = True
config["selected_coaches"] = ["coach_d", "coach_i", "coach_s", "coach_n"]
```

## When to Use Coaches

### Use Coaches When:
- ✅ You have access to experienced traders who can provide daily guidance
- ✅ You subscribe to a trading service that posts daily plans
- ✅ You want external perspective to complement internal analysis
- ✅ You have a team of coaches posting in Discord

### Don't Use Coaches When:
- ❌ You want fully automated trading (use only internal analysts)
- ❌ You don't have reliable external guidance sources
- ❌ You prefer pure algorithmic decision-making
- ❌ You don't have Discord integration set up

## Coach vs Analyst Summary

| Aspect | Internal Analysts | External Coaches |
|--------|------------------|------------------|
| **Type** | Automated agents | Human coaches |
| **Source** | Built into system | Discord posts |
| **Data** | Fetches from APIs | Posts manually |
| **Analysis** | Algorithmic | Human judgment |
| **Required** | Yes (core system) | No (optional) |
| **Customizable** | Via code | Via Discord posts |
| **Real-time** | Yes | Daily updates |
| **Charts** | Generated | Attached images |

## Best Practices

1. **Use Both**: Combine internal analysis with external coaching for best results
2. **Independent Sources**: Ensure coaches are truly independent (not just repeating system analysis)
3. **Daily Updates**: Have coaches post fresh plans each morning
4. **Chart Context**: Coaches should attach charts to support their analysis
5. **Clear Communication**: Coaches should be concise and actionable
6. **Backup Plan**: System should work even if coaches don't post

## Technical Implementation

The coaches are implemented as **summarization nodes** that:
1. Fetch daily plans from Discord
2. Extract chart URLs
3. Summarize the coach's guidance
4. Pass it to the research team as **external context**

They do NOT:
- ❌ Replace internal analysts
- ❌ Fetch market data
- ❌ Run technical analysis
- ❌ Make trading decisions

They simply **relay external human guidance** into the system.
