# Design Document: Financial Twitter/Social Monitor

## Overview

The Financial Twitter/Social Monitor is a data collection and analysis system that enhances the TradingAgents platform by gathering social sentiment from curated financial Twitter accounts and Stocktwits. The system uses free Nitter RSS feeds to avoid Twitter API costs while providing high-quality sentiment signals from trusted financial commentators. It integrates seamlessly with the existing Social Sentiment Analyst agent through a tool-based interface.

### Design Goals

1. **Cost-Effective**: Use free data sources (Nitter RSS) as primary method
2. **High Signal Quality**: Focus on curated accounts rather than noisy general feeds
3. **Resilient**: Handle failures gracefully with fallbacks and caching
4. **Extensible**: Easy to add new accounts or data sources
5. **Integrated**: Work seamlessly with existing Social Sentiment Analyst

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Social Sentiment Analyst                    │
│                  (Existing Agent)                            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Calls get_twitter_sentiment()
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Twitter Monitor Tool Function                   │
│              (New Integration Point)                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              TwitterSocialMonitor Class                      │
│              (Core Orchestrator)                             │
└─────┬───────────────────┬───────────────────┬───────────────┘
      │                   │                   │
      ▼                   ▼                   ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Nitter     │  │  Stocktwits  │  │   Sentiment  │
│   Fetcher    │  │   Fetcher    │  │   Analyzer   │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                  │
       ▼                 ▼                  ▼
┌──────────────────────────────────────────────────┐
│              Data Cache Layer                     │
│         (tradingagents/dataflows/data_cache/)    │
└──────────────────────────────────────────────────┘
```

### Component Interaction Flow

```
1. Social Sentiment Analyst invokes get_twitter_sentiment(ticker="AAPL")
2. TwitterSocialMonitor checks cache for recent data
3. If cache miss or expired:
   a. NitterFetcher fetches tweets from curated accounts
   b. StockwitsFetcher fetches Stocktwits messages (if enabled)
   c. Data is filtered for ticker mentions
4. SentimentAnalyzer processes collected content with LLM
5. Results are cached and returned to analyst
6. Social Sentiment Analyst includes Twitter data in final report
```

## Components and Interfaces

### 1. TwitterSocialMonitor (Main Orchestrator)

**Location**: `tradingagents/dataflows/twitter_monitor.py`

**Responsibilities**:
- Coordinate data fetching from multiple sources
- Manage caching and cache invalidation
- Filter content for ticker mentions
- Aggregate results from all sources

**Key Methods**:

```python
class TwitterSocialMonitor:
    def __init__(self, config: dict):
        """Initialize with configuration for accounts, Nitter instances, etc."""
        
    def get_sentiment_data(self, ticker: str, timeframe: str = "24h") -> dict:
        """
        Main entry point for fetching Twitter sentiment data.
        
        Returns:
        {
            "tweets": [...],
            "stocktwits_messages": [...],
            "sentiment_summary": {...},
            "key_accounts": [...],
            "cache_used": bool
        }
        """
        
    def _check_cache(self, ticker: str) -> Optional[dict]:
        """Check if cached data exists and is still valid."""
        
    def _save_cache(self, ticker: str, data: dict):
        """Save fetched data to cache."""
```

### 2. NitterFetcher (Twitter RSS Scraper)

**Location**: `tradingagents/dataflows/twitter_monitor.py`

**Responsibilities**:
- Fetch tweets from curated accounts via Nitter RSS
- Rotate between Nitter instances for reliability
- Parse RSS feeds into structured tweet objects
- Handle rate limiting and retries

**Key Methods**:

```python
class NitterFetcher:
    def __init__(self, nitter_instances: List[str], curated_accounts: List[str]):
        """Initialize with Nitter instances and account list."""
        
    def fetch_tweets(self, ticker: str, max_tweets_per_account: int = 20) -> List[Tweet]:
        """
        Fetch recent tweets from all curated accounts.
        
        Returns list of Tweet objects with:
        - text: str
        - author: str
        - timestamp: datetime
        - url: str
        - mentions_ticker: bool
        """
        
    def _fetch_from_nitter(self, account: str, nitter_url: str) -> List[dict]:
        """Fetch RSS feed from specific Nitter instance."""
        
    def _parse_rss_feed(self, rss_content: str) -> List[dict]:
        """Parse RSS XML into structured data."""
        
    def _filter_by_ticker(self, tweets: List[Tweet], ticker: str) -> List[Tweet]:
        """Filter tweets to only those mentioning the ticker."""
```

### 3. StockwitsFetcher (Stocktwits API Client)

**Location**: `tradingagents/dataflows/twitter_monitor.py`

**Responsibilities**:
- Fetch messages from Stocktwits API
- Handle API authentication (if provided)
- Parse Stocktwits responses
- Respect rate limits

**Key Methods**:

```python
class StockwitsFetcher:
    def __init__(self, api_token: Optional[str] = None):
        """Initialize with optional API token."""
        
    def fetch_messages(self, ticker: str, limit: int = 30) -> List[StocktwitsMessage]:
        """
        Fetch recent Stocktwits messages for ticker.
        
        Returns list of StocktwitsMessage objects with:
        - text: str
        - sentiment: str (bullish/bearish/neutral)
        - timestamp: datetime
        - user: str
        - likes: int
        """
        
    def _make_api_request(self, endpoint: str, params: dict) -> dict:
        """Make authenticated API request to Stocktwits."""
