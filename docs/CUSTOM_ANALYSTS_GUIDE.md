## Custom Analysts Guide

## Overview

TradingAgents now includes three specialized analysts that provide additional market context and insights:

1. **Options Analyst** - Options trading analysis
2. **Crypto Analyst** - Cryptocurrency market context
3. **Macro Analyst** - Macroeconomic indicators and market regime

## Quick Start

### Standalone Usage

```python
from langchain_openai import ChatOpenAI
from tradingagents.agents import (
    create_options_analyst,
    create_crypto_analyst,
    create_macro_analyst
)

# Create LLM
llm = ChatOpenAI(model="gpt-4o-mini")

# Create analysts
options_analyst = create_options_analyst(llm)
crypto_analyst = create_crypto_analyst(llm)
macro_analyst = create_macro_analyst(llm)

# Use analysts
state = {"company_of_interest": "AAPL", "trade_date": "2024-01-15"}

options_report = options_analyst(state)["options_report"]
crypto_report = crypto_analyst(state)["crypto_report"]
macro_report = macro_analyst(state)["macro_report"]
```

### Integrated Usage

```python
from tradingagents.graph import TradingAgentsGraph

# Create graph with new analysts
graph = TradingAgentsGraph(
    ticker="AAPL",
    selected_analysts=["market", "fundamentals", "options", "crypto", "macro"]
)

# Run analysis
result = graph.run()

# Access reports
print(result["options_report"])
print(result["crypto_report"])
print(result["macro_report"])
```

## Options Analyst

### Purpose
Analyzes options trading opportunities and provides insights on options strategies.

### Analysis Includes
- **Options Chain Overview**: Available strikes, expirations, liquidity
- **Implied Volatility**: IV levels, percentiles, and skew
- **Greeks Analysis**: Delta, Gamma, Theta, Vega implications
- **Put/Call Ratio**: Market sentiment indicators
- **Strategy Identification**: Covered calls, spreads, straddles, etc.
- **Risk Assessment**: Key risks and considerations

### Example Output
```
=== OPTIONS ANALYSIS FOR AAPL ===

1. Options Chain Overview:
   - Available strikes: $140-$160
   - Expiration dates: Weekly and monthly options
   - Liquidity: High volume on ATM strikes

2. Implied Volatility Analysis:
   - Current IV: 25%
   - IV Percentile: 45th percentile (moderate)
   - IV Skew: Slight put skew indicating caution

3. Greeks Analysis:
   - Delta: Calls showing positive delta exposure
   - Gamma: Highest at ATM strikes
   - Theta: Time decay accelerating near expiration
   - Vega: High sensitivity to IV changes

4. Put/Call Ratio: 0.85 (slightly bullish)

5. Potential Strategies:
   - Covered calls for income generation
   - Bull call spreads for directional plays
   - Iron condors for range-bound markets

6. Risk Assessment:
   - Earnings volatility risk
   - IV crush post-events
   - Time decay considerations
```

### Use Cases
- Evaluating options trading opportunities
- Understanding market sentiment through options
- Identifying optimal options strategies
- Assessing options-related risks

## Crypto Analyst

### Purpose
Provides cryptocurrency market context and how it affects traditional markets.

### Analysis Includes
- **Crypto Market Overview**: BTC, ETH, and major crypto trends
- **Market Sentiment**: Risk-on/risk-off indicators
- **Correlation Analysis**: Crypto-traditional market relationships
- **Volatility Assessment**: Crypto market volatility implications
- **Regulatory Environment**: Recent regulatory developments
- **Institutional Activity**: Institutional adoption trends
- **Impact on Traditional Assets**: How crypto affects stocks

### Example Output
```
=== CRYPTO MARKET ANALYSIS (Context for AAPL) ===

1. Crypto Market Overview:
   - BTC: Trading at $45,000, up 5% this week
   - ETH: Strong performance, DeFi activity increasing
   - Overall market cap: $1.8T

2. Market Sentiment: Risk-on
   - Institutional buying increasing
   - Retail participation growing
   - Fear & Greed Index: 65 (Greed)

3. Correlation Analysis:
   - Crypto-stock correlation: 0.45 (moderate)
   - When crypto rallies, tech stocks often follow
   - Current environment suggests risk appetite

4. Volatility Assessment:
   - Crypto volatility elevated but declining
   - Spillover effects to tech sector
   - Options markets pricing in uncertainty

5. Implications for AAPL:
   - Risk-on sentiment supports growth stocks
   - Tech sector benefiting from crypto optimism
   - Consider crypto market as leading indicator
```

