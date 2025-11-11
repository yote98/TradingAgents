"""
Backtesting Configuration

Defines configuration classes and data models for the backtesting framework.
"""

from dataclasses import dataclass, field, asdict
from typing import List, Dict, Any, Optional
from datetime import datetime
import json


@dataclass
class BacktestConfig:
    """
    Configuration for a backtest run.
    
    Defines all parameters needed to execute a backtest including account settings,
    trading costs, strategy configuration, and date ranges.
    """
    
    # Account settings
    initial_balance: float = 10000.0
    
    # Trading costs
    commission_rate: float = 0.001  # 0.1% per trade
    slippage: float = 0.001  # 0.1% slippage
    
    # Strategy settings
    selected_analysts: Optional[List[str]] = None
    enable_coaches: bool = False
    risk_management_config: Optional[Dict[str, Any]] = None
    
    # Backtest settings
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    benchmark: str = "SPY"
    data_interval: str = "daily"  # daily, weekly, intraday
    
    # Walk-forward settings
    train_period_days: int = 252  # 1 year
    test_period_days: int = 63  # 3 months
    
    # Position sizing
    position_sizing_method: str = "fixed_percentage"  # fixed_percentage, risk_based, equal_weight
    risk_per_trade_pct: float = 1.0  # 1% of account per trade
    max_position_size_pct: float = 20.0  # Max 20% of account per position
    
    def __post_init__(self):
        """Validate configuration after initialization."""
        self._validate()
    
    def _validate(self):
        """Validate configuration parameters."""
        if self.initial_balance <= 0:
            raise ValueError("initial_balance must be positive")
        
        if self.commission_rate < 0 or self.commission_rate > 0.1:
            raise ValueError("commission_rate must be between 0 and 0.1 (10%)")
        
        if self.slippage < 0 or self.slippage > 0.1:
            raise ValueError("slippage must be between 0 and 0.1 (10%)")
        
        if self.risk_per_trade_pct <= 0 or self.risk_per_trade_pct > 100:
            raise ValueError("risk_per_trade_pct must be between 0 and 100")
        
        if self.max_position_size_pct <= 0 or self.max_position_size_pct > 100:
            raise ValueError("max_position_size_pct must be between 0 and 100")
        
        if self.data_interval not in ["daily", "weekly", "intraday"]:
            raise ValueError("data_interval must be 'daily', 'weekly', or 'intraday'")
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert configuration to dictionary."""
        return asdict(self)
    
    @classmethod
    def from_dict(cls, config_dict: Dict[str, Any]) -> 'BacktestConfig':
        """Create configuration from dictionary."""
        return cls(**config_dict)
    
    def copy(self) -> 'BacktestConfig':
        """Create a copy of this configuration."""
        return BacktestConfig.from_dict(self.to_dict())


@dataclass
class BacktestResults:
    """
    Results from a backtest run.
    
    Contains all trades, equity history, and calculated performance metrics.
    """
    
    # Basic info
    ticker: str
    start_date: str
    end_date: str
    initial_balance: float
    final_balance: float
    
    # Trade data
    trades: List[Dict[str, Any]] = field(default_factory=list)
    equity_history: List[Dict[str, Any]] = field(default_factory=list)
    
    # Configuration
    config: Optional[BacktestConfig] = None
    
    # Performance metrics (calculated by PerformanceAnalyzer)
    total_return: float = 0.0
    total_return_pct: float = 0.0
    cagr: float = 0.0
    sharpe_ratio: float = 0.0
    sortino_ratio: float = 0.0
    max_drawdown: float = 0.0
    volatility: float = 0.0
    
    # Trade statistics
    total_trades: int = 0
    winning_trades: int = 0
    losing_trades: int = 0
    win_rate: float = 0.0
    profit_factor: float = 0.0
    avg_win: float = 0.0
    avg_loss: float = 0.0
    avg_holding_days: float = 0.0
    
    # Metadata
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert results to dictionary."""
        result_dict = asdict(self)
        # Convert config to dict if present
        if self.config:
            result_dict['config'] = self.config.to_dict()
        return result_dict
    
    def save(self, filepath: str):
        """Save results to JSON file."""
        with open(filepath, 'w') as f:
            json.dump(self.to_dict(), f, indent=2, default=str)
    
    @classmethod
    def load(cls, filepath: str) -> 'BacktestResults':
        """Load results from JSON file."""
        with open(filepath, 'r') as f:
            data = json.load(f)
        
        # Reconstruct config if present
        if 'config' in data and data['config']:
            data['config'] = BacktestConfig.from_dict(data['config'])
        
        return cls(**data)
    
    def summary(self) -> str:
        """Generate a summary string of results."""
        return f"""
=== Backtest Results for {self.ticker} ===
Period: {self.start_date} to {self.end_date}

Account Performance:
  Initial Balance: ${self.initial_balance:,.2f}
  Final Balance: ${self.final_balance:,.2f}
  Total Return: {self.total_return_pct:.2f}%
  CAGR: {self.cagr:.2f}%

Risk Metrics:
  Sharpe Ratio: {self.sharpe_ratio:.2f}
  Sortino Ratio: {self.sortino_ratio:.2f}
  Max Drawdown: {self.max_drawdown:.2f}%
  Volatility: {self.volatility:.2f}%

Trade Statistics:
  Total Trades: {self.total_trades}
  Win Rate: {self.win_rate:.2f}%
  Profit Factor: {self.profit_factor:.2f}
  Avg Win: ${self.avg_win:.2f}
  Avg Loss: ${self.avg_loss:.2f}
  Avg Holding Days: {self.avg_holding_days:.1f}
"""
    
    def analyze(self):
        """
        Perform detailed performance analysis and print results.
        Uses PerformanceAnalyzer to calculate comprehensive metrics.
        
        Returns:
            PerformanceAnalyzer instance with all metrics
        """
        from tradingagents.backtesting.performance_analyzer import PerformanceAnalyzer
        analyzer = PerformanceAnalyzer(self)
        analyzer.print_summary()
        return analyzer
    
    def export_trades_csv(self, filepath: str):
        """
        Export trades to CSV file.
        
        Args:
            filepath: Path to save CSV file
        """
        import pandas as pd
        
        if not self.trades:
            print("No trades to export")
            return
        
        df = pd.DataFrame(self.trades)
        df.to_csv(filepath, index=False)
        print(f"✅ Trades exported to {filepath}")
    
    def export_equity_csv(self, filepath: str):
        """
        Export equity history to CSV file.
        
        Args:
            filepath: Path to save CSV file
        """
        import pandas as pd
        
        if not self.equity_history:
            print("No equity history to export")
            return
        
        df = pd.DataFrame(self.equity_history)
        df.to_csv(filepath, index=False)
        print(f"✅ Equity history exported to {filepath}")
    
    def export_all(self, output_dir: str):
        """
        Export all results to a directory.
        
        Args:
            output_dir: Directory to save all exports
        """
        import os
        os.makedirs(output_dir, exist_ok=True)
        
        ticker = self.ticker
        
        # Export JSON
        self.save(f"{output_dir}/{ticker}_results.json")
        
        # Export CSVs
        self.export_trades_csv(f"{output_dir}/{ticker}_trades.csv")
        self.export_equity_csv(f"{output_dir}/{ticker}_equity.csv")
        
        print(f"✅ All results exported to {output_dir}/")


@dataclass
class WalkForwardResults:
    """Results from walk-forward analysis."""
    
    in_sample_results: List[BacktestResults] = field(default_factory=list)
    out_of_sample_results: List[BacktestResults] = field(default_factory=list)
    performance_degradation: float = 0.0
    overfitting_score: float = 0.0
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            'in_sample_results': [r.to_dict() for r in self.in_sample_results],
            'out_of_sample_results': [r.to_dict() for r in self.out_of_sample_results],
            'performance_degradation': self.performance_degradation,
            'overfitting_score': self.overfitting_score
        }


@dataclass
class ComparisonResults:
    """Results from strategy comparison."""
    
    strategies: List[str] = field(default_factory=list)
    results: List[BacktestResults] = field(default_factory=list)
    best_strategy: str = ""
    comparison_metrics: Optional[Dict[str, Any]] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            'strategies': self.strategies,
            'results': [r.to_dict() for r in self.results],
            'best_strategy': self.best_strategy,
            'comparison_metrics': self.comparison_metrics
        }
