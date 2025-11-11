"""
Analyze Multiple Stocks at Once
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
ta = TradingAgentsGraph(
    selected_analysts=["market", "fundamentals"],  # Just 2 analysts for speed
    debug=False,
    config=config
)

# Stocks to analyze
tickers = ["AAPL", "MSFT", "GOOGL", "NVDA", "TSLA"]
date = "2024-05-10"

print("="*60)
print("  ANALYZING MULTIPLE STOCKS")
print("="*60)
print()

results = []

for ticker in tickers:
    print(f"Analyzing {ticker}...", end=" ")
    try:
        _, decision, _ = ta.propagate(ticker, date)
        results.append({"ticker": ticker, "decision": decision})
        print(f"✓ {decision}")
    except Exception as e:
        print(f"✗ Error: {e}")
        results.append({"ticker": ticker, "decision": "ERROR"})

print()
print("="*60)
print("  SUMMARY")
print("="*60)
print()

for result in results:
    print(f"{result['ticker']:6s} → {result['decision']}")

print()
print("Note: Each analysis costs ~$0.10-0.30 in API credits")
