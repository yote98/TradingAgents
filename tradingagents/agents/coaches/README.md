# External Coach Agents

## Overview

This directory contains **external coach agents** that integrate human coaching guidance from Discord into the TradingAgents framework.

## ⚠️ Important: These Are NOT Internal Analysts

### What Coaches Are:
- **External human coaches** who post daily plans in Discord
- **Independent perspective** separate from internal system analysis
- **Optional enhancement** that complements built-in analysts
- **Summarization nodes** that relay external guidance

### What Coaches Are NOT:
- ❌ NOT replacements for internal analysts
- ❌ NOT automated data analysis agents
- ❌ NOT required for the system to function
- ❌ NOT part of the core TradingAgents framework

## The 4 Coaches

### Coach D
- **Focus**: Daily trading insights
- **Charts**: TradingView, TPO charts
- **Posts**: Technical setups, key levels, entry/exit strategies
- **Discord Command**: `!plan d: Your analysis here`

### Coach I
- **Focus**: Insights and analysis
- **Charts**: Analysis charts, metrics
- **Posts**: Key insights, strategic considerations
- **Discord Command**: `!plan i: Your insights here`

### Coach S
- **Focus**: Sentiment and positioning
- **Charts**: Sentiment indicators, positioning data
- **Posts**: Market psychology, crowd behavior, contrarian opportunities
- **Discord Command**: `!plan s: Your sentiment analysis here`

### Coach N
- **Focus**: Narrative and market context
- **Charts**: Macro charts, context visuals
- **Posts**: Market themes, events, catalysts, big picture
- **Discord Command**: `!plan n: Your narrative here`

## How Coaches Work

### 1. Human Posts Plan in Discord
```
!plan d: ES showing support at 5800. Watch for bounce to 5850.
[Attaches TradingView chart]
```

### 2. Discord Bot Stores Plan
- Plan text saved
- Chart URLs extracted
- Stored with date

### 3. TradingAgents Fetches Plan
- System queries Discord bot server
- Retrieves plan + charts for today
- Passes to coach agent

### 4. Coach Agent Summarizes
- Reads the human coach's plan
- Extracts key points
- Formats as external guidance
- Passes to research team

### 5. Research Team Considers
- Reviews internal analyst data
- Reviews external coach guidance
- Debates and makes recommendation

## Integration with Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    INTERNAL ANALYSTS                         │
│  (Market, Fundamentals, News, Social Media)                 │
│  - Automated data fetching and analysis                     │
│  - Technical indicators, financials, news                   │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   EXTERNAL COACHES (Optional)                │
│  (Coach D, I, S, N)                                         │
│  - Human-posted daily plans from Discord                    │
│  - Independent perspective with charts                      │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    RESEARCH TEAM                             │
│  (Bull/Bear Researchers + Research Manager)                 │
│  - Debates using BOTH internal + external inputs            │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
                  [Continue to Trader → Risk Mgmt → Decision]
```

## Configuration

### Enable All Coaches
```python
config["enable_coaches"] = True
config["selected_coaches"] = ["coach_d", "coach_i", "coach_s", "coach_n"]
```

### Enable Specific Coaches
```python
config["enable_coaches"] = True
config["selected_coaches"] = ["coach_d", "coach_s"]  # Only D and S
```

### Disable Coaches (Use Only Internal Analysts)
```python
config["enable_coaches"] = False
```

## Implementation Details

Each coach agent:
1. Checks if a plan was posted in Discord for today
2. If no plan: Returns "No daily plan posted"
3. If plan exists: Summarizes the coach's guidance
4. Preserves the coach's original insights
5. Presents as external guidance (not system analysis)

## Files

- `technical_coach.py` → Coach D implementation
- `fundamental_coach.py` → Coach I implementation
- `sentiment_coach.py` → Coach S implementation
- `macro_coach.py` → Coach N implementation
- `__init__.py` → Exports all coach creators

## Usage Example

```python
from tradingagents.graph.trading_graph import TradingAgentsGraph
from tradingagents.default_config import DEFAULT_CONFIG

config = DEFAULT_CONFIG.copy()
config["enable_coaches"] = True
config["selected_coaches"] = ["coach_d", "coach_i", "coach_s", "coach_n"]

ta = TradingAgentsGraph(debug=True, config=config)
final_state, decision = ta.propagate("NVDA", "2024-05-10")

# Access coach reports
print("Coach D:", final_state.get("coach_d_report"))
print("Charts:", final_state.get("coach_d_charts"))
```

## When to Use Coaches

### Use Coaches When:
- ✅ You have experienced traders providing daily guidance
- ✅ You subscribe to a trading service with daily plans
- ✅ You want external perspective to complement internal analysis
- ✅ You have a Discord channel with coach posts

### Don't Use Coaches When:
- ❌ You want fully automated trading
- ❌ You don't have reliable external guidance
- ❌ You prefer pure algorithmic decisions
- ❌ You don't have Discord integration

## See Also

- [COACHES_EXPLAINED.md](../../../docs/COACHES_EXPLAINED.md) - Detailed explanation
- [COACH_DISCORD_SETUP.md](../../../docs/COACH_DISCORD_SETUP.md) - Setup guide
- [COACH_QUICKSTART.md](../../../docs/COACH_QUICKSTART.md) - Quick start
- [discord_bot_server.py](../../../examples/discord_bot_server.py) - Bot implementation
