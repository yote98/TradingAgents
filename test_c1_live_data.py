"""
Test if C1 can access live TradingAgents data through MCP
"""
import subprocess
import json
import sys

def test_mcp_server():
    """Test if MCP server is accessible"""
    print("🔍 Testing MCP Server Connection...")
    print("=" * 60)
    
    try:
        # Test if we can import the MCP server
        sys.path.insert(0, r"C:\Users\CVN B850I GAMING\.kiro\TradingAgents")
        import mcp_server
        print("✅ MCP server module found")
        
        # Test if we can access TradingAgents
        from tradingagents.graph.trading_graph import TradingAgentsGraph
        print("✅ TradingAgents module accessible")
        
        # Test a simple analysis
        print("\n📊 Testing live data fetch...")
        graph = TradingAgentsGraph(
            ticker="AAPL",
            debug=False,
            config={
                "deep_think_llm": "gpt-4o-mini",
                "quick_think_llm": "gpt-4o-mini",
                "max_debate_rounds": 1
            }
        )
        
        # Just test data fetching, not full analysis
        from tradingagents.dataflows.agent_utils import get_stock_data
        data = get_stock_data("AAPL", period="1d")
        
        if data is not None and not data.empty:
            latest_price = data['Close'].iloc[-1]
            print(f"✅ Live data retrieved: AAPL = ${latest_price:.2f}")
            print("\n🎉 SUCCESS! MCP server can access live data")
            return True
        else:
            print("❌ No data returned")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

def check_c1_config():
    """Check if C1 is configured to use MCP"""
    print("\n🔧 Checking C1 Configuration...")
    print("=" * 60)
    
    try:
        with open(r"C:\Users\CVN B850I GAMING\.kiro\settings\mcp.json", 'r') as f:
            config = json.load(f)
            
        if 'tradingagents' in config.get('mcpServers', {}):
            ta_config = config['mcpServers']['tradingagents']
            print(f"✅ TradingAgents MCP server configured")
            print(f"   Command: {ta_config.get('command')}")
            print(f"   Disabled: {ta_config.get('disabled', False)}")
            
            if ta_config.get('disabled', False):
                print("\n⚠️  WARNING: MCP server is DISABLED!")
                print("   Enable it in C1 settings or set 'disabled': false")
                return False
            return True
        else:
            print("❌ TradingAgents not found in MCP config")
            return False
            
    except Exception as e:
        print(f"❌ Error reading config: {e}")
        return False

if __name__ == "__main__":
    print("🚀 TradingAgents C1 Live Data Test")
    print("=" * 60)
    
    config_ok = check_c1_config()
    server_ok = test_mcp_server()
    
    print("\n" + "=" * 60)
    print("📋 SUMMARY")
    print("=" * 60)
    print(f"C1 Configuration: {'✅ OK' if config_ok else '❌ FAILED'}")
    print(f"MCP Server: {'✅ OK' if server_ok else '❌ FAILED'}")
    
    if config_ok and server_ok:
        print("\n🎉 ALL SYSTEMS GO!")
        print("\n📝 Next Steps:")
        print("1. Open C1 Chat interface")
        print("2. Ask: 'Analyze AAPL using all analysts'")
        print("3. C1 should now use REAL live data from TradingAgents")
    else:
        print("\n⚠️  ISSUES DETECTED")
        print("\n🔧 Troubleshooting:")
        if not config_ok:
            print("- Check MCP configuration in C1 settings")
            print("- Ensure 'disabled' is set to false")
        if not server_ok:
            print("- Verify Python environment has all dependencies")
            print("- Check OPENAI_API_KEY is set in .env")
            print("- Run: pip install -r requirements.txt")
