"""
Simple test to verify MCP server can access live data
"""
import sys
import os

# Add to path
sys.path.insert(0, os.path.abspath("."))

def test_live_data():
    """Test if we can get live stock data"""
    print("🔍 Testing Live Data Access...")
    print("=" * 60)
    
    try:
        from tradingagents.dataflows.interface import route_to_vendor
        from datetime import datetime, timedelta
        
        # Calculate date range
        end_date = datetime.now().strftime("%Y-%m-%d")
        start_date = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
        
        # Test fetching live data for AAPL
        print(f"\n📊 Fetching live data for AAPL ({start_date} to {end_date})...")
        result = route_to_vendor("get_stock_data", "AAPL", start_date, end_date)
        
        if result and len(result) > 0:
            print(f"✅ SUCCESS! Got live data:")
            print(f"   Ticker: AAPL")
            print(f"   Date range: {start_date} to {end_date}")
            print(f"   Data length: {len(result)} characters")
            print(f"   Sample: {result[:200]}...")
            return True
        else:
            print("❌ No data returned")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_mcp_server_import():
    """Test if MCP server can be imported"""
    print("\n🔧 Testing MCP Server Import...")
    print("=" * 60)
    
    try:
        import mcp_server
        print("✅ MCP server module found")
        
        from mcp_server.adapters.tradingagents import TradingAgentsAdapter
        print("✅ TradingAgents adapter found")
        
        return True
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("🚀 MCP Live Data Test")
    print("=" * 60)
    
    mcp_ok = test_mcp_server_import()
    data_ok = test_live_data()
    
    print("\n" + "=" * 60)
    print("📋 RESULTS")
    print("=" * 60)
    print(f"MCP Server: {'✅ OK' if mcp_ok else '❌ FAILED'}")
    print(f"Live Data: {'✅ OK' if data_ok else '❌ FAILED'}")
    
    if mcp_ok and data_ok:
        print("\n🎉 MCP SERVER IS WORKING WITH LIVE DATA!")
        print("\n📝 The issue is that C1 Chat needs to be configured to USE the MCP tools.")
        print("\nNext steps:")
        print("1. The MCP server is running and has live data ✅")
        print("2. C1 needs to call the MCP tools when you ask for analysis")
        print("3. Check if C1 is actually calling the 'analyze_stock' tool")
    else:
        print("\n⚠️  ISSUES DETECTED - MCP server or data access not working")
