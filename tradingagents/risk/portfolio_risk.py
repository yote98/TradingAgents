"""
Portfolio Risk Assessor
Evaluates portfolio-level risk including concentration, correlation,
and overall risk exposure.
"""
import logging
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any, Tuple
import numpy as np
import pandas as pd

from tradingagents.risk.risk_config import RiskConfig

logger = logging.getLogger(__name__)


@dataclass
class PortfolioRisk:
    """
    Represents portfolio risk assessment.
    
    Attributes:
        total_risk_pct: Total portfolio risk as percentage of account
        concentration_risk: Risk from position concentration
        correlation_risk: Risk from correlated positions
        sector_exposure: Exposure by sector
        position_risks: Individual position risks
        risk_score: Overall risk score (0-100)
        warnings: List of risk warnings
        recommendations: List of risk management recommendations
    """
    total_risk_pct: float
    concentration_risk: float
    correlation_risk: float
    sector_exposure: Dict[str, float] = field(default_factory=dict)
    position_risks: Dict[str, float] = field(default_factory=dict)
    risk_score: float = 0.0
    warnings: List[str] = field(default_factory=list)
    recommendations: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class Position:
    """Represents a portfolio position."""
    ticker: str
    shares: float
    current_price: float
    market_value: float
    cost_basis: float
    sector: Optional[str] = None
    stop_loss_price: Optional[float] = None
    
    @property
    def unrealized_pnl(self) -> float:
        return self.market_value - self.cost_basis
    
    @property
    def unrealized_pnl_pct(self) -> float:
        if self.cost_basis == 0:
            return 0.0
        return (self.unrealized_pnl / self.cost_basis) * 100


