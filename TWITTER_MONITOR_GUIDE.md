# Twitter/Social Monitor Guide

## Overview

The Twitter/Social Monitor enhances TradingAgents by providing real-time social sentiment analysis from curated financial Twitter accounts and Stocktwits. It uses free Nitter RSS feeds to avoid API costs while delivering high-quality signals from trusted sources like Chart Champions, Unusual Whales, and Walter Bloomberg.

## Features

✅ **Free Data Sources**: Uses Nitter RSS feeds (no Twitter API costs)
✅ **Curated Accounts**: Monitors 8 trusted financial Twitter accounts
✅ **Stocktwits Integration**: Optional retail sentiment from Stocktwits
✅ **LLM Analysis**: Intelligent sentiment scoring and theme extraction
✅ **Smart Caching**: 1-hour cache to minimize API calls
✅ **Error Resilient**: Graceful fallbacks when services are unavailable
✅ **Integrated**: Works seamlessly with Social Sentiment Analyst

## Quick Start

The Twitter monitor is automatically integrated with the Social Sentiment Analyst. Just run your normal analysis:

```python
from tradingagents.graph.trading_graph import TradingAgentsGraph

# Initialize graph
graph = TradingAgentsGraph()

# Run analysis - Twitter sentiment is automatically included
result = graph.run(ticker="AAPL")

# Check the social sentiment report
print(result["sentiment_report"])
```

The Social Sentiment Analyst will automatically use the `get_twitter_sentiment()` tool to fetch Twitter and Stocktwits data.

## Configuration

### Default Configuration

The system comes pre-configured with 8 curated accounts in `tradingagents/default_config.py`:

```python
"twitter_monitor": {
    "curated_accounts": [
        "ChartChampions",      # Technical analysis
        "unusual_whales",      # Options flow
        "DeItaone",           # Breaking news (Walter Bloomberg)
        "zerohedge",          # Market news
        "TradingView",        # Charts and analysis
        "Investingcom",       # Financial news
        "YahooFinance",       # Market updates
        "MarketWatch",        # News and analysis
    ],
    "nitter_instances": [
        "https://nitter.net",
        "https://nitter.it",
        "https://nitter.privacydev.net",
        "https://nitter.poast.org",
    ],
    "stocktwits_enabled": True,
    "cache_duration": 3600,  # 1 hour
}
```

### Adding/Removing Twitter Accounts

Edit `tradingagents/default_config.py` and modify the `curated_accounts` list:

```python
"curated_accounts": [
    "ChartChampions",
    "unusual_whales",
    "YourFavoriteAccount",  # Add new account
    # Remove accounts by deleting them from the list
],
```

No code changes needed - the system will automatically use the updated list on the next run.

### Stocktwits API (Optional)

For authenticated Stocktwits access (higher rate limits), add to your `.env` file:

```
STOCKTWITS_API_TOKEN=your_token_here
```

The system works fine without authentication using the free tier.

### Adjusting Cache Duration

To change how long data is cached:

```python
"cache_duration": 1800,  # 30 minutes (in seconds)
```

## Standalone Usage

You can also use the Twitter monitor directly without running a full analysis:

```python
from tradingagents.dataflows.twitter_monitor import TwitterSocialMonitor
from tradingagents.default_config import DEFAULT_CONFIG

# Initialize monitor
config = DEFAULT_CONFIG["twitter_monitor"]
monitor = TwitterSocialMonitor(config=config)

# Fetch sentiment data
data = monitor.get_sentiment_data(ticker="AAPL", timeframe="24h")

# Access results
print(f"Overall Sentiment: {data['sentiment_summary']['overall_sentiment']}")
print(f"Tweets analyzed: {len(data['tweets'])}")
print(f"Stocktwits messages: {len(data['stocktwits_messages'])}")
```

## Using the Tool Function

The `get_twitter_sentiment()` tool can be used in any LangChain agent:

```python
from tradingagents.dataflows.twitter_tools import get_twitter_sentiment

# Fetch Twitter sentiment
report = get_twitter_sentiment.invoke({"ticker": "AAPL", "timeframe": "24h"})
print(report)
```

Output example:
```
=== Twitter/Social Sentiment Report for $AAPL ===

Data Sources:
- Tweets analyzed: 15
- Stocktwits messages: 30
- Cache used: False

Overall Sentiment: 0.65 (-1.0 to 1.0)
Confidence: 0.75

Bullish Arguments:
  • Strong earnings beat expectations
  • New product launch generating positive buzz
  • Technical breakout above resistance

Bearish Arguments:
  • Valuation concerns at current levels
  • Regulatory headwinds in EU market

Key Themes:
  • iPhone 15 sales momentum
  • AI integration in products
  • Services revenue growth

Most Active Accounts:
  • @ChartChampions: 5 tweets
  • @unusual_whales: 3 tweets
  • @DeItaone: 2 tweets
```

## Monitored Accounts

### Technical Analysis
- **Chart Champions** (@ChartChampions): Chart patterns and technical setups
- **TradingView** (@TradingView): Charts and technical analysis

