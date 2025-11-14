"""Stock analysis tool implementation"""

import asyncio
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

from ..adapters.tradingagents import TradingAgentsAdapter
from ..protocol.schemas import Tool, ToolResult

logger = logging.getLogger(__name__)


class AnalyzeStockTool:
    """
    Stock analysis tool that runs multi-agent analysis using TradingAgents.
    
    This tool executes the full TradingAgents workflow including:
    - Multiple analyst reports (market, fundamentals, news, social)
    - Bull/Bear debate rounds
    - Trading recommendation with confidence
    """
    
    TOOL_NAME = "analyze_stock"
    TOOL_DESCRIPTION = (
        "Analyze a stock using multiple AI analysts. Returns comprehensive analysis "
        "including market data, fundamentals, news sentiment, social sentiment, "
        "bull/bear debate, and trading recommendation."
    )
    
    INPUT_SCHEMA = {
        "type": "object",
        "properties": {
            "ticker": {
                "type": "string",
                "description": "Stock ticker symbol (e.g., 'AAPL', 'TSLA')",
                "pattern": "^[A-Z]{1,5}$"
            },
            "analysts": {
                "type": "array",
                "items": {
                    "type": "string",
                    "enum": ["market", "fundamentals", "news", "social"]
                },
                "description": "List of analysts to include in analysis",
                "default": ["market", "fundamentals", "news", "social"]
            },
            "config": {
                "type": "object",
                "description": "Optional configuration overrides",
                "properties": {
                    "deep_think_llm": {
                        "type": "string",
                        "description": "LLM model for deep thinking tasks"
                    },
                    "quick_think_llm": {
                        "type": "string",
                        "description": "LLM model for quick thinking tasks"
                    },
                    "max_debate_rounds": {
                        "type": "integer",
                        "minimum": 1,
                        "maximum": 5,
                        "description": "Maximum number of debate rounds"
                    }
                }
            }
        },
        "required": ["ticker"]
    }
    
    def __init__(self, adapter: TradingAgentsAdapter):
        """
        Initialize the analyze stock tool.
        
        Args:
            adapter: TradingAgents adapter for executing analysis
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
        analysts: Optional[List[str]] = None,
        config: Optional[Dict[str, Any]] = None
    ) -> ToolResult:
        """
        Execute stock analysis.
        
        Args:
            ticker: Stock ticker symbol (e.g., "AAPL")
            analysts: List of analysts to include (default: all)
            config: Optional configuration overrides
            
        Returns:
            ToolResult with analysis data or error
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
            
            # Use default analysts if not specified
            if analysts is None:
                analysts = ["market", "fundamentals", "news", "social"]
            
            # Validate analyst names
            valid_analysts = {"market", "fundamentals", "news", "social"}
            invalid = set(analysts) - valid_analysts
            if invalid:
                return ToolResult(
                    success=False,
                    error={
                        "code": 400,
                        "message": f"Invalid analysts: {invalid}. Must be one of: {valid_analysts}"
                    }
                )
            
            logger.info(
                f"Starting analysis for {ticker} with analysts: {analysts}",
                extra={"ticker": ticker, "analysts": analysts}
            )
            
            # Run analysis with timeout
            try:
                result = await asyncio.wait_for(
                    self.adapter.run_analysis(
                        ticker=ticker,
                        analysts=analysts,
                        config_overrides=config
                    ),
                    timeout=120.0  # 2 minute timeout
                )
            except asyncio.TimeoutError:
                logger.error(f"Analysis timeout for {ticker}")
                return ToolResult(
                    success=False,
                    error={
                        "code": 504,
                        "message": f"Analysis timeout after 120 seconds for {ticker}"
                    }
                )
            
            # Calculate execution time
            execution_time = (datetime.utcnow() - start_time).total_seconds()
            result["execution_time_seconds"] = execution_time
            
            logger.info(
                f"Analysis completed for {ticker} in {execution_time:.2f}s",
                extra={"ticker": ticker, "execution_time": execution_time}
            )
            
            return ToolResult(
                success=True,
                data=result
            )
            
        except Exception as e:
            logger.exception(f"Error analyzing {ticker}: {e}")
            return ToolResult(
                success=False,
                error={
                    "code": 500,
                    "message": f"Internal error during analysis: {str(e)}"
                }
            )
