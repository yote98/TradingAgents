# Risk Management System Guide

## Overview

The TradingAgents Risk Management System provides comprehensive quantitative risk assessment capabilities including position sizing, stop-loss calculation, and portfolio risk analysis.

## Quick Start

```python
from tradingagents.risk import RiskConfig, RiskCalculator

# Create risk calculator with moderate profile
config = RiskConfig.moderate()
calculator = RiskCalculator(config)

# Calculate risk for a trade
risk_metrics = calculator.calculate_trade_risk(
    ticker="AAPL",
    entry_price=150.00,
    account_value=100000.00,
    direction="long"
)

# View results
print(risk_metrics.to_report())
print(f"Recommendation: {risk_metrics.recommendation.value}")
print(f"Position Size: {risk_metrics.position_size.shares} shares")
```

## Risk Profiles

Three pre-configured risk profiles are available:

### Conservative
```python
config = RiskConfig.conservative()
```
- Risk per trade: 1%
- Max position size: 5%
- Stop-loss: 2%
- Kelly fraction: 0.1

### Moderate (Default)
```python
config = RiskConfig.moderate()
```
- Risk per trade: 2%
- Max position size: 10%
- Stop-loss: 3%
- Kelly fraction: 0.25

### Aggressive
```python
config = RiskConfig.aggressive()
```
- Risk per trade: 3%
- Max position size: 15%
- Stop-loss: 5%
- Kelly fraction: 0.5

## Position Sizing Methods

### 1. Fixed Percentage
Simple risk-based sizing using a fixed percentage of account value.

```python
from tradingagents.risk import PositionSizingCalculator

calculator = PositionSizingCalculator(config)
position_size = calculator.calculate_position_size(
    ticker="AAPL",
    current_price=150.00,
    account_value=100000.00,
    stop_loss_price=147.00
)
```

### 2. Kelly Criterion
Mathematically optimal sizing based on win rate and average win/loss.

```python
position_size = calculator.calculate_position_size(
    ticker="AAPL",
    current_price=150.00,
    account_value=100000.00,
    win_rate=0.55,  # 55% win rate
    avg_win=0.06,   # 6% average win
    avg_loss=0.03   # 3% average loss
)
```

### 3. Volatility-Based
Position size inversely proportional to volatility (ATR).

```python
position_size = calculator.calculate_position_size(
    ticker="AAPL",
    current_price=150.00,
    account_value=100000.00,
    historical_data=price_data  # DataFrame with OHLC data
)
```

### 4. Ensemble Method
Combines multiple methods with confidence weighting.

```python
position_size = calculator.get_recommended_position_size(
    ticker="AAPL",
    current_price=150.00,
    account_value=100000.00,
    historical_data=price_data,
    win_rate=0.55,
    avg_win=0.06,
    avg_loss=0.03
)
```

## Stop-Loss Calculation

### 1. Percentage-Based
Fixed percentage below entry price.

```python
from tradingagents.risk import StopLossCalculator

calculator = StopLossCalculator(config)
stop_loss = calculator.calculate_stop_loss(
    ticker="AAPL",
    entry_price=150.00,
    direction="long"
)
```

### 2. ATR-Based
Volatility-adjusted stop using Average True Range.

```python
stop_loss = calculator.calculate_stop_loss(
    ticker="AAPL",
    entry_price=150.00,
    direction="long",
    historical_data=price_data
)
```

### 3. Support/Resistance
Based on technical support/resistance levels.

```python
stop_loss = calculator.calculate_stop_loss(
    ticker="AAPL",
    entry_price=150.00,
    direction="long",
    support_resistance_levels=[145.00, 148.00, 152.00, 155.00]
)
```

### Validation
```python
is_valid, reason = calculator.validate_stop_loss(
    stop_loss, entry_price, direction="long"
)
```

## Portfolio Risk Assessment

### Basic Assessment
```python
from tradingagents.risk import PortfolioRiskAssessor, Position

assessor = PortfolioRiskAssessor(config)

positions = [
    Position("AAPL", 100, 150.00, 15000, 14500, "Technology"),
    Position("GOOGL", 50, 120.00, 6000, 5800, "Technology"),
]

risk_assessment = assessor.assess_portfolio_risk(
    positions=positions,
    account_value=100000.00
)
```

### Risk Metrics
```python
print(f"Total Risk: {risk_assessment.total_risk_pct:.2f}%")
print(f"Concentration Risk: {risk_assessment.concentration_risk:.2f}%")
print(f"Correlation Risk: {risk_assessment.correlation_risk:.2f}%")
print(f"Risk Score: {risk_assessment.risk_score:.1f}/100")
```

### Position Limits
```python
limits = assessor.get_position_limit(
    ticker="TSLA",
    current_price=250.00,
    account_value=100000.00,
    existing_positions=positions,
    sector="Technology"
)

print(f"Max Shares: {limits['recommended_max']}")
print(f"Remaining Risk Budget: {limits['remaining_risk_budget_pct']:.2f}%")
```

