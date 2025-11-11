# 🚀 Backtesting Cheat Sheet

## Quick Start (5 lines)

```python
from tradingagents.backtesting import BacktestConfig, BacktestEngine
config = BacktestConfig(initial_balance=10000, start_date="2023-01-01", end_date="2023-12-31")
engine = BacktestEngine(config)
results = engine.run_backtest("AAPL")
results.analyze()  # Prints comprehensive metrics
```

## Common Tasks

### Run Backtest
```python
from tradingagents.backtesting import BacktestConfig, BacktestEngine

config = BacktestConfig(
    initial_balance=10000,
    start_date="2023-01-01",
    end_date="2023-12-31",
    commission_rate=0.001,
    slippage=0.001,
    risk_per_trade_pct=2.0
)

engine = BacktestEngine(config)
results = engine.run_backtest("AAPL")
print(results.summary())
```

### Analyze Performance
```python
# Quick analysis
analyzer = results.analyze()

# Get specific metrics
returns = analyzer.calculate_returns()
print(f"CAGR: {returns['cagr']:.2f}%")

risk = analyzer.calculate_risk_metrics()
print(f"Sharpe: {risk['sharpe_ratio']:.2f}")
print(f"Max DD: {risk['max_drawdown_pct']:.2f}%")

trades = analyzer.calculate_trade_statistics()
print(f"Win Rate: {trades['win_rate']:.2f}%")
```

### Generate Charts
```python
from tradingagents.backtesting import VisualizationGenerator

viz = VisualizationGenerator(analyzer)

# All charts at once
viz.save_all_charts("my_charts")

# Individual charts
viz.plot_equity_curve(filepath="equity.png")
viz.plot_drawdown(filepath="drawdown.png")
viz.create_dashboard(filepath="dashboard.png")
```

### Export Results
```python
# JSON
results.save("results.json")

# CSV
results.export_trades_csv("trades.csv")
results.export_equity_csv("equity.csv")

# Everything
results.export_all("output_dir")
```

### Compare Strategies
```python
from tradingagents.backtesting import compare_risk_levels

# Quick comparison
results_df = compare_risk_levels(
    ticker="AAPL",
    risk_levels=[1.0, 2.0, 5.0],
    base_config=config
)
```

### Custom Comparison
```python
from tradingagents.backtesting import StrategyComparator

comparator = StrategyComparator()
comparator.add_strategy(config1, "Conservative")
comparator.add_strategy(config2, "Aggressive")

results_df = comparator.run_comparison("AAPL")
comparator.print_comparison()

best_config, best_result = comparator.get_best_strategy('sharpe_ratio')
```

### Compare Tickers
```python
from tradingagents.backtesting import compare_tickers

results_df = compare_tickers(
    tickers=["AAPL", "GOOGL", "MSFT"],
    config=config
)
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
    
    # Risk
    risk_per_trade_pct=2.0,      # 2% per trade
    max_position_size_pct=20.0,  # Max 20% per position
    
    # Position Sizing
    position_sizing_method="fixed_percentage",  # or "risk_based", "equal_weight"
    
    # Data
    data_interval="daily"  # or "weekly", "monthly"
)
```

## Key Metrics

### Returns
- `total_return` - Absolute return ($)
- `total_return_pct` - Percentage return
- `cagr` - Compound Annual Growth Rate

### Risk
- `sharpe_ratio` - Risk-adjusted return
- `sortino_ratio` - Downside risk-adjusted
- `max_drawdown` - Largest decline ($)
- `max_drawdown_pct` - Largest decline (%)
- `volatility` - Annualized volatility
- `calmar_ratio` - CAGR / Max Drawdown

### Trades
- `total_trades` - Number of trades
- `win_rate` - Percentage of winning trades
- `profit_factor` - Gross profit / Gross loss
- `avg_win` - Average winning trade
- `avg_loss` - Average losing trade

## Comparison Utilities

```python
from tradingagents.backtesting import (
    compare_risk_levels,
    compare_position_sizing_methods,
    compare_tickers
)

# Compare risk levels
compare_risk_levels("AAPL", [1.0, 2.0, 5.0], base_config)

# Compare sizing methods
compare_position_sizing_methods("AAPL", base_config)

# Compare tickers
compare_tickers(["AAPL", "GOOGL", "MSFT"], config)
```

## Example Scripts

```bash
# Basic backtest
python examples/run_backtest_example.py

# Strategy comparison
python examples/compare_strategies_example.py
```

## Installation

```bash
# Required
pip install pandas yfinance numpy

# For visualizations
pip install matplotlib
```

## Troubleshooting

### "matplotlib not available"
```bash
pip install matplotlib
```

### "No data available"
- Check internet connection
- Verify ticker symbol
- Try different date range

### "Insufficient funds"
- Increase `initial_balance`
- Decrease `risk_per_trade_pct`

## Quick Reference

| Task | Code |
|------|------|
| Run backtest | `engine.run_backtest("AAPL")` |
| Analyze | `results.analyze()` |
| Save JSON | `results.save("file.json")` |
| Export CSV | `results.export_trades_csv("trades.csv")` |
| Generate charts | `viz.save_all_charts("dir")` |
| Compare strategies | `comparator.run_comparison("AAPL")` |

## Full Workflow

```python
from tradingagents.backtesting import (
    BacktestConfig, BacktestEngine,
    VisualizationGenerator
)

# 1. Configure
config = BacktestConfig(
    initial_balance=10000,
    start_date="2023-01-01",
    end_date="2023-12-31"
)

# 2. Run
engine = BacktestEngine(config)
results = engine.run_backtest("AAPL")

# 3. Analyze
analyzer = results.analyze()

# 4. Visualize
viz = VisualizationGenerator(analyzer)
viz.save_all_charts("charts")

# 5. Export
results.export_all("results")

print("✅ Complete!")
```

## Documentation

- **Quick Start**: `BACKTESTING_QUICK_START.md`
- **Complete Guide**: `BACKTESTING_FRAMEWORK_COMPLETE.md`
- **Session Summary**: `BACKTESTING_SESSION_COMPLETE.md`

---

**Ready to backtest!** 🚀📈
