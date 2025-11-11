"""
Simple Backtester - Test strategy over time
"""
from tradingagents.graph.trading_graph import TradingAgentsGraph
from tradingagents.default_config import DEFAULT_CONFIG
from datetime import datetime, timedelta
from dotenv import load_dotenv
import time

load_dotenv()

# Configuration
config = DEFAULT_CONFIG.copy()
config["deep_think_llm"] = "gpt-4o-mini"
config["quick_think_llm"] = "gpt-4o-mini"
config["max_debate_rounds"] = 1

# Initialize
ta = TradingAgentsGraph(
    selected_analysts=["market", "fundamentals"],
    debug=False,
    config=config
)

# Backtest parameters
ticker = "AAPL"
start_date = datetime(2024, 5, 1)
end_date = datetime(2024, 5, 10)  # Just 10 days for testing

print("="*60)
print(f"  BACKTESTING {ticker}")
print(f"  From {start_date.date()} to {end_date.date()}")
print("="*60)
print()

results = []
current_date = start_date

while current_date <= end_date:
    date_str = current_date.strftime("%Y-%m-%d")
    
    # Skip weekends
    if current_date.weekday() < 5:  # Monday = 0, Friday = 4
        print(f"{date_str}...", end=" ")
        try:
            _, decision, _ = ta.propagate(ticker, date_str)
            results.append({
                "date": date_str,
                "decision": decision
            })
            print(f"✓ {decision}")
            time.sleep(1)  # Small delay to avoid rate limits
        except Exception as e:
            print(f"✗ Error: {str(e)[:50]}")
            results.append({
                "date": date_str,
                "decision": "ERROR"
            })
    
    current_date += timedelta(days=1)

print()
print("="*60)
print("  RESULTS")
print("="*60)
print()

buy_count = sum(1 for r in results if "BUY" in r["decision"])
sell_count = sum(1 for r in results if "SELL" in r["decision"])
hold_count = sum(1 for r in results if "HOLD" in r["decision"])

print(f"Total days analyzed: {len(results)}")
print(f"BUY signals:  {buy_count}")
print(f"SELL signals: {sell_count}")
print(f"HOLD signals: {hold_count}")
print()

print("Daily decisions:")
for result in results:
    print(f"  {result['date']}: {result['decision']}")

print()
print("Note: This is a simple backtest for demonstration.")
print("Real backtesting requires price data and position tracking.")
