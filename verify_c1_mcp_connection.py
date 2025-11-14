"""
Verify that C1 can see and access the MCP TradingAgents tools
"""
import json
import os

def check_mcp_config():
    """Check MCP configuration"""
    print("🔧 Checking MCP Configuration")
    print("=" * 60)
    
    config_path = r"C:\Users\CVN B850I GAMING\.kiro\settings\mcp.json"
    
    try:
        with open(config_path, 'r') as f:
            # Read as text first to handle PowerShell formatting
            content = f.read()
            # Try to parse as JSON
            config = json.loads(content)
        
        if 'mcpServers' in config and 'tradingagents' in config['mcpServers']:
            ta_config = config['mcpServers']['tradingagents']
            
            print("✅ TradingAgents MCP Server Found")
            print(f"\n📋 Configuration:")
            print(f"   Command: {ta_config.get('command')}")
            print(f"   Args: {ta_config.get('args')}")
            print(f"   Disabled: {ta_config.get('disabled', False)}")
            print(f"   Auto-approve: {ta_config.get('autoApprove', [])}")
            
            if ta_config.get('disabled', False):
                print("\n⚠️  WARNING: MCP server is DISABLED!")
                print("   To enable: Set 'disabled': false in mcp.json")
                return False
            
            print("\n✅ MCP server is ENABLED")
            return True
        else:
            print("❌ TradingAgents not found in MCP config")
            return False
            
    except json.JSONDecodeError as e:
        print(f"❌ Error parsing JSON: {e}")
        print("   The mcp.json file may have formatting issues")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def list_available_tools():
    """List all available MCP tools"""
    print("\n🛠️  Available MCP Tools")
    print("=" * 60)
    
    try:
        from mcp_server.tools.analyze import AnalyzeStockTool
        from mcp_server.tools.backtest import BacktestStrategyTool
        from mcp_server.tools.risk import CalculateRiskTool
        from mcp_server.tools.sentiment import GetSentimentTool
        
        tools = [
            ("analyze_stock", "Comprehensive multi-agent stock analysis"),
            ("backtest_strategy", "Historical strategy backtesting"),
            ("calculate_risk", "Position sizing and risk calculations"),
            ("get_sentiment", "Social media sentiment analysis")
        ]
        
        print("✅ MCP Tools Available:\n")
        for name, desc in tools:
            print(f"   📊 {name}")
            print(f"      {desc}\n")
        
        return True
        
    except Exception as e:
        print(f"❌ Error loading tools: {e}")
        return False

def test_tool_execution():
    """Test if we can execute a tool"""
    print("\n🧪 Testing Tool Execution")
    print("=" * 60)
    
    try:
        import asyncio
        from mcp_server.adapters.tradingagents import TradingAgentsAdapter
        from mcp_server.config.settings import Settings
        
        # Create adapter
        settings = Settings()
        adapter = TradingAgentsAdapter(settings.dict())
        
        print("✅ Adapter created successfully")
        print("\n📊 Testing live data fetch...")
        
        # Test getting live data (not full analysis to save time)
        from tradingagents.dataflows.interface import route_to_vendor
        from datetime import datetime, timedelta
        
        end_date = datetime.now().strftime("%Y-%m-%d")
        start_date = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
        
        result = route_to_vendor("get_stock_data", "AAPL", start_date, end_date)
        
        if result and len(result) > 0:
            print(f"✅ Live data accessible")
            print(f"   Sample: {result[:150]}...")
            return True
        else:
            print("❌ No data returned")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

def generate_c1_instructions():
    """Generate instructions for using tools in C1"""
    print("\n📝 How to Use in C1 Chat")
    print("=" * 60)
    
    print("""
To get LIVE DATA in C1, you must explicitly ask it to use the MCP tools:

✅ CORRECT (Will use live data):
   "Use the analyze_stock tool to analyze AAPL"
   "Call analyze_stock for TSLA with all analysts"
   "Run the MCP analyze_stock function on NVDA"

❌ WRONG (Will use training data):
   "Analyze AAPL"
   "What do you think about TSLA?"
   "Tell me about NVDA"

🎯 KEY PHRASES TO USE:
   - "Use the [tool_name] tool"
   - "Call the [tool_name] function"
   - "Run [tool_name] on [ticker]"
   - "Execute analyze_stock for [ticker]"

📋 AVAILABLE TOOLS:
   1. analyze_stock - Full multi-agent analysis
   2. backtest_strategy - Test strategies on historical data
   3. calculate_risk - Position sizing and risk metrics
   4. get_sentiment - Social media sentiment

🔧 IF TOOLS DON'T WORK:
   1. Check if MCP server shows as "Connected" in C1
   2. Restart C1 to reconnect MCP server
   3. Check MCP server logs for errors
   4. Verify .env has OPENAI_API_KEY set
""")

if __name__ == "__main__":
    print("🚀 C1 MCP Connection Verification")
    print("=" * 60)
    
    config_ok = check_mcp_config()
    tools_ok = list_available_tools()
    exec_ok = test_tool_execution()
    
    print("\n" + "=" * 60)
    print("📋 VERIFICATION RESULTS")
    print("=" * 60)
    print(f"MCP Configuration: {'✅ OK' if config_ok else '❌ FAILED'}")
    print(f"Tools Available: {'✅ OK' if tools_ok else '❌ FAILED'}")
    print(f"Tool Execution: {'✅ OK' if exec_ok else '❌ FAILED'}")
    
    if config_ok and tools_ok and exec_ok:
        print("\n🎉 ALL SYSTEMS GO!")
        print("\n✅ MCP server is configured correctly")
        print("✅ Tools are available")
        print("✅ Live data is accessible")
        print("\n⚠️  THE ISSUE: C1 is not calling the tools")
        print("\n💡 SOLUTION: You must explicitly ask C1 to use the tools")
        generate_c1_instructions()
    else:
        print("\n⚠️  ISSUES DETECTED")
        if not config_ok:
            print("   - Fix MCP configuration")
        if not tools_ok:
            print("   - Check MCP server installation")
        if not exec_ok:
            print("   - Verify Python environment and dependencies")
