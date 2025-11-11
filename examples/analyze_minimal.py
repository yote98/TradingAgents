"""
Minimal Analysis Script

Ultra-fast, ultra-cheap analysis using only 1 analyst.
Perfect for quick checks and high-frequency analysis.

Cost: ~$0.01-0.05 per run
Speed: ~10-20 seconds per stock

Usage:
    python examples/analyze_minimal.py AAPL
    python examples/analyze_minimal.py AAPL MSFT GOOGL
"""

import sys
from datetime import datetime
from tradingagents.graph.trading_graph import TradingAgentsGraph


# ============================================================================
# MINIMAL CONFIGURATION
# ============================================================================

MINIMAL_CONFIG = {
    # LLM Settings - Cheapest and fastest
    "llm_provider": "openai",
    "deep_think_llm": "gpt-4o-mini",      # Cheapest model
    "quick_think_llm": "gpt-4o-mini",     # Same for consistency
    "backend_url": "https://api.openai.com/v1",
    
    # Analyst Selection - ONLY Market Analyst (technical analysis)
    "selected_analysts": ["market"],       # Single analyst = minimal cost
    
    # Debate Settings - Minimal rounds
    "max_debate_rounds": 1,                # Quick decision
    
    # Coach Settings - Disabled
    "enable_coaches": False,
    "selected_coaches": [],
    
    # Project Settings
    "project_dir": ".",
}


# ============================================================================
# QUICK ANALYSIS FUNCTION
# ============================================================================

def analyze_quick(ticker, date="today", verbose=True):
    """
    Quick minimal analysis of a single stock.
    
    Args:
        ticker: Stock ticker symbol
        date: Analysis date ("today" or "YYYY-MM-DD")
        verbose: Print detailed output
    
    Returns:
        Tuple of (state, signal)
    """
    
    # Determine date
    if date == "today":
        analysis_date = datetime.now().strftime("%Y-%m-%d")
    else:
        analysis_date = date
    
    if verbose:
        print(f"\n{'='*60}")
        print(f"MINIMAL ANALYSIS: {ticker}")
        print(f"{'='*60}")
        print(f"Date: {analysis_date}")
        print(f"Config: Market analyst only (minimal cost)")
        print(f"Model: gpt-4o-mini (fastest)")
        print(f"{'='*60}\n")
    
    # Initialize trading graph with minimal config
    graph = TradingAgentsGraph(config=MINIMAL_CONFIG)
    
    # Run analysis
    try:
        state, signal = graph.propagate(ticker, analysis_date)
        
        if verbose:
            print(f"\n{'='*60}")
            print(f"RESULT: {ticker}")
            print(f"{'='*60}")
            print(f"Signal: {signal}")
            print(f"\nFinal Decision:")
            print(f"{state['final_trade_decision']}")
            print(f"\nMarket Analysis:")
            print(f"{state.get('market_report', 'No report')[:500]}...")
            print(f"{'='*60}\n")
        
        return state, signal
        
    except Exception as e:
        if verbose:
            print(f"\n✗ Error analyzing {ticker}: {e}\n")
        return None, None


def analyze_multiple(tickers, date="today"):
    """
    Quick analysis of multiple stocks.
    
    Args:
        tickers: List of stock ticker symbols
        date: Analysis date
    
    Returns:
        Dictionary of results
    """
    
    print(f"\n{'='*60}")
    print(f"MINIMAL BATCH ANALYSIS")
    print(f"{'='*60}")
    print(f"Stocks: {', '.join(tickers)}")
    print(f"Date: {date if date != 'today' else datetime.now().strftime('%Y-%m-%d')}")
    print(f"Config: Minimal (market analyst only)")
    print(f"{'='*60}\n")
    
    results = {}
    
    for i, ticker in enumerate(tickers, 1):
        print(f"[{i}/{len(tickers)}] Analyzing {ticker}...")
        
        state, signal = analyze_quick(ticker, date, verbose=False)
        
        if state and signal:
            results[ticker] = {
                "signal": signal,
                "decision": state.get("final_trade_decision", ""),
                "market_report": state.get("market_report", "")
            }
            print(f"  ✓ {ticker}: {signal}")
        else:
            results[ticker] = {"error": "Analysis failed"}
            print(f"  ✗ {ticker}: Error")
    
    # Print summary
    print(f"\n{'='*60}")
    print(f"SUMMARY")
    print(f"{'='*60}")
    
    buy_count = sum(1 for r in results.values() 
                    if "BUY" in r.get("signal", "").upper())
    sell_count = sum(1 for r in results.values() 
                     if "SELL" in r.get("signal", "").upper())
    hold_count = len(results) - buy_count - sell_count
    
    print(f"Total: {len(results)} stocks")
    print(f"  BUY:  {buy_count}")
    print(f"  SELL: {sell_count}")
    print(f"  HOLD: {hold_count}")
    print(f"{'='*60}\n")
    
    return results


# ============================================================================
# COMPARISON FUNCTIONS
# ============================================================================

