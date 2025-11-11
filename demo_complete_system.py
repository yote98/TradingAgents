"""
Complete Demo: TradingAgents with External Coach Plans

This demo shows the complete system in action:
1. TradingAgents makes automated trading decisions
2. External coaches post daily plans in Discord (separate)
3. You can view both independently
"""

from tradingagents.graph.trading_graph import TradingAgentsGraph
from tradingagents.default_config import DEFAULT_CONFIG
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def print_section(title):
    """Print a formatted section header."""
    print(f"\n{'='*70}")
    print(f"  {title}")
    print(f"{'='*70}\n")

def main():
    # Configuration
    config = DEFAULT_CONFIG.copy()
    config["deep_think_llm"] = "gpt-4o-mini"  # Use cheaper model for demo
    config["quick_think_llm"] = "gpt-4o-mini"
    config["max_debate_rounds"] = 1
    
    # Initialize TradingAgents
    print_section("INITIALIZING TRADINGAGENTS")
    ta = TradingAgentsGraph(
        selected_analysts=["market", "fundamentals", "news"],
        debug=False,  # Set to True to see detailed agent conversations
        config=config
    )
    print("✓ TradingAgents initialized with 3 analysts")
    print("  - Market Analyst (technical indicators)")
    print("  - Fundamentals Analyst (company financials)")
    print("  - News Analyst (news and insider data)")
    
    # Trading parameters
    ticker = "NVDA"
    trade_date = "2024-05-10"
    
    # Run the trading workflow
    print_section(f"RUNNING TRADINGAGENTS FOR {ticker} ON {trade_date}")
    print("Running automated analysis...")
    print("(This may take 1-2 minutes as agents analyze data)\n")
    
    try:
        final_state, decision, coach_plans = ta.propagate(ticker, trade_date)
        
        print("✓ Analysis complete!")
        print(f"\n📊 TRADING DECISION: {decision}")
        print(f"\nThis decision was made by:")
        print("  1. Internal analysts analyzing market data")
        print("  2. Bull/Bear researchers debating the analysis")
        print("  3. Trader proposing action")
        print("  4. Risk management team evaluating")
        print("  5. Risk manager making final decision")
        
        # Show some details from the analysis
        print_section("ANALYSIS DETAILS")
        
        if final_state.get("market_report"):
            print("📈 Market Analyst Report (excerpt):")
            report = final_state["market_report"]
            print(f"   {report[:200]}..." if len(report) > 200 else f"   {report}")
        
        if final_state.get("fundamentals_report"):
            print("\n💰 Fundamentals Analyst Report (excerpt):")
            report = final_state["fundamentals_report"]
            print(f"   {report[:200]}..." if len(report) > 200 else f"   {report}")
        
        if final_state.get("final_trade_decision"):
            print("\n⚖️ Final Risk Management Decision (excerpt):")
            decision_text = final_state["final_trade_decision"]
            print(f"   {decision_text[:300]}..." if len(decision_text) > 300 else f"   {decision_text}")
        
        # View external coach plans
        print_section("EXTERNAL COACH PLANS (INDEPENDENT REFERENCE)")
        
        if coach_plans and any(coach_plans.values()):
            print("📋 External coaches posted the following plans in Discord:\n")
            print("NOTE: These are EXTERNAL human opinions, separate from the")
            print("      automated decision above. They did NOT influence it.\n")
            
            coaches = [
                ("coach_d", "Coach D (Daily Trading)", "🎯"),
                ("coach_i", "Coach I (Insights)", "💡"),
                ("coach_s", "Coach S (Sentiment)", "📊"),
                ("coach_n", "Coach N (Narrative)", "📰")
            ]
            
            for coach_key, coach_name, emoji in coaches:
                plan = coach_plans.get(f"{coach_key}_plan", "")
                charts = coach_plans.get(f"{coach_key}_charts", [])
                
                if plan and not plan.startswith("No"):
                    print(f"{emoji} {coach_name}:")
                    print(f"   {plan}")
                    if charts:
                        print(f"   📎 Charts attached: {len(charts)}")
                        for i, url in enumerate(charts, 1):
                            print(f"      {i}. {url}")
                    print()
                else:
                    print(f"{emoji} {coach_name}: No plan posted today")
        else:
            print("ℹ️  No external coach plans available.")
            print("\nTo enable coach plans:")
            print("1. Set up Discord bot (see examples/discord_bot_server.py)")
            print("2. Configure webhooks in .env file")
            print("3. Have coaches post: !plan d: Your analysis here")
        
        # Summary
        print_section("SUMMARY")
        
        print("✅ WHAT HAPPENED:")
        print("   1. TradingAgents ran automated analysis")
        print(f"   2. Made decision: {decision}")
        print("   3. Fetched external coach plans (separate)")
        print("   4. Both are available for review\n")
        
        print("🔑 KEY POINTS:")
        print("   • System decision is INDEPENDENT of coach plans")
        print("   • Coaches are external human opinions")
        print("   • You can view both for comprehensive perspective")
        print("   • Coaches are optional (system works without them)\n")
        
        print("📚 NEXT STEPS:")
        print("   • Review the decision and analysis above")
        print("   • Try different tickers: python main.py")
        print("   • Read GETTING_STARTED.md for more options")
        print("   • Customize configuration in main.py")
        
    except Exception as e:
        print(f"\n❌ Error occurred: {e}")
        print("\nTroubleshooting:")
        print("1. Check your API keys in .env file")
        print("2. Verify internet connection")
        print("3. Try running: python test_setup.py")
        print(f"\nFull error: {type(e).__name__}: {str(e)}")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Demo interrupted by user")
    except Exception as e:
        print(f"\n\n❌ Unexpected error: {e}")
        print("\nMake sure you have:")
        print("  1. Set OPENAI_API_KEY in .env")
        print("  2. Set ALPHA_VANTAGE_API_KEY in .env")
        print("  3. Installed all dependencies: pip install -r requirements.txt")