## Complete Risk Analysis

The `RiskCalculator` orchestrates all risk assessments:

```python
from tradingagents.risk import RiskCalculator

calculator = RiskCalculator(config)

risk_metrics = calculator.calculate_trade_risk(
    ticker="TSLA",
    entry_price=250.00,
    account_value=100000.00,
    direction="long",
    historical_data=price_data,
    existing_positions=positions,
    sector="Technology",
    win_rate=0.55,
    avg_win=0.06,
    avg_loss=0.03
)

# View comprehensive report
print(risk_metrics.to_report())

# Access individual components
print(f"Stop-Loss: ${risk_metrics.stop_loss.price:.2f}")
print(f"Position Size: {risk_metrics.position_size.shares} shares")
print(f"Recommendation: {risk_metrics.recommendation.value}")
```

## Integration with TradingAgents

The risk management system is automatically integrated into the TradingAgents workflow:

```python
from tradingagents.graph import TradingAgentsGraph
from tradingagents.risk import RiskConfig

# Create graph with risk management
config = RiskConfig.moderate()
graph = TradingAgentsGraph(
    ticker="AAPL",
    risk_config=config,
    account_balance=100000.00
)

# Run analysis (risk metrics calculated automatically)
result = graph.run()

# Access risk metrics from state
risk_metrics = result["risk_metrics"]
```

## Configuration Options

### Custom Configuration
```python
config = RiskConfig(
    risk_profile="custom",
    risk_per_trade_pct=2.5,
    max_position_size_pct=12.0,
    max_portfolio_risk_pct=20.0,
    stop_loss_percentage=4.0,
    position_sizing_method="kelly",
    stop_loss_method="atr",
    atr_multiplier=2.5,
    kelly_fraction=0.3
)
```

### Available Methods
- **Position Sizing**: `"fixed_percentage"`, `"kelly"`, `"volatility"`
- **Stop-Loss**: `"percentage"`, `"atr"`, `"support_resistance"`

## Best Practices

### 1. Always Use Stop-Losses
```python
# Calculate stop-loss before position sizing
stop_loss = stop_calc.calculate_stop_loss(ticker, entry_price, historical_data=data)
position_size = pos_calc.calculate_position_size(
    ticker, entry_price, account_value, stop_loss_price=stop_loss.price
)
```

### 2. Consider Portfolio Context
```python
# Include existing positions for accurate risk assessment
risk_metrics = calculator.calculate_trade_risk(
    ticker=ticker,
    entry_price=entry_price,
    account_value=account_value,
    existing_positions=current_positions  # Important!
)
```

### 3. Use Historical Data When Available
```python
# Better risk calculations with historical data
risk_metrics = calculator.calculate_trade_risk(
    ticker=ticker,
    entry_price=entry_price,
    account_value=account_value,
    historical_data=price_data  # Enables ATR and volatility calculations
)
```

### 4. Respect Risk Limits
```python
if risk_metrics.recommendation == TradeRecommendation.REJECT:
    print("Trade rejected due to excessive risk")
elif risk_metrics.recommendation == TradeRecommendation.REDUCE:
    print("Consider reducing position size")
    # Use reduced position size
    reduced_shares = risk_metrics.position_size.shares // 2
```

## Examples

See `examples/risk_management_demo.py` for comprehensive demonstrations of all features.

## API Reference

### RiskConfig
- `conservative()` - Conservative risk profile
- `moderate()` - Moderate risk profile (default)
- `aggressive()` - Aggressive risk profile
- `validate()` - Validate configuration parameters

### RiskCalculator
- `calculate_trade_risk()` - Complete risk assessment
- Main orchestrator for all risk calculations

### PositionSizingCalculator
- `calculate_position_size()` - Calculate position size
- `compare_methods()` - Compare all sizing methods
- `get_recommended_position_size()` - Ensemble recommendation

### StopLossCalculator
- `calculate_stop_loss()` - Calculate stop-loss level
- `compare_methods()` - Compare all stop-loss methods
- `get_recommended_stop_loss()` - Best method recommendation
- `validate_stop_loss()` - Validate stop-loss

### PortfolioRiskAssessor
- `assess_portfolio_risk()` - Complete portfolio assessment
- `get_position_limit()` - Calculate position limits

## Troubleshooting

### Issue: Position size is zero
**Cause**: Insufficient capital or excessive risk parameters
**Solution**: Increase account value or adjust risk parameters

### Issue: Stop-loss validation fails
**Cause**: Stop-loss on wrong side of entry or too tight/wide
**Solution**: Check direction and adjust stop-loss percentage

### Issue: High risk score
**Cause**: Excessive position size, portfolio concentration, or correlation
**Solution**: Reduce position size, diversify portfolio, or adjust risk parameters

## Support

For issues or questions:
1. Check the examples in `examples/risk_management_demo.py`
2. Review configuration in `tradingagents/risk/risk_config.py`
3. Enable debug logging: `logging.basicConfig(level=logging.DEBUG)`
