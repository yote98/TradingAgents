# Implementation Plan

- [x] 1. Set up backtesting module structure



  - Create `tradingagents/backtesting/` directory
  - Create `__init__.py` to export backtesting classes
  - Create `config.py` with `BacktestConfig` dataclass
  - Implement configuration validation and default values





  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 2. Implement Historical Data Manager
  - [ ] 2.1 Create `data_manager.py` with `HistoricalDataManager` class
    - Implement data retrieval from Alpha Vantage MCP

    - Add support for daily, weekly, and intraday data frequencies
    - Implement in-memory caching with dictionary
    - _Requirements: 1.1, 1.3_
  
  - [x] 2.2 Add file-based caching

    - Implement cache file path generation
    - Add methods to save and load data from cache files
    - Create cache directory management
    - _Requirements: 1.2_
  
  - [ ] 2.3 Add data validation
    - Implement `validate_data()` to check completeness
    - Add logic to detect missing dates and gaps

    - Implement `get_trading_dates()` to filter non-trading days

    - _Requirements: 1.4, 1.5_
  
  - [ ]* 2.4 Create unit tests for data manager
    - Test data retrieval with mocked MCP responses
    - Test caching functionality

    - Test data validation logic
    - _Requirements: 12.5_

- [ ] 3. Implement Simulated Account
  - [ ] 3.1 Create `trade_executor.py` with `SimulatedAccount` class
    - Implement `Position` dataclass for open positions

    - Implement account initialization with balance tracking
    - Add methods to add, remove, and get positions
    - _Requirements: 2.2_

  

  - [ ] 3.2 Add position management
    - Implement `update_positions()` to update position values
    - Add stop-loss checking logic
    - Implement `get_total_equity()` for account value calculation
    - Add `record_equity()` to track equity history

    - _Requirements: 2.4_
  
  - [ ] 3.3 Add unrealized P&L tracking
    - Implement unrealized P&L calculation in `Position` class
    - Track position value changes over time
    - _Requirements: 2.4_


- [ ] 4. Implement Trade Executor
  - [ ] 4.1 Create `TradeExecutor` class in `trade_executor.py`
    - Implement `Trade` dataclass for completed trades
    - Implement `execute_trade()` main method
    - Add signal parsing logic (BUY, SELL, HOLD)

    - _Requirements: 2.1, 2.5_
  
  - [ ] 4.2 Implement buy order execution
    - Implement `_execute_buy()` with slippage application

    - Add commission calculation

    - Integrate with risk metrics for position sizing
    - Add balance checking before execution
    - _Requirements: 2.3, 2.5_
  
  - [x] 4.3 Implement sell order execution

    - Implement `_execute_sell()` with slippage application
    - Calculate P&L and P&L percentage
    - Track holding period
    - Update account balance with proceeds
    - _Requirements: 2.3_
  
  - [x] 4.4 Add helper methods

    - Implement `_get_position_size()` to extract from risk metrics
    - Implement `_get_stop_loss()` to extract from risk metrics
    - Implement `_get_target()` to extract target price
    - _Requirements: 2.5_


- [ ] 5. Implement Backtest Engine
  - [ ] 5.1 Create `backtest_engine.py` with `BacktestEngine` class
    - Implement `BacktestResults` dataclass
    - Initialize engine with config, trading graph, and data manager
    - Create simulated account and trade executor

    - _Requirements: 2.1, 2.2, 11.1_
  
  - [ ] 5.2 Implement main backtest loop
    - Implement `run_backtest()` main method

    - Load historical data for date range

    - Loop through trading dates
    - Call `trading_graph.propagate()` for each date
    - Execute trades based on signals
    - _Requirements: 2.1, 11.1, 11.2_

  
  - [ ] 5.3 Add progress tracking
    - Implement `_update_progress()` method
    - Display percentage complete and ETA
    - Log progress at regular intervals

    - _Requirements: 10.2_
  
  - [ ] 5.4 Add error handling
    - Wrap each date iteration in try-catch
    - Log errors and continue with remaining dates
    - Generate partial results if interrupted


    - _Requirements: 10.1, 10.4_
  
  - [ ] 5.5 Implement results generation
    - Implement `_generate_results()` method
    - Collect all trades and equity history
    - Create `BacktestResults` object
    - _Requirements: 6.1, 6.2_


- [ ] 6. Implement Performance Analyzer
  - [ ] 6.1 Create `performance_analyzer.py` with `PerformanceAnalyzer` class
    - Initialize with `BacktestResults`
    - Convert trades and equity to DataFrames
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [ ] 6.2 Implement return metrics
    - Implement `calculate_returns()` method
    - Calculate total return and percentage



    - Calculate CAGR (annualized return)
    - _Requirements: 4.1_
  
  - [x] 6.3 Implement risk metrics

    - Implement `calculate_risk_metrics()` method
    - Calculate Sharpe ratio
    - Calculate Sortino ratio
    - Calculate maximum drawdown
    - Calculate volatility
    - _Requirements: 4.2_

  
  - [ ] 6.4 Implement trade statistics
    - Implement `calculate_trade_statistics()` method
    - Calculate win rate and profit factor
    - Calculate average win and average loss
    - Calculate average holding period
    - Handle edge case of zero trades
    - _Requirements: 4.3, 4.4_
  
  - [x] 6.5 Add equity curve and drawdown generation



    - Implement `generate_equity_curve()` method
    - Implement `generate_drawdown_series()` method
    - _Requirements: 4.5_
  
  - [x]* 6.6 Implement accuracy metrics

    - Implement `calculate_accuracy_metrics()` method
    - Track directional accuracy
    - Track magnitude accuracy
    - Analyze per-analyst accuracy

    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_


