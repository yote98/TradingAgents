# Design Document: Backtesting Framework

## Overview

This design document outlines the implementation of a comprehensive backtesting framework for the TradingAgents system. The framework will enable users to test trading strategies on historical data, compare different configurations, and measure accuracy over time. The design emphasizes reusing the existing TradingAgentsGraph workflow to ensure backtest results accurately reflect live trading behavior.

The backtesting framework consists of four main components:
1. **Historical Data Manager**: Handles data retrieval and caching
2. **Backtest Engine**: Executes trades and manages simulated account
3. **Performance Analyzer**: Calculates metrics and generates reports
4. **Configuration Manager**: Handles strategy configurations and comparisons

## Architecture

### System Integration

The backtesting framework wraps the existing TradingAgentsGraph:

```
┌─────────────────────────────────────────────────────────────┐
│                   BACKTESTING FRAMEWORK                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────┐         ┌──────────────────┐          │
│  │  Historical     │────────▶│  Backtest        │          │
│  │  Data Manager   │         │  Engine          │          │
│  └─────────────────┘         └────────┬─────────┘          │
│                                        │                     │
│                                        ▼                     │
│                              ┌──────────────────┐           │
│                              │ TradingAgents    │           │
│                              │ Graph (Existing) │           │
│                              └────────┬─────────┘           │
│                                       │                     │
│                                       ▼                     │
│  ┌─────────────────┐         ┌──────────────────┐          │
│  │  Performance    │◀────────│  Trade           │          │
│  │  Analyzer       │         │  Executor        │          │
│  └─────────────────┘         └──────────────────┘          │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### File Structure

```
tradingagents/
├── backtesting/
│   ├── __init__.py
│   ├── data_manager.py             ← NEW
│   ├── backtest_engine.py          ← NEW
│   ├── performance_analyzer.py     ← NEW
│   ├── trade_executor.py           ← NEW
│   ├── metrics.py                  ← NEW
│   ├── visualizations.py           ← NEW
│   ├── config.py                   ← NEW
│   └── reports.py                  ← NEW
├── examples/
│   ├── run_backtest.py             ← NEW
│   └── compare_strategies.py       ← NEW
└── tests/
    ├── test_backtest_engine.py     ← NEW
    ├── test_performance_metrics.py ← NEW
    └── test_data_manager.py        ← NEW
```

## Components and Interfaces

### 1. Historical Data Manager

**Purpose**: Retrieve, cache, and manage historical market data for backtesting.

**Key Classes**:

```python
class HistoricalDataManager:
    """
    Manages historical data retrieval and caching.
    """
    
    def __init__(self, cache_dir: str = "backtest_data_cache"):
        self.cache_dir = cache_dir
        self.data_cache = {}
    
    def get_historical_data(
        self,
        ticker: str,
        start_date: str,
        end_date: str,
        interval: str = "daily"
    ) -> pd.DataFrame:
        """
        Retrieve historical data for a ticker.
        
        Checks cache first, then fetches from Alpha Vantage MCP if needed.
        """
        cache_key = f"{ticker}_{start_date}_{end_date}_{interval}"
        
        if cache_key in self.data_cache:
            return self.data_cache[cache_key]
        
        # Check file cache
        cached_file = self._get_cache_file_path(cache_key)
        if os.path.exists(cached_file):
            return self._load_from_cache(cached_file)
        
        # Fetch from MCP
        data = self._fetch_from_mcp(ticker, start_date, end_date, interval)
        
        # Cache it
        self._save_to_cache(cached_file, data)
        self.data_cache[cache_key] = data
        
        return data
    
    def validate_data(
        self,
        data: pd.DataFrame,
        start_date: str,
        end_date: str
    ) -> Tuple[bool, List[str]]:
        """
        Validate data completeness and quality.
        """
        pass
    
    def get_trading_dates(
        self,
        start_date: str,
        end_date: str
    ) -> List[str]:
        """
        Get list of valid trading dates in range.
        """
        pass
