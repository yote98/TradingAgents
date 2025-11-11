"""
Financial Twitter/Social Monitor

This module provides functionality to monitor and analyze social sentiment from
curated financial Twitter accounts and Stocktwits. It uses free Nitter RSS feeds
to avoid Twitter API costs while providing high-quality sentiment signals.
"""

import os
import json
import logging
import time
import re
import hashlib
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from concurrent.futures import ThreadPoolExecutor, as_completed

import feedparser
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from dateutil import parser as date_parser

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class Tweet:
    """Represents a tweet from a financial Twitter account."""
    text: str
    author: str
    timestamp: datetime
    url: str
    mentions_ticker: bool
    ticker_symbols: List[str]
    sentiment_score: Optional[float] = None


@dataclass
class StocktwitsMessage:
    """Represents a message from Stocktwits."""
    text: str
    sentiment: str  # "bullish", "bearish", "neutral"
    timestamp: datetime
    user: str
    likes: int
    ticker: str


@dataclass
class SentimentReport:
    """Aggregated sentiment report from social media analysis."""
    ticker: str
    overall_sentiment: float  # -1.0 to 1.0
    confidence: float  # 0.0 to 1.0
    total_tweets: int
    total_stocktwits: int
    bullish_arguments: List[str]
    bearish_arguments: List[str]
    key_themes: List[str]
    influential_accounts: List[Dict[str, Any]]
    sample_tweets: List[Dict[str, Any]]
    timestamp: datetime
    cache_used: bool


class NitterFetcher:
    """
    Fetches tweets from curated accounts via Nitter RSS feeds.
    
    Handles instance rotation, rate limiting, and RSS parsing.
    """
    
    def __init__(self, nitter_instances: List[str], curated_accounts: List[str],
                 rate_limit_delay: float = 6.0, max_retries: int = 3, timeout: int = 10):
        """
        Initialize the Nitter fetcher.
        
        Args:
            nitter_instances: List of Nitter instance URLs
            curated_accounts: List of Twitter account usernames to monitor
            rate_limit_delay: Delay between requests in seconds
            max_retries: Maximum number of retry attempts
            timeout: Request timeout in seconds
        """
        self.nitter_instances = nitter_instances
        self.curated_accounts = curated_accounts
        self.rate_limit_delay = rate_limit_delay
        self.max_retries = max_retries
        self.timeout = timeout
        self.current_instance_index = 0
        
        # Setup session with retries
        self.session = requests.Session()
        retry_strategy = Retry(
            total=max_retries,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504]
        )
        adapter = HTTPAdapter(max_retries=retry_strategy)
        self.session.mount("http://", adapter)
        self.session.mount("https://", adapter)
        
        logger.info(f"NitterFetcher initialized with {len(curated_accounts)} accounts")
    
    def fetch_tweets(self, ticker: str, max_tweets_per_account: int = 20) -> List[Tweet]:
        """
        Fetch recent tweets from all curated accounts.
        
        Args:
            ticker: Stock symbol to filter for
            max_tweets_per_account: Maximum tweets to fetch per account
            
        Returns:
            List of Tweet objects mentioning the ticker
        """
        logger.info(f"Fetching tweets for {ticker} from {len(self.curated_accounts)} accounts")
        
        all_tweets = []
        
        # Fetch tweets from each account
        for account in self.curated_accounts:
            try:
                tweets = self._fetch_account_tweets(account, max_tweets_per_account)
                all_tweets.extend(tweets)
                time.sleep(self.rate_limit_delay)  # Rate limiting
            except Exception as e:
                logger.warning(f"Failed to fetch tweets from {account}: {e}")
                continue
        
        # Filter for ticker mentions
        filtered_tweets = self._filter_by_ticker(all_tweets, ticker)
        logger.info(f"Found {len(filtered_tweets)} tweets mentioning {ticker}")
        
        return filtered_tweets
    
    def _fetch_account_tweets(self, account: str, max_tweets: int) -> List[Tweet]:
        """Fetch tweets from a specific account."""
        for instance in self.nitter_instances:
            try:
                rss_url = f"{instance}/{account}/rss"
                response = self.session.get(rss_url, timeout=self.timeout)
                response.raise_for_status()
                
                tweets = self._parse_rss_feed(response.content, account)
                return tweets[:max_tweets]
                
            except Exception as e:
                logger.debug(f"Failed to fetch from {instance} for {account}: {e}")
                continue
        
        logger.warning(f"All Nitter instances failed for {account}")
        return []
    
    def _parse_rss_feed(self, rss_content: bytes, account: str) -> List[Tweet]:
        """Parse RSS XML into structured Tweet objects."""
        try:
            feed = feedparser.parse(rss_content)
            tweets = []
            
            for entry in feed.entries:
                try:
                    # Extract tweet data
                    text = entry.get('title', '') or entry.get('summary', '')
                    url = entry.get('link', '')
                    
                    # Parse timestamp
                    timestamp = datetime.now()
                    if hasattr(entry, 'published_parsed') and entry.published_parsed:
                        timestamp = datetime(*entry.published_parsed[:6])
                    elif hasattr(entry, 'published'):
                        try:
                            timestamp = date_parser.parse(entry.published)
                        except:
                            pass
                    
                    tweet = Tweet(
                        text=text,
                        author=account,
                        timestamp=timestamp,
                        url=url,
                        mentions_ticker=False,  # Will be set by filter
                        ticker_symbols=[],
                        sentiment_score=None
                    )
                    tweets.append(tweet)
                    
                except Exception as e:
                    logger.debug(f"Failed to parse tweet entry: {e}")
                    continue
            
            return tweets
            
        except Exception as e:
            logger.error(f"Failed to parse RSS feed: {e}")
            return []
    
    def _filter_by_ticker(self, tweets: List[Tweet], ticker: str) -> List[Tweet]:
        """Filter tweets to only those mentioning the ticker."""
        ticker_upper = ticker.upper()
        patterns = [
            rf'\${ticker_upper}\b',  # $AAPL
            rf'#{ticker_upper}\b',   # #AAPL
            rf'\b{ticker_upper}\b',  # AAPL (word boundary)
        ]
        
        filtered = []
        for tweet in tweets:
            text_upper = tweet.text.upper()
            for pattern in patterns:
                if re.search(pattern, text_upper):
                    tweet.mentions_ticker = True
                    tweet.ticker_symbols = [ticker_upper]
                    filtered.append(tweet)
                    break
        
        return filtered


