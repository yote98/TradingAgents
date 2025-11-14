"""
Test script for calculate_risk tool
"""

import asyncio
import sys
import os

# Add mcp_server to path
sys.path.insert(0, os.path.dirname(__file__))

from mcp_server.config.settings import ServerConfig
from mcp_server.adapters.tradingagents import TradingAgentsAdapter
from mcp_server.tools.risk import CalculateRiskTool


async def test_risk_tool():
    """Test the calculate_risk tool"""
    
    print("=" * 60)
    print("Testing calculate_risk tool")
    print("=" * 60)
    
    # Create configuration
    config = ServerConfig.from_env()
    
    # Create adapter
    print("\nCreating TradingAgents adapter...")
    adapter = TradingAgentsAdapter(config.to_dict())
    
    # Create tool
    print("Creating calculate_risk tool...")
    tool = CalculateRiskTool(adapter)
    
    # Get tool definition
    tool_def = tool.get_tool_definition()
    print(f"\nTool Definition:")
    print(f"  Name: {tool_def.name}")
    print(f"  Description: {tool_def.description}")
    print(f"  Required params: {tool_def.input_schema.get('required', [])}")
    
    # Test scenarios
    scenarios = [
        {
            "name": "Conservative Trade",
            "ticker": "AAPL",
            "account_value": 10000,
            "risk_per_trade_pct": 1.0,
            "current_price": 150.00,
            "stop_loss_price": 147.00,
            "target_price": 156.00
        },
        {
            "name": "Moderate Trade (auto stop loss)",
            "ticker": "TSLA",
            "account_value": 25000,
            "risk_per_trade_pct": 2.0,
            "current_price": 250.00,
            "target_price": 270.00
        },
        {
            "name": "Aggressive Trade",
            "ticker": "NVDA",
            "account_value": 50000,
            "risk_per_trade_pct": 3.0,
            "current_price": 500.00,
            "stop_loss_price": 485.00,
            "target_price": 550.00
        }
    ]
    
    for scenario in scenarios:
        print(f"\n{'=' * 60}")
        print(f"Scenario: {scenario['name']}")
        print(f"{'=' * 60}")
        print(f"Ticker: {scenario['ticker']}")
        print(f"Account Value: ${scenario['account_value']:,.2f}")
        print(f"Risk per Trade: {scenario['risk_per_trade_pct']}%")
        print(f"Current Price: ${scenario['current_price']:.2f}")
        if 'stop_loss_price' in scenario:
            print(f"Stop Loss: ${scenario['stop_loss_price']:.2f}")
        if 'target_price' in scenario:
            print(f"Target Price: ${scenario['target_price']:.2f}")
        print()
        
        try:
            result = await tool.execute(
                ticker=scenario['ticker'],
                account_value=scenario['account_value'],
                risk_per_trade_pct=scenario['risk_per_trade_pct'],
                current_price=scenario['current_price'],
                stop_loss_price=scenario.get('stop_loss_price'),
                target_price=scenario.get('target_price')
            )
            
            if result.success:
                print("✓ Risk calculation completed!")
                
                data = result.data
                sizing = data.get('position_sizing', {})
                risk_reward = data.get('risk_reward', {})
                warnings = data.get('warnings', [])
                
                print(f"\nPosition Sizing:")
                print(f"  Recommended Shares: {sizing.get('recommended_shares')}")
                print(f"  Position Value: ${sizing.get('position_value'):,.2f}")
                print(f"  Position % of Account: {sizing.get('position_pct_of_account'):.2f}%")
                print(f"  Risk Amount: ${sizing.get('risk_amount'):,.2f}")
                print(f"  Risk per Share: ${sizing.get('risk_per_share'):.2f}")
                
                print(f"\nStop Loss:")
                print(f"  Price: ${data.get('stop_loss_price'):.2f}")
                print(f"  Percentage: {data.get('stop_loss_pct'):.2f}%")
                
                if risk_reward.get('risk_reward_ratio') is not None:
                    print(f"\nRisk/Reward Analysis:")
                    print(f"  Risk/Reward Ratio: {risk_reward.get('risk_reward_ratio'):.2f}:1")
                    print(f"  Potential Profit: ${risk_reward.get('potential_profit'):,.2f} ({risk_reward.get('potential_profit_pct'):.2f}%)")
                    print(f"  Potential Loss: ${risk_reward.get('potential_loss'):,.2f} ({risk_reward.get('potential_loss_pct'):.2f}%)")
                
                if warnings:
                    print(f"\n⚠️  Warnings:")
                    for warning in warnings:
                        print(f"  - {warning}")
                
            else:
                print("✗ Risk calculation failed!")
                print(f"Error: {result.error}")
                
        except Exception as e:
            print(f"✗ Exception occurred: {e}")
            import traceback
            traceback.print_exc()
    
    print(f"\n{'=' * 60}")
    print("All tests completed")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    asyncio.run(test_risk_tool())