```

### 2. Backtest Engine

**Purpose**: Execute the trading workflow on historical data and manage simulated account.

**Key Classes**:

```python
class BacktestEngine:
    """
    Main backtesting engine that executes trades on historical data.
    """
    
    def __init__(
        self,
        config: BacktestConfig,
        trading_graph: TradingAgentsGraph,
        data_manager: HistoricalDataManager
    ):
        self.config = config
        self.trading_graph = trading_graph
        self.data_manager = data_manager
        self.account = SimulatedAccount(config.initial_balance)
        self.trade_executor = TradeExecutor(self.account, config)
        self.trade_log = []
    
    def run_backtest(
        self,
        ticker: str,
        start_date: str,
        end_date: str
    ) -> BacktestResults:
        """
        Run backtest for a ticker over specified date range.
        """
        # Get historical data
        historical_data = self.data_manager.get_historical_data(
            ticker, start_date, end_date
        )
        
        # Get trading dates
        trading_dates = self.data_manager.get_trading_dates(
            start_date, end_date
        )
        
        # Execute for each date
        for i, date in enumerate(trading_dates):
            self._update_progress(i, len(trading_dates))
            
            try:
                # Run trading workflow
                state, signal = self.trading_graph.propagate(ticker, date)
                
                # Execute trade based on signal
                trade = self.trade_executor.execute_trade(
                    ticker=ticker,
                    signal=signal,
                    date=date,
                    price=historical_data.loc[date, 'close'],
                    state=state
                )
                
                if trade:
                    self.trade_log.append(trade)
                
                # Update open positions
                self.account.update_positions(
                    date, historical_data.loc[date]
                )
                
            except Exception as e:
                logger.error(f"Error on {date}: {e}")
                continue
        
        # Generate results
        return self._generate_results()
    
    def run_walk_forward(
        self,
        ticker: str,
        start_date: str,
        end_date: str,
        train_period_days: int = 252,
        test_period_days: int = 63
    ) -> WalkForwardResults:
        """
        Run walk-forward analysis.
        """
        pass
```


### 3. Trade Executor

**Purpose**: Execute trades in the simulated account with slippage and commissions.

**Key Classes**:

```python
class TradeExecutor:
    """
    Executes trades in simulated account.
    """
    
    def __init__(self, account: SimulatedAccount, config: BacktestConfig):
        self.account = account
        self.config = config
    
    def execute_trade(
        self,
        ticker: str,
        signal: str,
        date: str,
        price: float,
        state: Dict[str, Any]
    ) -> Optional[Trade]:
        """
        Execute a trade based on signal.
        
        Applies slippage and commission.
        """
        if signal == "BUY" or signal == "LONG":
            return self._execute_buy(ticker, date, price, state)
        elif signal == "SELL" or signal == "SHORT":
            return self._execute_sell(ticker, date, price, state)
        elif signal == "HOLD":
            return None
        else:
            return None
    
    def _execute_buy(
        self,
        ticker: str,
        date: str,
        price: float,
        state: Dict[str, Any]
    ) -> Trade:
        """Execute buy order with slippage and commission."""
        # Apply slippage
        execution_price = price * (1 + self.config.slippage)
        
        # Get position size from risk metrics if available
        position_size = self._get_position_size(state, execution_price)
        
        # Calculate cost
        cost = execution_price * position_size
        commission = cost * self.config.commission_rate
        total_cost = cost + commission
        
        # Check if we have enough balance
        if total_cost > self.account.cash:
            logger.warning(f"Insufficient funds for trade on {date}")
            return None
        
        # Execute trade
        self.account.cash -= total_cost
        position = Position(
            ticker=ticker,
            shares=position_size,
            entry_price=execution_price,
            entry_date=date,
            stop_loss=self._get_stop_loss(state),
            target=self._get_target(state)
        )
        self.account.add_position(position)
        
        return Trade(
            ticker=ticker,
            action="BUY",
            date=date,
            price=execution_price,
            shares=position_size,
            commission=commission,
            state=state
        )
    
    def _execute_sell(
        self,
        ticker: str,
        date: str,
        price: float,
        state: Dict[str, Any]
    ) -> Optional[Trade]:
        """Execute sell order for existing position."""
        position = self.account.get_position(ticker)
        if not position:
            return None
        
        # Apply slippage
        execution_price = price * (1 - self.config.slippage)
        
        # Calculate proceeds
        proceeds = execution_price * position.shares
        commission = proceeds * self.config.commission_rate
        net_proceeds = proceeds - commission
        
        # Calculate P&L
        cost_basis = position.entry_price * position.shares
        pnl = net_proceeds - cost_basis
        pnl_pct = (pnl / cost_basis) * 100
        
        # Execute trade
        self.account.cash += net_proceeds
        self.account.remove_position(ticker)
        
        return Trade(
            ticker=ticker,
            action="SELL",
            date=date,
            price=execution_price,
            shares=position.shares,
            commission=commission,
            pnl=pnl,
            pnl_pct=pnl_pct,
            entry_date=position.entry_date,
            entry_price=position.entry_price,
            holding_days=(pd.to_datetime(date) - pd.to_datetime(position.entry_date)).days,
            state=state
        )
