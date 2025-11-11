"""
Minimal Analysis - Lowest cost possible
Uses only 1 analyst and minimal processing
Cost: ~$0.05-0.10 per run
"""
from tradingagents.graph.trading_graph import TradingAgentsGraph
from tradingagents.default_config import DEFAULT_CONFIG
from dotenv import load_dotenv

load_dotenv()

# Minimal configuration
config = DEFAULT_CONFIG.copy()
config["deep_think_llm"] = "gpt-4o-mini"  # Cheapest model
config["quick_think_llm"] = "gpt-4o-mini"
config["max_debate_rounds"] = 1  # Minimum debates

# Initialize with ONLY 1 analyst (cheapest!)
print("Initializing minimal TradingAgents...")
ta = TradingAgentsGraph(
    selected_analysts=["market"],  # Only market analyst
    debug=False,
    config=config
)

# Analyze
ticker = input("Enter ticker symbol (e.g., AAPL): ").upper()
date = "2024-05-10"

print(f"\nAnalyzing {ticker}...")
print("Cost: ~$0.05-0.10\n")

try:
    final_state, decision, _ = ta.propagate(ticker, date)
    
    print("="*60)
    print(f"  DECISION: {decision}")
    print("="*60)
    print("\nDone! ✓")
    
except Exception as e:
    print(f"Error: {e}")
