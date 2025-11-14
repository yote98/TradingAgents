"""
Simple script to analyze Bitcoin using TradingAgents
"""
import asyncio
from tradingagents.graph.trading_graph import TradingAgentsGraph

async def main():
    print("🚀 Starting Bitcoin Analysis...")
    print("="*60)
    
    # Create the trading agents system
    graph = TradingAgentsGraph(
        config={
            "deep_think_llm": "gpt-4o-mini",  # Use cheaper model
            "quick_think_llm": "gpt-4o-mini",
            "max_debate_rounds": 1  # Faster analysis
        }
    )
    
    print("\n📊 Running analysis on BTC-USD...")
    print("This will take a few minutes...\n")
    
    # Run the analysis
    result = await graph.run(ticker="BTC-USD")
    
    print("\n" + "="*60)
    print("✅ ANALYSIS COMPLETE!")
    print("="*60)
    
    # Show the final decision
    if "final_decision" in result:
        decision = result["final_decision"]
        print(f"\n🎯 Decision: {decision.get('action', 'N/A')}")
        print(f"💭 Reasoning: {decision.get('reasoning', 'N/A')}")
    
    # Show where results are saved
    print(f"\n📁 Full results saved to: eval_results/BTC-USD/")
    
    return result

if __name__ == "__main__":
    result = asyncio.run(main())