```

### 4. Simulated Account

**Purpose**: Track account balance, positions, and equity over time.

**Key Classes**:

```python
class SimulatedAccount:
    """
    Simulated trading account for backtesting.
    """
    
    def __init__(self, initial_balance: float):
        self.initial_balance = initial_balance
        self.cash = initial_balance
        self.positions: Dict[str, Position] = {}
        self.equity_history = []
        self.closed_trades = []
    
    def add_position(self, position: Position):
        """Add a new position."""
        self.positions[position.ticker] = position
    
    def remove_position(self, ticker: str):
        """Close a position."""
        if ticker in self.positions:
            del self.positions[ticker]
    
    def get_position(self, ticker: str) -> Optional[Position]:
        """Get position for ticker."""
        return self.positions.get(ticker)
    
    def update_positions(self, date: str, market_data: pd.Series):
        """
        Update position values and check stop-losses.
        """
        for ticker, position in list(self.positions.items()):
            if ticker in market_data.index:
                current_price = market_data[ticker]
                position.current_price = current_price
                
                # Check stop-loss
                if position.stop_loss:
                    if current_price <= position.stop_loss:
                        logger.info(f"Stop-loss triggered for {ticker} on {date}")
                        # Execute stop-loss sell
                        # (would call trade executor)
    
    def get_total_equity(self) -> float:
        """Calculate total account equity."""
        position_value = sum(
            p.shares * p.current_price 
            for p in self.positions.values()
        )
        return self.cash + position_value
    
    def record_equity(self, date: str):
        """Record equity for this date."""
        equity = self.get_total_equity()
        self.equity_history.append({
            'date': date,
            'equity': equity,
            'cash': self.cash,
            'position_value': equity - self.cash
        })

@dataclass
class Position:
    """Represents an open position."""
    ticker: str
    shares: int
    entry_price: float
    entry_date: str
    current_price: float = None
    stop_loss: float = None
    target: float = None
    
    def get_unrealized_pnl(self) -> float:
        """Calculate unrealized P&L."""
        if self.current_price:
            return (self.current_price - self.entry_price) * self.shares
        return 0.0

@dataclass
class Trade:
    """Represents a completed trade."""
    ticker: str
    action: str  # BUY or SELL
    date: str
    price: float
    shares: int
    commission: float
    pnl: float = 0.0
    pnl_pct: float = 0.0
    entry_date: str = None
    entry_price: float = None
    holding_days: int = 0
    state: Dict[str, Any] = None
