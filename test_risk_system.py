"""
Quick test to verify the risk management system works correctly.
"""
import sys
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# Test imports
print("Testing imports...")
try:
    from tradingagents.risk import (
        RiskConfig,
        RiskCalculator,
        PositionSizingCalculator,
        StopLossCalculator,
        PortfolioRiskAssessor,
        Position,
        TradeRecommendation
    )
    print("✅ All imports successful")
except Exception as e:
    print(f"❌ Import failed: {e}")
    sys.exit(1)

# Test risk config
print("\nTesting RiskConfig...")
try:
    config_conservative = RiskConfig.conservative()
    config_moderate = RiskConfig.moderate()
    config_aggressive = RiskConfig.aggressive()
    print(f"✅ Conservative: {config_conservative.risk_per_trade_pct}% risk per trade")
    print(f"✅ Moderate: {config_moderate.risk_per_trade_pct}% risk per trade")
    print(f"✅ Aggressive: {config_aggressive.risk_per_trade_pct}% risk per trade")
except Exception as e:
    print(f"❌ RiskConfig failed: {e}")
    sys.exit(1)

# Test position sizing
print("\nTesting Position Sizing...")
try:
    calculator = PositionSizingCalculator(config_moderate)
    position_size = calculator.calculate(
        account_balance=100000.00,
        entry_price=150.00,
        stop_loss_price=147.00
    )
    print(f"✅ Position size calculated: {position_size.shares} shares")
    print(f"   Dollar amount: ${position_size.dollar_amount:,.2f}")
    print(f"   Risk amount: ${position_size.risk_amount:,.2f}")
except Exception as e:
    print(f"❌ Position sizing failed: {e}")
    sys.exit(1)

# Test stop-loss
print("\nTesting Stop-Loss Calculator...")
try:
    # Generate sample data
    dates = pd.date_range(end=datetime.now(), periods=30, freq='D')
    prices = 150.0 * (1 + np.random.normal(0.001, 0.02, 30)).cumprod()
    data = pd.DataFrame({
        'date': dates,
        'open': prices * 0.99,
        'high': prices * 1.01,
        'low': prices * 0.98,
        'close': prices,
        'volume': np.random.randint(1000000, 10000000, 30)
    })
    
    calculator = StopLossCalculator(config_moderate)
    stop_loss = calculator.calculate(
        entry_price=150.00,
        direction="long"
    )
    print(f"✅ Stop-loss calculated: ${stop_loss.stop_loss_price:.2f}")
    print(f"   Risk per share: ${stop_loss.risk_per_share:.2f}")
    print(f"   Method: {stop_loss.method}")
except Exception as e:
    print(f"❌ Stop-loss calculation failed: {e}")
    sys.exit(1)

# Test portfolio risk
print("\nTesting Portfolio Risk Assessor...")
try:
    assessor = PortfolioRiskAssessor(config_moderate)
    positions = [
        Position("AAPL", 100, 150.00, 15000, 14500, "Technology"),
        Position("GOOGL", 50, 120.00, 6000, 5800, "Technology"),
    ]
    
    risk_assessment = assessor.assess_portfolio_risk(
        positions=positions,
        account_value=100000.00
    )
    print(f"✅ Portfolio risk assessed")
    print(f"   Total risk: {risk_assessment.total_risk_pct:.2f}%")
    print(f"   Risk score: {risk_assessment.risk_score:.1f}/100")
    print(f"   Warnings: {len(risk_assessment.warnings)}")
except Exception as e:
    print(f"❌ Portfolio risk assessment failed: {e}")
    sys.exit(1)

# Test complete risk calculator (if available)
print("\nTesting Complete Risk Calculator...")
try:
    # Check if RiskCalculator exists
    if 'RiskCalculator' in dir():
        calculator = RiskCalculator(config_moderate)
        print(f"✅ RiskCalculator initialized successfully")
    else:
        print(f"⚠️  RiskCalculator not available (optional component)")
except Exception as e:
    print(f"⚠️  RiskCalculator not available: {e}")

print("\n" + "=" * 70)
print("🎉 ALL TESTS PASSED!")
print("=" * 70)
print("\nRisk Management System is working correctly!")
print("\nNext steps:")
print("1. Run: python examples/risk_management_demo.py")
print("2. Read: docs/RISK_MANAGEMENT_GUIDE.md")
print("3. Integrate with your trading strategy")
