"""
TradingAgents Risk Management Module

Enhanced risk management capabilities including position sizing,
stop-loss strategies, and portfolio risk assessment.
"""

from tradingagents.risk.risk_config import RiskConfig
from tradingagents.risk.position_sizing import PositionSizingCalculator, PositionSize
from tradingagents.risk.stop_loss import StopLossCalculator, StopLoss
from tradingagents.risk.portfolio_risk import PortfolioRiskAssessor, PortfolioRisk, Position
from tradingagents.risk.risk_calculator import RiskCalculator, RiskMetrics, TradeRecommendation
from tradingagents.risk.risk_node import create_risk_calculator_node

__all__ = [
    'RiskConfig',
    'PositionSizingCalculator',
    'PositionSize',
    'StopLossCalculator',
    'StopLoss',
    'PortfolioRiskAssessor',
    'PortfolioRisk',
    'Position',
    'RiskCalculator',
    'RiskMetrics',
    'TradeRecommendation',
    'create_risk_calculator_node',
]

__version__ = '0.1.0'
