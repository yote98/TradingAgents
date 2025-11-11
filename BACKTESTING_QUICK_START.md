# 🚀 Backtesting Quick Start Guide

## Installation

```bash
# Install visualization dependencies
pip install matplotlib

# Already installed: pandas, yfinance, numpy
```

## 5-Minute Quick Start

### 1. Basic Backtest

```python
from tradingagents.backtesting import BacktestConfig, BacktestEngine

# Configure
config = BacktestConfig(
    initial_balance=10000,
    start_date="2023-01-01",
    end_date="2023-12-31"
)

# Run
engine = BacktestEngine(config)
results = engine.run_backtest("AAPL")

# View results
print(results.summary())
```

### 2. Detailed Analysis

```python
# Analyze performance
analyzer = results.analyze()  # Prints comprehensive metrics

# Access specific metrics
returns = analyzer.calculate_returns()
print(f"CAGR: {returns['cagr']:.2f}%")

risk = analyzer.calculate_risk_metrics()
print(f"Sharpe Ratio: {risk['sharpe_ratio']:.2f}")
print(f"Max Drawdown: {risk['max_drawdown_pct']:.2f}%")

trades = analyzer.calculate_trade_statistics()
print(f"Win Rate: {trades['win_rate']:.2f}%")
```

### 3. Generate Visualizations

```python
from tradingagents.backtesting import VisualizationGenerator

viz = VisualizationGenerator(analyzer)

# Save all charts
viz.save_all_charts("my_backtest_charts")

# Or individual charts
viz.plot_equity_curve(filepath="equity.png")
viz.plot_drawdown(filepath="drawdown.png")
viz.create_dashboard(filepath="dashboard.png")
```

## Run the Example

```bash
python examples/run_backtest_example.py
```

This will:
1. Run a backtest on AAPL
2. Display comprehensive metrics
3. Generate all visualizations
4. Save results to JSON

## Common Use Cases

### Test Different Risk Levels

```python
for risk in [1.0, 2.0, 5.0]:
    config.risk_per_trade_pct = risk
    results = engine.run_backtest("AAPL")
    analyzer = results.analyze()
```

### Compare Multiple Stocks

```python
tickers = ["AAPL", "GOOGL", "MSFT", "TSLA"]
for ticker in tickers:
    results = engine.run_backtest(ticker)
    analyzer = results.analyze()
    viz = VisualizationGenerator(analyzer)
    viz.save_all_charts(f"charts_{ticker}")
```

### Integrate with TradingAgents

```python
from tradingagents.graph.trading_graph import TradingAgentsGraph

# Create trading graph
trading_graph = TradingAgentsGraph()

# Run backtest with agent decisions
engine = BacktestEngine(config, trading_graph=trading_graph)
results = engine.run_backtest("AAPL")
```

## Configuration Options

```python
config = BacktestConfig(
    # Account
    initial_balance=10000.0,
    
    # Period
    start_date="2023-01-01",
    end_date="2023-12-31",
    
    # Costs
    commission_rate=0.001,  # 0.1%
    slippage=0.001,         # 0.1%
    
    # Risk Management
    risk_per_trade_pct=2.0,      # Risk 2% per trade
    max_position_size_pct=20.0,  # Max 20% per position
    
    # Position Sizing
    position_sizing_method="fixed_percentage",  # or "risk_based", "equal_weight"
    
    # Data
    data_interval="daily"  # or "weekly", "monthly"
)
```

## Performance Metrics

### Returns
- Total Return ($ and %)
- CAGR (Compound Annual Growth Rate)
- Daily Return Mean & Std Dev

### Risk
- Sharpe Ratio (risk-adjusted return)
- Sortino Ratio (downside risk)
- Maximum Drawdown ($ and %)
- Volatility (annualized)
- Calmar Ratio (CAGR / Max DD)

### Trades
- Total Trades
- Win Rate
- Profit Factor
- Average Win/Loss
- Largest Win/Loss

## Visualizations

### Available Charts
1. **Equity Curve**: Portfolio value over time
2. **Drawdown**: Drawdown percentage over time
3. **Monthly Returns**: Bar chart of monthly performance
4. **Trade Distribution**: Histogram of P&L
5. **Dashboard**: All-in-one comprehensive view

### Export Options
```python
# Individual charts
viz.plot_equity_curve(filepath="equity.png", show=False)

# All charts at once
viz.save_all_charts("output_directory")

# Custom size
viz.plot_equity_curve(figsize=(16, 8))

# Display interactively
viz.create_dashboard(show=True)
```

## Troubleshooting

### "matplotlib not available"
```bash
pip install matplotlib
```

### "No data available"
- Check internet connection
- Verify ticker symbol is valid
- Try a different date range
- Ensure yfinance is installed: `pip install yfinance`

### "Insufficient funds"
- Increase `initial_balance`
- Decrease `risk_per_trade_pct`
- Adjust `max_position_size_pct`

## Next Steps

1. **Test your strategies**: Run backtests on your trading ideas
2. **Optimize parameters**: Find the best configuration
3. **Compare strategies**: Test multiple approaches
4. **Generate reports**: Create professional visualizations
5. **Integrate agents**: Use with TradingAgentsGraph

## Full Example

```python
from tradingagents.backtesting import (
    BacktestConfig, BacktestEngine,
    PerformanceAnalyzer, VisualizationGenerator
)

# 1. Configure
config = BacktestConfig(
    initial_balance=10000,
    start_date="2023-01-01",
    end_date="2023-12-31",
    commission_rate=0.001,
    slippage=0.001,
    risk_per_trade_pct=2.0
)

# 2. Run backtest
engine = BacktestEngine(config)
results = engine.run_backtest("AAPL")

# 3. Analyze
print(results.summary())
analyzer = results.analyze()

# 4. Visualize
viz = VisualizationGenerator(analyzer)
viz.save_all_charts("backtest_output")

# 5. Save results
results.save("backtest_results.json")

print("✅ Backtest complete!")
```

## Resources

- **Full Documentation**: See `BACKTESTING_FRAMEWORK_COMPLETE.md`
- **Example Script**: `examples/run_backtest_example.py`
- **Configuration Guide**: `tradingagents/backtesting/config.py`
- **API Reference**: `tradingagents/backtesting/__init__.py`

---

**Ready to backtest your trading strategies!** 🚀📈
