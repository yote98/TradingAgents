"""
Custom Analysts Demo

Demonstrates the new Options, Crypto, and Macro analysts.
Shows how to use them standalone and integrated in the workflow.
"""
from langchain_openai import ChatOpenAI
from tradingagents.agents import (
    create_options_analyst,
    create_crypto_analyst,
    create_macro_analyst
)


def demo_options_analyst():
    """Demonstrate Options Analyst."""
    print("=" * 70)
    print("OPTIONS ANALYST DEMO")
    print("=" * 70)
    
    # Create LLM
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
    
    # Create analyst
    analyst = create_options_analyst(llm)
    
    # Analyze
    state = {
        "company_of_interest": "AAPL",
        "trade_date": "2024-01-15",
        "messages": []
    }
    
    print("\nAnalyzing options for AAPL...")
    result = analyst(state)
    
    print("\n" + result["options_report"])


def demo_crypto_analyst():
    """Demonstrate Crypto Analyst."""
    print("\n" + "=" * 70)
    print("CRYPTO ANALYST DEMO")
    print("=" * 70)
    
    # Create LLM
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
    
    # Create analyst
    analyst = create_crypto_analyst(llm)
    
    # Analyze
    state = {
        "company_of_interest": "TSLA",
        "trade_date": "2024-01-15",
        "messages": []
    }
    
    print("\nAnalyzing crypto market context for TSLA...")
    result = analyst(state)
    
    print("\n" + result["crypto_report"])


def demo_macro_analyst():
    """Demonstrate Macro Analyst."""
    print("\n" + "=" * 70)
    print("MACRO ANALYST DEMO")
    print("=" * 70)
    
    # Create LLM
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
    
    # Create analyst
    analyst = create_macro_analyst(llm)
    
    # Analyze
    state = {
        "company_of_interest": "JPM",
        "trade_date": "2024-01-15",
        "messages": []
    }
    
    print("\nAnalyzing macroeconomic environment for JPM...")
    result = analyst(state)
    
    print("\n" + result["macro_report"])


def demo_all_analysts():
    """Demonstrate all three analysts together."""
    print("\n" + "=" * 70)
    print("ALL ANALYSTS DEMO")
    print("=" * 70)
    
    # Create LLM
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
    
    # Create all analysts
    options_analyst = create_options_analyst(llm)
    crypto_analyst = create_crypto_analyst(llm)
    macro_analyst = create_macro_analyst(llm)
    
    # Analyze same stock with all analysts
    ticker = "NVDA"
    state = {
        "company_of_interest": ticker,
        "trade_date": "2024-01-15",
        "messages": []
    }
    
    print(f"\nComprehensive analysis for {ticker}...")
    
    # Get all reports
    options_result = options_analyst(state)
    crypto_result = crypto_analyst(state)
    macro_result = macro_analyst(state)
    
    print("\n" + "=" * 70)
    print(f"COMPREHENSIVE ANALYSIS FOR {ticker}")
    print("=" * 70)
    
    print("\n--- OPTIONS PERSPECTIVE ---")
    print(options_result["options_report"][:500] + "...\n")
    
    print("\n--- CRYPTO MARKET CONTEXT ---")
    print(crypto_result["crypto_report"][:500] + "...\n")
    
    print("\n--- MACROECONOMIC ENVIRONMENT ---")
    print(macro_result["macro_report"][:500] + "...\n")


def main():
    """Run all demos."""
    print("\n" + "=" * 70)
    print("CUSTOM ANALYSTS DEMONSTRATION")
    print("=" * 70)
    print("\nThis demo shows the three new specialized analysts:")
    print("1. Options Analyst - Options trading analysis")
    print("2. Crypto Analyst - Crypto market context")
    print("3. Macro Analyst - Economic indicators and market regime")
    print("\nNote: These demos use gpt-4o-mini for cost efficiency.")
    print("For production, consider using more powerful models.")
    
    try:
        # Run individual demos
        demo_options_analyst()
        demo_crypto_analyst()
        demo_macro_analyst()
        
        # Run combined demo
        demo_all_analysts()
        
        print("\n" + "=" * 70)
        print("DEMO COMPLETE")
        print("=" * 70)
        print("\nNext steps:")
        print("1. Use analysts in TradingAgents workflow")
        print("2. Integrate with backtesting")
        print("3. Combine with risk management")
        
    except Exception as e:
        print(f"\nError running demo: {e}")
        print("\nMake sure you have:")
        print("1. Set OPENAI_API_KEY environment variable")
        print("2. Installed required packages: pip install -r requirements.txt")


if __name__ == "__main__":
    main()
