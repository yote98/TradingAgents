"""
Quick Analysis of Apple (AAPL)
"""
from tradingagents.graph.trading_graph import TradingAgentsGraph
from tradingagents.default_config import DEFAULT_CONFIG
from dotenv import load_dotenv

load_dotenv()

# Configuration
config = DEFAULT_CONFIG.copy()
config["deep_think_llm"] = "gpt-4o-mini"
config["quick_think_llm"] = "gpt-4o-mini"
config["max_debate_rounds"] = 1

# Initialize
print("Initializing TradingAgents...")
ta = TradingAgentsGraph(
    selected_analysts=["market", "fundamentals", "news"],
    debug=False,
    config=config
)

# Analyze Apple
print("\nAnalyzing AAPL (Apple Inc.)...")
print("This will take 1-2 minutes...\n")

final_state, decision, coach_plans = ta.propagate("AAPL", "2024-05-10")

print("="*60)
print(f"  TRADING DECISION FOR AAPL: {decision}")
print("="*60)
print()

# Show brief analysis
if final_state.get("market_report"):
    print("Market Analysis (excerpt):")
    print(f"  {final_state['market_report'][:150]}...")
    print()

if final_state.get("fundamentals_report"):
    print("Fundamentals Analysis (excerpt):")
    print(f"  {final_state['fundamentals_report'][:150]}...")
    print()

print("\nDone! ✓")
