# Design Document: Risk Management Enhancements

## Overview

This design document outlines the implementation of enhanced risk management capabilities for the TradingAgents system. The enhancements include three core modules: Position Sizing, Stop-Loss Strategy, and Portfolio Risk Assessment. These modules will integrate with the existing Risk Management team (Risky, Neutral, Safe analysts and Risk Manager) to provide quantitative risk metrics that complement the qualitative risk debate process.

The risk management enhancements will be implemented as a separate module that calculates risk metrics before the Risk Analyst debate, making these metrics available to all risk agents for informed decision-making.

## Architecture

### System Integration

The risk management enhancements will integrate into the existing workflow between the Trader and Risk Management team:

```
Trader Proposal
      ↓
[NEW] Risk Calculator Module
      ↓ (calculates metrics)
Risk Analyst Debate (Risky, Neutral, Safe)
      ↓ (considers metrics + qualitative factors)
Risk Manager Decision
      ↓
Final Trade Decision
```

### File Structure

```
tradingagents/
├── risk/
│   ├── __init__.py
│   ├── position_sizing.py          ← NEW
│   ├── stop_loss.py                ← NEW
│   ├── portfolio_risk.py           ← NEW
│   ├── risk_calculator.py          ← NEW (orchestrator)
│   └── risk_config.py              ← NEW
├── agents/
│   └── utils/
│       └── agent_states.py         ← UPDATE (add risk metrics)
├── graph/
│   ├── trading_graph.py            ← UPDATE (add risk calculator)
│   └── setup.py                    ← UPDATE (wire risk calculator)
└── tests/
    ├── test_position_sizing.py     ← NEW
    ├── test_stop_loss.py           ← NEW
    ├── test_portfolio_risk.py      ← NEW
    └── test_risk_integration.py    ← NEW
```

## Components and Interfaces

### 1. Position Sizing Module

**Purpose**: Calculate appropriate position sizes based on account risk parameters and trade setup.

**Key Classes**:

```python
class PositionSizingCalculator:
    """
    Calculates position sizes using multiple methods.
    """
    
    def __init__(self, config: RiskConfig):
        self.config = config
    
    def calculate_fixed_percentage(
        self, 
        account_balance: float,
        risk_per_trade: float,
        entry_price: float,
        stop_loss_price: float
    ) -> PositionSize:
        """
        Calculate position size using fixed percentage risk method.
        
        Formula: Position Size = (Account Balance * Risk %) / (Entry - Stop Loss)
        """
        pass
    
    def calculate_kelly_criterion(
        self,
        account_balance: float,
        win_rate: float,
        avg_win: float,
        avg_loss: float
    ) -> PositionSize:
        """
        Calculate position size using Kelly Criterion.
        
        Formula: Kelly % = W - [(1 - W) / R]
        Where W = win rate, R = avg_win / avg_loss
        """
        pass
    
    def calculate_volatility_based(
        self,
        account_balance: float,
        risk_per_trade: float,
        atr: float,
        atr_multiplier: float = 2.0
    ) -> PositionSize:
        """
        Calculate position size based on ATR volatility.
        """
        pass
```


**Data Models**:

```python
@dataclass
class PositionSize:
    """Result of position sizing calculation."""
    shares: int
    dollar_amount: float
    risk_amount: float
    method: str
    confidence: float
    warnings: List[str]
```

### 2. Stop-Loss Strategy Module

**Purpose**: Calculate optimal stop-loss levels using multiple methodologies.

**Key Classes**:

```python
class StopLossCalculator:
    """
    Calculates stop-loss levels using multiple methods.
    """
    
    def __init__(self, config: RiskConfig):
        self.config = config
    
    def calculate_percentage_based(
        self,
        entry_price: float,
        stop_loss_percentage: float,
        direction: str  # "long" or "short"
    ) -> StopLoss:
        """
        Calculate stop-loss as percentage from entry.
        """
        pass
    
    def calculate_atr_based(
        self,
        entry_price: float,
        atr: float,
        atr_multiplier: float = 2.0,
        direction: str = "long"
    ) -> StopLoss:
        """
        Calculate stop-loss based on ATR volatility.
        
        For long: Stop = Entry - (ATR * Multiplier)
        For short: Stop = Entry + (ATR * Multiplier)
        """
        pass
    
    def calculate_support_resistance(
        self,
        entry_price: float,
        support_level: float,
        resistance_level: float,
        direction: str = "long"
    ) -> StopLoss:
        """
        Calculate stop-loss based on support/resistance levels.
        """
        pass
    
    def calculate_risk_reward_ratio(
        self,
        entry_price: float,
        stop_loss_price: float,
        target_price: float
    ) -> float:
        """
        Calculate risk-reward ratio for the trade.
        
        Formula: (Target - Entry) / (Entry - Stop Loss)
        """
        pass
```

