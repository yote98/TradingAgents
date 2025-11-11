"""
Stop-Loss Calculator
Calculates stop-loss levels and risk-reward ratios.
"""
import logging
from dataclasses import dataclass
from typing import Optional, List
from tradingagents.risk.risk_config import RiskConfig

logger = logging.getLogger(__name__)


@dataclass
class StopLoss:
    """Result of stop-loss calculation."""
    stop_loss_price: float
    risk_per_share: float
    risk_reward_ratio: float
    method: str
    is_favorable: bool
    warnings: List[str] = None
    
    def __post_init__(self):
        if self.warnings is None:
            self.warnings = []


class StopLossCalculator:
    """Calculates stop-loss levels using multiple methods."""
    
    def __init__(self, config: RiskConfig):
        self.config = config
        logger.info(f"StopLossCalculator initialized with method: {config.stop_loss_method}")
    
    def calculate(
        self,
        entry_price: float,
        direction: str = "LONG",
        atr: Optional[float] = None,
        support_level: Optional[float] = None,
        target_price: Optional[float] = None
    ) -> StopLoss:
        """
        Calculate stop-loss using configured method.
        
        Args:
            entry_price: Entry price
            direction: "LONG" or "SHORT"
            atr: Average True Range
            support_level: Support level for technical stop
            target_price: Target price for R:R calculation
        
        Returns:
            StopLoss with calculated values
        """
        method = self.config.stop_loss_method
        
        if method == "percentage":
            return self.calculate_percentage_based(entry_price, direction, target_price)
        elif method == "atr":
            if atr:
                return self.calculate_atr_based(entry_price, direction, atr, target_price)
            else:
                logger.warning("ATR method requires ATR value. Falling back to percentage.")
                return self.calculate_percentage_based(entry_price, direction, target_price)
        elif method == "support_resistance":
            if support_level:
                return self.calculate_support_resistance(entry_price, direction, support_level, target_price)
            else:
                logger.warning("Support/resistance method requires support level. Falling back to percentage.")
                return self.calculate_percentage_based(entry_price, direction, target_price)
        else:
            logger.error(f"Unknown stop-loss method: {method}")
            return self.calculate_percentage_based(entry_price, direction, target_price)
    
    def calculate_percentage_based(
        self,
        entry_price: float,
        direction: str = "LONG",
        target_price: Optional[float] = None
    ) -> StopLoss:
        """Calculate stop-loss using fixed percentage."""
        warnings = []
        
        stop_pct = self.config.stop_loss_percentage / 100
        
        if direction == "LONG":
            stop_loss_price = entry_price * (1 - stop_pct)
            risk_per_share = entry_price - stop_loss_price
        else:  # SHORT
            stop_loss_price = entry_price * (1 + stop_pct)
            risk_per_share = stop_loss_price - entry_price
        
        # Calculate risk-reward ratio
        risk_reward_ratio = self._calculate_risk_reward(
            entry_price, stop_loss_price, target_price, direction
        )
        
        # Check if favorable
        is_favorable = risk_reward_ratio >= self.config.min_risk_reward_ratio
        
        if not is_favorable:
            warnings.append(f"Risk-reward ratio {risk_reward_ratio:.2f} below minimum {self.config.min_risk_reward_ratio}")
        
        return StopLoss(
            stop_loss_price=stop_loss_price,
            risk_per_share=risk_per_share,
            risk_reward_ratio=risk_reward_ratio,
            method="percentage",
            is_favorable=is_favorable,
            warnings=warnings
        )
    
    def calculate_atr_based(
        self,
        entry_price: float,
        direction: str,
        atr: float,
        target_price: Optional[float] = None
    ) -> StopLoss:
        """Calculate stop-loss using ATR (volatility-based)."""
        warnings = []
        
        if atr <= 0:
            warnings.append("Invalid ATR value")
            return self.calculate_percentage_based(entry_price, direction, target_price)
        
        # Calculate stop distance using ATR multiplier
        stop_distance = atr * self.config.atr_multiplier
        
        if direction == "LONG":
            stop_loss_price = entry_price - stop_distance
            risk_per_share = stop_distance
        else:  # SHORT
            stop_loss_price = entry_price + stop_distance
            risk_per_share = stop_distance
        
        # Ensure stop-loss is positive
        if stop_loss_price <= 0:
            warnings.append("Calculated stop-loss is negative or zero")
            return self.calculate_percentage_based(entry_price, direction, target_price)
        
        # Calculate risk-reward ratio
        risk_reward_ratio = self._calculate_risk_reward(
            entry_price, stop_loss_price, target_price, direction
        )
        
        is_favorable = risk_reward_ratio >= self.config.min_risk_reward_ratio
        
        if not is_favorable:
            warnings.append(f"Risk-reward ratio {risk_reward_ratio:.2f} below minimum")
        
        return StopLoss(
            stop_loss_price=stop_loss_price,
            risk_per_share=risk_per_share,
            risk_reward_ratio=risk_reward_ratio,
            method="atr",
            is_favorable=is_favorable,
            warnings=warnings
        )
    
    def calculate_support_resistance(
        self,
        entry_price: float,
        direction: str,
        support_level: float,
        target_price: Optional[float] = None
    ) -> StopLoss:
        """Calculate stop-loss using support/resistance levels."""
        warnings = []
        
        if direction == "LONG":
            # Place stop below support
            stop_loss_price = support_level * 0.99  # Slightly below support
            risk_per_share = entry_price - stop_loss_price
            
            if stop_loss_price >= entry_price:
                warnings.append("Support level is above entry price")
                return self.calculate_percentage_based(entry_price, direction, target_price)
        else:  # SHORT
            # Place stop above resistance
            stop_loss_price = support_level * 1.01  # Slightly above resistance
            risk_per_share = stop_loss_price - entry_price
            
            if stop_loss_price <= entry_price:
                warnings.append("Resistance level is below entry price")
                return self.calculate_percentage_based(entry_price, direction, target_price)
        
        # Calculate risk-reward ratio
        risk_reward_ratio = self._calculate_risk_reward(
            entry_price, stop_loss_price, target_price, direction
        )
        
        is_favorable = risk_reward_ratio >= self.config.min_risk_reward_ratio
        
        if not is_favorable:
            warnings.append(f"Risk-reward ratio {risk_reward_ratio:.2f} below minimum")
        
        return StopLoss(
            stop_loss_price=stop_loss_price,
            risk_per_share=risk_per_share,
            risk_reward_ratio=risk_reward_ratio,
            method="support_resistance",
            is_favorable=is_favorable,
            warnings=warnings
        )
    
    def _calculate_risk_reward(
        self,
        entry_price: float,
        stop_loss_price: float,
        target_price: Optional[float],
        direction: str
    ) -> float:
        """Calculate risk-reward ratio."""
        if target_price is None:
            return 0.0
        
        risk = abs(entry_price - stop_loss_price)
        
        if direction == "LONG":
            reward = target_price - entry_price
        else:  # SHORT
            reward = entry_price - target_price
        
        if risk == 0:
            return 0.0
        
        return reward / risk
