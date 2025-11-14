# Social Analyst Data Sources - Complete Guide

**Last Updated**: November 12, 2025  
**Status**: ✅ Fully Functional

## Overview

The Social Analyst (Sentiment Analyst) fetches data from **two primary sources**:

1. **Twitter** (via Nitter RSS feeds) - Curated financial accounts
2. **Stocktwits** (via API) - Community sentiment platform

## Data Source #1: Twitter via Nitter RSS

### What is Nitter?

Nitter is a **free, privacy-focused Twitter frontend** that provides RSS feeds without requiring Twitter API access. This allows us to monitor Twitter **without API costs**.

### Curated Financial Accounts Monitored

The system monitors **8 high-quality financial Twitter accounts**:

| Account | Focus | Why Monitored |
|---------|-------|---------------|
| **@ChartChampions** | Technical Analysis | Expert chart patterns, support/resistance levels |
| **@unusual_whales** | Options Flow | Large options trades, institutional activity |
| **@DeItaone** (Walter Bloomberg) | Breaking News | Real-time market-moving news |
| **@zerohedge** | Market News | Alternative market perspectives, macro trends |
| **@TradingView** | Charts & Analysis | Technical indicators, trading ideas |
| **@Investingcom** | Financial News | Global market updates, economic data |
| **@YahooFinance** | Market Updates | Mainstream financial news, earnings |
| **@MarketWatch** | News & Analysis | Market commentary, sector analysis |

### How It Works

1. **RSS Feed Fetching**:
   ```
   Nitter Instance → RSS Feed → Parse XML → Extract Tweets
   ```

2. **Instance Rotation**:
   - Uses 4 Nitter instances for reliability
   - Rotates if one fails
   - Instances: nitter.net, nitter.it, nitter.privacydev.net, nitter.poast.org

3. **Ticker Filtering**:
   - Searches for: `$AAPL`, `#AAPL`, or `AAPL` (word boundary)
   - Only includes tweets mentioning the specific ticker

4. **Rate Limiting**:
   - 6 seconds between requests (10 requests/minute)
   - Prevents overwhelming Nitter instances
   - Respects community resources

### Configuration

```python
"curated_accounts": [
    "ChartChampions",
    "unusual_whales",
    "DeItaone",
    "zerohedge",
    "TradingView",
    "Investingcom",
    "YahooFinance",
    "MarketWatch",
],
"max_tweets_per_account": 20,  # Fetch up to 20 recent tweets per account
"rate_limit_delay": 6,          # 6 seconds between requests
```

## Data Source #2: Stocktwits API

### What is Stocktwits?

Stocktwits is a **social media platform for traders and investors**. It's like Twitter but specifically for financial markets.

### Features

1. **Ticker-Specific Streams**:
   - Each stock has its own message stream
   - Users tag messages with tickers (e.g., `$AAPL`)

2. **Built-in Sentiment**:
   - Users mark messages as "Bullish" or "Bearish"
   - Provides explicit sentiment signals

3. **Community Metrics**:
   - Message volume (activity level)
   - Likes/engagement
   - User credibility

### How It Works

1. **API Endpoint**:
   ```
   GET https://api.stocktwits.com/api/2/streams/symbol/{ticker}.json
   ```

2. **Authentication**:
   - **Optional**: Works without API token (public data)
   - **With Token**: Higher rate limits, more features
   - Set via: `STOCKTWITS_API_TOKEN` environment variable

3. **Data Fetched**:
   - Last 30 messages for the ticker
   - Sentiment labels (bullish/bearish/neutral)
   - User information
   - Engagement metrics

### Configuration

```python
"stocktwits_enabled": True,
"stocktwits_api_token": None,  # Optional - works without it
"stocktwits_message_limit": 30,
```

## Combined Analysis Process

### Step 1: Data Collection

```
Twitter (Nitter) → 8 accounts × 20 tweets = ~160 tweets
                 ↓ Filter by ticker
                 → ~10-30 relevant tweets

Stocktwits API → 30 messages for ticker
```

### Step 2: Sentiment Analysis

The system analyzes sentiment using:

1. **Keyword Analysis**:
   - Bullish keywords: "buy", "bullish", "moon", "breakout", "strong"
   - Bearish keywords: "sell", "bearish", "crash", "weak", "dump"

2. **LLM-Powered Analysis** (Optional):
   - Uses OpenAI to understand context
   - Detects sarcasm and nuance
   - Identifies key themes

3. **Stocktwits Labels**:
   - Direct sentiment from user tags
   - Weighted by engagement

### Step 3: Report Generation

The Social Analyst generates a comprehensive report including:

- **Overall Sentiment Score**: -1.0 (very bearish) to +1.0 (very bullish)
- **Confidence Level**: Based on data volume and consistency
- **Bullish Arguments**: Key positive points from community
- **Bearish Arguments**: Key negative points from community
- **Key Themes**: Trending topics and discussions
- **Influential Accounts**: Most active/credible voices
- **Sample Tweets**: Representative messages

## Caching System

### Why Caching?

