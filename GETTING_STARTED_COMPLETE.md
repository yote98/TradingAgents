# 🚀 Getting Started with TradingAgents - Complete System

## Welcome!

You now have a **professional-grade trading analysis system** with comprehensive risk management and specialized market analysts. This guide will help you get started.

## 🎯 What You Have

### 1. **Risk Management System** ✅
Calculate optimal position sizes, set intelligent stop-losses, and assess portfolio risk.

### 2. **Custom Analysts** ✅
Get specialized insights from Options, Crypto, and Macro analysts.

### 3. **Complete Trading System** ✅
Multi-agent workflow with comprehensive market analysis and risk assessment.

## ⚡ Quick Start (5 Minutes)

### Step 1: Set Up Environment
```bash
# Set your OpenAI API key
export OPENAI_API_KEY='your-key-here'

# Verify installation
python -c "import tradingagents; print('✅ TradingAgents ready!')"
```

### Step 2: Run the Ultimate Demo
```bash
python demo_ultimate_system.py
```

This showcases everything working together!

### Step 3: Try Individual Features

**Risk Management:**
```bash
python examples/risk_management_demo.py
```

**Custom Analysts:**
```bash
python examples/custom_analysts_demo.py
```

## 📚 Core Features

### Risk Management

```python
from tradingagents.risk import RiskConfig, RiskCalculator

# Create calculator
config = RiskConfig.moderate()  # or .conservative() or .aggressive()
calculator = RiskCalculator(config)

# Calculate risk for a trade
risk_metrics = calculator.calculate_trade_risk(
    ticker="AAPL",
    entry_price=150.00,
    account_value=100000.00
)

# Use the results
print(f"Buy {risk_metrics.position_size.shares} shares")
print(f"Stop-loss: ${risk_metrics.stop_loss.price:.2f}")
print(f"Risk score: {risk_metrics.risk_score}/100")
```

**Features:**
- Position sizing (3 methods: Fixed %, Kelly, Volatility)
- Stop-loss calculation (3 methods: Percentage, ATR, Support/Resistance)
- Portfolio risk assessment
- Risk scoring and recommendations

### Custom Analysts

```python
from tradingagents.agents import (
    create_options_analyst,
    create_crypto_analyst,
    create_macro_analyst
)
from langchain_openai import ChatOpenAI

# Create analysts
llm = ChatOpenAI(model="gpt-4o-mini")
options_analyst = create_options_analyst(llm)
crypto_analyst = create_crypto_analyst(llm)
macro_analyst = create_macro_analyst(llm)

# Use them
state = {"company_of_interest": "AAPL"}
options_report = options_analyst(state)["options_report"]
crypto_report = crypto_analyst(state)["crypto_report"]
macro_report = macro_analyst(state)["macro_report"]
```

**Features:**
- **Options Analyst**: Options strategies, Greeks, IV analysis
- **Crypto Analyst**: Crypto market context and sentiment
- **Macro Analyst**: Economic indicators and market regime

### Complete System

```python
from tradingagents.graph import TradingAgentsGraph
from tradingagents.risk import RiskConfig

# Use everything together
graph = TradingAgentsGraph(
    ticker="AAPL",
    selected_analysts=["market", "fundamentals", "options", "crypto", "macro"],
    risk_config=RiskConfig.moderate(),
    account_balance=100000.00
)

# Run complete analysis
result = graph.run()

# Access all reports
print(result["market_report"])
print(result["options_report"])
print(result["crypto_report"])
print(result["macro_report"])
print(result["risk_metrics"])
print(result["final_trade_decision"])
```

## 📖 Documentation

### Essential Guides
1. **Risk Management**: `docs/RISK_MANAGEMENT_GUIDE.md`
2. **Custom Analysts**: `docs/CUSTOM_ANALYSTS_GUIDE.md`
3. **Backtesting**: `docs/BACKTESTING_USER_GUIDE.md`
4. **System Architecture**: `docs/SYSTEM_ARCHITECTURE.md`

### Quick References
- **What's Ready**: `WHATS_READY_TO_USE.md`
- **Session Summary**: `FINAL_SESSION_SUMMARY.md`
- **Quick Reference**: `QUICK_REFERENCE.md`

## 🎯 Common Use Cases

### Use Case 1: Calculate Position Size
```python
from tradingagents.risk import RiskConfig, PositionSizingCalculator

config = RiskConfig.moderate()
calculator = PositionSizingCalculator(config)

position_size = calculator.calculate(
    account_balance=100000,
    entry_price=150.00,
    stop_loss_price=147.00
)

print(f"Buy {position_size.shares} shares")
```

### Use Case 2: Get Options Insights
```python
from tradingagents.agents import create_options_analyst
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4o-mini")
analyst = create_options_analyst(llm)

result = analyst({"company_of_interest": "AAPL"})
print(result["options_report"])
```

### Use Case 3: Assess Portfolio Risk
```python
from tradingagents.risk import PortfolioRiskAssessor, Position

assessor = PortfolioRiskAssessor(RiskConfig.moderate())

positions = [
    Position("AAPL", 100, 150.00, 15000, 14500, "Technology"),
    Position("GOOGL", 50, 120.00, 6000, 5800, "Technology"),
]

risk = assessor.assess_portfolio_risk(positions, 100000.00)
print(f"Portfolio risk: {risk.total_risk_pct:.2f}%")
print(f"Risk score: {risk.risk_score}/100")
```