class StockwitsFetcher:
    """
    Fetches messages from Stocktwits API.
    
    Handles API authentication, rate limiting, and response parsing.
    """
    
    def __init__(self, api_token: Optional[str] = None, message_limit: int = 30, timeout: int = 10):
        """
        Initialize the Stocktwits fetcher.
        
        Args:
            api_token: Optional Stocktwits API token
            message_limit: Maximum messages to fetch
            timeout: Request timeout in seconds
        """
        self.api_token = api_token
        self.message_limit = message_limit
        self.timeout = timeout
        self.base_url = "https://api.stocktwits.com/api/2"
        
        logger.info(f"StockwitsFetcher initialized (authenticated: {api_token is not None})")
    
    def fetch_messages(self, ticker: str, limit: int = 30) -> List[StocktwitsMessage]:
        """
        Fetch recent Stocktwits messages for ticker.
        
        Args:
            ticker: Stock symbol
            limit: Maximum messages to fetch
            
        Returns:
            List of StocktwitsMessage objects
        """
        logger.info(f"Fetching Stocktwits messages for {ticker}")
        
        try:
            endpoint = f"{self.base_url}/streams/symbol/{ticker}.json"
            params = {"limit": min(limit, self.message_limit)}
            
            response = self._make_api_request(endpoint, params)
            
            if response and "messages" in response:
                messages = self._parse_messages(response["messages"], ticker)
                logger.info(f"Fetched {len(messages)} Stocktwits messages for {ticker}")
                return messages
            
            return []
            
        except Exception as e:
            logger.warning(f"Failed to fetch Stocktwits messages: {e}")
            return []
    
    def _make_api_request(self, endpoint: str, params: dict) -> Optional[dict]:
        """Make authenticated API request to Stocktwits."""
        try:
            headers = {}
            if self.api_token:
                headers["Authorization"] = f"Bearer {self.api_token}"
            
            response = requests.get(endpoint, params=params, headers=headers, timeout=self.timeout)
            response.raise_for_status()
            
            return response.json()
            
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 429:
                logger.warning("Stocktwits rate limit reached")
            else:
                logger.error(f"Stocktwits API error: {e}")
            return None
        except Exception as e:
            logger.error(f"Stocktwits request failed: {e}")
            return None
    
    def _parse_messages(self, messages: List[dict], ticker: str) -> List[StocktwitsMessage]:
        """Parse Stocktwits API response into StocktwitsMessage objects."""
        parsed = []
        
        for msg in messages:
            try:
                # Extract sentiment
                sentiment = "neutral"
                if msg.get("entities") and msg["entities"].get("sentiment"):
                    sentiment = msg["entities"]["sentiment"].get("basic", "neutral")
                
                # Parse timestamp
                timestamp = datetime.now()
                if msg.get("created_at"):
                    try:
                        timestamp = date_parser.parse(msg["created_at"])
                    except:
                        pass
                
                message = StocktwitsMessage(
                    text=msg.get("body", ""),
                    sentiment=sentiment,
                    timestamp=timestamp,
                    user=msg.get("user", {}).get("username", "unknown"),
                    likes=msg.get("likes", {}).get("total", 0),
                    ticker=ticker
                )
                parsed.append(message)
                
            except Exception as e:
                logger.debug(f"Failed to parse Stocktwits message: {e}")
                continue
        
        return parsed


