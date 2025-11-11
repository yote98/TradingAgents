from tradingagents.graph.trading_graph import TradingAgentsGraph
from tradingagents.default_config import DEFAULT_CONFIG

from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Create a custom config
config = DEFAULT_CONFIG.copy()
config["deep_think_llm"] = "gpt-4o-mini"  # Use a different model
config["quick_think_llm"] = "gpt-4o-mini"  # Use a different model
config["max_debate_rounds"] = 1  # Increase debate rounds

# Configure data vendors (default uses yfinance and alpha_vantage)
config["data_vendors"] = {
    "core_stock_apis": "yfinance",           # Options: yfinance, alpha_vantage, local
    "technical_indicators": "yfinance",      # Options: yfinance, alpha_vantage, local
    "fundamental_data": "alpha_vantage",     # Options: openai, alpha_vantage, local
    "news_data": "alpha_vantage",            # Options: openai, alpha_vantage, google, local
}

# Initialize with custom config
ta = TradingAgentsGraph(debug=True, config=config)

# forward propagate
# Note: propagate() returns 3 values: (final_state, decision, coach_plans)
final_state, decision, coach_plans = ta.propagate("NVDA", "2024-05-10")
print(f"\nTrading Decision: {decision}")

# Optional: View coach plans if available
if coach_plans and any(coach_plans.values()):
    print("\nExternal Coach Plans:")
    for coach in ["coach_d", "coach_i", "coach_s", "coach_n"]:
        plan = coach_plans.get(f"{coach}_plan", "")
        if plan and not plan.startswith("No"):
            print(f"  {coach.upper()}: {plan[:100]}...")
else:
    print("\nNo external coach plans available.")

# Memorize mistakes and reflect
# ta.reflect_and_remember(1000) # parameter is the position returns