### Use Case 4: Complete Analysis
```python
from tradingagents.graph import TradingAgentsGraph

graph = TradingAgentsGraph(
    ticker="NVDA",
    selected_analysts=["market", "fundamentals", "options", "crypto", "macro"]
)

result = graph.run()
# Get comprehensive analysis from all perspectives
```

## 🔧 Configuration

### Risk Profiles

**Conservative** (Low Risk):
```python
config = RiskConfig.conservative()
# Risk per trade: 1%
# Max position: 5%
# Stop-loss: 2%
```

**Moderate** (Balanced):
```python
config = RiskConfig.moderate()
# Risk per trade: 2%
# Max position: 10%
# Stop-loss: 3%
```

**Aggressive** (High Risk):
```python
config = RiskConfig.aggressive()
# Risk per trade: 5%
# Max position: 15%
# Stop-loss: 5%
```

### Custom Configuration
```python
config = RiskConfig(
    risk_profile="custom",
    risk_per_trade_pct=2.5,
    max_position_size_pct=12.0,
    stop_loss_percentage=4.0,
    position_sizing_method="kelly",  # or "fixed_percentage", "volatility"
    stop_loss_method="atr"  # or "percentage", "support_resistance"
)
```

### Analyst Selection
```python
# Use specific analysts
graph = TradingAgentsGraph(
    ticker="AAPL",
    selected_analysts=["market", "options", "macro"]
)

# Use all analysts
graph = TradingAgentsGraph(
    ticker="AAPL",
    selected_analysts=["market", "fundamentals", "news", "social", 
                      "options", "crypto", "macro"]
)
```

## 🎓 Learning Path

### Beginner (Day 1)
1. Run `demo_ultimate_system.py`
2. Read `WHATS_READY_TO_USE.md`
3. Try risk management examples
4. Experiment with different risk profiles

### Intermediate (Week 1)
1. Read `docs/RISK_MANAGEMENT_GUIDE.md`
2. Read `docs/CUSTOM_ANALYSTS_GUIDE.md`
3. Integrate risk management into your strategy
4. Use custom analysts for market context

### Advanced (Month 1)
1. Combine with backtesting framework
2. Create custom risk profiles
3. Build strategies using all analysts
4. Optimize based on backtest results

## 💡 Best Practices

### 1. Always Use Risk Management
```python
# Calculate risk before every trade
risk_metrics = calculator.calculate_trade_risk(...)

if risk_metrics.recommendation == TradeRecommendation.APPROVE:
    execute_trade(risk_metrics.position_size.shares)
```

### 2. Consider Multiple Perspectives
```python
# Get insights from multiple analysts
options_report = options_analyst(state)["options_report"]
crypto_report = crypto_analyst(state)["crypto_report"]
macro_report = macro_analyst(state)["macro_report"]

# Make informed decisions based on all perspectives
```

### 3. Monitor Portfolio Risk
```python
# Regularly assess portfolio risk
risk_assessment = assessor.assess_portfolio_risk(positions, account_value)

if risk_assessment.risk_score > 70:
    # Consider reducing positions or tightening stops
    pass
```

### 4. Use Appropriate Models
```python
# For production, use powerful models
llm = ChatOpenAI(model="gpt-4o")

# For testing, use cheaper models
llm = ChatOpenAI(model="gpt-4o-mini")
```

## 🐛 Troubleshooting

### Issue: Import errors
**Solution**: Ensure you're in the project root and packages are installed
```bash
pip install -r requirements.txt
```

### Issue: API key errors
**Solution**: Set your OpenAI API key
```bash
export OPENAI_API_KEY='your-key-here'
```

### Issue: No risk metrics
**Solution**: Ensure risk_config and account_balance are provided
```python
graph = TradingAgentsGraph(
    ticker="AAPL",
    risk_config=RiskConfig.moderate(),
    account_balance=100000.00  # Required for risk calculations
)
```

## 📞 Support

### Documentation
- Risk Management: `docs/RISK_MANAGEMENT_GUIDE.md`
- Custom Analysts: `docs/CUSTOM_ANALYSTS_GUIDE.md`
- Backtesting: `docs/BACKTESTING_USER_GUIDE.md`

### Examples
- Ultimate Demo: `demo_ultimate_system.py`
- Risk Management: `examples/risk_management_demo.py`
- Custom Analysts: `examples/custom_analysts_demo.py`

### Quick References
- What's Ready: `WHATS_READY_TO_USE.md`
- Session Summary: `FINAL_SESSION_SUMMARY.md`

## 🎉 You're Ready!

You now have everything you need to:
- ✅ Calculate optimal position sizes
- ✅ Set intelligent stop-losses
- ✅ Assess portfolio risk
- ✅ Get options trading insights
- ✅ Understand crypto market context
- ✅ Analyze macroeconomic environment
- ✅ Make informed trading decisions

**Start with the ultimate demo and explore from there!**

```bash
python demo_ultimate_system.py
```

Happy trading! 🚀📈
