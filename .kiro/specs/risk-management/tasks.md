# Implementation Plan

- [x] 1. Set up risk management module structure



  - Create `tradingagents/risk/` directory
  - Create `__init__.py` to export risk classes
  - Create `risk_config.py` with `RiskConfig` dataclass
  - Implement configuration validation and default values




  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 2. Implement Position Sizing Calculator
  - [ ] 2.1 Create `position_sizing.py` with `PositionSizingCalculator` class
    - Implement `PositionSize` dataclass for results

    - Implement `calculate_fixed_percentage()` method for basic position sizing
    - Add input validation for account balance, prices, and risk parameters
    - _Requirements: 1.1, 1.5, 7.1, 7.4_
  
  - [x] 2.2 Add advanced position sizing methods

    - Implement `calculate_kelly_criterion()` for optimal sizing based on win rate
    - Implement `calculate_volatility_based()` using ATR for dynamic sizing
    - Add position size adjustment logic for maximum position limits
    - _Requirements: 1.2, 1.3_
  
  - [ ] 2.3 Add error handling and edge cases
    - Handle insufficient account balance scenarios
    - Implement conservative defaults for missing data
    - Add warnings for unusual position sizes
    - _Requirements: 1.4, 7.1, 7.2, 7.4_

  



  - [ ]* 2.4 Create unit tests for position sizing
    - Test fixed percentage sizing with known inputs
    - Test Kelly Criterion calculations

    - Test volatility-based sizing with ATR data
    - Test edge cases (zero balance, invalid prices, extreme risk)
    - _Requirements: 8.1_

- [x] 3. Implement Stop-Loss Calculator

  - [ ] 3.1 Create `stop_loss.py` with `StopLossCalculator` class
    - Implement `StopLoss` dataclass for results
    - Implement `calculate_percentage_based()` for simple percentage stops
    - Implement `calculate_atr_based()` for volatility-adjusted stops
    - _Requirements: 2.1, 2.2_
  
  - [ ] 3.2 Add risk-reward analysis
    - Implement `calculate_risk_reward_ratio()` method
    - Add logic to flag trades below minimum R:R threshold
    - Implement `calculate_support_resistance()` for technical stops
    - _Requirements: 2.3, 2.4_

  

  - [ ] 3.3 Add error handling and validation
    - Validate entry price and stop-loss relationship
    - Handle missing ATR data with fallback methods
    - Add warnings for unfavorable risk-reward ratios
    - _Requirements: 2.5, 7.2, 7.4_

  
  - [ ]* 3.4 Create unit tests for stop-loss
    - Test percentage-based stop-loss calculations
    - Test ATR-based stop-loss with various multipliers
    - Test risk-reward ratio calculations

    - Test edge cases (entry equals stop, negative prices)
    - _Requirements: 8.2_

- [ ] 4. Implement Portfolio Risk Assessor
  - [x] 4.1 Create `portfolio_risk.py` with `PortfolioRiskAssessor` class

    - Implement `Position`, `PortfolioImpact`, and `CorrelationAnalysis` dataclasses
    - Implement `add_position()` and position tracking
    - Implement `calculate_total_exposure()` for portfolio-wide risk
    - _Requirements: 3.1, 3.2_
  
  - [ ] 4.2 Add concentration and correlation analysis
    - Implement `calculate_sector_concentration()` for sector exposure
    - Implement `calculate_correlation_risk()` for position correlation
    - Add logic to flag excessive concentration
    - _Requirements: 3.2, 3.4_
  

  - [x] 4.3 Add portfolio impact assessment

    - Implement `assess_new_trade_impact()` to evaluate new positions
    - Add logic to recommend position size reduction or rejection
    - Calculate diversification benefits
    - _Requirements: 3.3, 3.5_
  

  - [ ] 4.4 Add error handling
    - Handle missing portfolio data gracefully
    - Implement fallback to single-trade assessment when portfolio unavailable

    - Add warnings for high correlation and concentration
    - _Requirements: 7.3, 7.4_

  
  - [ ]* 4.5 Create unit tests for portfolio risk
    - Test total exposure calculations
    - Test sector concentration analysis
    - Test correlation calculations between positions

    - Test portfolio impact assessment
    - _Requirements: 8.3_