class PortfolioRiskAssessor:
    """
    Assesses portfolio-level risk metrics.
    
    Evaluates:
    - Position concentration risk
    - Correlation risk between positions
    - Sector concentration
    - Overall portfolio risk
    """
    
    def __init__(self, config: RiskConfig):
        """
        Initialize portfolio risk assessor.
        
        Args:
            config: Risk configuration parameters
        """
        self.config = config
        logger.info("PortfolioRiskAssessor initialized")
    
    def assess_portfolio_risk(
        self,
        positions: List[Position],
        account_value: float,
        correlation_matrix: Optional[pd.DataFrame] = None,
        historical_data: Optional[Dict[str, pd.DataFrame]] = None
    ) -> PortfolioRisk:
        """
        Assess overall portfolio risk.
        
        Args:
            positions: List of current positions
            account_value: Total account value
            correlation_matrix: Correlation matrix between positions
            historical_data: Historical price data for positions
        
        Returns:
            PortfolioRisk assessment
        """
        if not positions:
            return PortfolioRisk(
                total_risk_pct=0.0,
                concentration_risk=0.0,
                correlation_risk=0.0,
                warnings=["Portfolio is empty"],
                recommendations=["Consider adding positions to diversify"]
            )
        
        # Calculate individual position risks
        position_risks = self._calculate_position_risks(positions, account_value)
        
        # Calculate concentration risk
        concentration_risk = self._calculate_concentration_risk(positions, account_value)
        
        # Calculate correlation risk
        correlation_risk = self._calculate_correlation_risk(
            positions, account_value, correlation_matrix, historical_data
        )
        
        # Calculate sector exposure
        sector_exposure = self._calculate_sector_exposure(positions, account_value)
        
        # Calculate total portfolio risk
        total_risk_pct = self._calculate_total_risk(
            position_risks, concentration_risk, correlation_risk
        )
        
        # Generate risk score
        risk_score = self._calculate_risk_score(
            total_risk_pct, concentration_risk, correlation_risk, sector_exposure
        )
        
        # Generate warnings and recommendations
        warnings, recommendations = self._generate_warnings_and_recommendations(
            positions, account_value, total_risk_pct, concentration_risk,
            correlation_risk, sector_exposure, position_risks
        )
        
        return PortfolioRisk(
            total_risk_pct=total_risk_pct,
            concentration_risk=concentration_risk,
            correlation_risk=correlation_risk,
            sector_exposure=sector_exposure,
            position_risks=position_risks,
            risk_score=risk_score,
            warnings=warnings,
            recommendations=recommendations,
            metadata={
                "num_positions": len(positions),
                "account_value": account_value,
                "largest_position_pct": max(pos.market_value / account_value * 100 for pos in positions) if positions else 0
            }
        )
    
    def _calculate_position_risks(
        self,
        positions: List[Position],
        account_value: float
    ) -> Dict[str, float]:
        """Calculate risk for each position."""
        position_risks = {}
        
        for position in positions:
            # Calculate position size as percentage of account
            position_pct = (position.market_value / account_value) * 100
            
            # Calculate risk based on stop-loss or default percentage
            if position.stop_loss_price is not None:
                risk_per_share = abs(position.current_price - position.stop_loss_price)
                total_risk = position.shares * risk_per_share
                risk_pct = (total_risk / account_value) * 100
            else:
                # Use default stop-loss percentage
                risk_pct = position_pct * (self.config.stop_loss_percentage / 100.0)
            
            position_risks[position.ticker] = risk_pct
        
        return position_risks
    
    def _calculate_concentration_risk(
        self,
        positions: List[Position],
        account_value: float
    ) -> float:
        """Calculate concentration risk from large positions."""
        position_percentages = [
            (pos.market_value / account_value) * 100 for pos in positions
        ]
        
        # Concentration risk increases exponentially with position size
        concentration_risk = 0.0
        for pct in position_percentages:
            if pct > self.config.max_position_size_pct:
                # Penalty for oversized positions
                excess = pct - self.config.max_position_size_pct
                concentration_risk += excess * 0.5  # 0.5x multiplier for excess
        
        # Additional risk from having too few positions
        if len(positions) < 3:
            concentration_risk += (3 - len(positions)) * 2.0  # 2% per missing position
        
        return concentration_risk
    
    def _calculate_correlation_risk(
        self,
        positions: List[Position],
        account_value: float,
        correlation_matrix: Optional[pd.DataFrame] = None,
        historical_data: Optional[Dict[str, pd.DataFrame]] = None
    ) -> float:
        """Calculate correlation risk between positions."""
        if len(positions) < 2:
            return 0.0  # No correlation risk with single position
        
        # If correlation matrix not provided, try to calculate from historical data
        if correlation_matrix is None and historical_data is not None:
            correlation_matrix = self._calculate_correlation_matrix(historical_data)
        
        if correlation_matrix is None:
            # Assume moderate correlation if no data available
            logger.warning("No correlation data available, assuming moderate correlation")
            return len(positions) * 1.0  # 1% per position as default correlation risk
        
        correlation_risk = 0.0
        tickers = [pos.ticker for pos in positions]
        
        # Calculate weighted correlation risk
        for i, pos1 in enumerate(positions):
            for j, pos2 in enumerate(positions):
                if i >= j:  # Avoid double counting
                    continue
                
                if pos1.ticker in correlation_matrix.index and pos2.ticker in correlation_matrix.columns:
                    correlation = correlation_matrix.loc[pos1.ticker, pos2.ticker]
                    
                    # High correlation increases risk
                    if abs(correlation) > self.config.max_correlation:
                        weight1 = pos1.market_value / account_value
                        weight2 = pos2.market_value / account_value
                        # Risk proportional to position sizes and correlation
                        pair_risk = weight1 * weight2 * abs(correlation) * 100
                        correlation_risk += pair_risk
        
        return correlation_risk
    
    def _calculate_correlation_matrix(
        self,
        historical_data: Dict[str, pd.DataFrame]
    ) -> Optional[pd.DataFrame]:
        """Calculate correlation matrix from historical data."""
        try:
            # Extract returns for each ticker
            returns_data = {}
            for ticker, data in historical_data.items():
                if 'close' in data.columns and len(data) > 20:
                    returns = data['close'].pct_change().dropna()
                    returns_data[ticker] = returns
            
            if len(returns_data) < 2:
                return None
            
            # Create DataFrame of returns
            returns_df = pd.DataFrame(returns_data)
            
            # Calculate correlation matrix
            correlation_matrix = returns_df.corr()
            
            return correlation_matrix
        except Exception as e:
            logger.error(f"Error calculating correlation matrix: {e}")
            return None
    
    def _calculate_sector_exposure(
        self,
        positions: List[Position],
        account_value: float
    ) -> Dict[str, float]:
        """Calculate exposure by sector."""
        sector_exposure = {}
        
        for position in positions:
            sector = position.sector or "Unknown"
            position_pct = (position.market_value / account_value) * 100
            
            if sector in sector_exposure:
                sector_exposure[sector] += position_pct
            else:
                sector_exposure[sector] = position_pct
        
        return sector_exposure
    
    def _calculate_total_risk(
        self,
        position_risks: Dict[str, float],
        concentration_risk: float,
        correlation_risk: float
    ) -> float:
        """Calculate total portfolio risk."""
        # Sum individual position risks
        individual_risk = sum(position_risks.values())
        
        # Add concentration and correlation risks
        total_risk = individual_risk + concentration_risk + correlation_risk
        
        # Cap at reasonable maximum
        return min(total_risk, 100.0)
    
    def _calculate_risk_score(
        self,
        total_risk_pct: float,
        concentration_risk: float,
        correlation_risk: float,
        sector_exposure: Dict[str, float]
    ) -> float:
        """Calculate overall risk score (0-100)."""
        score = 0.0
        
        # Risk from total portfolio risk
        if total_risk_pct > self.config.max_portfolio_risk_pct:
            score += min((total_risk_pct - self.config.max_portfolio_risk_pct) * 2, 30)
        
        # Risk from concentration
        score += min(concentration_risk, 25)
        
        # Risk from correlation
        score += min(correlation_risk, 20)
        
        # Risk from sector concentration
        max_sector_exposure = max(sector_exposure.values()) if sector_exposure else 0
        if max_sector_exposure > self.config.max_sector_concentration_pct:
            excess = max_sector_exposure - self.config.max_sector_concentration_pct
            score += min(excess * 0.5, 15)
        
        # Risk from too few positions (lack of diversification)
        if len(sector_exposure) < 3:
            score += (3 - len(sector_exposure)) * 5
        
        return min(score, 100.0)
    
    def _generate_warnings_and_recommendations(
        self,
        positions: List[Position],
        account_value: float,
        total_risk_pct: float,
        concentration_risk: float,
        correlation_risk: float,
        sector_exposure: Dict[str, float],
        position_risks: Dict[str, float]
    ) -> Tuple[List[str], List[str]]:
        """Generate risk warnings and recommendations."""
        warnings = []
        recommendations = []
        
        # Total risk warnings
        if total_risk_pct > self.config.max_portfolio_risk_pct:
            warnings.append(f"Total portfolio risk ({total_risk_pct:.1f}%) exceeds maximum ({self.config.max_portfolio_risk_pct:.1f}%)")
            recommendations.append("Consider reducing position sizes or tightening stop-losses")
        
        # Concentration warnings
        if concentration_risk > 5.0:
            warnings.append(f"High concentration risk ({concentration_risk:.1f}%)")
            recommendations.append("Diversify portfolio by adding more positions or reducing large positions")
        
        # Individual position size warnings
        for position in positions:
            position_pct = (position.market_value / account_value) * 100
            if position_pct > self.config.max_position_size_pct:
                warnings.append(f"{position.ticker} position ({position_pct:.1f}%) exceeds maximum ({self.config.max_position_size_pct:.1f}%)")
                recommendations.append(f"Consider reducing {position.ticker} position size")
        
        # Correlation warnings
        if correlation_risk > 3.0:
            warnings.append(f"High correlation risk ({correlation_risk:.1f}%)")
            recommendations.append("Consider diversifying into less correlated assets")
        
        # Sector concentration warnings
        for sector, exposure in sector_exposure.items():
            if exposure > self.config.max_sector_concentration_pct:
                warnings.append(f"{sector} sector exposure ({exposure:.1f}%) exceeds maximum ({self.config.max_sector_concentration_pct:.1f}%)")
                recommendations.append(f"Consider reducing exposure to {sector} sector")
        
        # Diversification warnings
        if len(positions) < 3:
            warnings.append(f"Portfolio has only {len(positions)} positions - insufficient diversification")
            recommendations.append("Consider adding more positions to improve diversification")
        
        if len(sector_exposure) < 3:
            warnings.append(f"Portfolio spans only {len(sector_exposure)} sectors")
            recommendations.append("Consider diversifying across more sectors")
        
        # Individual position risk warnings
        for ticker, risk in position_risks.items():
            if risk > self.config.risk_per_trade_pct * 2:  # More than 2x normal risk
                warnings.append(f"{ticker} individual risk ({risk:.1f}%) is very high")
                recommendations.append(f"Consider tightening stop-loss for {ticker} or reducing position size")
        
        return warnings, recommendations
    
    def get_position_limit(
        self,
        ticker: str,
        current_price: float,
        account_value: float,
        existing_positions: List[Position],
        sector: Optional[str] = None
    ) -> Dict[str, float]:
        """
        Get maximum position size limits for a new position.
        
        Returns:
            Dictionary with various limits and the recommended maximum
        """
        # Individual position size limit
        max_position_value = account_value * (self.config.max_position_size_pct / 100.0)
        max_shares_individual = int(max_position_value / current_price)
        
        # Portfolio risk limit
        current_total_risk = sum(self._calculate_position_risks(existing_positions, account_value).values())
        remaining_risk_budget = self.config.max_portfolio_risk_pct - current_total_risk
        if remaining_risk_budget <= 0:
            max_shares_portfolio = 0
        else:
            # Assume default stop-loss percentage for new position
            risk_per_share = current_price * (self.config.stop_loss_percentage / 100.0)
            max_risk_amount = account_value * (remaining_risk_budget / 100.0)
            max_shares_portfolio = int(max_risk_amount / risk_per_share) if risk_per_share > 0 else 0
        
        # Sector concentration limit
        max_shares_sector = max_shares_individual  # Default to individual limit
        if sector:
            current_sector_exposure = sum(
                (pos.market_value / account_value) * 100
                for pos in existing_positions
                if pos.sector == sector
            )
            remaining_sector_budget = self.config.max_sector_concentration_pct - current_sector_exposure
            if remaining_sector_budget <= 0:
                max_shares_sector = 0
            else:
                max_sector_value = account_value * (remaining_sector_budget / 100.0)
                max_shares_sector = int(max_sector_value / current_price)
        
        # Take the minimum of all limits
        recommended_max = min(max_shares_individual, max_shares_portfolio, max_shares_sector)
        
        return {
            "individual_limit": max_shares_individual,
            "portfolio_risk_limit": max_shares_portfolio,
            "sector_limit": max_shares_sector,
            "recommended_max": max(0, recommended_max),
            "current_total_risk_pct": current_total_risk,
            "remaining_risk_budget_pct": remaining_risk_budget
        }
