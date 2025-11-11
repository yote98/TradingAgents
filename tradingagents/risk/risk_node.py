"""
Risk Calculator Node for LangGraph Integration

Provides a node function that calculates quantitative risk metrics
and adds them to the agent state for use by Risk Analysts.
"""
import logging
from typing import Dict, Any
import pandas as pd

from tradingagents.risk.risk_calculator import RiskCalculator
from tradingagents.risk.risk_config import RiskConfig
from tradingagents.risk.portfolio_risk import Position

logger = logging.getLogger(__name__)


def create_risk_calculator_node(config: RiskConfig = None):
    """
    Create a risk calculator node for the trading graph.
    
    Args:
        config: Risk configuration (uses moderate defaults if not provided)
    
    Returns:
        Node function that calculates risk metrics
    """
    calculator = RiskCalculator(config or RiskConfig.moderate())
    
    def risk_calculator_node(state: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate quantitative risk metrics and add to state.
        
        Extracts necessary information from state, calculates risk metrics,
        and updates state with the results.
        
        Args:
            state: Current agent state
        
        Returns:
            Updated state with risk_metrics field
        """
        try:
            # Extract required information from state
            ticker = state.get("company_of_interest", "UNKNOWN")
            
            # Try to extract entry price from trader's plan
            entry_price = _extract_entry_price(state)
            if entry_price is None:
                logger.warning(f"Could not extract entry price for {ticker}, skipping risk calculation")
                return {
                    "risk_metrics": {
                        "error": "Could not extract entry price",
                        "ticker": ticker
                    }
                }
            
            # Get account balance (default to $100,000 if not provided)
            account_value = state.get("account_balance", 100000.0)
            
            # Get existing positions if available
            existing_positions = _extract_positions(state)
            
            # Get historical data if available (from market analyst report)
            historical_data = _extract_historical_data(state)
            
            # Determine direction (default to long)
            direction = _extract_direction(state)
            
            # Calculate risk metrics
            logger.info(f"Calculating risk metrics for {ticker} at ${entry_price:.2f}")
            risk_metrics = calculator.calculate_trade_risk(
                ticker=ticker,
                entry_price=entry_price,
                account_value=account_value,
                direction=direction,
                historical_data=historical_data,
                existing_positions=existing_positions
            )
            
            # Convert to dictionary for state storage
            risk_dict = risk_metrics.to_dict()
            
            # Log summary
            logger.info(
                f"Risk calculation complete: "
                f"Score={risk_metrics.risk_score:.1f}, "
                f"Recommendation={risk_metrics.recommendation.value}, "
                f"Position={risk_metrics.position_size.shares if risk_metrics.position_size else 0} shares"
            )
            
            return {"risk_metrics": risk_dict}
            
        except Exception as e:
            logger.error(f"Error in risk calculator node: {e}", exc_info=True)
            return {
                "risk_metrics": {
                    "error": str(e),
                    "ticker": state.get("company_of_interest", "UNKNOWN")
                }
            }
    
    return risk_calculator_node


def _extract_entry_price(state: Dict[str, Any]) -> float:
    """Extract entry price from trader's plan or market data."""
    # Try to parse from trader's investment plan
    trader_plan = state.get("trader_investment_plan", "")
    
    # Look for price mentions in the plan
    import re
    
    # Pattern: $XX.XX or $XXX.XX
    price_pattern = r'\$(\d+\.?\d*)'
    matches = re.findall(price_pattern, trader_plan)
    
    if matches:
        # Use the first price mentioned (likely entry price)
        try:
            return float(matches[0])
        except ValueError:
            pass
    
    # Fallback: try to get from market report
    market_report = state.get("market_report", "")
    matches = re.findall(price_pattern, market_report)
    
    if matches:
        try:
            return float(matches[0])
        except ValueError:
            pass
    
    # Last resort: return None
    return None


def _extract_direction(state: Dict[str, Any]) -> str:
    """Extract trade direction from trader's plan."""
    trader_plan = state.get("trader_investment_plan", "").lower()
    
    # Look for buy/sell/long/short keywords
    if any(word in trader_plan for word in ["buy", "long", "bullish"]):
        return "long"
    elif any(word in trader_plan for word in ["sell", "short", "bearish"]):
        return "short"
    
    # Default to long
    return "long"


def _extract_positions(state: Dict[str, Any]) -> list:
    """Extract existing positions from state."""
    positions_data = state.get("existing_positions", [])
    
    if not positions_data:
        return []
    
    # Convert position dictionaries to Position objects
    positions = []
    for pos_dict in positions_data:
        try:
            position = Position(
                ticker=pos_dict.get("ticker", ""),
                shares=pos_dict.get("shares", 0),
                current_price=pos_dict.get("current_price", 0),
                market_value=pos_dict.get("market_value", 0),
                cost_basis=pos_dict.get("cost_basis", 0),
                sector=pos_dict.get("sector"),
                stop_loss_price=pos_dict.get("stop_loss_price")
            )
            positions.append(position)
        except Exception as e:
            logger.warning(f"Error parsing position: {e}")
            continue
    
    return positions


def _extract_historical_data(state: Dict[str, Any]) -> pd.DataFrame:
    """Extract historical price data from state if available."""
    # This would need to be populated by the market analyst
    # For now, return None and let the risk calculator handle it
    return None
