"""
Fast Analysis - Uses only 2 analysts for speed
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

# Initialize with only 2 analysts (faster!)
print("Initializing TradingAgents (fast mode)...")
ta = TradingAgentsGraph(
    selected_analysts=["market", "fundamentals"],  # Only 2 analysts
    debug=False,
    config=config
)

# Analyze
ticker = "AAPL"
print(f"\nAnalyzing {ticker}...")
print("This should take about 30-60 seconds...\n")

final_state, decision, coach_plans = ta.propagate(ticker, "2024-05-10")

print("="*60)
print(f"  DECISION: {decision}")
print("="*60)
print("\nDone! ✓")