**Data Models**:

```python
@dataclass
class StopLoss:
    """Result of stop-loss calculation."""
    price: float
    distance_percent: float
    distance_dollars: float
    method: str
    risk_reward_ratio: float
    is_favorable: bool
    warnings: List[str]
```

### 3. Portfolio Risk Assessment Module

**Purpose**: Assess overall portfolio risk including exposure, concentration, and correlation.

**Key Classes**:

```python
class PortfolioRiskAssessor:
    """
    Assesses portfolio-level risk metrics.
    """
    
    def __init__(self, config: RiskConfig):
        self.config = config
        self.positions: List[Position] = []
    
    def add_position(self, position: Position):
        """Add a position to the portfolio."""
        pass
    
    def calculate_total_exposure(self) -> float:
        """Calculate total portfolio exposure as % of account."""
        pass
    
    def calculate_sector_concentration(self) -> Dict[str, float]:
        """Calculate exposure by sector."""
        pass
    
    def calculate_correlation_risk(
        self,
        new_ticker: str,
        historical_data: pd.DataFrame
    ) -> CorrelationAnalysis:
        """
        Calculate correlation between new position and existing positions.
        """
        pass
    
    def calculate_portfolio_var(
        self,
        confidence_level: float = 0.95,
        time_horizon_days: int = 1
    ) -> float:
        """
        Calculate Value at Risk for the portfolio.
        """
        pass
    
    def assess_new_trade_impact(
        self,
        new_position: Position
    ) -> PortfolioImpact:
        """
        Assess how adding a new position would affect portfolio risk.
        """
        pass
```

**Data Models**:

```python
@dataclass
class Position:
    """Represents a portfolio position."""
    ticker: str
    shares: int
    entry_price: float
    current_price: float
    stop_loss: float
    sector: str
    risk_amount: float

@dataclass
class PortfolioImpact:
    """Impact of adding a new position."""
    new_total_exposure: float
    new_sector_concentration: Dict[str, float]
    correlation_with_existing: float
    diversification_benefit: float
    recommendation: str  # "approve", "reduce_size", "reject"
    warnings: List[str]

@dataclass
class CorrelationAnalysis:
    """Correlation analysis results."""
    avg_correlation: float
    max_correlation: float
    correlated_tickers: List[Tuple[str, float]]
    diversification_score: float
```

### 4. Risk Calculator Orchestrator

**Purpose**: Coordinate all risk calculations and provide unified interface.

**Key Classes**:

```python
class RiskCalculator:
    """
    Main orchestrator for risk calculations.
    """
    
    def __init__(self, config: RiskConfig):
        self.config = config
        self.position_sizer = PositionSizingCalculator(config)
        self.stop_loss_calc = StopLossCalculator(config)
        self.portfolio_assessor = PortfolioRiskAssessor(config)
    
    def calculate_trade_risk(
        self,
        ticker: str,
        entry_price: float,
        target_price: float,
        account_balance: float,
        market_data: Dict[str, Any],
        existing_positions: List[Position] = None
    ) -> RiskMetrics:
        """
        Calculate comprehensive risk metrics for a trade.
        
        Returns all position sizing, stop-loss, and portfolio risk metrics.
        """
        # 1. Calculate stop-loss levels
        stop_loss = self._calculate_optimal_stop_loss(
            entry_price, market_data
        )
        
        # 2. Calculate position size
        position_size = self._calculate_optimal_position_size(
            account_balance, entry_price, stop_loss.price, market_data
        )
        
        # 3. Assess portfolio impact
        portfolio_impact = None
        if existing_positions:
            new_position = Position(
                ticker=ticker,
                shares=position_size.shares,
                entry_price=entry_price,
                current_price=entry_price,
                stop_loss=stop_loss.price,
                sector=market_data.get("sector", "Unknown"),
                risk_amount=position_size.risk_amount
            )
            portfolio_impact = self.portfolio_assessor.assess_new_trade_impact(
                new_position
            )
        
        return RiskMetrics(
            position_size=position_size,
            stop_loss=stop_loss,
            portfolio_impact=portfolio_impact,
            overall_recommendation=self._generate_recommendation(
                position_size, stop_loss, portfolio_impact
            )
        )
```

