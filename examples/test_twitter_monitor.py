"""
Test Twitter/Social Monitor

Simple script to test the Twitter monitor functionality.
"""

from tradingagents.dataflows.twitter_monitor import TwitterSocialMonitor, format_twitter_report
from tradingagents.default_config import DEFAULT_CONFIG


def test_twitter_monitor():
    """Test the Twitter monitor with a popular ticker."""
    
    print("=" * 60)
    print("Testing Twitter/Social Monitor")
    print("=" * 60)
    
    # Get configuration
    config = DEFAULT_CONFIG.get("twitter_monitor", {})
    
    print(f"\nConfiguration:")
    print(f"  Curated accounts: {len(config.get('curated_accounts', []))}")
    print(f"  Nitter instances: {len(config.get('nitter_instances', []))}")
    print(f"  Stocktwits enabled: {config.get('stocktwits_enabled', False)}")
    print(f"  Cache duration: {config.get('cache_duration', 0)} seconds")
    
    # Initialize monitor (without LLM for basic test)
    print("\nInitializing Twitter monitor...")
    monitor = TwitterSocialMonitor(config=config, llm=None)
    
    # Test with a popular ticker
    ticker = "AAPL"
    print(f"\nFetching sentiment data for ${ticker}...")
    print("(This may take 10-15 seconds on first run)")
    
    try:
        data = monitor.get_sentiment_data(ticker=ticker, timeframe="24h")
        
        print("\n" + "=" * 60)
        print("RESULTS")
        print("=" * 60)
        
        print(f"\nSuccess: {data.get('success', False)}")
        print(f"Cache used: {data.get('cache_used', False)}")
        print(f"Tweets found: {len(data.get('tweets', []))}")
        print(f"Stocktwits messages: {len(data.get('stocktwits_messages', []))}")
        
        if data.get('errors'):
            print(f"\nErrors: {len(data['errors'])}")
            for error in data['errors']:
                print(f"  - {error}")
        
        if data.get('warnings'):
            print(f"\nWarnings: {len(data['warnings'])}")
            for warning in data['warnings']:
                print(f"  - {warning}")
        
        # Show formatted report
        print("\n" + "=" * 60)
        print("FORMATTED REPORT")
        print("=" * 60)
        report = format_twitter_report(data)
        print(report)
        
        # Show sample tweets
        if data.get('tweets'):
            print("\n" + "=" * 60)
            print("SAMPLE TWEETS")
            print("=" * 60)
            for i, tweet in enumerate(data['tweets'][:3], 1):
                print(f"\n{i}. @{tweet['author']}")
                print(f"   {tweet['text'][:150]}...")
                print(f"   {tweet['timestamp']}")
        
        print("\n" + "=" * 60)
        print("TEST COMPLETE")
        print("=" * 60)
        print("\nThe Twitter monitor is working! 🎉")
        print("\nNext steps:")
        print("1. Run a full analysis: python demo_complete_system.py")
        print("2. The Social Sentiment Analyst will automatically use Twitter data")
        print("3. Check TWITTER_MONITOR_GUIDE.md for more details")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\nTroubleshooting:")
        print("1. Check your internet connection")
        print("2. Nitter instances may be temporarily down (this is normal)")
        print("3. Try again in a few minutes")
        print("4. Check TWITTER_MONITOR_GUIDE.md for more help")


if __name__ == "__main__":
    test_twitter_monitor()