class SentimentAnalyzer:
    """
    Analyzes sentiment of social media content using LLM.
    
    Provides sentiment scoring, theme extraction, and account ranking.
    """
    
    def __init__(self, llm, batch_size: int = 50):
        """
        Initialize the sentiment analyzer.
        
        Args:
            llm: LLM instance for sentiment analysis
            batch_size: Number of tweets to process in one batch
        """
        self.llm = llm
        self.batch_size = batch_size
        logger.info("SentimentAnalyzer initialized")
    
    def analyze_content(self, tweets: List[Tweet], 
                       stocktwits: List[StocktwitsMessage],
                       ticker: str) -> dict:
        """
        Analyze all social content and generate sentiment report.
        
        Args:
            tweets: List of tweets
            stocktwits: List of Stocktwits messages
            ticker: Stock symbol
            
        Returns:
            Dictionary with sentiment analysis results
        """
        logger.info(f"Analyzing sentiment for {ticker} ({len(tweets)} tweets, {len(stocktwits)} stocktwits)")
        
        if not tweets and not stocktwits:
            return self._empty_analysis()
        
        try:
            # Combine all content
            all_content = []
            for tweet in tweets:
                all_content.append(f"@{tweet.author}: {tweet.text}")
            for msg in stocktwits:
                all_content.append(f"Stocktwits ({msg.sentiment}): {msg.text}")
            
            # Use LLM for analysis
            analysis_prompt = self._create_analysis_prompt(ticker, all_content)
            
            try:
                response = self.llm.invoke(analysis_prompt)
                result = self._parse_llm_response(response.content if hasattr(response, 'content') else str(response))
            except Exception as e:
                logger.warning(f"LLM analysis failed, using fallback: {e}")
                result = self._fallback_analysis(tweets, stocktwits)
            
            # Add account ranking
            result["influential_accounts"] = self._rank_accounts(tweets)
            result["sample_tweets"] = self._get_sample_tweets(tweets, stocktwits)
            
            return result
            
        except Exception as e:
            logger.error(f"Sentiment analysis failed: {e}")
            return self._empty_analysis()
    
    def _create_analysis_prompt(self, ticker: str, content: List[str]) -> str:
        """Create prompt for LLM sentiment analysis."""
        content_text = "\n".join(content[:self.batch_size])  # Limit to batch size
        
        return f"""Analyze the following social media posts about ${ticker} and provide:
1. Overall sentiment score (-1.0 to 1.0, where -1 is very bearish, 0 is neutral, 1 is very bullish)
2. Confidence score (0.0 to 1.0)
3. Top 3 bullish arguments
4. Top 3 bearish arguments
5. Key themes (3-5 main topics)

Social media posts:
{content_text}

Respond in JSON format:
{{
    "overall_sentiment": <float>,
    "confidence": <float>,
    "bullish_arguments": [<string>, ...],
    "bearish_arguments": [<string>, ...],
    "key_themes": [<string>, ...]
}}"""
    
    def _parse_llm_response(self, response: str) -> dict:
        """Parse LLM JSON response."""
        try:
            # Extract JSON from response
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            return self._empty_analysis()
        except:
            return self._empty_analysis()
    
    def _fallback_analysis(self, tweets: List[Tweet], stocktwits: List[StocktwitsMessage]) -> dict:
        """Simple keyword-based sentiment analysis as fallback."""
        bullish_keywords = ['buy', 'bull', 'bullish', 'up', 'gain', 'growth', 'strong', 'positive']
        bearish_keywords = ['sell', 'bear', 'bearish', 'down', 'loss', 'weak', 'negative', 'drop']
        
        bullish_count = 0
        bearish_count = 0
        total = 0
        
        for tweet in tweets:
            text_lower = tweet.text.lower()
            bullish_count += sum(1 for kw in bullish_keywords if kw in text_lower)
            bearish_count += sum(1 for kw in bearish_keywords if kw in text_lower)
            total += 1
        
        for msg in stocktwits:
            if msg.sentiment == "bullish":
                bullish_count += 2
            elif msg.sentiment == "bearish":
                bearish_count += 2
            total += 1
        
        if total == 0:
            sentiment = 0.0
        else:
            sentiment = (bullish_count - bearish_count) / max(total, 1)
            sentiment = max(-1.0, min(1.0, sentiment))
        
        return {
            "overall_sentiment": sentiment,
            "confidence": min(total / 20.0, 1.0),  # More content = higher confidence
            "bullish_arguments": ["Positive sentiment detected in social media"],
            "bearish_arguments": ["Negative sentiment detected in social media"],
            "key_themes": ["Social media discussion"]
        }
    
    def _rank_accounts(self, tweets: List[Tweet]) -> List[dict]:
        """Rank accounts by number of relevant tweets."""
        account_counts = {}
        for tweet in tweets:
            account_counts[tweet.author] = account_counts.get(tweet.author, 0) + 1
        
        ranked = sorted(account_counts.items(), key=lambda x: x[1], reverse=True)
        return [{"account": acc, "tweet_count": count} for acc, count in ranked[:5]]
    
    def _get_sample_tweets(self, tweets: List[Tweet], stocktwits: List[StocktwitsMessage]) -> List[dict]:
        """Get sample tweets for the report."""
        samples = []
        for tweet in tweets[:3]:
            samples.append({
                "author": tweet.author,
                "text": tweet.text[:200],
                "url": tweet.url
            })
        return samples
    
    def _empty_analysis(self) -> dict:
        """Return empty analysis structure."""
        return {
            "overall_sentiment": 0.0,
            "confidence": 0.0,
            "bullish_arguments": [],
            "bearish_arguments": [],
            "key_themes": []
        }


