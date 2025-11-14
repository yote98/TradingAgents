"""
Test script for analyze_stock tool
"""

import asyncio
import sys
import os

# Add mcp_server to path
sys.path.insert(0, os.path.dirname(__file__))

from mcp_server.config.settings import ServerConfig
from mcp_server.adapters.tradingagents import TradingAgentsAdapter
from mcp_server.tools.analyze import AnalyzeStockTool


async def test_analyze_tool():
    """Test the analyze_stock tool"""
    
    print("=" * 60)
    print("Testing analyze_stock tool")
    print("=" * 60)
    
    # Create configuration
    config = ServerConfig.from_env()
    print(f"\nConfiguration:")
    print(f"  Deep Think LLM: {config.deep_think_llm}")
    print(f"  Quick Think LLM: {config.quick_think_llm}")
    print(f"  Max Debate Rounds: {config.max_debate_rounds}")
    
    # Create adapter
    print("\nCreating TradingAgents adapter...")
    adapter = TradingAgentsAdapter(config.to_dict())
    
    # Create tool
    print("Creating analyze_stock tool...")
    tool = AnalyzeStockTool(adapter)
    
    # Get tool definition
    tool_def = tool.get_tool_definition()
    print(f"\nTool Definition:")
    print(f"  Name: {tool_def.name}")
    print(f"  Description: {tool_def.description}")
    print(f"  Required params: {tool_def.input_schema.get('required', [])}")
    
    # Test with a simple ticker
    ticker = "AAPL"
    analysts = ["market"]  # Just one analyst for quick test
    
    print(f"\n{'=' * 60}")
    print(f"Testing analysis for {ticker} with analysts: {analysts}")
    print(f"{'=' * 60}\n")
    
    try:
        result = await tool.execute(
            ticker=ticker,
            analysts=analysts,
            config={"max_debate_rounds": 1}
        )
        
        if result.success:
            print("✓ Analysis completed successfully!")
            print(f"\nExecution time: {result.data.get('execution_time_seconds', 0):.2f}s")
            print(f"\nTicker: {result.data.get('ticker')}")
            print(f"Timestamp: {result.data.get('timestamp')}")
            
            # Print analyst reports
            analysts_data = result.data.get('analysts', {})
            print(f"\nAnalysts ({len(analysts_data)}):")
            for analyst_name, report in analysts_data.items():
                print(f"  - {analyst_name}: {report.get('sentiment', 'N/A')}")
            
            # Print recommendation
            rec = result.data.get('recommendation', {})
            print(f"\nRecommendation:")
            print(f"  Action: {rec.get('action', 'N/A')}")
            print(f"  Confidence: {rec.get('confidence', 0):.2%}")
            
        else:
            print("✗ Analysis failed!")
            print(f"Error: {result.error}")
            
    except Exception as e:
        print(f"✗ Exception occurred: {e}")
        import traceback
        traceback.print_exc()
    
    print(f"\n{'=' * 60}")
    print("Test completed")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    asyncio.run(test_analyze_tool())
