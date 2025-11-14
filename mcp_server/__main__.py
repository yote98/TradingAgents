"""
MCP Server entry point
"""

import asyncio
import logging
import sys
import os
from typing import Dict, Any

from .server import MCPServer, Tool, Resource
from .config.settings import ServerConfig
from .adapters.tradingagents import TradingAgentsAdapter
from .tools.analyze import AnalyzeStockTool
from .tools.backtest import BacktestStrategyTool
from .tools.risk import CalculateRiskTool
from .tools.sentiment import GetSentimentTool
from .resources.coach_plans import CoachPlansResource

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(sys.stderr)  # Log to stderr, not stdout
    ]
)

logger = logging.getLogger(__name__)


async def setup_server(config: ServerConfig) -> MCPServer:
    """
    Set up MCP server with all tools and resources
    
    Args:
        config: Server configuration
        
    Returns:
        Configured MCPServer instance
    """
    # Create server
    server = MCPServer(config.to_dict())
    
    # Create TradingAgents adapter
    adapter = TradingAgentsAdapter(config.to_dict())
    
    # Register analyze_stock tool
    analyze_tool = AnalyzeStockTool(adapter)
    tool_def = analyze_tool.get_tool_definition()
    
    await server.register_tool(Tool(
        name=tool_def.name,
        description=tool_def.description,
        input_schema=tool_def.input_schema,
        handler=analyze_tool.execute
    ))
    
    # Register backtest_strategy tool
    backtest_tool = BacktestStrategyTool(adapter)
    backtest_def = backtest_tool.get_tool_definition()
    
    await server.register_tool(Tool(
        name=backtest_def.name,
        description=backtest_def.description,
        input_schema=backtest_def.input_schema,
        handler=backtest_tool.execute
    ))
    
    # Register calculate_risk tool
    risk_tool = CalculateRiskTool(adapter)
    risk_def = risk_tool.get_tool_definition()
    
    await server.register_tool(Tool(
        name=risk_def.name,
        description=risk_def.description,
        input_schema=risk_def.input_schema,
        handler=risk_tool.execute
    ))
    
    # Register get_sentiment tool
    sentiment_tool = GetSentimentTool(adapter)
    sentiment_def = sentiment_tool.get_tool_definition()
    
    await server.register_tool(Tool(
        name=sentiment_def.name,
        description=sentiment_def.description,
        input_schema=sentiment_def.input_schema,
        handler=sentiment_tool.execute
    ))
    
    logger.info("All tools registered successfully")
    
    # Skip resources for now - just get tools working
    logger.info("Skipping resources registration for now")
    
    return server


async def main():
    """Main entry point"""
    try:
        # Load configuration
        config = ServerConfig.from_env()
        
        # Set up server
        server = await setup_server(config)
        
        # Start server
        await server.start()
        
    except KeyboardInterrupt:
        logger.info("Shutting down...")
    except Exception as e:
        logger.error(f"Fatal error: {e}", exc_info=True)
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
