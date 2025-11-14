"""Backtesting tool implementation"""

import asyncio
import logging
from datetime import datetime
from typing import Any, Dict, Optional

from ..adapters.tradingagents import TradingAgentsAdapter
from ..protocol.schemas import Tool, ToolResult

logger = logging.getLogger(__name__)


class BacktestStrategyTool:
    """
    Backtesting tool that runs strategy backtests on historical data.
    
    This tool executes backtests using the TradingAgents backtesting engine,
    returning performance metrics, trade history, and equity curve.
    """
    
    TOOL_NAME = "backtest_strategy"
    TOOL_DESCRIPTION = (
        "Run a backtest of a trading strategy on historical data. Returns performance "
        "metrics including total return, Sharpe ratio, maximum drawdown, win rate, "
        "and detailed trade history."
    )
    
    INPUT_SCHEMA = {
        "type": "object",
        "properties": {
            "ticker": {
                "type": "string",
                "description": "Stock ticker symbol (e.g., 'AAPL', 'TSLA')",
                "pattern": "^[A-Z]{1,5}$"
            },
            "start_date": {
                "type": "string",
                "description": "Start date in YYYY-MM-DD format",
                "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
            },
            "end_date": {
                "type": "string",
                "description": "End date in YYYY-MM-DD format",
                "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
            },
            "strategy_config": {
                "type": "object",
                "description": "Strategy configuration parameters",
                "properties": {
                    "initial_capital": {
                        "type": "number",
                        "minimum": 0,
                        "description": "Initial capital amount",
                        "default": 10000
                    },
                    "position_size_pct": {
                        "type": "number",
                        "minimum": 0,
                        "maximum": 100,
                        "description": "Position size as percentage of capital",
                        "default": 10
                    },
                    "risk_per_trade_pct": {
                        "type": "number",
                        "minimum": 0,
                        "maximum": 100,
                        "description": "Risk per trade percentage",
                        "default": 2
                    },
                    "commission_rate": {
                        "type": "number",
                        "minimum": 0,
                        "maximum": 1,
                        "description": "Commission rate (e.g., 0.001 for 0.1%)",
                        "default": 0.001
                    },
                    "slippage": {
                        "type": "number",
                        "minimum": 0,
                        "maximum": 1,
                        "description": "Slippage rate (e.g., 0.001 for 0.1%)",
                        "default": 0.001
                    }
                }
            }
        },
        "required": ["ticker", "start_date", "end_date"]
    }
    
    def __init__(self, adapter: TradingAgentsAdapter):
        """
        Initialize the backtest strategy tool.
        
        Args:
            adapter: TradingAgents adapter for executing backtests
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
        start_date: str,
        end_date: str,
        strategy_config: Optional[Dict[str, Any]] = None
    ) -> ToolResult:
        """
        Execute backtest.
        
        Args:
            ticker: Stock ticker symbol (e.g., "AAPL")
            start_date: Start date in YYYY-MM-DD format
            end_date: End date in YYYY-MM-DD format
            strategy_config: Optional strategy configuration
            
        Returns:
            ToolResult with backtest data or error
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
            
            # Validate date format
            try:
                start_dt = datetime.strptime(start_date, "%Y-%m-%d")
                end_dt = datetime.strptime(end_date, "%Y-%m-%d")
                
                if start_dt >= end_dt:
                    return ToolResult(
                        success=False,
                        error={
                            "code": 400,
                            "message": "Start date must be before end date"
                        }
                    )
                
                if end_dt > datetime.now():
                    return ToolResult(
                        success=False,
                        error={
                            "code": 400,
                            "message": "End date cannot be in the future"
                        }
                    )
                    
            except ValueError as e:
                return ToolResult(
                    success=False,
                    error={
                        "code": 400,
                        "message": f"Invalid date format: {str(e)}. Use YYYY-MM-DD."
                    }
                )
            
            # Use default strategy config if not provided
            if strategy_config is None:
                strategy_config = {}
            
            logger.info(
                f"Starting backtest for {ticker} from {start_date} to {end_date}",
                extra={"ticker": ticker, "start_date": start_date, "end_date": end_date}
            )
            
            # Run backtest with timeout
            try:
                result = await asyncio.wait_for(
                    self.adapter.run_backtest(
                        ticker=ticker,
                        start_date=start_date,
                        end_date=end_date,
                        strategy_config=strategy_config
                    ),
                    timeout=300.0  # 5 minute timeout for backtests
                )
            except asyncio.TimeoutError:
                logger.error(f"Backtest timeout for {ticker}")
                return ToolResult(
                    success=False,
                    error={
                        "code": 504,
                        "message": f"Backtest timeout after 300 seconds for {ticker}"
                    }
                )
            
            # Calculate execution time
            execution_time = (datetime.utcnow() - start_time).total_seconds()
            result["execution_time_seconds"] = execution_time
            
            logger.info(
                f"Backtest completed for {ticker} in {execution_time:.2f}s",
                extra={"ticker": ticker, "execution_time": execution_time}
            )
            
            return ToolResult(
                success=True,
                data=result
            )
            
        except Exception as e:
            logger.exception(f"Error backtesting {ticker}: {e}")
            return ToolResult(
                success=False,
                error={
                    "code": 500,
                    "message": f"Internal error during backtest: {str(e)}"
                }
            )