### Use Cases
- Understanding broader market sentiment
- Assessing risk-on/risk-off environment
- Identifying correlation-based opportunities
- Monitoring institutional money flows

## Macro Analyst

### Purpose
Analyzes macroeconomic indicators and their implications for trading.

### Analysis Includes
- **Economic Cycle Assessment**: Current phase and outlook
- **Monetary Policy Analysis**: Fed stance and interest rates
- **Inflation Environment**: CPI trends and implications
- **Employment & Consumer Health**: Labor market and spending
- **Market Regime**: Risk-on vs risk-off identification
- **Sector-Specific Impact**: How macro affects specific sectors
- **Key Risks & Opportunities**: Macro catalysts and risks

### Example Output
```
=== MACROECONOMIC ANALYSIS FOR AAPL ===

1. Economic Cycle: Mid-expansion
   - GDP growth: 2.5% (healthy)
   - Leading indicators: Positive
   - Outlook: Continued growth expected

2. Monetary Policy: Neutral-to-dovish
   - Fed funds rate: 5.25-5.50%
   - Yield curve: Normalizing
   - Rate cuts possible in 6-12 months

3. Inflation: Moderating
   - CPI: 3.2% (down from peak)
   - Core inflation: Sticky but declining
   - Impact: Margin pressure easing

4. Employment: Strong
   - Unemployment: 3.7%
   - Labor market: Tight but cooling
   - Consumer spending: Resilient

5. Market Regime: Risk-on
   - Equity-friendly environment
   - Growth stocks favored
   - Tech sector outperforming

6. Implications for AAPL:
   - Favorable macro backdrop
   - Consumer spending supports iPhone sales
   - Services revenue growth sustainable
   - Valuation supported by falling rates
```

### Use Cases
- Understanding economic cycle positioning
- Assessing monetary policy impact
- Identifying sector rotation opportunities
- Timing market entry/exit based on macro

## Configuration

### Selecting Analysts

```python
# Use specific analysts
graph = TradingAgentsGraph(
    ticker="AAPL",
    selected_analysts=["market", "options", "macro"]
)

# Use all analysts
graph = TradingAgentsGraph(
    ticker="AAPL",
    selected_analysts=["market", "fundamentals", "news", "social", 
                      "options", "crypto", "macro"]
)

# Traditional analysts only (default)
graph = TradingAgentsGraph(
    ticker="AAPL",
    selected_analysts=["market", "fundamentals", "news", "social"]
)
```

### Model Selection

```python
# Use different models for different analysts
from langchain_openai import ChatOpenAI

# Fast model for quick analysis
quick_llm = ChatOpenAI(model="gpt-4o-mini")

# Powerful model for deep analysis
deep_llm = ChatOpenAI(model="gpt-4o")

# Create analysts with appropriate models
options_analyst = create_options_analyst(deep_llm)  # Complex analysis
crypto_analyst = create_crypto_analyst(quick_llm)   # Context analysis
macro_analyst = create_macro_analyst(deep_llm)      # Deep analysis
```

## Integration with Other Features

### With Risk Management

```python
from tradingagents.risk import RiskConfig, RiskCalculator

# Get macro context
macro_report = macro_analyst(state)["macro_report"]

# Adjust risk based on macro environment
if "risk-on" in macro_report.lower():
    config = RiskConfig.aggressive()
else:
    config = RiskConfig.conservative()

calculator = RiskCalculator(config)
```

### With Backtesting

```python
from tradingagents.backtesting import BacktestEngine

# Use analysts in backtest strategy
class MacroAwareStrategy:
    def __init__(self):
        self.macro_analyst = create_macro_analyst(llm)
    
    def should_trade(self, date, ticker):
        state = {"company_of_interest": ticker, "trade_date": date}
        macro_report = self.macro_analyst(state)["macro_report"]
        
        # Trade based on macro regime
        return "risk-on" in macro_report.lower()
```

