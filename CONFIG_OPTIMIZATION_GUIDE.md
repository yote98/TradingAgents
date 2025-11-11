# Configuration Optimization Guide

## Quick Start: Choose Your Trading Style

### 🚀 Ultra Low Cost (Testing & Learning)
**Cost:** ~$0.005-0.02 per decision | **Speed:** 5-15 seconds

```python
from examples.config_presets import get_config

config = get_config("ultra_low_cost")
```

**Best for:**
- Testing the system
- Learning how it works
- Budget-conscious users
- High-frequency testing

---

### ⚡ Day Trading (Fast & Cheap)
**Cost:** ~$0.01-0.05 per decision | **Speed:** 10-30 seconds

```python
config = get_config("day_trading")
```

**Configuration:**
- **Model:** gpt-4o-mini (fast & cheap)
- **Analysts:** Market only (technical analysis)
- **Debate Rounds:** 1 (quick decisions)
- **Coaches:** Disabled

**Best for:**
- Intraday trades
- Quick entry/exit decisions
- High-frequency trading
- Scalping strategies

---

### 📊 Swing Trading (Balanced) ⭐ RECOMMENDED
**Cost:** ~$0.10-0.30 per decision | **Speed:** 30-60 seconds

```python
config = get_config("swing_trading")
```

**Configuration:**
- **Model:** gpt-4o-mini
- **Analysts:** Market + Fundamentals
- **Debate Rounds:** 1
- **Coaches:** Optional

**Best for:**
- Multi-day holds (2-10 days)
- Balanced cost/quality
- Most traders
- Moderate frequency

---

### 📈 Long-Term Investing (Thorough)
**Cost:** ~$0.50-1.50 per decision | **Speed:** 1-3 minutes

```python
config = get_config("long_term")
```

**Configuration:**
- **Model:** gpt-4o (high quality)
- **Analysts:** Market + Fundamentals + News
- **Debate Rounds:** 2 (thorough analysis)
- **Coaches:** Optional

**Best for:**
- Position trading (weeks to months)
- Important investment decisions
- Portfolio building
- Lower frequency trading

---

### 💎 Premium (Maximum Quality)
**Cost:** ~$2-5 per decision | **Speed:** 3-5 minutes

```python
config = get_config("premium")
```

**Configuration:**
- **Model:** gpt-4o (best available)
- **Analysts:** All (Market + Fundamentals + News + Social)
- **Debate Rounds:** 3 (maximum depth)
- **Coaches:** All enabled

**Best for:**
- High-stakes decisions
- Large position sizes
- Maximum analysis depth
- When cost is not a concern

---

## Cost Breakdown by Component

### LLM Models (per 1M tokens)
| Model | Input | Output | Best For |
|-------|-------|--------|----------|
| gpt-4o-mini | $0.15 | $0.60 | Day trading, testing |
| gpt-4o | $2.50 | $10.00 | Long-term, premium |

### Analysts (approximate tokens per analysis)
| Analyst | Tokens | Cost (mini) | Cost (4o) |
|---------|--------|-------------|-----------|
| Market | 2,000 | $0.002 | $0.005 |
| Fundamentals | 3,000 | $0.003 | $0.008 |
| News | 2,500 | $0.003 | $0.006 |
| Social | 2,000 | $0.002 | $0.005 |

### Debate Rounds
- **1 Round:** ~5,000 tokens = $0.005 (mini) / $0.013 (4o)
- **2 Rounds:** ~10,000 tokens = $0.010 (mini) / $0.025 (4o)
- **3 Rounds:** ~15,000 tokens = $0.015 (mini) / $0.038 (4o)

---

## Customization Examples

### Example 1: Day Trading with Fundamentals
```python
from examples.config_presets import customize_config

config = customize_config(
    "day_trading",
    selected_analysts=["market", "fundamentals"],  # Add fundamentals
    max_debate_rounds=1  # Keep it fast
)
```

### Example 2: Swing Trading with More Analysis
```python
config = customize_config(
    "swing_trading",
    selected_analysts=["market", "fundamentals", "news"],  # Add news
    max_debate_rounds=2,  # More thorough
    deep_think_llm="gpt-4o"  # Better quality
)
```

### Example 3: Budget Long-Term
```python
config = customize_config(
    "long_term",
    deep_think_llm="gpt-4o-mini",  # Use cheaper model
    max_debate_rounds=1  # Reduce rounds
)
```

---

## Usage with TradingAgentsGraph