### Options & Flow
- **Unusual Whales** (@unusual_whales): Options flow and unusual activity

### News & Breaking
- **Walter Bloomberg** (@DeItaone): Real-time market news
- **Zerohedge** (@zerohedge): Market news and analysis
- **Investing.com** (@Investingcom): Financial news
- **Yahoo Finance** (@YahooFinance): Market updates
- **MarketWatch** (@MarketWatch): News and analysis

## Performance

- **Cold start** (no cache): 10-15 seconds
- **Warm start** (cached): <1 second
- **API costs**: $0 (Nitter is free)
- **LLM costs**: ~$0.01-0.05 per analysis

## Caching

Data is cached for 1 hour by default in:
```
tradingagents/dataflows/data_cache/twitter/{TICKER}.json
```

Cache benefits:
- Reduces API calls by 95%+
- Faster repeated analyses
- Respects Nitter rate limits
- Stores historical sentiment

To clear cache:
```bash
# Windows
del tradingagents\dataflows\data_cache\twitter\*.json

# Linux/Mac
rm tradingagents/dataflows/data_cache/twitter/*.json
```

## Troubleshooting

### No tweets found

**Cause**: Nitter instances may be down or rate-limited

**Solution**: 
1. The system automatically rotates between 4 Nitter instances
2. Check if accounts are tweeting about the ticker
3. Try a more popular ticker (AAPL, TSLA, NVDA)

### Stocktwits not working

**Cause**: Rate limit reached or API issues

**Solution**:
1. System continues with Twitter data only
2. Add `STOCKTWITS_API_TOKEN` to `.env` for higher limits
3. Or disable: `"stocktwits_enabled": False` in config

### Sentiment seems off

**Cause**: Limited data or LLM analysis issues

**Solution**:
1. Check `data['warnings']` for issues
2. System falls back to keyword-based sentiment if LLM fails
3. More tweets = better sentiment accuracy

### Cache not updating

**Cause**: Cache duration not expired

**Solution**:
1. Wait for cache to expire (default 1 hour)
2. Or manually delete cache file
3. Or reduce `cache_duration` in config

## Advanced Usage

### Custom Account Lists Per Ticker

```python
# Create custom config for specific ticker
custom_config = DEFAULT_CONFIG["twitter_monitor"].copy()
custom_config["curated_accounts"] = [
    "elonmusk",  # For TSLA
    "TeslaDaily",
    "SawyerMerritt",
]

monitor = TwitterSocialMonitor(config=custom_config)
data = monitor.get_sentiment_data(ticker="TSLA")
```

### Batch Analysis

```python
tickers = ["AAPL", "GOOGL", "MSFT", "TSLA"]

for ticker in tickers:
    data = monitor.get_sentiment_data(ticker=ticker)
    print(f"{ticker}: Sentiment = {data['sentiment_summary']['overall_sentiment']:.2f}")
```

### Export to CSV

```python
import pandas as pd

data = monitor.get_sentiment_data(ticker="AAPL")

# Convert tweets to DataFrame
tweets_df = pd.DataFrame(data['tweets'])
tweets_df.to_csv(f"twitter_sentiment_AAPL.csv", index=False)
```

## Integration with Existing Workflow

The Twitter monitor integrates seamlessly with your existing TradingAgents workflow:

1. **Social Sentiment Analyst** automatically calls `get_twitter_sentiment()`
2. Twitter data is included in the sentiment report
3. Bull/Bear researchers consider Twitter sentiment in debates
4. Final trading decision incorporates social sentiment

No changes needed to your existing code!

## Cost Optimization

- **Nitter RSS**: Free, no API costs
- **Stocktwits**: Free tier (200 calls/hour)
- **LLM Analysis**: ~$0.01-0.05 per ticker
- **Caching**: Reduces costs by 95%+

**Total cost per analysis**: ~$0.01-0.05 (LLM only)

## Future Enhancements

Planned features:
- Account categorization (technical, fundamental, news)
- Historical sentiment trends
- Sentiment alerts for dramatic shifts
- Image analysis from chart tweets
- Custom account recommendations per ticker

## Support

For issues or questions:
1. Check this guide first
2. Review error messages in logs
3. Check `data['errors']` and `data['warnings']`
4. Verify Nitter instances are accessible
5. Test with popular tickers first (AAPL, TSLA)

## Example: Complete Analysis

```python
from tradingagents.graph.trading_graph import TradingAgentsGraph

# Run complete analysis with Twitter sentiment
graph = TradingAgentsGraph()
result = graph.run(ticker="AAPL")

# Twitter sentiment is automatically included in:
# - result["sentiment_report"] (Social Sentiment Analyst)
# - Bull/Bear debate considerations
# - Final trading decision

print("=== Analysis Complete ===")
print(f"Final Decision: {result['final_decision']}")
print(f"\nSocial Sentiment Report:\n{result['sentiment_report']}")
```

That's it! The Twitter monitor is now part of your trading analysis workflow. 🚀