```

### 4. SentimentAnalyzer (LLM-based Analysis)

**Location**: `tradingagents/dataflows/twitter_monitor.py`

**Responsibilities**:
- Analyze sentiment of individual tweets/messages
- Aggregate sentiment across all content
- Extract key themes and arguments
- Identify influential accounts

**Key Methods**:

```python
class SentimentAnalyzer:
    def __init__(self, llm):
        """Initialize with LLM instance."""
        
    def analyze_content(self, tweets: List[Tweet], 
                       stocktwits: List[StocktwitsMessage],
                       ticker: str) -> dict:
        """
        Analyze all social content and generate sentiment report.
        
        Returns:
        {
            "overall_sentiment": float,  # -1.0 to 1.0
            "confidence": float,  # 0.0 to 1.0
            "bullish_arguments": List[str],
            "bearish_arguments": List[str],
            "key_themes": List[str],
            "influential_accounts": List[dict],
            "sample_tweets": List[dict]
        }
        """
        
    def _score_individual_content(self, content: str) -> float:
        """Score individual tweet/message sentiment."""
        
    def _extract_themes(self, all_content: List[str]) -> List[str]:
        """Extract common themes using LLM."""
        
    def _rank_accounts(self, tweets: List[Tweet]) -> List[dict]:
        """Rank accounts by influence and relevance."""
```

### 5. Tool Function Integration

**Location**: `tradingagents/agents/analyst_agents.py` (modify existing)

**Integration Point**:

```python
def get_twitter_sentiment(ticker: str, timeframe: str = "24h") -> str:
    """
    Tool function for Social Sentiment Analyst to fetch Twitter data.
    
    Args:
        ticker: Stock symbol (e.g., "AAPL")
        timeframe: Time window for data (e.g., "24h", "7d")
        
    Returns:
        Formatted string report of Twitter sentiment analysis
    """
    from tradingagents.dataflows.twitter_monitor import TwitterSocialMonitor
    
    config = get_twitter_config()  # Load from default_config
    monitor = TwitterSocialMonitor(config)
    
    data = monitor.get_sentiment_data(ticker, timeframe)
    
    # Format as readable report
    report = format_twitter_report(data)
    return report
```

## Data Models

### Tweet Object

```python
@dataclass
class Tweet:
    text: str
    author: str
    timestamp: datetime
    url: str
    mentions_ticker: bool
    ticker_symbols: List[str]
    sentiment_score: Optional[float] = None
```

### StocktwitsMessage Object

```python
@dataclass
class StocktwitsMessage:
    text: str
    sentiment: str  # "bullish", "bearish", "neutral"
    timestamp: datetime
    user: str
    likes: int
    ticker: str
```

### SentimentReport Object

```python
@dataclass
class SentimentReport:
    ticker: str
    overall_sentiment: float  # -1.0 to 1.0
    confidence: float  # 0.0 to 1.0
    total_tweets: int
    total_stocktwits: int
    bullish_arguments: List[str]
    bearish_arguments: List[str]
    key_themes: List[str]
    influential_accounts: List[dict]
    sample_tweets: List[dict]
    timestamp: datetime
    cache_used: bool