class TwitterSocialMonitor:
    """
    Main orchestrator for Twitter and Stocktwits social sentiment monitoring.
    
    Coordinates data fetching from multiple sources, manages caching,
    and aggregates results for sentiment analysis.
    """
    
    def __init__(self, config: dict, llm=None):
        """
        Initialize the Twitter Social Monitor.
        
        Args:
            config: Configuration dictionary with Twitter monitor settings
            llm: Optional LLM instance for sentiment analysis
        """
        self.config = config
        self.cache_dir = config.get("cache_directory", "data_cache/twitter")
        self.cache_duration = config.get("cache_duration", 3600)
        
        # Initialize components
        self.nitter_fetcher = NitterFetcher(
            nitter_instances=config.get("nitter_instances", []),
            curated_accounts=config.get("curated_accounts", []),
            rate_limit_delay=config.get("rate_limit_delay", 6.0),
            max_retries=config.get("max_retries", 3),
            timeout=config.get("request_timeout", 10)
        )
        
        self.stocktwits_fetcher = None
        if config.get("stocktwits_enabled", True):
            self.stocktwits_fetcher = StockwitsFetcher(
                api_token=config.get("stocktwits_api_token"),
                message_limit=config.get("stocktwits_message_limit", 30),
                timeout=config.get("request_timeout", 10)
            )
        
        self.sentiment_analyzer = None
        if llm and config.get("use_llm_sentiment", True):
            self.sentiment_analyzer = SentimentAnalyzer(
                llm=llm,
                batch_size=config.get("sentiment_batch_size", 50)
            )
        
        # Ensure cache directory exists
        os.makedirs(self.cache_dir, exist_ok=True)
        
        logger.info("TwitterSocialMonitor initialized")
    
    def get_sentiment_data(self, ticker: str, timeframe: str = "24h") -> dict:
        """
        Main entry point for fetching Twitter sentiment data.
        
        Args:
            ticker: Stock symbol (e.g., "AAPL")
            timeframe: Time window for data (e.g., "24h", "7d")
            
        Returns:
            Dictionary containing tweets, sentiment analysis, and metadata
        """
        logger.info(f"Fetching sentiment data for {ticker} (timeframe: {timeframe})")
        
        errors = []
        warnings = []
        
        # Check cache first
        cached_data = self._check_cache(ticker)
        if cached_data:
            logger.info(f"Using cached data for {ticker}")
            cached_data["cache_used"] = True
            return cached_data
        
        # Fetch fresh data
        tweets = []
        stocktwits_messages = []
        
        try:
            tweets = self.nitter_fetcher.fetch_tweets(
                ticker=ticker,
                max_tweets_per_account=self.config.get("max_tweets_per_account", 20)
            )
        except Exception as e:
            error_msg = f"Failed to fetch tweets: {e}"
            logger.error(error_msg)
            errors.append(error_msg)
        
        if self.stocktwits_fetcher:
            try:
                stocktwits_messages = self.stocktwits_fetcher.fetch_messages(
                    ticker=ticker,
                    limit=self.config.get("stocktwits_message_limit", 30)
                )
            except Exception as e:
                warning_msg = f"Failed to fetch Stocktwits: {e}"
                logger.warning(warning_msg)
                warnings.append(warning_msg)
        
        # Analyze sentiment
        sentiment_summary = {}
        if self.sentiment_analyzer and (tweets or stocktwits_messages):
            try:
                sentiment_summary = self.sentiment_analyzer.analyze_content(
                    tweets=tweets,
                    stocktwits=stocktwits_messages,
                    ticker=ticker
                )
            except Exception as e:
                warning_msg = f"Sentiment analysis failed: {e}"
                logger.warning(warning_msg)
                warnings.append(warning_msg)
        
        # Prepare result
        result = {
            "ticker": ticker,
            "tweets": [asdict(t) for t in tweets],
            "stocktwits_messages": [asdict(m) for m in stocktwits_messages],
            "sentiment_summary": sentiment_summary,
            "key_accounts": sentiment_summary.get("influential_accounts", []),
            "cache_used": False,
            "success": True,
            "errors": errors,
            "warnings": warnings,
            "timestamp": datetime.now().isoformat()
        }
        
        # Save to cache
        try:
            self._save_cache(ticker, result)
        except Exception as e:
            logger.warning(f"Failed to save cache: {e}")
        
        return result
    
    def _check_cache(self, ticker: str) -> Optional[dict]:
        """Check if cached data exists and is still valid."""
        try:
            cache_file = os.path.join(self.cache_dir, f"{ticker}.json")
            
            if not os.path.exists(cache_file):
                return None
            
            # Check if cache is expired
            file_age = time.time() - os.path.getmtime(cache_file)
            if file_age > self.cache_duration:
                logger.debug(f"Cache expired for {ticker}")
                return None
            
            # Load cache
            with open(cache_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            return data
            
        except Exception as e:
            logger.warning(f"Failed to read cache: {e}")
            return None
    
    def _save_cache(self, ticker: str, data: dict):
        """Save fetched data to cache."""
        try:
            cache_file = os.path.join(self.cache_dir, f"{ticker}.json")
            
            with open(cache_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, default=str)
            
            logger.debug(f"Saved cache for {ticker}")
            
        except Exception as e:
            logger.error(f"Failed to save cache: {e}")


def format_twitter_report(data: dict) -> str:
    """
    Format Twitter sentiment data into a readable report.
    
    Args:
        data: Dictionary from TwitterSocialMonitor.get_sentiment_data()
        
    Returns:
        Formatted string report
    """
    ticker = data.get("ticker", "Unknown")
    sentiment = data.get("sentiment_summary", {})
    tweets_count = len(data.get("tweets", []))
    stocktwits_count = len(data.get("stocktwits_messages", []))
    
    report = f"""
=== Twitter/Social Sentiment Report for ${ticker} ===

Data Sources:
- Tweets analyzed: {tweets_count}
- Stocktwits messages: {stocktwits_count}
- Cache used: {data.get('cache_used', False)}

Overall Sentiment: {sentiment.get('overall_sentiment', 0.0):.2f} (-1.0 to 1.0)
Confidence: {sentiment.get('confidence', 0.0):.2f}

Bullish Arguments:
{chr(10).join(f"  • {arg}" for arg in sentiment.get('bullish_arguments', []))}

Bearish Arguments:
{chr(10).join(f"  • {arg}" for arg in sentiment.get('bearish_arguments', []))}

Key Themes:
{chr(10).join(f"  • {theme}" for theme in sentiment.get('key_themes', []))}

Most Active Accounts:
{chr(10).join(f"  • @{acc['account']}: {acc['tweet_count']} tweets" for acc in data.get('key_accounts', [])[:5])}

Sample Tweets:
{chr(10).join(f"  • @{tweet['author']}: {tweet['text'][:100]}..." for tweet in sentiment.get('sample_tweets', []))}

Errors: {len(data.get('errors', []))}
Warnings: {len(data.get('warnings', []))}
"""
    
    return report.strip()