- Reduces API calls
- Faster analysis
- Respects rate limits
- Saves costs

### How It Works

```python
"cache_duration": 3600,  # 1 hour
"cache_directory": "tradingagents/dataflows/data_cache/twitter/"
```

1. **First Request**: Fetches fresh data, saves to cache
2. **Subsequent Requests** (within 1 hour): Uses cached data
3. **After 1 Hour**: Fetches fresh data again

### Cache Key Format

```
{ticker}_{timeframe}_{timestamp}.json
```

Example: `AAPL_24h_20251112_1400.json`

## Data Quality & Reliability

### Strengths

✅ **Curated Sources**: Only high-quality financial accounts  
✅ **Multiple Platforms**: Twitter + Stocktwits for diversity  
✅ **Real-time**: Recent tweets and messages  
✅ **Free**: No API costs (Nitter RSS + public Stocktwits)  
✅ **Reliable**: Instance rotation, retry logic, caching  

### Limitations

⚠️ **Volume**: Limited to ~40-60 data points per analysis  
⚠️ **Nitter Availability**: Instances can go down (rotation helps)  
⚠️ **Noise**: Social media can be noisy/emotional  
⚠️ **Lag**: RSS feeds may have slight delay vs real-time Twitter  

## Comparison to Other Data Sources

| Source | Cost | Quality | Volume | Real-time |
|--------|------|---------|--------|-----------|
| **Twitter API v2** | $100-5000/mo | High | High | Yes |
| **Nitter RSS** (Current) | Free | High | Medium | Near real-time |
| **Stocktwits API** | Free | Medium | Medium | Yes |
| **Reddit API** | Free | Medium | High | Yes |
| **News APIs** | $0-500/mo | High | Medium | Yes |

## Upgrading Data Sources

### Option 1: Add Twitter API v2 (Premium)

**Cost**: $100-5000/month  
**Benefits**:
- Real-time streaming
- Higher volume
- Full tweet metadata
- Search capabilities

**Setup**:
```python
# In default_config.py
"twitter_api_v2_enabled": True,
"twitter_bearer_token": os.getenv("TWITTER_BEARER_TOKEN"),
```

### Option 2: Add Reddit Integration

**Cost**: Free  
**Benefits**:
- r/wallstreetbets sentiment
- r/stocks discussions
- Community insights

**Setup**: Already implemented in `twitter_monitor.py` (can be enabled)

### Option 3: Add More Curated Accounts

**Cost**: Free  
**Benefits**:
- More data points
- Diverse perspectives

**How**:
```python
"curated_accounts": [
    # ... existing accounts ...
    "jimcramer",          # CNBC host
    "carlquintanilla",    # CNBC anchor
    "SquawkCNBC",        # CNBC show
    "business",          # Bloomberg
],
```

## Testing the Social Analyst

### Quick Test

```python
from tradingagents.dataflows.twitter_tools import get_twitter_sentiment

# Fetch sentiment for Apple
report = get_twitter_sentiment("AAPL", "24h")
print(report)
```

### Expected Output

```
=== Twitter/Social Sentiment Report for $AAPL ===

Overall Sentiment: 0.65 (Bullish)
Confidence: 0.78
Data Points: 45 tweets, 28 Stocktwits messages

Bullish Arguments:
- Strong iPhone 16 sales momentum
- Services revenue growth accelerating
- AI features driving upgrades

Bearish Arguments:
- China market concerns
- Valuation stretched at current levels
- Competition from Android

Key Themes:
- AI integration
- China sales
- Holiday season outlook

Top Accounts:
- @unusual_whales: 5 mentions (bullish)
- @ChartChampions: 3 mentions (neutral)
- @DeItaone: 2 mentions (bearish)

Sample Tweets:
[Recent relevant tweets...]
```

## Troubleshooting

### Issue: No tweets found

**Cause**: Nitter instances down or ticker not mentioned  
**Solution**: 
- Check Nitter instance status
- Try different ticker
- Increase `max_tweets_per_account`

### Issue: Stocktwits API error

**Cause**: Rate limit or API down  
**Solution**:
- Wait 1 minute
- Check Stocktwits status
- Disable Stocktwits temporarily

### Issue: Slow performance

**Cause**: Fetching from many accounts  
**Solution**:
- Reduce `curated_accounts` list
- Decrease `max_tweets_per_account`
- Enable caching

## Best Practices

1. **Use Caching**: Enable 1-hour cache for repeated analyses
2. **Monitor Rate Limits**: Respect Nitter and Stocktwits limits
3. **Curate Accounts**: Only add high-quality sources
4. **Combine with News**: Use Social + News analysts together
5. **Context Matters**: Social sentiment is one signal, not the only signal

## Summary

The Social Analyst provides **valuable real-time sentiment** from:
- ✅ 8 curated financial Twitter accounts (via free Nitter RSS)
- ✅ Stocktwits community messages (via free API)
- ✅ ~40-60 data points per analysis
- ✅ Bullish/bearish arguments and key themes
- ✅ No API costs required

This gives you **professional-grade social sentiment analysis** without the $100-5000/month Twitter API costs!
