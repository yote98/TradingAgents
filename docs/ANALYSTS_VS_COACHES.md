# Internal Analysts vs External Coaches

## Quick Comparison

| Feature | Internal Analysts | External Coaches |
|---------|------------------|------------------|
| **What they are** | Automated AI agents | Human coaches (or external services) |
| **Where they work** | Built into TradingAgents | Post in Discord |
| **Data source** | APIs (yfinance, Alpha Vantage) | Manual posts |
| **Analysis type** | Algorithmic, data-driven | Human judgment, experience |
| **Required?** | ✅ Yes (core system) | ❌ No (optional enhancement) |
| **Real-time** | ✅ Yes | ⏰ Daily updates |
| **Charts** | Generated from data | Attached images (TradingView, TPO) |
| **Customization** | Via code/config | Via Discord posts |
| **Cost** | API costs | Coaching service subscription |

## Internal Analysts (Built-in)

### What They Do
Automated agents that fetch and analyze market data programmatically.

### The 4 Internal Analysts

#### 1. Market Analyst
- **Fetches**: Stock prices, technical indicators
- **Analyzes**: MACD, RSI, Bollinger Bands, moving averages
- **Source**: yfinance or Alpha Vantage
- **Output**: Technical analysis report

#### 2. Fundamentals Analyst
- **Fetches**: Balance sheet, cash flow, income statement
- **Analyzes**: Financial metrics, valuations
- **Source**: Alpha Vantage
- **Output**: Fundamental analysis report

#### 3. News Analyst
- **Fetches**: Global news, insider transactions, sentiment
- **Analyzes**: News impact, insider activity
- **Source**: Alpha Vantage or OpenAI
- **Output**: News analysis report

#### 4. Social Media Analyst
- **Fetches**: Social media sentiment, news sentiment
- **Analyzes**: Public sentiment, trends
- **Source**: Alpha Vantage or Google News
- **Output**: Sentiment analysis report

### How They Work
```python
# Market Analyst example
1. Receives ticker: "NVDA"
2. Calls get_stock_data() → fetches price data
3. Calls get_indicators() → calculates MACD, RSI
4. Analyzes patterns and trends
5. Generates technical report
```

## External Coaches (Optional)

### What They Do
Human coaches post daily trading plans in Discord with charts.

### The 4 External Coaches

#### 1. Coach D
- **Posts**: Daily trading insights
- **Charts**: TradingView, TPO charts
- **Focus**: Technical setups, key levels, strategies
- **Command**: `!plan d: Your analysis`

#### 2. Coach I
- **Posts**: Insights and analysis
- **Charts**: Analysis charts, metrics
- **Focus**: Strategic considerations, key insights
- **Command**: `!plan i: Your insights`

#### 3. Coach S
- **Posts**: Sentiment and positioning
- **Charts**: Sentiment indicators, positioning
- **Focus**: Market psychology, crowd behavior
- **Command**: `!plan s: Your sentiment`

#### 4. Coach N
- **Posts**: Narrative and context
- **Charts**: Macro charts, context visuals
- **Focus**: Market themes, events, big picture
- **Command**: `!plan n: Your narrative`

### How They Work
```
1. Human coach analyzes market
2. Posts plan in Discord: "!plan d: ES support at 5800"
3. Attaches TradingView chart
4. Discord bot stores plan + chart URLs
5. TradingAgents fetches plan when running
6. Coach agent summarizes the guidance
7. Research team considers it alongside analyst data
```

## Workflow Comparison

### Without Coaches (Default)
```
┌──────────────┐
│   Analysts   │ ← Fetch data from APIs
│  (4 agents)  │ ← Analyze programmatically
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Researchers  │ ← Debate based on analyst reports
└──────┬───────┘
       │
       ▼
   [Continue...]
```

### With Coaches (Optional)
```
┌──────────────┐
│   Analysts   │ ← Fetch data from APIs
│  (4 agents)  │ ← Analyze programmatically
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Coaches    │ ← Fetch plans from Discord
│  (4 humans)  │ ← Summarize human guidance
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Researchers  │ ← Debate using BOTH inputs
└──────┬───────┘
       │
       ▼
   [Continue...]
```

## Example: NVDA Analysis

### Internal Analysts Provide:
```
Market Analyst:
"NVDA showing RSI at 65, MACD bullish crossover. 
50 SMA at $920 providing support. Bollinger bands expanding."

Fundamentals Analyst:
"NVDA P/E ratio 45, revenue growth 20% YoY. 
Strong balance sheet with $25B cash. Data center segment growing."

News Analyst:
"3 positive news articles today. Insider buying detected. 
Analyst upgrades from 2 firms."

Social Media Analyst:
"Sentiment score 7.5/10 bullish. High social media activity. 
Retail interest elevated."
```

### External Coaches Provide:
```
Coach D:
"ES showing support at 5800. Watch for bounce to 5850. 
Stop below 5790. [TradingView chart attached]"

Coach I:
"Tech earnings strong this week. Maintain long bias on dips. 
Fair value estimate $1000-1050. [Analysis chart attached]"

Coach S:
"Retail FOMO building (8/10). Watch for exhaustion signals. 
Contrarian opportunity if sentiment hits 9+. [Sentiment chart attached]"

Coach N:
"Fed meeting Wednesday. Tech sensitive to rate signals. 
Watch 10Y yield at 4.5% resistance. [Macro chart attached]"
```

### Research Team Considers:
- ✅ Internal analyst data (algorithmic)
- ✅ External coach guidance (human)
- ✅ Debates and synthesizes both perspectives
- ✅ Makes informed recommendation

## When to Use Each

### Use Only Internal Analysts When:
- You want fully automated trading
- You don't have access to external coaches
- You prefer pure algorithmic decisions
- You're testing/backtesting the system

### Use Both Analysts + Coaches When:
- You have experienced traders providing guidance
- You subscribe to a coaching service
- You want human perspective to complement algorithms
- You have a Discord channel with daily plans

## Configuration Examples

### Only Internal Analysts (Default)
```python
config = DEFAULT_CONFIG.copy()
config["enable_coaches"] = False  # or just omit this line

ta = TradingAgentsGraph(debug=True, config=config)
```

### Internal Analysts + All Coaches
```python
config = DEFAULT_CONFIG.copy()
config["enable_coaches"] = True
config["selected_coaches"] = ["coach_d", "coach_i", "coach_s", "coach_n"]

ta = TradingAgentsGraph(debug=True, config=config)
```

### Internal Analysts + Selected Coaches
```python
config = DEFAULT_CONFIG.copy()
config["enable_coaches"] = True
config["selected_coaches"] = ["coach_d", "coach_s"]  # Only D and S

ta = TradingAgentsGraph(debug=True, config=config)
```

## Key Takeaways

1. **Analysts are core, coaches are optional**
   - System requires analysts to function
   - Coaches are an enhancement

2. **Different data sources**
   - Analysts fetch from APIs automatically
   - Coaches post manually in Discord

3. **Complementary, not competitive**
   - Analysts provide data-driven analysis
   - Coaches provide human judgment
   - Together they offer comprehensive view

4. **Independent operation**
   - Analysts work without coaches
   - Coaches don't replace analysts
   - Both can coexist

5. **Flexible configuration**
   - Enable/disable coaches anytime
   - Select which coaches to use
   - No impact on core functionality

## See Also

- [COACHES_EXPLAINED.md](./COACHES_EXPLAINED.md) - Detailed coach explanation
- [COACH_DISCORD_SETUP.md](./COACH_DISCORD_SETUP.md) - Setup guide
- [README.md](../README.md) - Main documentation
