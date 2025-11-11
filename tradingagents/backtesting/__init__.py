"""
TradingAgents Backtesting Framework

This module provides comprehensive backtesting capabilities for the TradingAgents system,
allowing users to test trading strategies on historical data, compare configurations,
and measure performance metrics.
"""

from tradingagents.backtesting.config import BacktestConfig, BacktestResults, WalkForwardResults
from tradingagents.backtesting.backtest_engine import BacktestEngine
from tradingagents.backtesting.data_manager import HistoricalDataManager
from tradingagents.backtesting.performance_analyzer import PerformanceAnalyzer
from tradingagents.backtesting.visualizations import VisualizationGenerator
from tradingagents.backtesting.comparison import (
    StrategyComparator,
    compare_risk_levels,
    compare_position_sizing_methods,
    compare_tickers
)
from tradingagents.backtesting.walk_forward import (
    WalkForwardAnalyzer,
    quick_walk_forward
)

__all__ = [
    'BacktestConfig',
    'BacktestResults',
    'WalkForwardResults',
    'BacktestEngine',
    'HistoricalDataManager',
    'PerformanceAnalyzer',
    'VisualizationGenerator',
    'StrategyComparator',
    'compare_risk_levels',
    'compare_position_sizing_methods',
    'compare_tickers',
    'WalkForwardAnalyzer',
    'quick_walk_forward',
]

__version__ = '0.1.0'
