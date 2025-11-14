"""
Automatic Analysis System for Coach N (Unusual Whales) Signals

This script monitors coach_n_signals.json for new signals and automatically
triggers TradingAgents analysis when new signals arrive.

Usage:
    python auto_analyze_signals.py

The script will:
1. Watch for new signals in coach_n_signals.json
2. Extract ticker symbols from the signals
3. Automatically run TradingAgents analysis
4. Save results to eval_results/
"""

import json
import time
import os
from datetime import datetime
from pathlib import Path
from tradingagents.graph.trading_graph import TradingAgentsGraph
from tradingagents.agents.coaches.sentiment_coach import SentimentCoach

# Configuration
SIGNALS_FILE = "coach_n_signals.json"
CHECK_INTERVAL = 30  # Check every 30 seconds
ANALYZED_SIGNALS_FILE = "analyzed_signals.json"

def load_signals():
    """Load signals from JSON file"""
    if not os.path.exists(SIGNALS_FILE):
        return []
    
    try:
        with open(SIGNALS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"❌ Error loading signals: {e}")
        return []

def load_analyzed_signals():
    """Load list of already analyzed signal IDs"""
    if not os.path.exists(ANALYZED_SIGNALS_FILE):
        return set()
    
    try:
        with open(ANALYZED_SIGNALS_FILE, 'r') as f:
            return set(json.load(f))
    except:
        return set()

def save_analyzed_signal(signal_id):
    """Mark a signal as analyzed"""
    analyzed = load_analyzed_signals()
    analyzed.add(signal_id)
    
    with open(ANALYZED_SIGNALS_FILE, 'w') as f:
        json.dump(list(analyzed), f, indent=2)

def extract_ticker_from_signal(signal):
    """
    Extract ticker symbol from signal content
    
    Looks for patterns like:
    - $AAPL
    - AAPL:
    - Stock: AAPL
    """
    import re
    
    content = signal.get('content', '')
    
    # Pattern 1: $TICKER
    match = re.search(r'\$([A-Z]{1,5})\b', content)
    if match:
        return match.group(1)
    
    # Pattern 2: TICKER: or Stock: TICKER
    match = re.search(r'(?:Stock:|Ticker:)?\s*([A-Z]{2,5})\b', content)
    if match:
        ticker = match.group(1)
        # Filter out common words that look like tickers
        if ticker not in ['THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL']:
            return ticker
    
    return None

def analyze_signal(signal):
    """Run TradingAgents analysis for a signal"""
    ticker = extract_ticker_from_signal(signal)
    
    if not ticker:
        print(f"⚠️  Could not extract ticker from signal: {signal.get('content', '')[:100]}")
        return False
    
    print(f"\n{'='*60}")
    print(f"🎯 NEW SIGNAL DETECTED!")
    print(f"{'='*60}")
    print(f"Ticker: {ticker}")
    print(f"Signal: {signal.get('content', '')[:200]}")
    print(f"Time: {signal.get('timestamp', 'Unknown')}")
    print(f"{'='*60}\n")
    
    try:
        # Initialize Coach N with signals
        coach = SentimentCoach(
            name="Coach N (Unusual Whales)",
            signals_file=SIGNALS_FILE
        )
        
        # Run analysis
        print(f"🚀 Starting TradingAgents analysis for {ticker}...")
        
        graph = TradingAgentsGraph(
            ticker=ticker,
            coaches=[coach],
            analysts=['market', 'fundamentals'],  # Use minimal analysts for speed
            debug=False  # Set to True to see agent reasoning
        )
        
        result = graph.run()
        
        print(f"\n✅ Analysis complete for {ticker}!")
        print(f"📊 Results saved to: eval_results/{ticker}/")
        
        # Print key findings
        if result.get('final_recommendation'):
            rec = result['final_recommendation']
            print(f"\n🎯 RECOMMENDATION: {rec.get('action', 'N/A')}")
            print(f"💡 Reasoning: {rec.get('reasoning', 'N/A')[:200]}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error analyzing {ticker}: {e}")
        import traceback
        traceback.print_exc()
        return False

def monitor_signals():
    """Main monitoring loop"""
    print("🔍 Coach N Signal Monitor Started")
    print(f"📁 Watching: {SIGNALS_FILE}")
    print(f"⏱️  Check interval: {CHECK_INTERVAL} seconds")
    print(f"{'='*60}\n")
    
    analyzed = load_analyzed_signals()
    print(f"📝 Already analyzed {len(analyzed)} signals")
    
    while True:
        try:
            signals = load_signals()
            
            # Find new signals
            new_signals = [s for s in signals if s.get('id') not in analyzed]
            
            if new_signals:
                print(f"\n🆕 Found {len(new_signals)} new signal(s)!")
                
                for signal in new_signals:
                    signal_id = signal.get('id')
                    
                    # Analyze the signal
                    success = analyze_signal(signal)
                    
                    # Mark as analyzed (even if failed, to avoid retrying)
                    if signal_id:
                        save_analyzed_signal(signal_id)
                        analyzed.add(signal_id)
                    
                    # Wait a bit between analyses
                    time.sleep(5)
            
            # Wait before next check
            time.sleep(CHECK_INTERVAL)
            
        except KeyboardInterrupt:
            print("\n\n👋 Stopping signal monitor...")
            break
        except Exception as e:
            print(f"❌ Error in monitoring loop: {e}")
            time.sleep(CHECK_INTERVAL)

if __name__ == "__main__":
    print("""
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║     🤖 TradingAgents Auto-Analysis System                   ║
║     📡 Coach N (Unusual Whales) Signal Monitor              ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
    """)
    
    # Check if signals file exists
    if not os.path.exists(SIGNALS_FILE):
        print(f"⚠️  Warning: {SIGNALS_FILE} not found!")
        print(f"   Make sure discord_to_coach_n.py is running first.")
        print(f"   Waiting for signals file to be created...\n")
    
    monitor_signals()
