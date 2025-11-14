#!/usr/bin/env python3
"""
Quick test to verify C1 MCP connection is working
"""

import requests
import json
import time

def test_mcp_server():
    """Test if MCP server is running and responding"""
    print("🔍 Testing MCP Server Connection...")
    
    try:
        # Test basic connection
        response = requests.get("http://localhost:8000", timeout=5)
        print(f"✅ MCP Server responding: {response.status_code}")
        
        # Test if it's the right server
        if "MCP" in response.text or "protocol" in response.text.lower():
            print("✅ MCP Protocol detected")
        else:
            print("⚠️  Server responding but may not be MCP compliant")
            
        return True
        
    except requests.exceptions.ConnectionError:
        print("❌ MCP Server not running on port 8000")
        print("   Start it with: python mcp_http_server_v2.py")
        return False
    except Exception as e:
        print(f"❌ Error connecting to MCP server: {e}")
        return False

def test_live_data():
    """Test if we can get live data through the system"""
    print("\n🔍 Testing Live Data Access...")
    
    try:
        # Import and test TradingAgents directly
        from tradingagents.graph.trading_graph import TradingAgentsGraph
        
        # Quick test with minimal config
        config = {
            'deep_think_llm': 'gpt-4o-mini',
            'quick_think_llm': 'gpt-4o-mini',
            'max_debate_rounds': 1,
            'debug': False
        }
        
        graph = TradingAgentsGraph(config=config)
        
        # Test with a simple stock
        print("   Testing AAPL data fetch...")
        result = graph.run_analysis("AAPL", analysts=['market'])
        
        if result and 'market_report' in result:
            print("✅ Live data accessible through TradingAgents")
            
            # Try to extract current price
            market_report = result['market_report']
            if 'current_price' in str(market_report).lower():
                print("✅ Current price data found in report")
            else:
                print("⚠️  Market report generated but no price data visible")
                
            return True
        else:
            print("❌ No market report generated")
            return False
            
    except ImportError as e:
        print(f"❌ Cannot import TradingAgents: {e}")
        return False
    except Exception as e:
        print(f"❌ Error testing live data: {e}")
        return False

def test_c1_instructions():
    """Show instructions for testing C1"""
    print("\n🎯 C1 Testing Instructions:")
    print("=" * 50)
    
    print("\n1. Update your C1 system prompt with the new version:")
    print("   - Copy from THESYS_C1_SYSTEM_PROMPT.md")
    print("   - Paste into C1 Prompts tab")
    print("   - Save the prompt")
    
    print("\n2. Test with this exact message in C1:")
    print('   "Use the analyze_stock MCP tool to analyze AAPL"')
    
    print("\n3. What you should see:")
    print("   ✅ C1 calls the analyze_stock function")
    print("   ✅ Takes 30-60 seconds to run")
    print("   ✅ Returns analysis with current price")
    print("   ✅ Shows multi-agent reports")
    
    print("\n4. If it doesn't work:")
    print("   - Check MCP server is running (python mcp_http_server_v2.py)")
    print("   - Verify MCP connection in C1 settings")
    print("   - Try removing and re-adding the MCP server")
    
    print("\n5. Alternative test commands:")
    print('   "Call the analyze_stock function for TSLA"')
    print('   "Execute analyze_stock tool on NVDA"')
    print('   "Run MCP analysis on MSFT"')

def main():
    """Run all tests"""
    print("🚀 TradingAgents C1 MCP Connection Test")
    print("=" * 50)
    
    # Test MCP server
    mcp_ok = test_mcp_server()
    
    # Test live data (only if MCP is running)
    if mcp_ok:
        data_ok = test_live_data()
    else:
        data_ok = False
        print("\n⏭️  Skipping live data test (MCP server not running)")
    
    # Show C1 instructions
    test_c1_instructions()
    
    # Summary
    print("\n📊 TEST SUMMARY:")
    print("=" * 50)
    print(f"MCP Server:  {'✅ OK' if mcp_ok else '❌ FAIL'}")
    print(f"Live Data:   {'✅ OK' if data_ok else '❌ FAIL'}")
    print(f"C1 Ready:    {'✅ YES' if mcp_ok and data_ok else '❌ NO'}")
    
    if mcp_ok and data_ok:
        print("\n🎉 READY! Your system has live data.")
        print("   The issue is just C1 not using the tools.")
        print("   Update the system prompt and test!")
    else:
        print("\n🔧 NEEDS FIXING:")
        if not mcp_ok:
            print("   - Start MCP server: python mcp_http_server_v2.py")
        if not data_ok:
            print("   - Check TradingAgents configuration")
            print("   - Verify API keys in .env file")

if __name__ == "__main__":
    main()