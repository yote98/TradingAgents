"""
Risk Calculator Orchestrator
Main interface for comprehensive risk assessment that coordinates
position sizing, stop-loss calculation, and portfolio risk analysis.
"""
import logging
from dataclasses import dataclass, field
from typing import Optional, Dict, Any, List
from enum import Enum
import pandas as pd

from tradingagents.risk.risk_config import RiskConfig
from tradingagents.risk.position_sizing import PositionSizingCalculator, PositionSize
from tradingagents.risk.stop_loss import StopLossCalculator, StopLoss
from tradingagents.risk.portfolio_risk import PortfolioRiskAssessor, PortfolioRisk, Position

logger = logging.getLogger(__name__)


class TradeRecommendation(Enum):
    """Trade recommendation based on risk assessment."""
    APPROVE = "approve"
    REDUCE = "reduce"
    REJECT = "reject"


@dataclass
class RiskMetrics:
    """
    Comprehensive risk assessment results.
    
    Attributes:
        ticker: Stock symbol
        entry_price: Proposed entry price
        stop_loss: Stop-loss calculation results
        position_size: Position sizing calculation results
        portfolio_risk: Portfolio risk assessment (if applicable)
        recommendation: Overall trade recommendation
        risk_score: Overall risk score (0-100, higher = riskier)
        warnings: List of risk warnings
        recommendations: List of risk management recommendations
        metadata: Additional calculation details
    """
    ticker: str
    entry_price: float
    stop_loss: Optional[StopLoss] = None
    position_size: Optional[PositionSize] = None
    portfolio_risk: Optional[PortfolioRisk] = None
    recommendation: TradeRecommendation = TradeRecommendation.APPROVE
    risk_score: float = 0.0
    warnings: List[str] = field(default_factory=list)
    recommendations: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for state storage."""
        return {
            "ticker": self.ticker,
            "entry_price": self.entry_price,
            "stop_loss": {
                "price": self.stop_loss.price,
                "percentage": self.stop_loss.percentage,
                "method": self.stop_loss.method,
                "confidence": self.stop_loss.confidence
            } if self.stop_loss else None,
            "position_size": {
                "shares": self.position_size.shares,
                "dollar_amount": self.position_size.dollar_amount,
                "position_pct": self.position_size.position_pct,
                "risk_amount": self.position_size.risk_amount,
                "method": self.position_size.method,
                "confidence": self.position_size.confidence
            } if self.position_size else None,
            "portfolio_risk": {
                "total_risk_pct": self.portfolio_risk.total_risk_pct,
                "concentration_risk": self.portfolio_risk.concentration_risk,
                "correlation_risk": self.portfolio_risk.correlation_risk,
                "risk_score": self.portfolio_risk.risk_score,
                "sector_exposure": self.portfolio_risk.sector_exposure
            } if self.portfolio_risk else None,
            "recommendation": self.recommendation.value,
            "risk_score": self.risk_score,
            "warnings": self.warnings,
            "recommendations": self.recommendations,
            "metadata": self.metadata
        }
    
    def to_report(self) -> str:
        """Generate human-readable risk report."""
        lines = []
        lines.append(f"=== Risk Assessment for {self.ticker} ===")
        lines.append(f"Entry Price: ${self.entry_price:.2f}")
        lines.append(f"Overall Risk Score: {self.risk_score:.1f}/100")
        lines.append(f"Recommendation: {self.recommendation.value.upper()}")
        lines.append("")
        
        # Stop-loss section
        if self.stop_loss:
            lines.append("--- Stop-Loss ---")
            lines.append(f"Price: ${self.stop_loss.price:.2f}")
            lines.append(f"Percentage: {self.stop_loss.percentage:.2f}%")
            lines.append(f"Method: {self.stop_loss.method}")
            lines.append(f"Risk per share: ${self.stop_loss.risk_amount:.2f}")
            lines.append("")
        
        # Position sizing section
        if self.position_size:
            lines.append("--- Position Sizing ---")
            lines.append(f"Recommended Shares: {self.position_size.shares}")
            lines.append(f"Dollar Amount: ${self.position_size.dollar_amount:,.2f}")
            lines.append(f"Position Size: {self.position_size.position_pct:.2f}% of account")
            lines.append(f"Total Risk: ${self.position_size.risk_amount:,.2f}")
            lines.append(f"Method: {self.position_size.method}")
            lines.append("")
        
        # Portfolio risk section
        if self.portfolio_risk:
            lines.append("--- Portfolio Risk ---")
            lines.append(f"Total Portfolio Risk: {self.portfolio_risk.total_risk_pct:.2f}%")
            lines.append(f"Concentration Risk: {self.portfolio_risk.concentration_risk:.2f}%")
            lines.append(f"Correlation Risk: {self.portfolio_risk.correlation_risk:.2f}%")
            lines.append(f"Portfolio Risk Score: {self.portfolio_risk.risk_score:.1f}/100")
            if self.portfolio_risk.sector_exposure:
                lines.append("Sector Exposure:")
                for sector, exposure in self.portfolio_risk.sector_exposure.items():
                    lines.append(f"  - {sector}: {exposure:.2f}%")
            lines.append("")
        
        # Warnings
        if self.warnings:
            lines.append("--- Warnings ---")
            for warning in self.warnings:
                lines.append(f"⚠️  {warning}")
            lines.append("")
        
        # Recommendations
        if self.recommendations:
            lines.append("--- Recommendations ---")
            for rec in self.recommendations:
                lines.append(f"💡 {rec}")
            lines.append("")
        
        return "\n".join(lines)


class RiskCalculator:
    """
    Main risk calculator that orchestrates all risk assessments.
    
    Coordinates:
    - Stop-loss calculation
    - Position sizing
    - Portfolio risk assessment
    - Overall risk scoring and recommendations
    """
    
    def __init__(self, config: Optional[RiskConfig] = None):
        """
        Initialize risk calculator.
        
        Args:
            config: Risk configuration (uses moderate defaults if not provided)
        """
        self.config = config or RiskConfig.moderate()
        
        # Initialize sub-calculators
        self.position_calculator = PositionSizingCalculator(self.config)
        self.stop_loss_calculator = StopLossCalculator(self.config)
        self.portfolio_assessor = PortfolioRiskAssessor(self.config)
        
        logger.info(f"RiskCalculator initialized with {self.config.position_sizing_method} method")
    
    def calculate_trade_risk(
        self,
        ticker: str,
        entry_price: float,
        account_value: float,
        direction: str = "long",
        historical_data: Optional[pd.DataFrame] = None,
        existing_positions: Optional[List[Position]] = None,
        support_resistance_levels: Optional[List[float]] = None,
        sector: Optional[str] = None,
        win_rate: Optional[float] = None,
        avg_win: Optional[float] = None,
        avg_loss: Optional[float] = None
    ) -> RiskMetrics:
        """
        Calculate comprehensive risk assessment for a trade.
        
        Args:
            ticker: Stock symbol
            entry_price: Proposed entry price
            account_value: Total account value
            direction: Position direction ("long" or "short")
            historical_data: Historical price data for calculations
            existing_positions: List of existing portfolio positions
            support_resistance_levels: Technical support/resistance levels
            sector: Stock sector for concentration analysis
            win_rate: Historical win rate for Kelly Criterion
            avg_win: Average winning trade percentage
            avg_loss: Average losing trade percentage
        
        Returns:
            RiskMetrics with comprehensive assessment
        """
        warnings = []
        recommendations = []
        metadata = {}
        
        try:
            # Step 1: Calculate stop-loss
            stop_loss = self._calculate_stop_loss_safe(
                ticker, entry_price, direction, historical_data, 
                support_resistance_levels, warnings
            )
            
            # Step 2: Calculate position size (using stop-loss if available)
            position_size = self._calculate_position_size_safe(
                ticker, entry_price, account_value, stop_loss, 
                historical_data, win_rate, avg_win, avg_loss, warnings
            )
            
            # Step 3: Assess portfolio risk (if positions exist)
            portfolio_risk = self._assess_portfolio_risk_safe(
                ticker, entry_price, account_value, position_size,
                existing_positions, historical_data, sector, warnings
            )
            
            # Step 4: Calculate overall risk score
            risk_score = self._calculate_overall_risk_score(
                stop_loss, position_size, portfolio_risk
            )
            
            # Step 5: Generate recommendation
            recommendation = self._generate_recommendation(
                risk_score, position_size, portfolio_risk, warnings, recommendations
            )
            
            # Compile metadata
            metadata.update({
                "account_value": account_value,
                "direction": direction,
                "sector": sector,
                "has_historical_data": historical_data is not None,
                "num_existing_positions": len(existing_positions) if existing_positions else 0
            })
            
            return RiskMetrics(
                ticker=ticker,
                entry_price=entry_price,
                stop_loss=stop_loss,
                position_size=position_size,
                portfolio_risk=portfolio_risk,
                recommendation=recommendation,
                risk_score=risk_score,
                warnings=warnings,
                recommendations=recommendations,
                metadata=metadata
            )
            
        except Exception as e:
            logger.error(f"Error calculating trade risk for {ticker}: {e}", exc_info=True)
            warnings.append(f"Risk calculation error: {str(e)}")
            
            # Return minimal risk metrics with error
            return RiskMetrics(
                ticker=ticker,
                entry_price=entry_price,
                recommendation=TradeRecommendation.REJECT,
                risk_score=100.0,
                warnings=warnings,
                recommendations=["Unable to calculate risk - recommend manual review"],
                metadata={"error": str(e)}
            )
    
    def _calculate_stop_loss_safe(
        self,
        ticker: str,
        entry_price: float,
        direction: str,
        historical_data: Optional[pd.DataFrame],
        support_resistance_levels: Optional[List[float]],
        warnings: List[str]
    ) -> Optional[StopLoss]:
        """Calculate stop-loss with error handling."""
        try:
            stop_loss = self.stop_loss_calculator.calculate_stop_loss(
                ticker=ticker,
                entry_price=entry_price,
                direction=direction,
                historical_data=historical_data,
                support_resistance_levels=support_resistance_levels
            )
            
            # Validate stop-loss
            is_valid, reason = self.stop_loss_calculator.validate_stop_loss(
                stop_loss, entry_price, direction
            )
            if not is_valid:
                warnings.append(f"Stop-loss validation: {reason}")
            
            return stop_loss
            
        except Exception as e:
            logger.warning(f"Error calculating stop-loss: {e}")
            warnings.append(f"Stop-loss calculation failed: {str(e)}")
            return None
    
    def _calculate_position_size_safe(
        self,
        ticker: str,
        entry_price: float,
        account_value: float,
        stop_loss: Optional[StopLoss],
        historical_data: Optional[pd.DataFrame],
        win_rate: Optional[float],
        avg_win: Optional[float],
        avg_loss: Optional[float],
        warnings: List[str]
    ) -> Optional[PositionSize]:
        """Calculate position size with error handling."""
        try:
            stop_loss_price = stop_loss.price if stop_loss else None
            
            position_size = self.position_calculator.calculate_position_size(
                ticker=ticker,
                current_price=entry_price,
                account_value=account_value,
                stop_loss_price=stop_loss_price,
                historical_data=historical_data,
                win_rate=win_rate,
                avg_win=avg_win,
                avg_loss=avg_loss
            )
            
            # Check if position size is reasonable
            if position_size.shares == 0:
                warnings.append("Calculated position size is zero - insufficient capital or excessive risk")
            elif position_size.position_pct > self.config.max_position_size_pct:
                warnings.append(f"Position size ({position_size.position_pct:.2f}%) exceeds maximum ({self.config.max_position_size_pct}%)")
            
            return position_size
            
        except Exception as e:
            logger.warning(f"Error calculating position size: {e}")
            warnings.append(f"Position sizing failed: {str(e)}")
            return None
    
    def _assess_portfolio_risk_safe(
        self,
        ticker: str,
        entry_price: float,
        account_value: float,
        position_size: Optional[PositionSize],
        existing_positions: Optional[List[Position]],
        historical_data: Optional[pd.DataFrame],
        sector: Optional[str],
        warnings: List[str]
    ) -> Optional[PortfolioRisk]:
        """Assess portfolio risk with error handling."""
        if not existing_positions:
            return None
        
        try:
            # Create simulated position for the new trade
            if position_size:
                new_position = Position(
                    ticker=ticker,
                    shares=position_size.shares,
                    current_price=entry_price,
                    market_value=position_size.dollar_amount,
                    cost_basis=position_size.dollar_amount,
                    sector=sector
                )
                all_positions = existing_positions + [new_position]
            else:
                all_positions = existing_positions
            
            # Assess portfolio risk
            portfolio_risk = self.portfolio_assessor.assess_portfolio_risk(
                positions=all_positions,
                account_value=account_value,
                historical_data={pos.ticker: historical_data} if historical_data else None
            )
            
            # Add portfolio warnings
            warnings.extend(portfolio_risk.warnings)
            
            return portfolio_risk
            
        except Exception as e:
            logger.warning(f"Error assessing portfolio risk: {e}")
            warnings.append(f"Portfolio risk assessment failed: {str(e)}")
            return None
    
    def _calculate_overall_risk_score(
        self,
        stop_loss: Optional[StopLoss],
        position_size: Optional[PositionSize],
        portfolio_risk: Optional[PortfolioRisk]
    ) -> float:
        """Calculate overall risk score (0-100)."""
        score = 0.0
        
        # Stop-loss risk (0-25 points)
        if stop_loss:
            if stop_loss.percentage > 10:
                score += min((stop_loss.percentage - 10) * 2, 25)
            elif stop_loss.percentage < 1:
                score += 10  # Too tight
        else:
            score += 15  # No stop-loss calculated
        
        # Position size risk (0-25 points)
        if position_size:
            if position_size.position_pct > self.config.max_position_size_pct:
                excess = position_size.position_pct - self.config.max_position_size_pct
                score += min(excess * 2, 25)
            if position_size.shares == 0:
                score += 20  # Can't size position
        else:
            score += 20  # No position size calculated
        
        # Portfolio risk (0-50 points)
        if portfolio_risk:
            score += min(portfolio_risk.risk_score / 2, 50)
        
        return min(score, 100.0)
    
    def _generate_recommendation(
        self,
        risk_score: float,
        position_size: Optional[PositionSize],
        portfolio_risk: Optional[PortfolioRisk],
        warnings: List[str],
        recommendations: List[str]
    ) -> TradeRecommendation:
        """Generate overall trade recommendation."""
        # Add general recommendations
        if portfolio_risk:
            recommendations.extend(portfolio_risk.recommendations)
        
        # Determine recommendation based on risk score
        if risk_score >= 70:
            recommendations.append("Risk score is very high - consider passing on this trade")
            return TradeRecommendation.REJECT
        elif risk_score >= 50:
            recommendations.append("Risk score is elevated - consider reducing position size")
            return TradeRecommendation.REDUCE
        elif position_size and position_size.shares == 0:
            recommendations.append("Unable to size position within risk parameters")
            return TradeRecommendation.REJECT
        else:
            recommendations.append("Risk parameters are acceptable")
            return TradeRecommendation.APPROVE