**Data Models**:

```python
@dataclass
class RiskMetrics:
    """Comprehensive risk metrics for a trade."""
    position_size: PositionSize
    stop_loss: StopLoss
    portfolio_impact: Optional[PortfolioImpact]
    overall_recommendation: str
    risk_score: float  # 0-100, higher = riskier
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for state storage."""
        pass
    
    def to_report(self) -> str:
        """Generate human-readable risk report."""
        pass
```

### 5. Risk Configuration

**Purpose**: Centralize all risk management configuration parameters.

```python
@dataclass
class RiskConfig:
    """Configuration for risk management."""
    
    # Position sizing
    risk_per_trade_pct: float = 1.0  # % of account per trade
    max_position_size_pct: float = 10.0  # Max % of account in one position
    position_sizing_method: str = "fixed_percentage"  # or "kelly", "volatility"
    
    # Stop-loss
    default_stop_loss_pct: float = 2.0  # Default stop-loss %
    atr_multiplier: float = 2.0  # ATR multiplier for volatility stops
    min_risk_reward_ratio: float = 2.0  # Minimum acceptable R:R
    stop_loss_method: str = "atr"  # or "percentage", "support_resistance"
    
    # Portfolio risk
    max_portfolio_risk_pct: float = 6.0  # Max total portfolio risk
    max_sector_concentration_pct: float = 30.0  # Max % in one sector
    max_correlation_threshold: float = 0.7  # Flag high correlation
    enable_portfolio_assessment: bool = True
    
    # Kelly Criterion (if used)
    kelly_fraction: float = 0.25  # Use 25% of Kelly recommendation
    
    # Validation
    min_account_balance: float = 1000.0
    min_position_value: float = 100.0
    
    @classmethod
    def from_dict(cls, config_dict: Dict[str, Any]) -> 'RiskConfig':
        """Create from configuration dictionary."""
        pass
    
    def validate(self) -> List[str]:
        """Validate configuration parameters."""
        pass
```

## Data Models

### AgentState Extensions

Add risk metrics to `AgentState` in `agent_states.py`:

```python
class AgentState(MessagesState):
    # ... existing fields ...
    
    # Risk management metrics
    risk_metrics: Annotated[Optional[Dict], "Calculated risk metrics for the trade"]
    account_balance: Annotated[float, "Current account balance"]
    existing_positions: Annotated[List[Dict], "List of existing portfolio positions"]
```

## Error Handling

### Graceful Degradation Strategy

1. **Missing Data Handling**:
```python
def handle_missing_data(data_type: str, default_value: Any) -> Any:
    """
    Provide conservative defaults when data is missing.
    """
    logger.warning(f"Missing {data_type}, using conservative default")
    return default_value
```

2. **Calculation Failures**:
```python
def safe_calculate(calculation_func, fallback_value, *args, **kwargs):
    """
    Safely execute calculation with fallback.
    """
    try:
        return calculation_func(*args, **kwargs)
    except Exception as e:
        logger.error(f"Calculation failed: {e}")
        return fallback_value
```

3. **Validation Errors**:
```python
def validate_inputs(
    entry_price: float,
    stop_loss: float,
    account_balance: float
) -> Tuple[bool, List[str]]:
    """
    Validate all inputs before calculations.
    """
    errors = []
    
    if entry_price <= 0:
        errors.append("Entry price must be positive")
    if stop_loss <= 0:
        errors.append("Stop loss must be positive")
    if account_balance <= 0:
        errors.append("Account balance must be positive")
    if entry_price == stop_loss:
        errors.append("Entry and stop loss cannot be equal")
    
    return len(errors) == 0, errors
```

## Testing Strategy

### Unit Tests

1. **Position Sizing Tests**:
```python
def test_fixed_percentage_sizing():
    """Test fixed percentage position sizing."""
    calc = PositionSizingCalculator(RiskConfig())
    result = calc.calculate_fixed_percentage(
        account_balance=10000,
        risk_per_trade=0.01,  # 1%
        entry_price=100,
        stop_loss_price=98
    )
    # Risk amount should be $100 (1% of $10,000)
    # Position size = $100 / $2 = 50 shares
    assert result.shares == 50
    assert result.risk_amount == 100

def test_kelly_criterion():
    """Test Kelly Criterion position sizing."""
    pass

def test_volatility_based_sizing():
    """Test ATR-based position sizing."""
    pass
```