```

### 5. Performance Analyzer

**Purpose**: Calculate performance metrics and generate reports.

**Key Classes**:

```python
class PerformanceAnalyzer:
    """
    Analyzes backtest results and calculates performance metrics.
    """
    
    def __init__(self, results: BacktestResults):
        self.results = results
        self.trades_df = pd.DataFrame([t.__dict__ for t in results.trades])
        self.equity_df = pd.DataFrame(results.equity_history)
    
    def calculate_returns(self) -> Dict[str, float]:
        """Calculate return metrics."""
        initial = self.results.initial_balance
        final = self.results.final_balance
        
        total_return = ((final - initial) / initial) * 100
        
        # Calculate annualized return
        days = (pd.to_datetime(self.results.end_date) - 
                pd.to_datetime(self.results.start_date)).days
        years = days / 365.25
        cagr = (((final / initial) ** (1 / years)) - 1) * 100 if years > 0 else 0
        
        return {
            'total_return': total_return,
            'total_return_pct': total_return,
            'cagr': cagr,
            'annualized_return': cagr
        }
    
    def calculate_risk_metrics(self) -> Dict[str, float]:
        """Calculate risk-adjusted metrics."""
        returns = self.equity_df['equity'].pct_change().dropna()
        
        # Sharpe Ratio (assuming 0% risk-free rate)
        sharpe = (returns.mean() / returns.std()) * np.sqrt(252) if returns.std() > 0 else 0
        
        # Sortino Ratio (downside deviation)
        downside_returns = returns[returns < 0]
        sortino = (returns.mean() / downside_returns.std()) * np.sqrt(252) if len(downside_returns) > 0 else 0
        
        # Maximum Drawdown
        equity = self.equity_df['equity']
        cummax = equity.cummax()
        drawdown = (equity - cummax) / cummax
        max_drawdown = drawdown.min() * 100
        
        return {
            'sharpe_ratio': sharpe,
            'sortino_ratio': sortino,
            'max_drawdown': max_drawdown,
            'volatility': returns.std() * np.sqrt(252) * 100
        }
    
    def calculate_trade_statistics(self) -> Dict[str, Any]:
        """Calculate trade-level statistics."""
        if len(self.trades_df) == 0:
            return self._empty_trade_stats()
        
        sell_trades = self.trades_df[self.trades_df['action'] == 'SELL']
        
        if len(sell_trades) == 0:
            return self._empty_trade_stats()
        
        winning_trades = sell_trades[sell_trades['pnl'] > 0]
        losing_trades = sell_trades[sell_trades['pnl'] < 0]
        
        win_rate = (len(winning_trades) / len(sell_trades)) * 100
        
        avg_win = winning_trades['pnl'].mean() if len(winning_trades) > 0 else 0
        avg_loss = losing_trades['pnl'].mean() if len(losing_trades) > 0 else 0
        
        profit_factor = (winning_trades['pnl'].sum() / abs(losing_trades['pnl'].sum())) if len(losing_trades) > 0 else float('inf')
        
        return {
            'total_trades': len(sell_trades),
            'winning_trades': len(winning_trades),
            'losing_trades': len(losing_trades),
            'win_rate': win_rate,
            'avg_win': avg_win,
            'avg_loss': avg_loss,
            'profit_factor': profit_factor,
            'avg_holding_days': sell_trades['holding_days'].mean()
        }
    
    def calculate_accuracy_metrics(self) -> Dict[str, float]:
        """
        Calculate prediction accuracy metrics.
        
        Compares agent predictions to actual outcomes.
        """
        # Analyze directional accuracy
        # (Did the system predict price direction correctly?)
        pass
    
    def generate_equity_curve(self) -> pd.DataFrame:
        """Generate equity curve data."""
        return self.equity_df
    
    def generate_drawdown_series(self) -> pd.Series:
        """Generate drawdown series."""
        equity = self.equity_df['equity']
        cummax = equity.cummax()
        drawdown = (equity - cummax) / cummax * 100
        return drawdown