```

## Configuration

### Configuration Structure

Add to `tradingagents/default_config.py`:

```python
TWITTER_MONITOR_CONFIG = {
    # Curated Twitter accounts to monitor
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
    
    # Nitter instances for RSS feeds (rotate for reliability)
    "nitter_instances": [
        "https://nitter.net",
        "https://nitter.it",
        "https://nitter.privacydev.net",
        "https://nitter.poast.org",
    ],
    
    # Stocktwits configuration
    "stocktwits_enabled": True,
    "stocktwits_api_token": None,  # Optional, uses free tier if None
    "stocktwits_message_limit": 30,
    
    # Fetching behavior
    "max_tweets_per_account": 20,
    "request_timeout": 10,  # seconds
    "max_retries": 3,
    "rate_limit_delay": 6,  # seconds between requests (10 req/min)
    
    # Caching
    "cache_duration": 3600,  # 1 hour in seconds
    "cache_directory": "tradingagents/dataflows/data_cache/twitter/",
    
    # Sentiment analysis
    "use_llm_sentiment": True,
    "sentiment_batch_size": 50,  # Process tweets in batches
}
```

### Environment Variables

Optional `.env` additions:

```
STOCKTWITS_API_TOKEN=your_token_here  # Optional
TWITTER_CACHE_DURATION=3600
```

## Error Handling

### Error Handling Strategy

1. **Nitter Instance Failures**:
   - Try next instance in rotation
   - Log failed instances
   - Continue with successful fetches
   - Return partial data if some accounts succeed

2. **Stocktwits API Errors**:
   - Log error but don't fail entire operation
   - Return Twitter data only
   - Use cached Stocktwits data if available

3. **Network Timeouts**:
   - Retry with exponential backoff (1s, 2s, 4s)
   - Max 3 retries per request
   - Continue with other accounts if one fails

4. **Cache Errors**:
   - Log cache read/write failures
   - Continue without cache if unavailable
   - Never block on cache operations

5. **LLM Sentiment Analysis Errors**:
   - Fall back to simple keyword-based sentiment
   - Log LLM errors for debugging
   - Return basic sentiment scores

### Error Response Format

```python
{
    "success": bool,
    "data": dict,  # Partial or full data
    "errors": List[str],  # List of error messages
    "warnings": List[str],  # Non-critical issues
    "cache_used": bool
}
```

## Testing Strategy

### Unit Tests

**Location**: `tests/test_twitter_monitor.py`

1. **NitterFetcher Tests**:
   - Test RSS parsing with mock data
   - Test ticker filtering logic
   - Test Nitter instance rotation
   - Test rate limiting

2. **StockwitsFetcher Tests**:
   - Test API response parsing
   - Test authentication handling
   - Test rate limit handling

3. **SentimentAnalyzer Tests**:
   - Test sentiment scoring with sample tweets
   - Test theme extraction
   - Test account ranking logic

4. **TwitterSocialMonitor Tests**:
   - Test cache hit/miss logic
   - Test data aggregation
   - Test error handling with mock failures

### Integration Tests

**Location**: `tests/integration/test_twitter_integration.py`

1. Test full flow with real Nitter instances (use test accounts)
2. Test integration with Social Sentiment Analyst
3. Test caching behavior across multiple calls
4. Test graceful degradation when services are unavailable

### Manual Testing

1. Run analysis on known tickers with active Twitter discussion
2. Verify sentiment matches manual review of tweets
3. Test with various curated account configurations
4. Verify cache performance and invalidation

## Performance Considerations

### Optimization Strategies

1. **Parallel Fetching**:
   - Fetch from multiple accounts concurrently using `asyncio` or `ThreadPoolExecutor`
   - Reduces total fetch time from ~20s to ~3-5s

2. **Aggressive Caching**:
   - Cache for 1 hour by default
   - Social sentiment doesn't change rapidly enough to need real-time updates
   - Reduces API calls by 95%+ for repeated analyses

3. **Batch LLM Processing**:
   - Process tweets in batches of 50 for sentiment analysis
   - Reduces LLM API calls and costs
   - Single prompt can analyze multiple tweets

4. **Smart Filtering**:
   - Filter for ticker mentions before sentiment analysis
   - Reduces LLM processing by 80-90%
   - Only analyze relevant content

### Expected Performance

- **Cold start** (no cache): 10-15 seconds
- **Warm start** (cached): <1 second
- **API costs**: $0 (Nitter) + optional Stocktwits free tier
- **LLM costs**: ~$0.01-0.05 per analysis (depending on tweet volume)

## Security Considerations

1. **No Authentication Required**: Nitter RSS feeds are public, no credentials to protect
2. **Optional API Tokens**: Stocktwits token stored in `.env`, never committed
3. **Rate Limiting**: Respect Nitter instances to avoid being blocked
4. **Input Validation**: Sanitize ticker symbols to prevent injection attacks
5. **Cache Security**: Cache files stored locally, no sensitive data

## Deployment Considerations

### Dependencies

Add to `requirements.txt`:

```
feedparser>=6.0.10  # RSS feed parsing
requests>=2.31.0    # HTTP requests (already included)
python-dateutil>=2.8.2  # Date parsing (already included)
```

### Installation Steps

1. Install new dependencies: `pip install feedparser`
2. No API keys required for basic functionality
3. Optional: Add Stocktwits API token to `.env`
4. System will auto-create cache directory on first run

### Monitoring

1. Log all Nitter instance failures for monitoring
2. Track cache hit rates
3. Monitor LLM API costs for sentiment analysis
4. Alert if all Nitter instances fail

## Future Enhancements

### Phase 2 Potential Features

1. **Account Categories**: Group accounts by type (technical, fundamental, news)
2. **Engagement Metrics**: Track likes, retweets for influence scoring
3. **Historical Trends**: Store sentiment over time for trend analysis
4. **Custom Account Lists**: Per-ticker account recommendations
5. **Image Analysis**: Extract and analyze chart images from tweets
6. **Real-time Streaming**: WebSocket connection for live updates
7. **Sentiment Alerts**: Notify when sentiment shifts dramatically

### Alternative Data Sources

1. **Reddit Integration**: Already exists, ensure consistency
2. **Discord Servers**: Monitor trading Discord servers
3. **Telegram Channels**: Financial Telegram groups
4. **YouTube**: Transcribe and analyze financial YouTube videos
