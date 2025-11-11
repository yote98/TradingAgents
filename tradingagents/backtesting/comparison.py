"""
Strategy Comparison Tools
Compare multiple backtest results and identify best performers.
"""
import logging
from typing import List, Dict, Any, Optional
import pandas as pd
from tradingagents.backtesting.config import BacktestResults, BacktestConfig
from tradingagents.backtesting.backtest_engine import BacktestEngine

logger = logging.getLogger(__name__)


class StrategyComparator:
    """
    Compare multiple strategy configurations.
    Runs backtests with different settings and identifies best performers.
    """
    
    def __init__(self, data_manager=None):
        """
        Initialize strategy comparator.
        
        Args:
            data_manager: HistoricalDataManager instance (optional)
        """
        from tradingagents.backtesting.data_manager import HistoricalDataManager
        self.data_manager = data_manager or HistoricalDataManager()
        self.results: List[BacktestResults] = []
        self.configs: List[BacktestConfig] = []
        
        logger.info("StrategyComparator initialized")
    
    def add_strategy(self, config: BacktestConfig, name: Optional[str] = None):
        """
        Add a strategy configuration to compare.
        
        Args:
            config: BacktestConfig to test
            name: Optional name for the strategy
        """
        self.configs.append(config)
        logger.info(f"Added strategy: {name or f'Strategy {len(self.configs)}'}")
    
    def run_comparison(
        self,
        ticker: str,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        trading_graph=None
    ) -> pd.DataFrame:
        """
        Run all strategies and compare results.
        
        Args:
            ticker: Stock symbol to test
            start_date: Start date (uses config if None)
            end_date: End date (uses config if None)
            trading_graph: TradingAgentsGraph instance (optional)
        
        Returns:
            DataFrame with comparison results
        """
        if not self.configs:
            raise ValueError("No strategies added. Use add_strategy() first.")
        
        print(f"\n{'='*70}")
        print(f"Running Strategy Comparison for {ticker}")
        print(f"{'='*70}")
        print(f"Testing {len(self.configs)} configurations...\n")
        
        self.results = []
        
        for i, config in enumerate(self.configs, 1):
            print(f"[{i}/{len(self.configs)}] Testing configuration {i}...")
            
            try:
                # Create engine
                engine = BacktestEngine(
                    config=config,
                    trading_graph=trading_graph,
                    data_manager=self.data_manager
                )
                
                # Run backtest
                result = engine.run_backtest(ticker, start_date, end_date)
                self.results.append(result)
                
                print(f"  ✅ Complete - Return: {result.total_return_pct:.2f}%")
                
            except Exception as e:
                logger.error(f"Strategy {i} failed: {e}")
                print(f"  ❌ Failed: {e}")
        
        # Generate comparison report
        return self.generate_comparison_report()
    
    def generate_comparison_report(self) -> pd.DataFrame:
        """
        Generate comparison report DataFrame.
        
        Returns:
            DataFrame with all metrics for comparison
        """
        if not self.results:
            return pd.DataFrame()
        
        comparison_data = []
        
        for i, result in enumerate(self.results, 1):
            config = self.configs[i-1]
            
            comparison_data.append({
                'Strategy': f'Config {i}',
                'Initial Balance': result.initial_balance,
                'Final Balance': result.final_balance,
                'Total Return': result.total_return,
                'Return %': result.total_return_pct,
                'CAGR %': result.cagr,
                'Sharpe Ratio': result.sharpe_ratio,
                'Sortino Ratio': result.sortino_ratio,
                'Max Drawdown %': result.max_drawdown,
                'Volatility %': result.volatility,
                'Total Trades': result.total_trades,
                'Win Rate %': result.win_rate,
                'Profit Factor': result.profit_factor,
                'Avg Win': result.avg_win,
                'Avg Loss': result.avg_loss,
                'Commission Rate': config.commission_rate,
                'Slippage': config.slippage,
                'Risk per Trade %': config.risk_per_trade_pct,
                'Max Position %': config.max_position_size_pct,
                'Position Sizing': config.position_sizing_method
            })
        
        df = pd.DataFrame(comparison_data)
        return df
    
    def print_comparison(self):
        """Print formatted comparison report."""
        df = self.generate_comparison_report()
        
        if df.empty:
            print("No results to compare")
            return
        
        print(f"\n{'='*70}")
        print("STRATEGY COMPARISON REPORT")
        print(f"{'='*70}\n")
        
        # Key metrics
        print("Performance Metrics:")
        print(df[['Strategy', 'Return %', 'CAGR %', 'Sharpe Ratio', 
                  'Max Drawdown %', 'Win Rate %']].to_string(index=False))
        
        print(f"\n{'='*70}\n")
        
        # Identify best performers
        best_return = df.loc[df['Return %'].idxmax()]
        best_sharpe = df.loc[df['Sharpe Ratio'].idxmax()]
        best_drawdown = df.loc[df['Max Drawdown %'].idxmax()]  # Least negative
        
        print("Best Performers:")
        print(f"  🏆 Highest Return: {best_return['Strategy']} ({best_return['Return %']:.2f}%)")
        print(f"  🏆 Best Sharpe Ratio: {best_sharpe['Strategy']} ({best_sharpe['Sharpe Ratio']:.2f})")
        print(f"  🏆 Smallest Drawdown: {best_drawdown['Strategy']} ({best_drawdown['Max Drawdown %']:.2f}%)")
        
        print(f"\n{'='*70}")
    
    def get_best_strategy(self, metric: str = 'sharpe_ratio') -> tuple:
        """
        Get the best performing strategy based on a metric.
        
        Args:
            metric: Metric to optimize ('return_pct', 'sharpe_ratio', 'max_drawdown', etc.)
        
        Returns:
            Tuple of (config, result) for best strategy
        """
        if not self.results:
            return None, None
        
        metric_map = {
            'return_pct': lambda r: r.total_return_pct,
            'sharpe_ratio': lambda r: r.sharpe_ratio,
            'sortino_ratio': lambda r: r.sortino_ratio,
            'max_drawdown': lambda r: -r.max_drawdown,  # Negative because less is better
            'win_rate': lambda r: r.win_rate,
            'profit_factor': lambda r: r.profit_factor
        }
        
        if metric not in metric_map:
            raise ValueError(f"Unknown metric: {metric}. Choose from {list(metric_map.keys())}")
        
        best_idx = max(range(len(self.results)), key=lambda i: metric_map[metric](self.results[i]))
        
        return self.configs[best_idx], self.results[best_idx]
    
    def export_comparison(self, filepath: str):
        """
        Export comparison report to CSV.
        
        Args:
            filepath: Path to save CSV file
        """
        df = self.generate_comparison_report()
        df.to_csv(filepath, index=False)
        print(f"✅ Comparison report exported to {filepath}")