- [ ] 7. Implement Visualization Generator
  - [ ] 7.1 Create `visualizations.py` with `VisualizationGenerator` class
    - Initialize with `PerformanceAnalyzer`
    - Set up matplotlib configuration

    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [ ] 7.2 Implement equity curve plot
    - Implement `plot_equity_curve()` method
    - Plot portfolio value over time

    - Add initial balance reference line
    - Support saving to file
    - _Requirements: 7.1_
  



  - [ ] 7.3 Implement drawdown plot
    - Implement `plot_drawdown()` method
    - Plot drawdown percentage over time
    - Fill area under curve
    - _Requirements: 7.2_

  
  - [ ]* 7.4 Implement additional visualizations
    - Implement `plot_monthly_returns()` heatmap
    - Implement `plot_trade_distribution()` histogram
    - Add support for HTML export

    - _Requirements: 7.3, 7.4, 7.5_

- [ ] 8. Implement results persistence
  - [x] 8.1 Add save/load functionality to `BacktestResults`

    - Implement `to_dict()` method
    - Implement `save()` method to JSON file
    - Implement `load()` class method from JSON file
    - _Requirements: 6.4_
  
  - [ ] 8.2 Add trade log export
    - Implement CSV export for trades
    - Implement JSON export for trades
    - Add filtering and search capabilities
    - _Requirements: 6.3, 6.4, 6.5_

- [x] 9. Implement Strategy Comparator


  - [ ] 9.1 Create `StrategyComparator` class in `config.py`
    - Implement `ComparisonResults` dataclass





    - Initialize with data manager
    - Add method to register strategies
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  

  - [ ] 9.2 Implement comparison execution
    - Implement `run_comparison()` method
    - Run each strategy configuration
    - Collect all results
    - _Requirements: 3.1, 3.5_
  
  - [ ] 9.3 Generate comparison report
    - Implement `_generate_comparison_report()` method
    - Create comparative DataFrame with all metrics
    - Identify best performing strategy
    - _Requirements: 3.5_

- [ ] 10. Implement Walk-Forward Analysis
  - [ ] 10.1 Add walk-forward support to `BacktestEngine`
    - Implement `WalkForwardResults` dataclass
    - Implement `run_walk_forward()` method
    - Split data into training and testing windows
    - _Requirements: 8.1, 8.2_



  
  - [ ] 10.2 Track in-sample vs out-of-sample performance
    - Run backtest on each window
    - Separate in-sample and out-of-sample results
    - Calculate performance degradation
    - _Requirements: 8.3, 8.4_
  
  - [ ] 10.3 Add overfitting detection
    - Compare in-sample vs out-of-sample metrics
    - Calculate overfitting score
    - Generate walk-forward report
    - _Requirements: 8.4, 8.5_

- [ ] 11. Create example scripts
  - [ ] 11.1 Create `examples/run_backtest.py`
    - Demonstrate basic backtest execution
    - Show how to configure backtest parameters
    - Display results and generate visualizations
    - _Requirements: 11.1, 11.2, 11.3_
  
  - [ ] 11.2 Create `examples/compare_strategies.py`
    - Demonstrate strategy comparison
    - Show how to configure multiple strategies
    - Generate comparative analysis
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [ ]* 11.3 Create `examples/walk_forward_example.py`
    - Demonstrate walk-forward analysis
    - Show overfitting detection
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 12. Create integration tests
  - [ ] 12.1 Test full backtest workflow
    - Create integration test for complete backtest
    - Verify all components work together
    - Test with known historical data
    - _Requirements: 12.2_
  
  - [ ] 12.2 Test integration with TradingAgentsGraph
    - Verify backtest uses same workflow as live trading
    - Test with all analyst combinations
    - Verify risk management integration
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_
  
  - [ ]* 12.3 Test edge cases
    - Test with zero trades scenario
    - Test with all losing trades
    - Test with missing data
    - Test with interrupted backtest
    - _Requirements: 10.1, 10.4, 12.4_
  
  - [ ]* 12.4 Create unit tests for metrics
    - Test return calculations with known values
    - Test Sharpe ratio calculation
    - Test drawdown calculation
    - Test win rate and profit factor
    - _Requirements: 12.1_

- [ ] 13. Update documentation
  - Create backtesting user guide
  - Document all configuration options
  - Add examples of interpreting results
  - Update system architecture documentation
  - _Requirements: 11.5_