```

### 6. Visualization Generator

**Purpose**: Create charts and visual reports.

**Key Classes**:

```python
class VisualizationGenerator:
    """
    Generates visualizations for backtest results.
    """
    
    def __init__(self, analyzer: PerformanceAnalyzer):
        self.analyzer = analyzer
    
    def plot_equity_curve(self, save_path: str = None):
        """Plot equity curve over time."""
        equity_df = self.analyzer.equity_df
        
        plt.figure(figsize=(12, 6))
        plt.plot(equity_df['date'], equity_df['equity'], label='Portfolio Value')
        plt.axhline(y=self.analyzer.results.initial_balance, 
                   color='r', linestyle='--', label='Initial Balance')
        plt.xlabel('Date')
        plt.ylabel('Account Value ($)')
        plt.title('Equity Curve')
        plt.legend()
        plt.grid(True)
        
        if save_path:
            plt.savefig(save_path)
        else:
            plt.show()
    
    def plot_drawdown(self, save_path: str = None):
        """Plot drawdown over time."""
        drawdown = self.analyzer.generate_drawdown_series()
        
        plt.figure(figsize=(12, 6))
        plt.fill_between(drawdown.index, drawdown, 0, alpha=0.3, color='red')
        plt.plot(drawdown.index, drawdown, color='red')
        plt.xlabel('Date')
        plt.ylabel('Drawdown (%)')
        plt.title('Drawdown Chart')
        plt.grid(True)
        
        if save_path:
            plt.savefig(save_path)
        else:
            plt.show()
    
    def plot_monthly_returns(self, save_path: str = None):
        """Plot monthly returns heatmap."""
        pass
    
    def plot_trade_distribution(self, save_path: str = None):
        """Plot win/loss distribution."""
        pass
```

### 7. Configuration Manager

**Purpose**: Manage backtest configurations and strategy comparisons.

**Key Classes**:

```python
@dataclass
class BacktestConfig:
    """Configuration for a backtest run."""
    
    # Account settings
    initial_balance: float = 10000.0
    
    # Trading costs
    commission_rate: float = 0.001  # 0.1%
    slippage: float = 0.001  # 0.1%
    
    # Strategy settings
    selected_analysts: List[str] = None
    enable_coaches: bool = False
    risk_management_config: Dict[str, Any] = None
    
    # Backtest settings
    start_date: str = None
    end_date: str = None
    benchmark: str = "SPY"
    
    # Walk-forward settings
    train_period_days: int = 252
    test_period_days: int = 63
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        pass
    
    @classmethod
    def from_dict(cls, config_dict: Dict[str, Any]) -> 'BacktestConfig':
        """Create from dictionary."""
        pass

class StrategyComparator:
    """
    Compare multiple strategy configurations.
    """
    
    def __init__(self, data_manager: HistoricalDataManager):
        self.data_manager = data_manager
        self.results = []
    
    def add_strategy(
        self,
        name: str,
        config: BacktestConfig,
        trading_graph: TradingAgentsGraph
    ):
        """Add a strategy configuration to compare."""
        pass
    
    def run_comparison(
        self,
        ticker: str,
        start_date: str,
        end_date: str
    ) -> ComparisonResults:
        """
        Run all strategies and compare results.
        """
        for strategy in self.strategies:
            engine = BacktestEngine(
                strategy.config,
                strategy.trading_graph,
                self.data_manager
            )
            result = engine.run_backtest(ticker, start_date, end_date)
            self.results.append({
                'name': strategy.name,
                'result': result
            })
        
        return self._generate_comparison_report()
    
    def _generate_comparison_report(self) -> ComparisonResults:
        """Generate comparative analysis."""
        pass
```

## Data Models

### Core Data Models

```python
@dataclass
class BacktestResults:
    """Results from a backtest run."""
    ticker: str
    start_date: str
    end_date: str
    initial_balance: float
    final_balance: float
    trades: List[Trade]
    equity_history: List[Dict[str, Any]]
    config: BacktestConfig
    
    # Performance metrics
    total_return: float = 0.0
    cagr: float = 0.0
    sharpe_ratio: float = 0.0
    max_drawdown: float = 0.0
    win_rate: float = 0.0
    profit_factor: float = 0.0
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        pass
    
    def save(self, filepath: str):
        """Save results to file."""
        pass
    
    @classmethod
    def load(cls, filepath: str) -> 'BacktestResults':
        """Load results from file."""
        pass