## Best Practices

### 1. Use Appropriate Models
- Options Analyst: Use powerful models (gpt-4o) for complex analysis
- Crypto Analyst: Quick models (gpt-4o-mini) sufficient for context
- Macro Analyst: Powerful models for comprehensive economic analysis

### 2. Combine Insights
```python
# Get all perspectives
options_report = options_analyst(state)["options_report"]
crypto_report = crypto_analyst(state)["crypto_report"]
macro_report = macro_analyst(state)["macro_report"]

# Synthesize insights
if all([
    "bullish" in options_report.lower(),
    "risk-on" in crypto_report.lower(),
    "expansion" in macro_report.lower()
]):
    # Strong buy signal from all analysts
    execute_trade()
```

### 3. Context Matters
- Options Analyst: Most useful for liquid, optionable stocks
- Crypto Analyst: Valuable for tech stocks and growth sectors
- Macro Analyst: Important for all stocks, especially cyclicals

### 4. Cost Optimization
```python
# Use analysts selectively based on need
if is_tech_stock(ticker):
    analysts = ["market", "crypto", "macro"]
elif is_financial_stock(ticker):
    analysts = ["market", "fundamentals", "macro"]
else:
    analysts = ["market", "fundamentals"]
```

## Examples

### Example 1: Options Trading Decision
```python
# Analyze options opportunity
options_report = options_analyst({"company_of_interest": "AAPL"})["options_report"]

if "high implied volatility" in options_report.lower():
    # Consider selling premium strategies
    strategy = "iron_condor"
elif "low implied volatility" in options_report.lower():
    # Consider buying options
    strategy = "long_call"
```

### Example 2: Market Regime Detection
```python
# Detect market regime
crypto_report = crypto_analyst(state)["crypto_report"]
macro_report = macro_analyst(state)["macro_report"]

risk_on = (
    "risk-on" in crypto_report.lower() and
    "expansion" in macro_report.lower()
)

if risk_on:
    # Favor growth stocks
    position_size = calculate_aggressive_size()
else:
    # Favor defensive stocks
    position_size = calculate_conservative_size()
```

### Example 3: Comprehensive Analysis
```python
# Get complete picture
state = {"company_of_interest": "NVDA", "trade_date": "2024-01-15"}

reports = {
    "options": options_analyst(state)["options_report"],
    "crypto": crypto_analyst(state)["crypto_report"],
    "macro": macro_analyst(state)["macro_report"]
}

# Make informed decision based on all factors
decision = synthesize_reports(reports)
```

## Troubleshooting

### Issue: Analysts not appearing in workflow
**Solution**: Ensure analysts are in `selected_analysts` list

### Issue: Empty or generic reports
**Solution**: Use more powerful LLM models (gpt-4o instead of gpt-4o-mini)

### Issue: High API costs
**Solution**: Use analysts selectively, cache results, use cheaper models for context

## API Reference

### create_options_analyst(llm)
Creates an Options Analyst agent.

**Parameters**:
- `llm`: ChatOpenAI instance

**Returns**: Agent node function

### create_crypto_analyst(llm)
Creates a Crypto Analyst agent.

**Parameters**:
- `llm`: ChatOpenAI instance

**Returns**: Agent node function

### create_macro_analyst(llm)
Creates a Macro Analyst agent.

**Parameters**:
- `llm`: ChatOpenAI instance

**Returns**: Agent node function

## Future Enhancements

Planned improvements:
- Real-time options data integration via Alpha Vantage MCP
- Real-time crypto data integration
- Real-time economic indicator data
- Quantitative metrics and calculations
- Historical analysis and backtesting support

## Support

For issues or questions:
1. Check examples in `examples/custom_analysts_demo.py`
2. Review this guide
3. Check system logs for errors
4. Ensure API keys are configured

## See Also

- [Risk Management Guide](RISK_MANAGEMENT_GUIDE.md)
- [Backtesting User Guide](BACKTESTING_USER_GUIDE.md)
- [System Architecture](SYSTEM_ARCHITECTURE.md)