### Basic Usage
```python
from tradingagents.graph.trading_graph import TradingAgentsGraph
from examples.config_presets import get_config

# Choose your preset
config = get_config("swing_trading")

# Create trading graph
graph = TradingAgentsGraph(config=config)

# Make a trading decision
state, signal = graph.propagate("AAPL", "2024-01-15")

print(f"Decision: {signal}")
print(f"Final Decision: {state['final_trade_decision']}")
```

### With Risk Management
```python
config = get_config("swing_trading")

# Add risk management settings
config["risk_management"] = {
    "enabled": True,
    "risk_per_trade_pct": 1.0,
    "position_sizing_method": "fixed_percentage",
    "stop_loss_method": "atr",
    "min_risk_reward_ratio": 2.0,
}

graph = TradingAgentsGraph(config=config)
```

### With Coaches (Discord Integration)
```python
config = get_config("swing_trading")

# Enable coaches
config["enable_coaches"] = True
config["selected_coaches"] = ["coach_d", "coach_i"]
config["discord_webhooks"] = {
    "coach_d_webhook": "YOUR_WEBHOOK_URL",
    "coach_i_webhook": "YOUR_WEBHOOK_URL",
}

graph = TradingAgentsGraph(config=config)
```

---

## Cost Optimization Tips

### 1. **Start Small**
Begin with `ultra_low_cost` or `day_trading` preset to test the system.

### 2. **Choose Analysts Wisely**
- **Market only:** Fastest, cheapest (technical analysis)
- **Market + Fundamentals:** Good balance
- **All analysts:** Most comprehensive but expensive

### 3. **Limit Debate Rounds**
- **1 round:** Fast decisions, lower cost
- **2 rounds:** Better quality, moderate cost
- **3+ rounds:** Diminishing returns, high cost

### 4. **Use gpt-4o-mini for Most Tasks**
It's 10-15x cheaper than gpt-4o and works well for most trading decisions.

### 5. **Reserve gpt-4o for Important Decisions**
Use premium config only for:
- Large position sizes
- High-stakes trades
- Complex market conditions

### 6. **Disable Coaches for Testing**
Coaches add minimal cost but require Discord setup. Enable only when needed.

---

## Performance vs Cost Trade-offs

### Speed Priority
```python
config = {
    "deep_think_llm": "gpt-4o-mini",
    "selected_analysts": ["market"],
    "max_debate_rounds": 1,
}
# Result: ~10-15 seconds, ~$0.01 per decision
```

### Quality Priority
```python
config = {
    "deep_think_llm": "gpt-4o",
    "selected_analysts": ["market", "fundamentals", "news"],
    "max_debate_rounds": 2,
}
# Result: ~1-2 minutes, ~$0.50-1.00 per decision
```

### Balanced (Recommended)
```python
config = {
    "deep_think_llm": "gpt-4o-mini",
    "selected_analysts": ["market", "fundamentals"],
    "max_debate_rounds": 1,
}
# Result: ~30-45 seconds, ~$0.10-0.20 per decision
```

---

## Comparison Tool

Run this to see all presets side-by-side:

```python
from examples.config_presets import print_config_comparison

print_config_comparison()
```

Output:
```
================================================================================
CONFIGURATION PRESETS COMPARISON
================================================================================

Preset               Model           Analysts   Rounds   Est. Cost    Speed
--------------------------------------------------------------------------------
Ultra Low Cost       gpt-4o-mini     1          1        $0.005-0.02  5-15s
Day Trading          gpt-4o-mini     1          1        $0.01-0.05   10-30s
Swing Trading        gpt-4o-mini     2          1        $0.10-0.30   30-60s
Long-Term            gpt-4o          3          2        $0.50-1.50   1-3m
Premium              gpt-4o          4          3        $2-5         3-5m
================================================================================
```

---

## Recommended Configurations by Use Case

### 📱 Paper Trading / Testing
```python
config = get_config("ultra_low_cost")
```

### 💰 Real Money, Small Account (<$5,000)
```python
config = get_config("day_trading")
# or
config = get_config("swing_trading")
```

### 💼 Real Money, Medium Account ($5,000-$50,000)
```python
config = get_config("swing_trading")
# or
config = get_config("long_term")
```

### 🏦 Real Money, Large Account (>$50,000)
```python
config = get_config("long_term")
# or
config = get_config("premium")
```

---

## Next Steps

1. **Choose a preset** that matches your trading style
2. **Test it** with paper trading first
3. **Customize** based on your results
4. **Monitor costs** using your OpenAI dashboard
5. **Optimize** by adjusting analysts and rounds

For more details, see:
- `examples/config_presets.py` - All preset configurations
- `START_HERE.md` - Getting started guide
- `NEXT_STEPS_NO_COST.md` - Zero-cost improvements
