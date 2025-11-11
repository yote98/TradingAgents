"""
Position Sizing Calculator
Calculates appropriate position sizes based on risk parameters.
"""
import logging
from dataclasses import dataclass
from typing import Optional
from tradingagents.risk.risk_config import RiskConfig

logger = logging.getLogger(__name__)


@dataclass
class PositionSize:
    """Result of position sizing calculation."""
    shares: int
    dollar_amount: float
    risk_amount: float
    risk_percentage: float
    method: str
    warnings: list = None
    
    def __post_init__(self):
        if self.warnings is None:
            self.warnings = []


class PositionSizingCalculator:
    """Calculates position sizes using multiple methods."""
    
    def __init__(self, config: RiskConfig):
        self.config = config
        logger.info(f"PositionSizingCalculator initialized with method: {config.position_sizing_method}")
    
    def calculate(
        self,
        account_balance: float,
        entry_price: float,
        stop_loss_price: float,
        atr: Optional[float] = None,
        win_rate: Optional[float] = None,
        avg_win: Optional[float] = None,
        avg_loss: Optional[float] = None
    ) -> PositionSize:
        """
        Calculate position size using configured method.
        
        Args:
            account_balance: Current account balance
            entry_price: Planned entry price
            stop_loss_price: Stop-loss price
            atr: Average True Range (for volatility-based)
            win_rate: Historical win rate (for Kelly)
            avg_win: Average win amount (for Kelly)
            avg_loss: Average loss amount (for Kelly)
        
        Returns:
            PositionSize with calculated values
        """
        # Validate inputs
        if account_balance <= 0:
            logger.warning(f"Invalid account balance: {account_balance}")
            return PositionSize(0, 0, 0, 0, "error", ["Invalid account balance"])
        
        if entry_price <= 0 or stop_loss_price <= 0:
            logger.warning(f"Invalid prices: entry={entry_price}, stop={stop_loss_price}")
            return PositionSize(0, 0, 0, 0, "error", ["Invalid prices"])
        
        # Route to appropriate method
        method = self.config.position_sizing_method
        
        if method == "fixed_percentage":
            return self.calculate_fixed_percentage(account_balance, entry_price, stop_loss_price)
        elif method == "kelly":
            if win_rate and avg_win and avg_loss:
                return self.calculate_kelly_criterion(account_balance, entry_price, win_rate, avg_win, avg_loss)
            else:
                logger.warning("Kelly method requires win_rate, avg_win, avg_loss. Falling back to fixed percentage.")
                return self.calculate_fixed_percentage(account_balance, entry_price, stop_loss_price)
        elif method == "volatility":
            if atr:
                return self.calculate_volatility_based(account_balance, entry_price, stop_loss_price, atr)
            else:
                logger.warning("Volatility method requires ATR. Falling back to fixed percentage.")
                return self.calculate_fixed_percentage(account_balance, entry_price, stop_loss_price)
        else:
            logger.error(f"Unknown position sizing method: {method}")
            return self.calculate_fixed_percentage(account_balance, entry_price, stop_loss_price)
    
    def calculate_fixed_percentage(
        self,
        account_balance: float,
        entry_price: float,
        stop_loss_price: float
    ) -> PositionSize:
        """
        Calculate position size using fixed percentage risk method.
        
        Formula: Position Size = (Account Balance * Risk %) / (Entry - Stop Loss)
        """
        warnings = []
        
        # Calculate risk per share
        risk_per_share = abs(entry_price - stop_loss_price)
        
        if risk_per_share == 0:
            warnings.append("Entry price equals stop-loss price")
            return PositionSize(0, 0, 0, 0, "fixed_percentage", warnings)
        
        # Calculate risk amount
        risk_amount = account_balance * (self.config.risk_per_trade_pct / 100)
        
        # Calculate shares
        shares_float = risk_amount / risk_per_share
        shares = int(shares_float)
        
        # Check maximum position size
        max_position_value = account_balance * (self.config.max_position_size_pct / 100)
        position_value = shares * entry_price
        
        if position_value > max_position_value:
            shares = int(max_position_value / entry_price)
            warnings.append(f"Position size limited by max_position_size_pct ({self.config.max_position_size_pct}%)")
        
        # Check minimum position
        if shares == 0 and shares_float > 0:
            warnings.append("Calculated position size rounds to zero shares")
        
        # Final calculations
        final_position_value = shares * entry_price
        final_risk_amount = shares * risk_per_share
        final_risk_pct = (final_risk_amount / account_balance) * 100 if account_balance > 0 else 0
        
        return PositionSize(
            shares=shares,
            dollar_amount=final_position_value,
            risk_amount=final_risk_amount,
            risk_percentage=final_risk_pct,
            method="fixed_percentage",
            warnings=warnings
        )
    
    def calculate_kelly_criterion(
        self,
        account_balance: float,
        entry_price: float,
        win_rate: float,
        avg_win: float,
        avg_loss: float
    ) -> PositionSize:
        """
        Calculate position size using Kelly Criterion.
        
        Formula: Kelly % = W - [(1 - W) / R]
        Where W = win rate, R = avg_win / avg_loss
        """
        warnings = []
        
        # Validate inputs
        if not 0 <= win_rate <= 1:
            warnings.append(f"Invalid win rate: {win_rate}")
            win_rate = max(0, min(1, win_rate))
        
        if avg_loss == 0:
            warnings.append("Average loss is zero, cannot calculate Kelly")
            return PositionSize(0, 0, 0, 0, "kelly", warnings)
        
        # Calculate Kelly percentage
        win_loss_ratio = avg_win / abs(avg_loss)
        kelly_pct = win_rate - ((1 - win_rate) / win_loss_ratio)
        
        # Apply Kelly fraction for safety
        kelly_pct = kelly_pct * self.config.kelly_fraction
        
        # Ensure non-negative
        if kelly_pct <= 0:
            warnings.append("Kelly criterion suggests no position (negative edge)")
            return PositionSize(0, 0, 0, 0, "kelly", warnings)
        
        # Cap at reasonable maximum
        kelly_pct = min(kelly_pct, self.config.max_position_size_pct / 100)
        
        # Calculate position
        position_value = account_balance * kelly_pct
        shares = int(position_value / entry_price)
        
        # Final calculations
        final_position_value = shares * entry_price
        final_risk_pct = kelly_pct * 100
        
        return PositionSize(
            shares=shares,
            dollar_amount=final_position_value,
            risk_amount=final_position_value * (self.config.risk_per_trade_pct / 100),
            risk_percentage=final_risk_pct,
            method="kelly",
            warnings=warnings
        )
    
    def calculate_volatility_based(
        self,
        account_balance: float,
        entry_price: float,
        stop_loss_price: float,
        atr: float
    ) -> PositionSize:
        """
        Calculate position size based on volatility (ATR).
        
        Adjusts position size inversely to volatility.
        """
        warnings = []
        
        if atr <= 0:
            warnings.append("Invalid ATR value")
            return self.calculate_fixed_percentage(account_balance, entry_price, stop_loss_price)
        
        # Calculate volatility-adjusted risk
        # Higher volatility = smaller position
        volatility_factor = atr / entry_price
        adjusted_risk_pct = self.config.risk_per_trade_pct / (1 + volatility_factor)
        
        # Calculate risk amount
        risk_amount = account_balance * (adjusted_risk_pct / 100)
        
        # Calculate risk per share
        risk_per_share = abs(entry_price - stop_loss_price)
        
        if risk_per_share == 0:
            warnings.append("Entry price equals stop-loss price")
            return PositionSize(0, 0, 0, 0, "volatility", warnings)
        
        # Calculate shares
        shares = int(risk_amount / risk_per_share)
        
        # Check maximum position size
        max_position_value = account_balance * (self.config.max_position_size_pct / 100)
        position_value = shares * entry_price
        
        if position_value > max_position_value:
            shares = int(max_position_value / entry_price)
            warnings.append(f"Position size limited by max_position_size_pct")
        
        # Final calculations
        final_position_value = shares * entry_price
        final_risk_amount = shares * risk_per_share
        final_risk_pct = (final_risk_amount / account_balance) * 100 if account_balance > 0 else 0
        
        return PositionSize(
            shares=shares,
            dollar_amount=final_position_value,
            risk_amount=final_risk_amount,
            risk_percentage=final_risk_pct,
            method="volatility",
            warnings=warnings
        )
