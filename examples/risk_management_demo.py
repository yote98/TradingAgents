"""
Risk Management System Demo

Demonstrates the comprehensive risk management capabilities including:
- Position sizing with multiple methods
- Stop-loss calculation
- Portfolio risk assessment
- Complete risk analysis
"""
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

from tradingagents.risk import (
    RiskConfig,
    RiskCalculator,
    PositionSizingCalculator,
    StopLossCalculator,
    PortfolioRiskAssessor,
    Position
)


def generate_sample_data(ticker: str, days: int = 60) -> pd.DataFrame:
    """Generate sample historical price data for demonstration."""
    dates = pd.date_range(end=datetime.now(), periods=days, freq='D')
    
    # Generate realistic price data
    base_price = 150.0
    returns = np.random.normal(0.001, 0.02, days)
    prices = base_price * (1 + returns).cumprod()
    
    # Generate OHLC data
    data = pd.DataFrame({
        'date': dates,
        'open': prices * (1 + np.random.uniform(-0.01, 0.01, days)),
        'high': prices * (1 + np.random.uniform(0, 0.02, days)),
        'low': prices * (1 + np.random.uniform(-0.02, 0, days)),
        'close': prices,
        'volume': np.random.randint(1000000, 10000000, days)
    })
    
    return data


def demo_position_sizing():
    """Demonstrate position sizing calculations."""
    print("=" * 70)
    print("POSITION SIZING DEMO")
    print("=" * 70)
    
    # Create calculator with moderate risk profile
    config = RiskConfig.moderate()
    calculator = PositionSizingCalculator(config)
    
    # Example trade parameters
    ticker = "AAPL"
    current_price = 150.00
    account_value = 100000.00
    stop_loss_price = 147.00
    
    print(f"\nTrade Parameters:")
    print(f"  Ticker: {ticker}")
    print(f"  Current Price: ${current_price:.2f}")
    print(f"  Account Value: ${account_value:,.2f}")
    print(f"  Stop-Loss: ${stop_loss_price:.2f}")
    print(f"  Risk per Trade: {config.risk_per_trade_pct}%")
    
    # Calculate position size
    position_size = calculator.calculate_position_size(
        ticker=ticker,
        current_price=current_price,
        account_value=account_value,
        stop_loss_price=stop_loss_price
    )
    
    print(f"\nPosition Sizing Results ({position_size.method}):")
    print(f"  Recommended Shares: {position_size.shares}")
    print(f"  Dollar Amount: ${position_size.dollar_amount:,.2f}")
    print(f"  Position Size: {position_size.position_pct:.2f}% of account")
    print(f"  Total Risk: ${position_size.risk_amount:,.2f}")
    print(f"  Confidence: {position_size.confidence:.2f}")
    
    # Compare all methods
    print(f"\nComparing All Methods:")
    all_methods = calculator.compare_methods(
        ticker=ticker,
        current_price=current_price,
        account_value=account_value,
        stop_loss_price=stop_loss_price
    )
    
    for method, result in all_methods.items():
        if result:
            print(f"  {method:20s}: {result.shares:4d} shares (${result.dollar_amount:,.2f})")


def demo_stop_loss():
    """Demonstrate stop-loss calculations."""
    print("\n" + "=" * 70)
    print("STOP-LOSS CALCULATION DEMO")
    print("=" * 70)
    
    # Create calculator
    config = RiskConfig.moderate()
    calculator = StopLossCalculator(config)
    
    # Example parameters
    ticker = "AAPL"
    entry_price = 150.00
    
    # Generate sample historical data
    historical_data = generate_sample_data(ticker)
    
    print(f"\nTrade Parameters:")
    print(f"  Ticker: {ticker}")
    print(f"  Entry Price: ${entry_price:.2f}")
    print(f"  Direction: Long")
    
    # Calculate stop-loss
    stop_loss = calculator.calculate_stop_loss(
        ticker=ticker,
        entry_price=entry_price,
        direction="long",
        historical_data=historical_data
    )
    
    print(f"\nStop-Loss Results ({stop_loss.method}):")
    print(f"  Stop Price: ${stop_loss.price:.2f}")
    print(f"  Percentage: {stop_loss.percentage:.2f}%")
    print(f"  Risk per Share: ${stop_loss.risk_amount:.2f}")
    print(f"  Confidence: {stop_loss.confidence:.2f}")
    
    # Validate stop-loss
    is_valid, reason = calculator.validate_stop_loss(stop_loss, entry_price, "long")
    print(f"  Valid: {is_valid} - {reason}")
    
    # Compare all methods
    print(f"\nComparing All Methods:")
    all_methods = calculator.compare_methods(
        ticker=ticker,
        entry_price=entry_price,
        direction="long",
        historical_data=historical_data
    )
    
    for method, result in all_methods.items():
        if result:
            print(f"  {method:20s}: ${result.price:.2f} ({result.percentage:.2f}%)")


