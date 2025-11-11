"""
Risk Configuration
Defines configuration parameters for risk management calculations.
"""
from dataclasses import dataclass, field
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)


@dataclass
class RiskConfig:
    """
    Configuration for risk management calculations.
    
    Attributes:
        risk_per_trade_pct: Maximum risk per trade as percentage of account (default: 2.0%)
        max_portfolio_risk_pct: Maximum total portfolio risk percentage (default: 10.0%)
        min_risk_reward_ratio: Minimum acceptable risk-reward ratio (default: 2.0)
        position_sizing_method: Method for position sizing (default: "fixed_percentage")
        stop_loss_method: Method for stop-loss calculation (default: "percentage")
        max_position_size_pct: Maximum position size as percentage of account (default: 20.0%)
        atr_multiplier: Multiplier for ATR-based stop-loss (default: 2.0)
        stop_loss_percentage: Default stop-loss percentage (default: 2.0%)
        kelly_fraction: Fraction of Kelly Criterion to use (default: 0.5 for half-Kelly)
        max_correlation: Maximum acceptable correlation between positions (default: 0.7)
        max_sector_concentration_pct: Maximum exposure to single sector (default: 30.0%)
    """
    
    # Risk limits
    risk_per_trade_pct: float = 2.0
    max_portfolio_risk_pct: float = 10.0
    min_risk_reward_ratio: float = 2.0
    max_position_size_pct: float = 20.0
    
    # Position sizing
    position_sizing_method: str = "fixed_percentage"  # or "kelly", "volatility"
    kelly_fraction: float = 0.5  # Use half-Kelly for safety
    
    # Stop-loss
    stop_loss_method: str = "percentage"  # or "atr", "support_resistance"
    stop_loss_percentage: float = 2.0
    atr_multiplier: float = 2.0
    
    # Portfolio risk
    max_correlation: float = 0.7
    max_sector_concentration_pct: float = 30.0
    
    # Validation flags
    strict_validation: bool = True
    use_conservative_defaults: bool = True
    
    def __post_init__(self):
        """Validate configuration parameters."""
        if self.strict_validation:
            self.validate()
    
    def validate(self) -> bool:
        """
        Validate all configuration parameters.
        
        Returns:
            True if valid, raises ValueError if invalid
        """
        # Risk percentages
        if not 0 < self.risk_per_trade_pct <= 10:
            raise ValueError(f"risk_per_trade_pct must be between 0 and 10, got {self.risk_per_trade_pct}")
        
        if not 0 < self.max_portfolio_risk_pct <= 50:
            raise ValueError(f"max_portfolio_risk_pct must be between 0 and 50, got {self.max_portfolio_risk_pct}")
        
        if not 0 < self.max_position_size_pct <= 100:
            raise ValueError(f"max_position_size_pct must be between 0 and 100, got {self.max_position_size_pct}")
        
        # Risk-reward ratio
        if not 0 < self.min_risk_reward_ratio <= 10:
            raise ValueError(f"min_risk_reward_ratio must be between 0 and 10, got {self.min_risk_reward_ratio}")
        
        # Position sizing method
        valid_sizing_methods = ["fixed_percentage", "kelly", "volatility"]
        if self.position_sizing_method not in valid_sizing_methods:
            raise ValueError(f"position_sizing_method must be one of {valid_sizing_methods}, got {self.position_sizing_method}")
        
        # Kelly fraction
        if not 0 < self.kelly_fraction <= 1:
            raise ValueError(f"kelly_fraction must be between 0 and 1, got {self.kelly_fraction}")
        
        # Stop-loss method
        valid_stop_methods = ["percentage", "atr", "support_resistance"]
        if self.stop_loss_method not in valid_stop_methods:
            raise ValueError(f"stop_loss_method must be one of {valid_stop_methods}, got {self.stop_loss_method}")
        
        # Stop-loss percentage
        if not 0 < self.stop_loss_percentage <= 20:
            raise ValueError(f"stop_loss_percentage must be between 0 and 20, got {self.stop_loss_percentage}")
        
        # ATR multiplier
        if not 0 < self.atr_multiplier <= 5:
            raise ValueError(f"atr_multiplier must be between 0 and 5, got {self.atr_multiplier}")
        
        # Correlation
        if not 0 <= self.max_correlation <= 1:
            raise ValueError(f"max_correlation must be between 0 and 1, got {self.max_correlation}")
        
        # Sector concentration
        if not 0 < self.max_sector_concentration_pct <= 100:
            raise ValueError(f"max_sector_concentration_pct must be between 0 and 100, got {self.max_sector_concentration_pct}")
        
        logger.info("Risk configuration validated successfully")
        return True
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert configuration to dictionary."""
        return {
            'risk_per_trade_pct': self.risk_per_trade_pct,
            'max_portfolio_risk_pct': self.max_portfolio_risk_pct,
            'min_risk_reward_ratio': self.min_risk_reward_ratio,
            'max_position_size_pct': self.max_position_size_pct,
            'position_sizing_method': self.position_sizing_method,
            'kelly_fraction': self.kelly_fraction,
            'stop_loss_method': self.stop_loss_method,
            'stop_loss_percentage': self.stop_loss_percentage,
            'atr_multiplier': self.atr_multiplier,
            'max_correlation': self.max_correlation,
            'max_sector_concentration_pct': self.max_sector_concentration_pct
        }
    
    @classmethod
    def from_dict(cls, config_dict: Dict[str, Any]) -> 'RiskConfig':
        """Create configuration from dictionary."""
        return cls(**config_dict)
    
    @classmethod
    def conservative(cls) -> 'RiskConfig':
        """Create conservative risk configuration."""
        return cls(
            risk_per_trade_pct=1.0,
            max_portfolio_risk_pct=5.0,
            min_risk_reward_ratio=3.0,
            max_position_size_pct=10.0,
            kelly_fraction=0.25,
            stop_loss_percentage=1.5,
            atr_multiplier=1.5
        )
    
    @classmethod
    def moderate(cls) -> 'RiskConfig':
        """Create moderate risk configuration (default)."""
        return cls()
    
    @classmethod
    def aggressive(cls) -> 'RiskConfig':
        """Create aggressive risk configuration."""
        return cls(
            risk_per_trade_pct=5.0,
            max_portfolio_risk_pct=20.0,
            min_risk_reward_ratio=1.5,
            max_position_size_pct=30.0,
            kelly_fraction=0.75,
            stop_loss_percentage=3.0,
            atr_multiplier=2.5
        )
