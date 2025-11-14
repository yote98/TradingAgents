"""Sentiment analysis tool implementation"""

import asyncio
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

from ..adapters.tradingagents import TradingAgentsAdapter
from ..protocol.schemas import Tool, ToolResult

logger = logging.getLogger(__name__)


class GetSentimentTool:
    """
    Social media sentiment analysis tool.
    
    This tool analyzes social media sentiment from Twitter, StockTwits, and Reddit
    for a given stock ticker, returning aggregated sentiment scores and key mentions.
    """
    
    TOOL_NAME = "get_sentiment"
    TOOL_DESCRIPTION = (
        "Analyze social media sentiment for a stock from Twitter, StockTwits, and Reddit. "
        "Returns sentiment scores, volume metrics, key mentions, and trending topics."
    )
    
    INPUT_SCHEMA = {
        "type": "object",
        "properties": {
            "ticker": {
                "type": "string",
                "description": "Stock ticker symbol (e.g., 'AAPL', 'TSLA')",
                "pattern": "^[A-Z]{1,5}$"
            },
            "sources": {
                "type": "array",
                "items": {
                    "type": "string",
                    "enum": ["twitter", "stocktwits", "reddit"]
                },
                "description": "Social media sources to analyze",
                "default": ["twitter", "stocktwits"]
            },
            "time_range": {
                "type": "string",
                "enum": ["1h", "4h", "24h", "7d"],
                "description": "Time range for sentiment analysis",
                "default": "24h"
            },
            "include_details": {
                "type": "boolean",
                "description": "Include detailed mentions and trending topics",
                "default": True
            }
        },
        "required": ["ticker"]
    }
    
    def __init__(self, adapter: TradingAgentsAdapter):
        """
        Initialize the get sentiment tool.
        
        Args:
            adapter: TradingAgents adapter for sentiment analysis
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
        sources: Optional[List[str]] = None,
        time_range: str = "24h",
        include_details: bool = True
    ) -> ToolResult:
        """
        Execute sentiment analysis.
        
        Args:
            ticker: Stock ticker symbol (e.g., "AAPL")
            sources: List of social media sources to analyze
            time_range: Time range for analysis (1h, 4h, 24h, 7d)
            include_details: Whether to include detailed mentions
            
        Returns:
            ToolResult with sentiment analysis data or error
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
            
            # Use default sources if not specified
            if sources is None:
                sources = ["twitter", "stocktwits"]
            
            # Validate sources
            valid_sources = {"twitter", "stocktwits", "reddit"}
            invalid = set(sources) - valid_sources
            if invalid:
                return ToolResult(
                    success=False,
                    error={
                        "code": 400,
                        "message": f"Invalid sources: {invalid}. Must be one of: {valid_sources}"
                    }
                )
            
            # Validate time range
            valid_ranges = {"1h", "4h", "24h", "7d"}
            if time_range not in valid_ranges:
                return ToolResult(
                    success=False,
                    error={
                        "code": 400,
                        "message": f"Invalid time range: {time_range}. Must be one of: {valid_ranges}"
                    }
                )
            
            logger.info(
                f"Analyzing sentiment for {ticker} from {sources} over {time_range}",
                extra={
                    "ticker": ticker,
                    "sources": sources,
                    "time_range": time_range
                }
            )
            
            # Run sentiment analysis with timeout
            try:
                result = await asyncio.wait_for(
                    self.adapter.get_sentiment(
                        ticker=ticker,
                        sources=sources,
                        timeframe=time_range,  # Note: adapter uses 'timeframe' parameter
                    ),
                    timeout=60.0  # 1 minute timeout
                )
            except asyncio.TimeoutError:
                logger.error(f"Sentiment analysis timeout for {ticker}")
                return ToolResult(
                    success=False,
                    error={
                        "code": 504,
                        "message": f"Sentiment analysis timeout after 60 seconds for {ticker}"
                    }
                )
            
            # Calculate execution time
            execution_time = (datetime.utcnow() - start_time).total_seconds()
            result["execution_time_seconds"] = execution_time
            
            logger.info(
                f"Sentiment analysis completed for {ticker} in {execution_time:.2f}s",
                extra={"ticker": ticker, "execution_time": execution_time}
            )
            
            return ToolResult(
                success=True,
                data=result
            )
            
        except Exception as e:
            logger.exception(f"Error analyzing sentiment for {ticker}: {e}")
            return ToolResult(
                success=False,
                error={
                    "code": 500,
                    "message": f"Internal error during sentiment analysis: {str(e)}"
                }
            )
