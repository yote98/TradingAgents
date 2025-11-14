"""
Test script for backtest_strategy tool
"""

import asyncio
import sys
import os

# Add mcp_server to path
sys.path.insert(0, os.path.dirname(__file__))

from mcp_server.config.settings import ServerConfig
from mcp_server.adapters.tradingagents import TradingAgentsAdapter
from mcp_server.tools.backtest import BacktestStrategyTool


async def test_backtest_tool():
    """Test the backtest_strategy tool"""
    
    print("=" * 60)
    print("Testing backtest_strategy tool")
    print("=" * 60)
    
    # Create configuration
    config = ServerConfig.from_env()
    print(f"\nConfiguration:")
    print(f"  Deep Think LLM: {config.deep_think_llm}")
    print(f"  Quick Think LLM: {config.quick_think_llm}")
    
    # Create adapter
    print("\nCreating TradingAgents adapter...")
    adapter = TradingAgentsAdapter(config.to_dict())
    
    # Create tool
    print("Creating backtest_strategy tool...")
    tool = BacktestStrategyTool(adapter)
    
    # Get tool definition
    tool_def = tool.get_tool_definition()
    print(f"\nTool Definition:")
    print(f"  Name: {tool_def.name}")
    print(f"  Description: {tool_def.description}")
    print(f"  Required params: {tool_def.input_schema.get('required', [])}")
    
    # Test with a simple backtest
    ticker = "AAPL"
    start_date = "2023-01-01"
    end_date = "2023-03-31"  # Short period for quick test
    
    strategy_config = {
        "initial_capital": 10000,
        "position_size_pct": 10,
        "risk_per_trade_pct": 2,
        "commission_rate": 0.001,
        "slippage": 0.001
    }
    
    print(f"\n{'=' * 60}")
    print(f"Testing backtest for {ticker}")
    print(f"Period: {start_date} to {end_date}")
    print(f"Initial Capital: ${strategy_config['initial_capital']:,.2f}")
    print(f"{'=' * 60}\n")
    
    try:
        result = await tool.execute(
            ticker=ticker,
            start_date=start_date,
            end_date=end_date,
            strategy_config=strategy_config
        )
        
        if result.success:
            print("✓ Backtest completed successfully!")
            print(f"\nExecution time: {result.data.get('execution_time_seconds', 0):.2f}s")
            
            # Print performance metrics
            perf = result.data.get('performance', {})
            print(f"\nPerformance Metrics:")
            print(f"  Initial Balance: ${result.data.get('initial_balance', 0):,.2f}")
            print(f"  Final Balance: ${result.data.get('final_balance', 0):,.2f}")
            print(f"  Total Return: {perf.get('total_return_pct', 0):.2f}%")
            print(f"  Annualized Return: {perf.get('annualized_return_pct', 0):.2f}%")
            print(f"  Sharpe Ratio: {perf.get('sharpe_ratio', 0):.2f}")
            print(f"  Max Drawdown: {perf.get('max_drawdown_pct', 0):.2f}%")
            print(f"  Win Rate: {perf.get('win_rate', 0):.2f}%")
            print(f"  Total Trades: {perf.get('total_trades', 0)}")
            
            # Print trade summary
            trades = result.data.get('trades', [])
            print(f"\nTrade Summary:")
            print(f"  Trades shown: {len(trades)} of {result.data.get('total_trades_count', 0)}")
            if trades:
                print(f"  First trade: {trades[0].get('date')} - {trades[0].get('action')}")
                print(f"  Last trade: {trades[-1].get('date')} - {trades[-1].get('action')}")
            
        else:
            print("✗ Backtest failed!")
            print(f"Error: {result.error}")
            
    except Exception as e:
        print(f"✗ Exception occurred: {e}")
        import traceback
        traceback.print_exc()
    
    print(f"\n{'=' * 60}")
    print("Test completed")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    asyncio.run(test_backtest_tool())
