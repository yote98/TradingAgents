"""
Batch Analysis Script

Efficiently analyze multiple stocks in one session.
This approach maximizes cache usage and minimizes costs.

Usage:
    python examples/batch_analysis.py
"""

from datetime import datetime, timedelta
from tradingagents.graph.trading_graph import TradingAgentsGraph
from examples.config_presets import get_config
import json
import os


# ============================================================================
# CONFIGURATION
# ============================================================================

# Your watchlist
WATCHLIST = [
    "AAPL",   # Apple
    "MSFT",   # Microsoft
    "GOOGL",  # Google
    "NVDA",   # NVIDIA
    "TSLA",   # Tesla
]

# Choose your configuration preset
CONFIG_PRESET = "swing_trading"  # day_trading, swing_trading, long_term, etc.

# Analysis date (use "today" for current date)
ANALYSIS_DATE = "today"  # or specific date like "2024-01-15"

# Output settings
SAVE_RESULTS = True
RESULTS_DIR = "batch_analysis_results"


# ============================================================================
# BATCH ANALYSIS FUNCTION
# ============================================================================

def run_batch_analysis(
    watchlist,
    config_preset="swing_trading",
    analysis_date="today",
    save_results=True
):
    """
    Run analysis on multiple stocks in one batch.
    
    Args:
        watchlist: List of stock tickers to analyze
        config_preset: Configuration preset name
        analysis_date: Date to analyze ("today" or "YYYY-MM-DD")
        save_results: Whether to save results to file
    
    Returns:
        Dictionary of results for each stock
    """
    
    # Setup
    print("="*80)
    print("BATCH ANALYSIS")
    print("="*80)
    
    # Get configuration
    config = get_config(config_preset)
    print(f"\nConfiguration: {config_preset}")
    print(f"Analysts: {config['selected_analysts']}")
    print(f"Model: {config['deep_think_llm']}")
    
    # Determine analysis date
    if analysis_date == "today":
        date = datetime.now().strftime("%Y-%m-%d")
    else:
        date = analysis_date
    
    print(f"Analysis Date: {date}")
    print(f"Stocks to Analyze: {len(watchlist)}")
    print(f"Watchlist: {', '.join(watchlist)}")
    print("\n" + "="*80)
    
    # Initialize trading graph
    print("\nInitializing TradingAgents system...")
    graph = TradingAgentsGraph(config=config)
    
    # Results storage
    results = {}
    
    # Analyze each stock
    for i, ticker in enumerate(watchlist, 1):
        print(f"\n[{i}/{len(watchlist)}] Analyzing {ticker}...")
        print("-"*80)
        
        try:
            # Run analysis
            state, signal = graph.propagate(ticker, date)
            
            # Extract key information
            result = {
                "ticker": ticker,
                "date": date,
                "signal": signal,
                "final_decision": state.get("final_trade_decision", "No decision"),
                "market_report": state.get("market_report", ""),
                "fundamentals_report": state.get("fundamentals_report", ""),
                "news_report": state.get("news_report", ""),
                "risk_metrics": state.get("risk_metrics", {}),
                "timestamp": datetime.now().isoformat()
            }
            
            results[ticker] = result
            
            # Print summary
            print(f"✓ {ticker}: {signal}")
            print(f"  Decision: {result['final_decision'][:100]}...")
            
        except Exception as e:
            print(f"✗ Error analyzing {ticker}: {e}")
            results[ticker] = {
                "ticker": ticker,
                "date": date,
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    print("\n" + "="*80)
    print("BATCH ANALYSIS COMPLETE")
    print("="*80)
    
    # Save results
    if save_results:
        save_batch_results(results, date, config_preset)
    
    # Print summary
    print_batch_summary(results)
    
    return results


def save_batch_results(results, date, config_preset):
    """Save batch analysis results to file."""
    
    # Create results directory
    os.makedirs(RESULTS_DIR, exist_ok=True)
    
    # Generate filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{RESULTS_DIR}/batch_analysis_{date}_{timestamp}.json"
    
    # Save to JSON
    with open(filename, 'w') as f:
        json.dump({
            "date": date,
            "config_preset": config_preset,
            "timestamp": datetime.now().isoformat(),
            "results": results
        }, f, indent=2)
    
    print(f"\n✓ Results saved to: {filename}")


def print_batch_summary(results):
    """Print summary of batch analysis results."""
    
    print("\n" + "="*80)
    print("SUMMARY")
    print("="*80)
    
    # Count signals
    buy_signals = []
    sell_signals = []
    hold_signals = []
    errors = []
    
    for ticker, result in results.items():
        if "error" in result:
            errors.append(ticker)
        else:
            signal = result["signal"].upper()
            if "BUY" in signal or "LONG" in signal:
                buy_signals.append(ticker)
            elif "SELL" in signal or "SHORT" in signal:
                sell_signals.append(ticker)
            else:
                hold_signals.append(ticker)
    
    # Print summary
    print(f"\nTotal Stocks Analyzed: {len(results)}")
    print(f"  BUY/LONG:  {len(buy_signals)} - {', '.join(buy_signals) if buy_signals else 'None'}")
    print(f"  SELL/SHORT: {len(sell_signals)} - {', '.join(sell_signals) if sell_signals else 'None'}")
    print(f"  HOLD:      {len(hold_signals)} - {', '.join(hold_signals) if hold_signals else 'None'}")
    if errors:
        print(f"  ERRORS:    {len(errors)} - {', '.join(errors)}")
    
    print("\n" + "="*80)


# ============================================================================
# ADVANCED BATCH FUNCTIONS
# ============================================================================

def run_daily_batch():
    """Run daily batch analysis on your watchlist."""
    print("Running daily batch analysis...")
    return run_batch_analysis(
        watchlist=WATCHLIST,
        config_preset="swing_trading",
        analysis_date="today",
        save_results=True
    )


def run_weekly_batch():
    """Run weekly batch analysis (more thorough)."""
    print("Running weekly batch analysis...")
    return run_batch_analysis(
        watchlist=WATCHLIST,
        config_preset="long_term",
        analysis_date="today",
        save_results=True
    )


def run_custom_batch(tickers, config="swing_trading"):
    """Run batch analysis on custom list of tickers."""
    return run_batch_analysis(
        watchlist=tickers,
        config_preset=config,
        analysis_date="today",
        save_results=True
    )


def compare_configurations(ticker, configs=None):
    """
    Compare different configurations on the same stock.
    
    Args:
        ticker: Stock ticker to analyze
        configs: List of config presets to compare
    
    Returns:
        Dictionary of results for each configuration
    """
    if configs is None:
        configs = ["day_trading", "swing_trading", "long_term"]
    
    print(f"\nComparing configurations for {ticker}...")
    print("="*80)
    
    date = datetime.now().strftime("%Y-%m-%d")
    results = {}
    
    for config_name in configs:
        print(f"\nTesting {config_name} configuration...")
        config = get_config(config_name)
        graph = TradingAgentsGraph(config=config)
        
        try:
            state, signal = graph.propagate(ticker, date)
            results[config_name] = {
                "signal": signal,
                "decision": state.get("final_trade_decision", ""),
                "config": config_name
            }
            print(f"  {config_name}: {signal}")
        except Exception as e:
            print(f"  Error: {e}")
            results[config_name] = {"error": str(e)}
    
    return results


# ============================================================================
# SCHEDULED BATCH ANALYSIS
# ============================================================================

def morning_routine():
    """
    Morning routine: Analyze watchlist before market open.
    
    Best time: 8:00-9:30 AM ET (before market open)
    """
    print("\n" + "="*80)
    print("MORNING ROUTINE - Pre-Market Analysis")
    print("="*80)
    
    return run_batch_analysis(
        watchlist=WATCHLIST,
        config_preset="day_trading",  # Fast analysis
        analysis_date="today",
        save_results=True
    )


def evening_review():
    """
    Evening routine: Review day's performance and plan tomorrow.
    
    Best time: After market close (4:00 PM ET+)
    """
    print("\n" + "="*80)
    print("EVENING REVIEW - Post-Market Analysis")
    print("="*80)
    
    return run_batch_analysis(
        watchlist=WATCHLIST,
        config_preset="swing_trading",  # More thorough
        analysis_date="today",
        save_results=True
    )


def weekend_deep_dive():
    """
    Weekend routine: Deep analysis for the week ahead.
    
    Best time: Saturday or Sunday
    """
    print("\n" + "="*80)
    print("WEEKEND DEEP DIVE - Weekly Planning")
    print("="*80)
    
    # Get last trading day
    today = datetime.now()
    days_back = 1 if today.weekday() == 6 else 2  # Sunday or Saturday
    last_trading_day = (today - timedelta(days=days_back)).strftime("%Y-%m-%d")
    
    return run_batch_analysis(
        watchlist=WATCHLIST,
        config_preset="long_term",  # Most thorough
        analysis_date=last_trading_day,
        save_results=True
    )


# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

def load_previous_results(date=None):
    """Load previous batch analysis results."""
    if date is None:
        date = datetime.now().strftime("%Y-%m-%d")
    
    # Find matching files
    import glob
    pattern = f"{RESULTS_DIR}/batch_analysis_{date}_*.json"
    files = glob.glob(pattern)
    
    if not files:
        print(f"No results found for {date}")
        return None
    
    # Load most recent
    latest_file = max(files)
    with open(latest_file, 'r') as f:
        data = json.load(f)
    
    print(f"Loaded results from: {latest_file}")
    return data


def export_to_csv(results, filename=None):
    """Export batch results to CSV."""
    import csv
    
    if filename is None:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{RESULTS_DIR}/batch_results_{timestamp}.csv"
    
    # Prepare data
    rows = []
    for ticker, result in results.items():
        if "error" not in result:
            rows.append({
                "Ticker": ticker,
                "Date": result["date"],
                "Signal": result["signal"],
                "Decision": result["final_decision"][:100],
            })
    
    # Write CSV
    if rows:
        with open(filename, 'w', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=rows[0].keys())
            writer.writeheader()
            writer.writerows(rows)
        
        print(f"✓ Exported to CSV: {filename}")
    else:
        print("No data to export")


# ============================================================================
# MAIN EXECUTION
# ============================================================================

if __name__ == "__main__":
    import sys
    
    # Check command line arguments
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()
        
        if command == "morning":
            results = morning_routine()
        elif command == "evening":
            results = evening_review()
        elif command == "weekend":
            results = weekend_deep_dive()
        elif command == "daily":
            results = run_daily_batch()
        elif command == "weekly":
            results = run_weekly_batch()
        else:
            print(f"Unknown command: {command}")
            print("\nAvailable commands:")
            print("  python examples/batch_analysis.py morning")
            print("  python examples/batch_analysis.py evening")
            print("  python examples/batch_analysis.py weekend")
            print("  python examples/batch_analysis.py daily")
            print("  python examples/batch_analysis.py weekly")
            sys.exit(1)
    else:
        # Default: Run daily batch
        print("Running default daily batch analysis...")
        print("(Use 'python examples/batch_analysis.py morning/evening/weekend' for specific routines)")
        results = run_daily_batch()
    
    # Export to CSV
    export_to_csv(results)
    
    print("\n✓ Batch analysis complete!")