def compare_minimal_vs_full(ticker, date="today"):
    """
    Compare minimal config vs full config on same stock.
    
    Shows cost/speed trade-offs.
    """
    
    print(f"\n{'='*60}")
    print(f"COMPARISON: Minimal vs Full Analysis")
    print(f"{'='*60}")
    print(f"Stock: {ticker}")
    print(f"Date: {date if date != 'today' else datetime.now().strftime('%Y-%m-%d')}")
    print(f"{'='*60}\n")
    
    # Minimal analysis
    print("Running MINIMAL analysis...")
    print("  Config: Market analyst only")
    print("  Cost: ~$0.01-0.05")
    start_time = datetime.now()
    
    graph_minimal = TradingAgentsGraph(config=MINIMAL_CONFIG)
    state_minimal, signal_minimal = graph_minimal.propagate(
        ticker, 
        date if date != "today" else datetime.now().strftime("%Y-%m-%d")
    )
    
    minimal_time = (datetime.now() - start_time).total_seconds()
    print(f"  Time: {minimal_time:.1f} seconds")
    print(f"  Signal: {signal_minimal}\n")
    
    # Full analysis
    print("Running FULL analysis...")
    print("  Config: All analysts")
    print("  Cost: ~$0.50-1.00")
    start_time = datetime.now()
    
    full_config = {
        **MINIMAL_CONFIG,
        "selected_analysts": ["market", "fundamentals", "news"],
        "max_debate_rounds": 2,
        "deep_think_llm": "gpt-4o"
    }
    
    graph_full = TradingAgentsGraph(config=full_config)
    state_full, signal_full = graph_full.propagate(
        ticker,
        date if date != "today" else datetime.now().strftime("%Y-%m-%d")
    )
    
    full_time = (datetime.now() - start_time).total_seconds()
    print(f"  Time: {full_time:.1f} seconds")
    print(f"  Signal: {signal_full}\n")
    
    # Comparison
    print(f"{'='*60}")
    print(f"COMPARISON RESULTS")
    print(f"{'='*60}")
    print(f"Minimal: {signal_minimal} ({minimal_time:.1f}s, ~$0.03)")
    print(f"Full:    {signal_full} ({full_time:.1f}s, ~$0.75)")
    print(f"\nSpeed improvement: {full_time/minimal_time:.1f}x faster")
    print(f"Cost savings: {0.75/0.03:.1f}x cheaper")
    print(f"\nSignals match: {'✓ Yes' if signal_minimal == signal_full else '✗ No'}")
    print(f"{'='*60}\n")
    
    return {
        "minimal": {"signal": signal_minimal, "time": minimal_time, "cost": 0.03},
        "full": {"signal": signal_full, "time": full_time, "cost": 0.75}
    }


# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

def quick_check(ticker):
    """
    Ultra-quick check - just the signal, no details.
    
    Perfect for scanning many stocks quickly.
    """
    state, signal = analyze_quick(ticker, verbose=False)
    return signal if signal else "ERROR"


def scan_watchlist(watchlist):
    """
    Quick scan of entire watchlist - signals only.
    
    Example:
        watchlist = ["AAPL", "MSFT", "GOOGL", "NVDA", "TSLA"]
        scan_watchlist(watchlist)
    """
    
    print(f"\n{'='*60}")
    print(f"QUICK WATCHLIST SCAN")
    print(f"{'='*60}")
    
    for ticker in watchlist:
        signal = quick_check(ticker)
        emoji = "🟢" if "BUY" in signal else "🔴" if "SELL" in signal else "⚪"
        print(f"{emoji} {ticker:6s} → {signal}")
    
    print(f"{'='*60}\n")


# ============================================================================
# MAIN EXECUTION
# ============================================================================

def main():
    """Main execution function."""
    
    if len(sys.argv) < 2:
        print("\n" + "="*60)
        print("MINIMAL ANALYSIS SCRIPT")
        print("="*60)
        print("\nUsage:")
        print("  python examples/analyze_minimal.py AAPL")
        print("  python examples/analyze_minimal.py AAPL MSFT GOOGL")
        print("  python examples/analyze_minimal.py --compare AAPL")
        print("\nFeatures:")
        print("  • Ultra-fast analysis (~10-20 seconds)")
        print("  • Ultra-cheap (~$0.01-0.05 per stock)")
        print("  • Market analyst only (technical analysis)")
        print("  • Perfect for quick checks")
        print("\nExamples:")
        print("  # Single stock")
        print("  python examples/analyze_minimal.py AAPL")
        print()
        print("  # Multiple stocks")
        print("  python examples/analyze_minimal.py AAPL MSFT GOOGL NVDA")
        print()
        print("  # Compare minimal vs full")
        print("  python examples/analyze_minimal.py --compare AAPL")
        print("="*60 + "\n")
        sys.exit(1)
    
    # Check for comparison mode
    if sys.argv[1] == "--compare":
        if len(sys.argv) < 3:
            print("Error: --compare requires a ticker")
            print("Usage: python examples/analyze_minimal.py --compare AAPL")
            sys.exit(1)
        
        ticker = sys.argv[2].upper()
        compare_minimal_vs_full(ticker)
        return
    
    # Get tickers from command line
    tickers = [arg.upper() for arg in sys.argv[1:]]
    
    # Single stock or multiple?
    if len(tickers) == 1:
        # Single stock - detailed output
        analyze_quick(tickers[0])
    else:
        # Multiple stocks - batch mode
        analyze_multiple(tickers)
    
    # Print cost estimate
    cost_per_stock = 0.03
    total_cost = len(tickers) * cost_per_stock
    print(f"Estimated cost: ${total_cost:.2f} ({len(tickers)} stocks × ${cost_per_stock:.2f})")
    print()


if __name__ == "__main__":
    main()
