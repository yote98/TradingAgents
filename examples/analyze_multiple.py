"""
Analyze Multiple Stocks

Efficiently analyze multiple stocks in one session.
This is an alias/wrapper for batch_analysis.py for convenience.

Usage:
    python examples/analyze_multiple.py
    python examples/analyze_multiple.py AAPL MSFT GOOGL
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from examples.batch_analysis import (
    run_batch_analysis,
    analyze_multiple,
    morning_routine,
    evening_review,
    weekend_deep_dive,
    scan_watchlist
)

# Default watchlist
DEFAULT_WATCHLIST = [
    "AAPL",   # Apple
    "MSFT",   # Microsoft
    "GOOGL",  # Google
    "NVDA",   # NVIDIA
    "TSLA",   # Tesla
]


def main():
    """Main execution function."""
    
    if len(sys.argv) < 2:
        print("\n" + "="*70)
        print("ANALYZE MULTIPLE STOCKS")
        print("="*70)
        print("\nUsage:")
        print("  python examples/analyze_multiple.py AAPL MSFT GOOGL")
        print("  python examples/analyze_multiple.py --default")
        print("  python examples/analyze_multiple.py --morning")
        print("  python examples/analyze_multiple.py --evening")
        print("  python examples/analyze_multiple.py --weekend")
        print("\nOptions:")
        print("  --default   Analyze default watchlist (AAPL, MSFT, GOOGL, NVDA, TSLA)")
        print("  --morning   Run morning routine (before market open)")
        print("  --evening   Run evening review (after market close)")
        print("  --weekend   Run weekend deep dive (thorough analysis)")
        print("\nExamples:")
        print("  # Analyze specific stocks")
        print("  python examples/analyze_multiple.py AAPL MSFT GOOGL")
        print()
        print("  # Analyze default watchlist")
        print("  python examples/analyze_multiple.py --default")
        print()
        print("  # Morning routine")
        print("  python examples/analyze_multiple.py --morning")
        print("="*70 + "\n")
        sys.exit(1)
    
    # Check for special commands
    if sys.argv[1] == "--default":
        print("Analyzing default watchlist...")
        results = analyze_multiple(DEFAULT_WATCHLIST)
        
    elif sys.argv[1] == "--morning":
        print("Running morning routine...")
        results = morning_routine()
        
    elif sys.argv[1] == "--evening":
        print("Running evening review...")
        results = evening_review()
        
    elif sys.argv[1] == "--weekend":
        print("Running weekend deep dive...")
        results = weekend_deep_dive()
        
    else:
        # Get tickers from command line
        tickers = [arg.upper() for arg in sys.argv[1:]]
        
        print(f"\nAnalyzing {len(tickers)} stocks...")
        results = analyze_multiple(tickers)
    
    # Print cost estimate
    cost_per_stock = 0.20  # Average for swing_trading config
    total_cost = len(results) * cost_per_stock
    print(f"\nEstimated cost: ${total_cost:.2f} ({len(results)} stocks × ${cost_per_stock:.2f})")
    print()


if __name__ == "__main__":
    main()
