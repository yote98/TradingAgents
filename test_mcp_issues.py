#!/usr/bin/env python3
"""
Test script to reproduce the MCP issues
"""
import asyncio
import sys
sys.path.insert(0, '.')

from mcp_server.adapters.tradingagents import TradingAgentsAdapter
from mcp_server.tools.backtest import BacktestStrategyTool
from mcp_server.tools.sentiment import GetSentimentTool

async def test_backtest_issue():
    """Test the backtest engine issue"""
    print("🧪 Testing Backtest Engine...")
    try:
        config = {
            "deep_think_llm": "gpt-4o-mini",
            "quick_think_llm": "gpt-4o-mini",
            "max_debate_rounds": 1
        }
        adapter = TradingAgentsAdapter(config)
        tool = BacktestStrategyTool(adapter)
        
        result = await tool.execute(
            ticker="AAPL",
            start_date="2024-01-01",
            end_date="2024-06-01",
            strategy_config={"initial_capital": 10000}
        )
        
        if result.success:
            print("✅ Backtest: SUCCESS")
            print(f"   Data keys: {list(result.data.keys())}")
        else:
            print("❌ Backtest: FAILED")
            print(f"   Error: {result.error}")
            
    except Exception as e:
        print(f"❌ Backtest: EXCEPTION - {e}")
        import traceback
        traceback.print_exc()

async def test_sentiment_issue():
    """Test the sentiment analysis issue"""
    print("\n🧪 Testing Sentiment Analysis...")
    try:
        config = {
            "deep_think_llm": "gpt-4o-mini",
            "quick_think_llm": "gpt-4o-mini"
        }
        adapter = TradingAgentsAdapter(config)
        tool = GetSentimentTool(adapter)
        
        result = await tool.execute(
            ticker="AAPL",
            sources=["twitter", "stocktwits"],
            time_range="24h"
        )
        
        if result.success:
            print("✅ Sentiment: SUCCESS")
            print(f"   Data keys: {list(result.data.keys())}")
        else:
            print("❌ Sentiment: FAILED")
            print(f"   Error: {result.error}")
            
    except Exception as e:
        print(f"❌ Sentiment: EXCEPTION - {e}")
        import traceback
        traceback.print_exc()

async def main():
    print("🔍 Reproducing MCP Issues")
    print("=" * 50)
    
    await test_backtest_issue()
    await test_sentiment_issue()
    
    print("\n" + "=" * 50)
    print("✅ Test complete")

if __name__ == "__main__":
    asyncio.run(main())