def compare_risk_levels(
    ticker: str,
    risk_levels: List[float],
    base_config: BacktestConfig,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
) -> pd.DataFrame:
    """
    Quick comparison of different risk levels.
    
    Args:
        ticker: Stock symbol
        risk_levels: List of risk percentages to test
        base_config: Base configuration to modify
        start_date: Start date (optional)
        end_date: End date (optional)
    
    Returns:
        DataFrame with comparison results
    """
    comparator = StrategyComparator()
    
    for risk in risk_levels:
        config = base_config.copy()
        config.risk_per_trade_pct = risk
        comparator.add_strategy(config, name=f"{risk}% Risk")
    
    results_df = comparator.run_comparison(ticker, start_date, end_date)
    comparator.print_comparison()
    
    return results_df


def compare_position_sizing_methods(
    ticker: str,
    base_config: BacktestConfig,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
) -> pd.DataFrame:
    """
    Compare different position sizing methods.
    
    Args:
        ticker: Stock symbol
        base_config: Base configuration to modify
        start_date: Start date (optional)
        end_date: End date (optional)
    
    Returns:
        DataFrame with comparison results
    """
    comparator = StrategyComparator()
    
    methods = ["fixed_percentage", "risk_based", "equal_weight"]
    
    for method in methods:
        config = base_config.copy()
        config.position_sizing_method = method
        comparator.add_strategy(config, name=method)
    
    results_df = comparator.run_comparison(ticker, start_date, end_date)
    comparator.print_comparison()
    
    return results_df


def compare_tickers(
    tickers: List[str],
    config: BacktestConfig,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
) -> pd.DataFrame:
    """
    Compare same strategy across different tickers.
    
    Args:
        tickers: List of stock symbols
        config: Configuration to use
        start_date: Start date (optional)
        end_date: End date (optional)
    
    Returns:
        DataFrame with comparison results
    """
    from tradingagents.backtesting.backtest_engine import BacktestEngine
    
    results = []
    
    print(f"\n{'='*70}")
    print(f"Comparing Strategy Across {len(tickers)} Tickers")
    print(f"{'='*70}\n")
    
    for ticker in tickers:
        print(f"Testing {ticker}...")
        
        try:
            engine = BacktestEngine(config)
            result = engine.run_backtest(ticker, start_date, end_date)
            results.append(result)
            print(f"  ✅ Complete - Return: {result.total_return_pct:.2f}%")
        except Exception as e:
            print(f"  ❌ Failed: {e}")
    
    # Create comparison DataFrame
    comparison_data = []
    for result in results:
        comparison_data.append({
            'Ticker': result.ticker,
            'Return %': result.total_return_pct,
            'CAGR %': result.cagr,
            'Sharpe Ratio': result.sharpe_ratio,
            'Max Drawdown %': result.max_drawdown,
            'Win Rate %': result.win_rate,
            'Total Trades': result.total_trades
        })
    
    df = pd.DataFrame(comparison_data)
    
    print(f"\n{'='*70}")
    print("TICKER COMPARISON")
    print(f"{'='*70}\n")
    print(df.to_string(index=False))
    print(f"\n{'='*70}")
    
    return df
