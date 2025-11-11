"""
Example: Viewing External Coach Plans from Discord

This example demonstrates how to fetch and view external coach plans
that are posted in Discord. Coaches are INDEPENDENT and do NOT integrate
into the TradingAgents workflow.
"""

from tradingagents.graph.trading_graph import TradingAgentsGraph
from tradingagents.default_config import DEFAULT_CONFIG
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create a custom config
config = DEFAULT_CONFIG.copy()

# Configure LLMs (use cheaper models for testing)
config["deep_think_llm"] = "gpt-4o-mini"
config["quick_think_llm"] = "gpt-4o-mini"
config["max_debate_rounds"] = 1

# Discord webhooks are loaded from environment variables
# Make sure you have set them in your .env file:
# - DISCORD_BOT_TOKEN
# - DISCORD_COACH_D_WEBHOOK
# - DISCORD_COACH_I_WEBHOOK
# - DISCORD_COACH_S_WEBHOOK
# - DISCORD_COACH_N_WEBHOOK
# - DISCORD_SUMMARY_WEBHOOK

# Initialize the trading graph
ta = TradingAgentsGraph(
    selected_analysts=["market", "news", "fundamentals"],
    debug=True,
    config=config
)

ticker = "NVDA"
trade_date = "2024-05-10"

print(f"\n{'='*60}")
print(f"Running TradingAgents for {ticker} on {trade_date}")
print(f"{'='*60}\n")

# Run the trading workflow (coaches are NOT part of this)
final_state, decision, coach_plans = ta.propagate(ticker, trade_date)

print(f"\n{'='*60}")
print(f"Final Trading Decision: {decision}")
print(f"{'='*60}\n")

# Separately view external coach plans (independent from the decision)
if coach_plans:
    print("\n{'='*60}")
    print("EXTERNAL COACH PLANS (Independent Reference)")
    print(f"{'='*60}\n")
    
    if "coach_d_plan" in coach_plans:
        print("Coach D (Daily Trading):")
        print(f"  Plan: {coach_plans.get('coach_d_plan', 'N/A')}")
        charts = coach_plans.get('coach_d_charts', [])
        if charts:
            print(f"  Charts: {len(charts)} attached")
            for i, url in enumerate(charts, 1):
                print(f"    {i}. {url}")
        print()
    
    if "coach_i_plan" in coach_plans:
        print("Coach I (Insights):")
        print(f"  Plan: {coach_plans.get('coach_i_plan', 'N/A')}")
        charts = coach_plans.get('coach_i_charts', [])
        if charts:
            print(f"  Charts: {len(charts)} attached")
            for i, url in enumerate(charts, 1):
                print(f"    {i}. {url}")
        print()
    
    if "coach_s_plan" in coach_plans:
        print("Coach S (Sentiment):")
        print(f"  Plan: {coach_plans.get('coach_s_plan', 'N/A')}")
        charts = coach_plans.get('coach_s_charts', [])
        if charts:
            print(f"  Charts: {len(charts)} attached")
            for i, url in enumerate(charts, 1):
                print(f"    {i}. {url}")
        print()
    
    if "coach_n_plan" in coach_plans:
        print("Coach N (Narrative):")
        print(f"  Plan: {coach_plans.get('coach_n_plan', 'N/A')}")
        charts = coach_plans.get('coach_n_charts', [])
        if charts:
            print(f"  Charts: {len(charts)} attached")
            for i, url in enumerate(charts, 1):
                print(f"    {i}. {url}")
        print()

print("\nNote: Coach plans are external reference material.")
print("They did NOT influence the trading decision above.")
print("Traders can view coach plans separately for additional context.")

# You can also fetch coach plans independently at any time
print("\n--- Fetching Coach Plans Independently ---\n")
independent_plans = ta.get_coach_plans(trade_date)
print(f"Fetched {len([k for k in independent_plans.keys() if 'plan' in k])} coach plans")