- [x] 5. Implement Risk Calculator Orchestrator


  - [ ] 5.1 Create `risk_calculator.py` with `RiskCalculator` class
    - Implement `RiskMetrics` dataclass for comprehensive results
    - Initialize position sizing, stop-loss, and portfolio modules
    - Implement `calculate_trade_risk()` main orchestration method



    - _Requirements: 1.1, 2.1, 3.1_
  
  - [ ] 5.2 Add comprehensive risk assessment logic
    - Coordinate stop-loss calculation first
    - Use stop-loss in position sizing calculation
    - Assess portfolio impact if positions exist

    - Generate overall recommendation (approve/reduce/reject)
    - _Requirements: 1.4, 2.5, 3.5_
  
  - [ ] 5.3 Add reporting and formatting
    - Implement `RiskMetrics.to_dict()` for state storage

    - Implement `RiskMetrics.to_report()` for human-readable output
    - Calculate overall risk score (0-100)
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  
  - [ ] 5.4 Add comprehensive error handling
    - Wrap all calculations in try-catch blocks
    - Provide partial results when some calculations fail
    - Log all errors and warnings
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 6. Update agent state structure
  - Add `risk_metrics`, `account_balance`, and `existing_positions` fields to `AgentState`
  - Update type annotations with proper `Annotated` descriptors
  - Ensure backward compatibility with existing state fields
  - _Requirements: 5.4, 5.5_

- [ ] 7. Integrate risk calculator into trading graph
  - [ ] 7.1 Create risk calculator node for LangGraph
    - Create `create_risk_calculator_node()` function
    - Implement node that calls `RiskCalculator.calculate_trade_risk()`
    - Extract necessary data from state (ticker, prices, account balance)
    - Update state with calculated risk metrics
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [ ] 7.2 Wire risk calculator into workflow
    - Update `setup.py` to add risk calculator node
    - Position node between Trader and Risk Analyst debate
    - Ensure risk metrics flow to Risk Analyst agents
    - _Requirements: 5.1, 5.2, 5.4_
  
  - [ ] 7.3 Update Risk Analyst agent prompts
    - Modify Risky, Neutral, and Safe analyst prompts to consider risk metrics
    - Add risk metrics to Risk Manager prompt
    - Ensure agents balance quantitative metrics with qualitative analysis
    - _Requirements: 5.1, 5.2, 5.3_

- [ ] 8. Add configuration support
  - Update default configuration with risk management parameters


  - Add account balance configuration
  - Implement configuration loading in `TradingAgentsGraph.__init__()`

  - Add configuration validation on startup
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 9. Update logging and state persistence
  - Update `_log_state()` in `trading_graph.py` to include risk metrics
  - Add risk metrics to JSON log output
  - Ensure risk calculations are logged for audit trail
  - _Requirements: 6.4, 6.5_

- [ ] 10. Create integration tests
  - [ ] 10.1 Test risk calculator in full workflow
    - Create integration test with risk calculator enabled
    - Verify risk metrics are calculated correctly
    - Verify Risk Analyst agents receive metrics
    - Verify final decision includes risk analysis
    - _Requirements: 8.4_
  
  - [ ] 10.2 Test backward compatibility
    - Test workflow with risk management disabled
    - Verify system works without account balance data
    - Verify system works without portfolio positions
    - _Requirements: 5.5_
  
  - [ ]* 10.3 Test edge cases and error scenarios
    - Test with missing market data (no ATR)
    - Test with invalid account balance
    - Test with extreme risk parameters
    - Test with highly correlated portfolio
    - _Requirements: 7.5, 8.5_

- [ ] 11. Create example scripts and documentation
  - Create example script demonstrating position sizing
  - Create example script demonstrating stop-loss calculation
  - Create example script demonstrating portfolio risk assessment
  - Update system documentation with risk management features
  - _Requirements: 6.5_
