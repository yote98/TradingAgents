"""
JSON schemas for MCP tools and resources
"""

from dataclasses import dataclass
from typing import Dict, Any, Optional, Callable


@dataclass
class Tool:
    """MCP tool definition"""
    name: str
    description: str
    input_schema: Dict[str, Any]


@dataclass
class ToolResult:
    """Result from tool execution"""
    success: bool
    data: Optional[Dict[str, Any]] = None
    error: Optional[Dict[str, Any]] = None


@dataclass
class Resource:
    """MCP resource definition"""
    uri_template: str
    name: str
    description: str
    mime_type: str
    handler: Optional[Callable] = None


@dataclass
class ResourceResult:
    """Result from resource read"""
    success: bool
    data: Optional[Dict[str, Any]] = None
    error: Optional[Dict[str, Any]] = None


# Tool Schemas

ANALYZE_STOCK_SCHEMA: Dict[str, Any] = {
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
            },
            "description": "Optional configuration overrides"
        }
    },
    "required": ["ticker"]
}


BACKTEST_STRATEGY_SCHEMA: Dict[str, Any] = {
    "type": "object",
    "properties": {
        "ticker": {
            "type": "string",
            "description": "Stock ticker symbol",
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
                "stop_loss_pct": {
                    "type": "number",
                    "minimum": 0,
                    "maximum": 100,
                    "description": "Stop loss percentage",
                    "default": 2
                },
                "take_profit_pct": {
                    "type": "number",
                    "minimum": 0,
                    "description": "Take profit percentage",
                    "default": 5
                }
            },
            "description": "Strategy configuration parameters"
        }
    },
    "required": ["ticker", "start_date", "end_date"]
}


CALCULATE_RISK_SCHEMA: Dict[str, Any] = {
    "type": "object",
    "properties": {
        "ticker": {
            "type": "string",
            "description": "Stock ticker symbol",
            "pattern": "^[A-Z]{1,5}$"
        },
        "account_value": {
            "type": "number",
            "minimum": 0,
            "description": "Total account value"
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
            "description": "Optional stop loss price"
        }
    },
    "required": ["ticker", "account_value", "risk_per_trade_pct", "current_price"]
}


GET_SENTIMENT_SCHEMA: Dict[str, Any] = {
    "type": "object",
    "properties": {
        "ticker": {
            "type": "string",
            "description": "Stock ticker symbol",
            "pattern": "^[A-Z]{1,5}$"
        },
        "sources": {
            "type": "array",
            "items": {
                "type": "string",
                "enum": ["twitter", "stocktwits", "reddit"]
            },
            "description": "Social media sources to query",
            "default": ["twitter", "stocktwits", "reddit"]
        },
        "timeframe": {
            "type": "string",
            "enum": ["1h", "6h", "12h", "24h", "7d"],
            "description": "Timeframe for sentiment data",
            "default": "24h"
        }
    },
    "required": ["ticker"]
}


# Resource Schemas

COACH_PLANS_SCHEMA: Dict[str, Any] = {
    "type": "object",
    "properties": {
        "ticker": {
            "type": "string",
            "description": "Optional ticker to filter coach plans",
            "pattern": "^[A-Z]{1,5}$"
        },
        "limit": {
            "type": "integer",
            "minimum": 1,
            "maximum": 100,
            "description": "Maximum number of plans to return",
            "default": 10
        },
        "days": {
            "type": "integer",
            "minimum": 1,
            "maximum": 90,
            "description": "Number of days to look back",
            "default": 30
        }
    }
}


# Tool Definitions

TOOL_DEFINITIONS = {
    "analyze_stock": {
        "name": "analyze_stock",
        "description": "Run comprehensive multi-agent stock analysis using Market, Fundamentals, News, and Social analysts. Returns detailed bull/bear analysis with specific trading recommendations.",
        "inputSchema": ANALYZE_STOCK_SCHEMA
    },
    "backtest_strategy": {
        "name": "backtest_strategy",
        "description": "Test trading strategies on historical data. Returns performance metrics including total return, Sharpe ratio, maximum drawdown, and win rate.",
        "inputSchema": BACKTEST_STRATEGY_SCHEMA
    },
    "calculate_risk": {
        "name": "calculate_risk",
        "description": "Calculate position sizing and risk metrics based on account size and risk tolerance. Returns recommended position size, stop loss price, and risk-reward ratio.",
        "inputSchema": CALCULATE_RISK_SCHEMA
    },
    "get_sentiment": {
        "name": "get_sentiment",
        "description": "Retrieve social media sentiment for stocks from Twitter, StockTwits, and Reddit. Returns aggregated sentiment score, volume metrics, and trending topics.",
        "inputSchema": GET_SENTIMENT_SCHEMA
    }
}


# Resource Definitions

RESOURCE_DEFINITIONS = {
    "coach_plans": {
        "uri_template": "coach://plans/{ticker}",
        "name": "Coach Trading Plans",
        "description": "Access human coach trading plans and guidance from Discord. Returns recent plans with coach metadata, timestamps, and confidence levels.",
        "mimeType": "application/json",
        "schema": COACH_PLANS_SCHEMA
    }
}
