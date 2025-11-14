"""Risk calculation tool implementation"""

import asyncio
import logging
from datetime import datetime
from typing import Any, Dict, Optional

from ..adapters.tradingagents import TradingAgentsAdapter
from ..protocol.schemas import Tool, ToolResult

logger = logging.getLogger(__name__)


class CalculateRiskTool:
    """
    Risk calculation tool that calculates position sizing and risk metrics.
    
    This tool uses the TradingAgents risk management system to calculate
    appropriate position sizes based on account size, risk tolerance, and
    current market conditions.
    """
    
    TOOL_NAME = "calculate_risk"
    TOOL_DESCRIPTION = (
        "Calculate position sizing and risk metrics for a trade. Returns recommended "
        "position size, stop loss price, risk amount, and risk-reward ratio based on "
        "account size and risk tolerance."
    )
    
    INPUT_SCHEMA = {
        "type": "object",
        "properties": {
            "ticker": {
                "type": "string",
                "description": "Stock ticker symbol (e.g., 'AAPL', 'TSLA')",
                "pattern": "^[A-Z]{1,5}$"
            },
            "account_value": {
                "type": "number",
                "minimum": 0,
                "description": "Total account value in dollars"
            },
            "risk_per_trade_pct": {
                "type": "number",
                "minimum": 0.1,
                "maximum": 10.0,
                "description": "Risk per trade as percentage (0.1-10.0)"
            },
            "current_price": {
                "type": "number",
                "minimum": 0,
                "description": "Current stock price"
            },
            "stop_loss_price": {
                "type": "number",
                "minimum": 0,
                "description": "Optional stop loss price (if not provided, will be calculated)"
            },
            "target_price": {
                "type": "number",
                "minimum": 0,
                "description": "Optional target price for risk-reward calculation"
            }
        },
        "required": ["ticker", "account_value", "risk_per_trade_pct", "current_price"]
    }
    
    def __init__(self, adapter: TradingAgentsAdapter):
        """
        Initialize the calculate risk tool.
        
        Args:
            adapter: TradingAgents adapter for risk calculations
        """
        self.adapter = adapter
    
    def get_tool_definition(self) -> Tool:
        """
        Get the MCP tool definition.
        
        Returns:
            Tool definition with name, description, and schema
        """
        return Tool(
            name=self.TOOL_NAME,
            description=self.TOOL_DESCRIPTION,
            input_schema=self.INPUT_SCHEMA
        )
    
    async def execute(
        self,
        ticker: str,
        account_value: float,
        risk_per_trade_pct: float,
        current_price: float,
        stop_loss_price: Optional[float] = None,
        target_price: Optional[float] = None
    ) -> ToolResult:
        """
        Execute risk calculation.
        
        Args:
            ticker: Stock ticker symbol (e.g., "AAPL")
            account_value: Total account value
            risk_per_trade_pct: Risk per trade percentage (0.1-10.0)
            current_price: Current stock price
            stop_loss_price: Optional stop loss price
            target_price: Optional target price
            
        Returns:
            ToolResult with risk calculation data or error
        """
        start_time = datetime.utcnow()
        
        try:
            # Validate ticker format
            ticker = ticker.upper().strip()
            if not ticker or len(ticker) > 5:
                return ToolResult(
                    success=False,
                    error={
                        "code": 400,
                        "message": f"Invalid ticker: {ticker}. Must be 1-5 uppercase letters."
                    }
                )
            
            # Validate account value
            if account_value <= 0:
                return ToolResult(
                    success=False,
                    error={
                        "code": 400,
                        "message": f"Invalid account value: {account_value}. Must be positive."
                    }
                )
            
            # Validate risk percentage
            if risk_per_trade_pct < 0.1 or risk_per_trade_pct > 10.0:
                return ToolResult(
                    success=False,
                    error={
                        "code": 400,
                        "message": f"Invalid risk percentage: {risk_per_trade_pct}. Must be between 0.1 and 10.0."
                    }
                )
            
            # Validate current price
            if current_price <= 0:
                return ToolResult(
                    success=False,
                    error={
                        "code": 400,
                        "message": f"Invalid current price: {current_price}. Must be positive."
                    }
                )
            
            # Validate stop loss if provided
            if stop_loss_price is not None:
                if stop_loss_price <= 0:
                    return ToolResult(
                        success=False,
                        error={
                            "code": 400,
                            "message": f"Invalid stop loss price: {stop_loss_price}. Must be positive."
                        }
                    )
                if stop_loss_price >= current_price:
                    return ToolResult(
                        success=False,
                        error={
                            "code": 400,
                            "message": "Stop loss price must be below current price for long positions."
                        }
                    )
            
            # Validate target price if provided
            if target_price is not None:
                if target_price <= 0:
                    return ToolResult(
                        success=False,
                        error={
                            "code": 400,
                            "message": f"Invalid target price: {target_price}. Must be positive."
                        }
                    )
                if target_price <= current_price:
                    return ToolResult(
                        success=False,
                        error={
                            "code": 400,
                            "message": "Target price must be above current price for long positions."
                        }
                    )
            
            logger.info(
                f"Calculating risk for {ticker} at ${current_price}",
                extra={
                    "ticker": ticker,
                    "account_value": account_value,
                    "risk_pct": risk_per_trade_pct
                }
            )
            
            # Calculate risk (this is fast, no need for timeout)
            result = await self.adapter.calculate_risk(
                ticker=ticker,
                account_value=account_value,
                risk_per_trade_pct=risk_per_trade_pct,
                current_price=current_price,
                stop_loss_price=stop_loss_price,
                target_price=target_price
            )
            
            # Calculate execution time
            execution_time = (datetime.utcnow() - start_time).total_seconds()
            result["execution_time_seconds"] = execution_time
            
            logger.info(
                f"Risk calculation completed for {ticker} in {execution_time:.2f}s",
                extra={"ticker": ticker, "execution_time": execution_time}
            )
            
            return ToolResult(
                success=True,
                data=result
            )
            
        except Exception as e:
            logger.exception(f"Error calculating risk for {ticker}: {e}")
            return ToolResult(
                success=False,
                error={
                    "code": 500,
                    "message": f"Internal error during risk calculation: {str(e)}"
                }
            )