2. **Stop-Loss Tests**:
```python
def test_percentage_stop_loss():
    """Test percentage-based stop-loss."""
    calc = StopLossCalculator(RiskConfig())
    result = calc.calculate_percentage_based(
        entry_price=100,
        stop_loss_percentage=2.0,
        direction="long"
    )
    assert result.price == 98.0
    assert result.distance_percent == 2.0

def test_atr_stop_loss():
    """Test ATR-based stop-loss."""
    pass

def test_risk_reward_calculation():
    """Test risk-reward ratio calculation."""
    calc = StopLossCalculator(RiskConfig())
    rr = calc.calculate_risk_reward_ratio(
        entry_price=100,
        stop_loss_price=98,
        target_price=106
    )
    # Risk = $2, Reward = $6, R:R = 3:1
    assert rr == 3.0
```

3. **Portfolio Risk Tests**:
```python
def test_total_exposure():
    """Test total portfolio exposure calculation."""
    pass

def test_sector_concentration():
    """Test sector concentration calculation."""
    pass

def test_correlation_analysis():
    """Test correlation between positions."""
    pass
```

### Integration Tests

```python
def test_risk_calculator_full_workflow():
    """Test complete risk calculation workflow."""
    config = RiskConfig()
    calculator = RiskCalculator(config)
    
    metrics = calculator.calculate_trade_risk(
        ticker="AAPL",
        entry_price=150,
        target_price=165,
        account_balance=10000,
        market_data={"atr": 3.5, "sector": "Technology"},
        existing_positions=[]
    )
    
    assert metrics.position_size is not None
    assert metrics.stop_loss is not None
    assert metrics.overall_recommendation in ["approve", "reduce_size", "reject"]

def test_risk_integration_with_agents():
    """Test risk calculator integration with Risk Analyst agents."""
    pass
```

## Implementation Phases

### Phase 1: Core Risk Modules
1. Implement `RiskConfig` class
2. Implement `PositionSizingCalculator` with fixed percentage method
3. Implement `StopLossCalculator` with percentage and ATR methods
4. Create unit tests for core calculations

### Phase 2: Portfolio Risk
1. Implement `PortfolioRiskAssessor` class
2. Add position tracking and exposure calculations
3. Implement correlation analysis
4. Create unit tests for portfolio metrics

### Phase 3: Risk Calculator Orchestrator
1. Implement `RiskCalculator` main class
2. Integrate position sizing, stop-loss, and portfolio modules
3. Add comprehensive error handling
4. Create integration tests

### Phase 4: Agent Integration
1. Update `AgentState` with risk metrics fields
2. Create risk calculator node for LangGraph
3. Wire risk calculator into workflow before Risk Analyst debate
4. Update Risk Analyst prompts to consider quantitative metrics

### Phase 5: Advanced Features
1. Add Kelly Criterion position sizing
2. Add support/resistance-based stop-loss
3. Implement Value at Risk (VaR) calculation
4. Add configuration validation and defaults

## Configuration

Add risk management configuration to system config:

```python
config = {
    # ... existing config ...
    
    "risk_management": {
        "enabled": True,
        "risk_per_trade_pct": 1.0,
        "max_portfolio_risk_pct": 6.0,
        "min_risk_reward_ratio": 2.0,
        "position_sizing_method": "fixed_percentage",
        "stop_loss_method": "atr",
        "atr_multiplier": 2.0,
    },
    
    "account": {
        "initial_balance": 10000.0,
        "current_balance": 10000.0,
    },
}
```

## Performance Considerations

1. **Caching**: Cache ATR and volatility calculations
2. **Lazy Loading**: Only calculate portfolio metrics when needed
3. **Parallel Calculations**: Calculate position size and stop-loss in parallel
4. **Data Efficiency**: Reuse market data across calculations

## Security Considerations

1. **Input Validation**: Validate all numerical inputs
2. **Bounds Checking**: Ensure calculations stay within reasonable bounds
3. **Logging**: Log all risk calculations for audit trail
4. **Configuration Protection**: Validate configuration parameters

## Future Enhancements

1. **Machine Learning**: ML-based position sizing based on historical performance
2. **Dynamic Risk Adjustment**: Adjust risk based on market volatility
3. **Multi-Asset Support**: Extend to options, futures, crypto
4. **Risk Alerts**: Real-time alerts when portfolio risk exceeds thresholds
5. **Backtesting**: Historical analysis of risk management effectiveness
