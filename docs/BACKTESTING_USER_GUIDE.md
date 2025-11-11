# Backtesting Framework - Complete User Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Quick Start](#quick-start)
4. [Configuration](#configuration)
5. [Running Backtests](#running-backtests)
6. [Performance Analysis](#performance-analysis)
7. [Visualizations](#visualizations)
8. [Strategy Comparison](#strategy-comparison)
9. [Walk-Forward Analysis](#walk-forward-analysis)
10. [Best Practices](#best-practices)
11. [Troubleshooting](#troubleshooting)
12. [API Reference](#api-reference)

## Introduction

The TradingAgents Backtesting Framework allows you to test trading strategies on historical data with realistic trading costs and comprehensive performance metrics.

### Key Features

- **Realistic Simulation**: Includes commissions, slippage, and position sizing
- **Comprehensive Metrics**: 15+ performance indicators including Sharpe ratio, drawdown, win rate
- **Professional Visualizations**: 5 chart types with publication-quality output
- **Strategy Comparison**: Test multiple configurations simultaneously
- **Walk-Forward Analysis**: Detect overfitting and validate robustness
- **Multiple Export Formats**: JSON, CSV, and visual reports

## Installation

### Requirements

```bash
# Core dependencies (already installed)
pip install pandas yfinance numpy

# For visualizations (recommended)
pip install matplotlib

# For faster caching (optional)
pip install pyarrow
```

### Verify Installation

```bash
python test_backtesting.py
```

## Quick Start

### Basic Backtest (5 lines)

```python
from tradingagents.backtesting import BacktestConfig, BacktestEngine

config = BacktestConfig(initial_balance=10000, start_date="2023-01-01", end_date="2023-12-31")
engine = BacktestEngine(config)
results = engine.run_backtest("AAPL")
results.analyze()  # Prints comprehensive metrics
```

### Complete Workflow

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
analyzer = results.analyze()

# 4. Visualize
viz = VisualizationGenerator(analyzer)
viz.save_all_charts("my_backtest")

# 5. Export
results.export_all("results")
```

## Configuration

### BacktestConfig Parameters

```python
config = BacktestConfig(
    # Account Settings
    initial_balance=10000.0,          # Starting capital
    
    # Time Period
    start_date="2023-01-01",          # Backtest start (YYYY-MM-DD)
    end_date="2023-12-31",            # Backtest end (YYYY-MM-DD)
    
    # Trading Costs
    commission_rate=0.001,            # 0.1% per trade
    slippage=0.001,                   # 0.1% slippage
    
    # Risk Management
    risk_per_trade_pct=2.0,           # Risk 2% per trade
    max_position_size_pct=20.0,       # Max 20% per position
    
    # Position Sizing
    position_sizing_method="fixed_percentage",  # or "risk_based", "equal_weight"
    
    # Data Settings
    data_interval="daily",            # or "weekly", "monthly"
    
    # Walk-Forward Settings
    train_period_days=180,            # Training period length
    test_period_days=60               # Testing period length
)
```

### Configuration Presets

```python
# Conservative
conservative = BacktestConfig(
    initial_balance=10000,
    risk_per_trade_pct=1.0,
    max_position_size_pct=10.0
)

# Moderate
moderate = BacktestConfig(
    initial_balance=10000,
    risk_per_trade_pct=2.0,
    max_position_size_pct=20.0
)

# Aggressive
aggressive = BacktestConfig(
    initial_balance=10000,
    risk_per_trade_pct=5.0,
    max_position_size_pct=30.0
)
```

## Running Backtests

### Single Ticker

```python
results = engine.run_backtest("AAPL")
```

### Multiple Tickers

```python
tickers = ["AAPL", "GOOGL", "MSFT", "TSLA"]
for ticker in tickers:
    results = engine.run_backtest(ticker)
    print(f"{ticker}: {results.total_return_pct:.2f}%")
```

### With TradingAgentsGraph

```python
from tradingagents.graph.trading_graph import TradingAgentsGraph

trading_graph = TradingAgentsGraph()
engine = BacktestEngine(config, trading_graph=trading_graph)
results = engine.run_backtest("AAPL")
```

### Custom Date Range

```python
results = engine.run_backtest("AAPL", "2022-01-01", "2022-12-31")
```

## Performance Analysis

### Quick Analysis

```python
# Print comprehensive metrics
analyzer = results.analyze()
```

### Detailed Metrics

```python
# Return metrics
returns = analyzer.calculate_returns()
print(f"Total Return: {returns['total_return_pct']:.2f}%")
print(f"CAGR: {returns['cagr']:.2f}%")

# Risk metrics
risk = analyzer.calculate_risk_metrics()
print(f"Sharpe Ratio: {risk['sharpe_ratio']:.2f}")
print(f"Max Drawdown: {risk['max_drawdown_pct']:.2f}%")
print(f"Volatility: {risk['volatility']:.2f}%")

# Trade statistics
trades = analyzer.calculate_trade_statistics()
print(f"Win Rate: {trades['win_rate']:.2f}%")
print(f"Profit Factor: {trades['profit_factor']:.2f}")
```

### Available Metrics

**Returns**:
- Total Return ($ and %)
- CAGR (Compound Annual Growth Rate)
- Daily Return Mean & Std Dev

**Risk**:
- Sharpe Ratio (risk-adjusted return)
- Sortino Ratio (downside risk)
- Maximum Drawdown ($ and %)
- Volatility (annualized)
- Calmar Ratio (CAGR / Max DD)

**Trades**:
- Total Trades
- Win Rate
- Profit Factor
- Average Win/Loss
- Largest Win/Loss

## Visualizations

### Generate All Charts

```python
from tradingagents.backtesting import VisualizationGenerator

viz = VisualizationGenerator(analyzer)
viz.save_all_charts("output_directory")
```

### Individual Charts

```python
# Equity curve
viz.plot_equity_curve(filepath="equity.png")

# Drawdown
viz.plot_drawdown(filepath="drawdown.png")

# Monthly returns
viz.plot_monthly_returns(filepath="monthly.png")

# Trade distribution
viz.plot_trade_distribution(filepath="trades.png")

# Comprehensive dashboard
viz.create_dashboard(filepath="dashboard.png")
```

### Chart Types

1. **Equity Curve**: Portfolio value over time
2. **Drawdown Chart**: Drawdown percentage over time
3. **Monthly Returns**: Bar chart of monthly performance
4. **Trade Distribution**: Histogram of P&L
5. **Dashboard**: All-in-one comprehensive view

## Strategy Comparison

### Compare Risk Levels

```python
from tradingagents.backtesting import compare_risk_levels

results_df = compare_risk_levels(
    ticker="AAPL",
    risk_levels=[1.0, 2.0, 5.0],
    base_config=config
)
```

### Compare Position Sizing Methods

```python
from tradingagents.backtesting import compare_position_sizing_methods

results_df = compare_position_sizing_methods(
    ticker="AAPL",
    base_config=config
)
```

### Compare Tickers

```python
from tradingagents.backtesting import compare_tickers

results_df = compare_tickers(
    tickers=["AAPL", "GOOGL", "MSFT"],
    config=config
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

# Get best strategy
best_config, best_result = comparator.get_best_strategy('sharpe_ratio')
```

## Walk-Forward Analysis

### Basic Walk-Forward

```python
from tradingagents.backtesting import quick_walk_forward

results = quick_walk_forward(
    ticker="AAPL",
    config=config,
    start_date="2022-01-01",
    end_date="2023-12-31",
    train_days=180,  # 6 months training
    test_days=60     # 2 months testing
)
```

### Detailed Walk-Forward

```python
from tradingagents.backtesting import WalkForwardAnalyzer

analyzer = WalkForwardAnalyzer(config)
results = analyzer.run_walk_forward(
    ticker="AAPL",
    start_date="2022-01-01",
    end_date="2023-12-31",
    train_days=180,
    test_days=60,
    step_days=30  # Move forward 1 month each time
)

# Generate report
analyzer.generate_report(results, "walk_forward_report.md")
```

### Interpreting Results

- **Overfitting Score < 10**: Excellent - Strategy is robust
- **Overfitting Score 10-25**: Good - Acceptable overfitting
- **Overfitting Score 25-50**: Moderate - Consider simplifying
- **Overfitting Score > 50**: High - Strategy may fail on live data

## Best Practices

### 1. Start Simple

```python
# Begin with basic configuration
config = BacktestConfig(initial_balance=10000)
results = engine.run_backtest("AAPL")
```

### 2. Use Realistic Costs

```python
# Include commissions and slippage
config = BacktestConfig(
    commission_rate=0.001,  # 0.1%
    slippage=0.001          # 0.1%
)
```

### 3. Test Multiple Periods

```python
# Test on different time periods
periods = [
    ("2021-01-01", "2021-12-31"),
    ("2022-01-01", "2022-12-31"),
    ("2023-01-01", "2023-12-31")
]

for start, end in periods:
    results = engine.run_backtest("AAPL", start, end)
    print(f"{start} to {end}: {results.total_return_pct:.2f}%")
```

### 4. Validate with Walk-Forward

```python
# Always validate strategy robustness
wf_results = quick_walk_forward(ticker, config, start, end)
if wf_results.overfitting_score < 25:
    print("✅ Strategy is robust")
else:
    print("⚠️  Strategy may be overfitted")
```

### 5. Compare Configurations

```python
# Test different parameters
comparator = StrategyComparator()
for risk in [1.0, 2.0, 5.0]:
    test_config = config.copy()
    test_config.risk_per_trade_pct = risk
    comparator.add_strategy(test_config)

results_df = comparator.run_comparison("AAPL")
```

## Troubleshooting

### No Data Available

**Problem**: `ValueError: No data available for AAPL`

**Solutions**:
1. Check internet connection
2. Verify ticker symbol is valid
3. Try a different date range
4. Ensure yfinance is installed: `pip install yfinance`

### matplotlib Not Available

**Problem**: `ImportError: matplotlib is required for visualizations`

**Solution**:
```bash
pip install matplotlib
```

### Insufficient Funds

**Problem**: No trades executed, balance unchanged

**Solutions**:
1. Increase `initial_balance`
2. Decrease `risk_per_trade_pct`
3. Adjust `max_position_size_pct`

### Slow Performance

**Solutions**:
1. Use shorter date ranges for testing
2. Enable caching (automatic)
3. Install pyarrow for faster caching: `pip install pyarrow`

## API Reference

### BacktestConfig

```python
BacktestConfig(
    initial_balance: float = 10000.0,
    start_date: str = None,
    end_date: str = None,
    commission_rate: float = 0.001,
    slippage: float = 0.001,
    risk_per_trade_pct: float = 2.0,
    max_position_size_pct: float = 20.0,
    position_sizing_method: str = "fixed_percentage",
    data_interval: str = "daily",
    train_period_days: int = 180,
    test_period_days: int = 60
)
```

### BacktestEngine

```python
engine = BacktestEngine(config, trading_graph=None, data_manager=None)

# Methods
results = engine.run_backtest(ticker, start_date=None, end_date=None)
progress = engine.get_progress()
```

### BacktestResults

```python
# Properties
results.ticker
results.initial_balance
results.final_balance
results.total_return
results.total_return_pct
results.trades
results.equity_history

# Methods
results.summary()
results.analyze()
results.save(filepath)
results.export_trades_csv(filepath)
results.export_equity_csv(filepath)
results.export_all(output_dir)
```

### PerformanceAnalyzer

```python
analyzer = PerformanceAnalyzer(results)

# Methods
returns = analyzer.calculate_returns()
risk = analyzer.calculate_risk_metrics()
trades = analyzer.calculate_trade_statistics()
equity_df = analyzer.generate_equity_curve()
drawdown_df = analyzer.generate_drawdown_series()
monthly_df = analyzer.get_monthly_returns()
summary = analyzer.get_summary()
analyzer.print_summary()
```

### VisualizationGenerator

```python
viz = VisualizationGenerator(analyzer)

# Methods
viz.plot_equity_curve(filepath=None, show=True, figsize=(12,6))
viz.plot_drawdown(filepath=None, show=True, figsize=(12,6))
viz.plot_monthly_returns(filepath=None, show=True, figsize=(14,6))
viz.plot_trade_distribution(filepath=None, show=True, figsize=(12,6))
viz.create_dashboard(filepath=None, show=True, figsize=(16,12))
viz.save_all_charts(output_dir)
```

### StrategyComparator

```python
comparator = StrategyComparator(data_manager=None)

# Methods
comparator.add_strategy(config, name=None)
results_df = comparator.run_comparison(ticker, start_date=None, end_date=None)
comparator.print_comparison()
best_config, best_result = comparator.get_best_strategy(metric='sharpe_ratio')
comparator.export_comparison(filepath)
```

### WalkForwardAnalyzer

```python
analyzer = WalkForwardAnalyzer(config, trading_graph=None)

# Methods
results = analyzer.run_walk_forward(ticker, start_date, end_date, train_days=180, test_days=60)
results_df = analyzer.compare_walk_forward(ticker, configs, start_date, end_date)
analyzer.generate_report(results, filepath)
```

## Examples

See the `examples/` directory for complete working examples:

- `run_backtest_example.py` - Complete workflow demonstration
- `compare_strategies_example.py` - Strategy comparison
- `walk_forward_example.py` - Walk-forward analysis
- `demo_backtest.py` - Quick demo

## Support

For issues or questions:
1. Check this user guide
2. Review example scripts
3. Run `python test_backtesting.py` to verify installation
4. Check the troubleshooting section

---

**Happy Backtesting!** 🚀📈