def demo_portfolio_risk():
    """Demonstrate portfolio risk assessment."""
    print("\n" + "=" * 70)
    print("PORTFOLIO RISK ASSESSMENT DEMO")
    print("=" * 70)
    
    # Create assessor
    config = RiskConfig.moderate()
    assessor = PortfolioRiskAssessor(config)
    
    # Create sample portfolio
    account_value = 100000.00
    positions = [
        Position("AAPL", 100, 150.00, 15000, 14500, "Technology"),
        Position("GOOGL", 50, 120.00, 6000, 5800, "Technology"),
        Position("JPM", 80, 140.00, 11200, 11000, "Financial"),
        Position("XOM", 150, 100.00, 15000, 14800, "Energy"),
    ]
    
    print(f"\nPortfolio:")
    print(f"  Account Value: ${account_value:,.2f}")
    print(f"  Positions:")
    for pos in positions:
        pnl_pct = pos.unrealized_pnl_pct
        print(f"    {pos.ticker:6s}: {pos.shares:3d} shares @ ${pos.current_price:.2f} "
              f"= ${pos.market_value:,.2f} ({pnl_pct:+.2f}%)")
    
    # Assess portfolio risk
    risk_assessment = assessor.assess_portfolio_risk(
        positions=positions,
        account_value=account_value
    )
    
    print(f"\nRisk Assessment:")
    print(f"  Total Risk: {risk_assessment.total_risk_pct:.2f}%")
    print(f"  Concentration Risk: {risk_assessment.concentration_risk:.2f}%")
    print(f"  Correlation Risk: {risk_assessment.correlation_risk:.2f}%")
    print(f"  Risk Score: {risk_assessment.risk_score:.1f}/100")
    
    print(f"\nSector Exposure:")
    for sector, exposure in risk_assessment.sector_exposure.items():
        print(f"  {sector:15s}: {exposure:.2f}%")
    
    if risk_assessment.warnings:
        print(f"\nWarnings:")
        for warning in risk_assessment.warnings:
            print(f"  ⚠️  {warning}")
    
    if risk_assessment.recommendations:
        print(f"\nRecommendations:")
        for rec in risk_assessment.recommendations:
            print(f"  💡 {rec}")


def demo_complete_risk_analysis():
    """Demonstrate complete risk analysis."""
    print("\n" + "=" * 70)
    print("COMPLETE RISK ANALYSIS DEMO")
    print("=" * 70)
    
    # Create risk calculator
    config = RiskConfig.moderate()
    calculator = RiskCalculator(config)
    
    # Trade parameters
    ticker = "TSLA"
    entry_price = 250.00
    account_value = 100000.00
    
    # Existing portfolio
    existing_positions = [
        Position("AAPL", 100, 150.00, 15000, 14500, "Technology"),
        Position("NVDA", 50, 400.00, 20000, 19000, "Technology"),
    ]
    
    # Generate historical data
    historical_data = generate_sample_data(ticker)
    
    print(f"\nAnalyzing Trade:")
    print(f"  Ticker: {ticker}")
    print(f"  Entry Price: ${entry_price:.2f}")
    print(f"  Account Value: ${account_value:,.2f}")
    print(f"  Existing Positions: {len(existing_positions)}")
    
    # Calculate comprehensive risk
    risk_metrics = calculator.calculate_trade_risk(
        ticker=ticker,
        entry_price=entry_price,
        account_value=account_value,
        direction="long",
        historical_data=historical_data,
        existing_positions=existing_positions,
        sector="Technology"
    )
    
    # Print report
    print("\n" + risk_metrics.to_report())


def main():
    """Run all demos."""
    print("\n" + "=" * 70)
    print("TRADINGAGENTS RISK MANAGEMENT SYSTEM DEMO")
    print("=" * 70)
    
    # Run demos
    demo_position_sizing()
    demo_stop_loss()
    demo_portfolio_risk()
    demo_complete_risk_analysis()
    
    print("\n" + "=" * 70)
    print("DEMO COMPLETE")
    print("=" * 70)


if __name__ == "__main__":
    main()
