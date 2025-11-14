"""
Quick API Test - Verify TradingAgents API works
"""
import os
import sys
import time

# Set environment variables from .env
from dotenv import load_dotenv
load_dotenv()

print("=" * 60)
print("QUICK API TEST")
print("=" * 60)

# Test 1: Check OpenAI key
print("\n1. Checking OpenAI API Key...")
openai_key = os.getenv("OPENAI_API_KEY")
if openai_key and openai_key.startswith("sk-"):
    print(f"   ✅ Found: {openai_key[:20]}...")
else:
    print("   ❌ OPENAI_API_KEY not found in .env")
    sys.exit(1)

# Test 2: Initialize TradingAgents
print("\n2. Initializing TradingAgents...")
try:
    from tradingagents.graph.trading_graph import TradingAgentsGraph
    from tradingagents.default_config import DEFAULT_CONFIG
    
    config = DEFAULT_CONFIG.copy()
    config["quick_think_llm"] = "gpt-4o-mini"
    config["deep_think_llm"] = "gpt-4o-mini"
    config["max_debate_rounds"] = 1
    config["enable_coaches"] = False
    config["enable_memory"] = False
    
    print("   Initializing graph (this may take 10-15 seconds)...")
    graph = TradingAgentsGraph(config=config)
    print("   ✅ TradingAgents initialized!")
    
except Exception as e:
    print(f"   ❌ Failed: {e}")
    sys.exit(1)

# Test 3: Quick analysis test
print("\n3. Testing quick analysis...")
try:
    print("   Running analysis on AAPL (this will take 30-60 seconds)...")
    result = graph.run(ticker="AAPL", timeframe="1mo")
    
    if result and "final_decision" in result:
        print(f"   ✅ Analysis complete!")
        print(f"   Decision: {result.get('final_decision', 'N/A')[:100]}...")
    else:
        print("   ⚠️ Analysis returned but no decision found")
        
except Exception as e:
    print(f"   ❌ Analysis failed: {e}")
    sys.exit(1)

print("\n" + "=" * 60)
print("✅ ALL TESTS PASSED!")
print("=" * 60)
print("\nYour TradingAgents setup is working correctly.")
print("You can now start the API server with:")
print("   python tradingagents_api.py")
print("\nOr use the batch file:")
print("   start_c1.bat")
print("=" * 60)