@dataclass
class WalkForwardResults:
    """Results from walk-forward analysis."""
    in_sample_results: List[BacktestResults]
    out_of_sample_results: List[BacktestResults]
    performance_degradation: float
    overfitting_score: float

@dataclass
class ComparisonResults:
    """Results from strategy comparison."""
    strategies: List[str]
    results: List[BacktestResults]
    best_strategy: str
    comparison_metrics: pd.DataFrame
```

## Error Handling

### Robust Error Management

```python
class BacktestError(Exception):
    """Base exception for backtesting errors."""
    pass

class DataError(BacktestError):
    """Error related to data retrieval or validation."""
    pass

class ExecutionError(BacktestError):
    """Error during trade execution."""
    pass

def safe_backtest_execution(func):
    """Decorator for safe backtest execution."""
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except DataError as e:
            logger.error(f"Data error: {e}")
            return None
        except ExecutionError as e:
            logger.error(f"Execution error: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            return None
    return wrapper
```

## Testing Strategy

### Unit Tests

```python
def test_performance_metrics():
    """Test performance metric calculations."""
    # Create mock backtest results
    results = BacktestResults(
        ticker="AAPL",
        start_date="2023-01-01",
        end_date="2023-12-31",
        initial_balance=10000,
        final_balance=12000,
        trades=[],
        equity_history=[],
        config=BacktestConfig()
    )
    
    analyzer = PerformanceAnalyzer(results)
    returns = analyzer.calculate_returns()
    
    assert returns['total_return'] == 20.0
    # More assertions...

def test_trade_execution():
    """Test trade execution with slippage and commission."""
    pass

def test_data_caching():
    """Test historical data caching."""
    pass
```

### Integration Tests

```python
def test_full_backtest():
    """Test complete backtest workflow."""
    pass

def test_walk_forward_analysis():
    """Test walk-forward analysis."""
    pass

def test_strategy_comparison():
    """Test comparing multiple strategies."""
    pass
```

## Implementation Phases

### Phase 1: Core Infrastructure
1. Implement HistoricalDataManager
2. Implement SimulatedAccount
3. Implement TradeExecutor
4. Create basic BacktestEngine

### Phase 2: Performance Analysis
1. Implement PerformanceAnalyzer
2. Add all performance metrics
3. Create VisualizationGenerator
4. Add report generation

### Phase 3: Advanced Features
1. Implement walk-forward analysis
2. Add strategy comparison
3. Implement accuracy tracking
4. Add progress tracking

### Phase 4: Integration
1. Integrate with TradingAgentsGraph
2. Add configuration management
3. Create example scripts
4. Add comprehensive testing

## Configuration Example

```python
# Example backtest configuration
config = {
    "backtest": {
        "initial_balance": 10000.0,
        "commission_rate": 0.001,
        "slippage": 0.001,
        "start_date": "2023-01-01",
        "end_date": "2023-12-31",
    },
    "strategy": {
        "selected_analysts": ["market", "fundamentals", "news"],
        "enable_coaches": False,
        "risk_management": {
            "risk_per_trade_pct": 1.0,
            "position_sizing_method": "fixed_percentage"
        }
    }
}
```

## Performance Considerations

1. **Data Caching**: Cache all historical data to minimize API calls
2. **Parallel Execution**: Run multiple strategy comparisons in parallel
3. **Memory Management**: Stream large datasets instead of loading all at once
4. **Progress Tracking**: Provide real-time progress updates for long backtests

## Future Enhancements

1. **Monte Carlo Simulation**: Test strategy robustness with randomized scenarios
2. **Parameter Optimization**: Automated parameter tuning
3. **Multi-Asset Backtesting**: Test portfolios with multiple assets
4. **Real-time Backtesting**: Stream historical data to simulate live trading
5. **Machine Learning Integration**: Use ML to optimize strategy parameters
