"""
Twitter Service Layer

Provides business logic for fetching and managing Twitter sentiment data.
Integrates with TradingAgents Twitter monitor and supports caching.
"""

import logging
import time
import hashlib
import json
from typing import Dict, Optional, List, Any
from datetime import datetime
from pathlib import Path

from c1_api.config import Config

# Import TradingAgents Twitter monitor
try:
    from tradingagents.dataflows.twitter_monitor import TwitterSocialMonitor
    from langchain_openai import ChatOpenAI
    TWITTER_MONITOR_AVAILABLE = True
except ImportError:
    TWITTER_MONITOR_AVAILABLE = False
    logging.warning("Twitter monitor modules not available")


logger = logging.getLogger(__name__)


class TwitterService:
    """Service for managing Twitter sentiment data."""
    
    # Default curated accounts for financial Twitter
    DEFAULT_ACCOUNTS = [
        'ChartChampions',
        'unusual_whales',
        'TradingView',
        'Benzinga',
        'MarketWatch',
        'WSJ',
        'CNBC',
        'BloombergTV'
    ]
    
    # Default Nitter instances
    DEFAULT_NITTER_INSTANCES = [
        'https://nitter.net',
        'https://nitter.poast.org',
        'https://nitter.privacydev.net'
    ]
    
    def __init__(self):
        """Initialize Twitter service."""
        self.cache: Dict[str, Dict[str, Any]] = {}
        self.cache_ttl = Config.TWITTER_CACHE_TTL if hasattr(Config, 'TWITTER_CACHE_TTL') else 300  # 5 minutes
        self.twitter_monitor: Optional[TwitterSocialMonitor] = None
        
        self._initialize_monitor()
        
        logger.info(f"TwitterService initialized (cache_ttl={self.cache_ttl}s)")
    
    def _initialize_monitor(self):
        """Initialize Twitter monitor with configuration."""
        if not TWITTER_MONITOR_AVAILABLE:
            logger.warning("Twitter monitor not available")
            return
        
        try:
            # Initialize LLM for sentiment analysis
            llm = None
            if Config.OPENAI_API_KEY:
                llm = ChatOpenAI(
                    model="gpt-4o-mini",
                    temperature=0.3,
                    api_key=Config.OPENAI_API_KEY
                )
            
            # Create monitor configuration
            monitor_config = {
                "nitter_instances": self.DEFAULT_NITTER_INSTANCES,
                "curated_accounts": self.DEFAULT_ACCOUNTS,
                "rate_limit_delay": 6.0,
                "max_retries": 3,
                "request_timeout": 10,
                "cache_directory": "data_cache/twitter",
                "cache_duration": self.cache_ttl,
                "stocktwits_enabled": True,
                "stocktwits_api_token": None,  # Using free API
                "stocktwits_message_limit": 30,
                "use_llm_sentiment": llm is not None,
                "sentiment_batch_size": 50,
                "max_tweets_per_account": 20
            }
            
            self.twitter_monitor = TwitterSocialMonitor(
                config=monitor_config,
                llm=llm
            )
            
            logger.info("Twitter monitor initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Twitter monitor: {e}")
            self.twitter_monitor = None
    
    def get_sentiment(
        self, 
        ticker: Optional[str] = None,
        accounts: Optional[List[str]] = None,
        limit: int = 50
    ) -> Dict[str, Any]:
        """
        Fetch tweets and sentiment analysis.
        
        Args:
            ticker: Optional stock ticker to filter tweets
            accounts: Optional list of accounts to monitor
            limit: Max tweets to return
            
        Returns:
            Dictionary with tweets, sentiment, and metadata
        """
        logger.info(f"Fetching sentiment for ticker={ticker}, accounts={accounts}, limit={limit}")
        
        # Check cache first
        cache_key = self._generate_cache_key(ticker, accounts)
        cached_data = self._get_from_cache(cache_key)
        
        if cached_data:
            logger.info("Returning cached sentiment data")
            cached_data['metadata']['cache_hit'] = True
            return cached_data
        
        # Fetch fresh data with graceful degradation
        errors = []
        warnings = []
        
        try:
            if not self.twitter_monitor:
                logger.warning("Twitter monitor not available, returning mock data")
                warnings.append("Twitter monitor not initialized - using mock data")
                result = self._get_mock_sentiment_data(ticker, limit)
                result['metadata']['warnings'] = warnings
                return result
            
            # Fetch data from Twitter monitor
            try:
                raw_data = self.twitter_monitor.get_sentiment_data(
                    ticker=ticker or "SPY",  # Default to SPY if no ticker
                    timeframe="24h"
                )
                
                # Check for partial failures
                if raw_data.get('errors'):
                    errors.extend(raw_data['errors'])
                if raw_data.get('warnings'):
                    warnings.extend(raw_data['warnings'])
                
                # Transform to API format
                result = self._transform_sentiment_data(raw_data, ticker, limit)
                
                # Add error/warning info
                if errors:
                    result['metadata']['errors'] = errors
                if warnings:
                    result['metadata']['warnings'] = warnings
                
                # Cache the result even with partial failures
                self._save_to_cache(cache_key, result)
                
                return result
                
            except Exception as e:
                error_msg = f"Twitter monitor error: {str(e)}"
                logger.error(error_msg, exc_info=True)
                errors.append(error_msg)
                
                # Try to return cached data even if expired
                if cache_key in self.cache:
                    logger.warning("Returning stale cached data due to error")
                    stale_data = self.cache[cache_key].get('data')
                    if stale_data:
                        stale_data['metadata']['cache_hit'] = True
                        stale_data['metadata']['stale'] = True
                        stale_data['metadata']['errors'] = errors
                        return stale_data
                
                # Last resort: return mock data
                logger.warning("Returning mock data due to error")
                result = self._get_mock_sentiment_data(ticker, limit)
                result['metadata']['errors'] = errors
                return result
            
        except Exception as e:
            logger.error(f"Critical error in get_sentiment: {e}", exc_info=True)
            # Return mock data with error info
            result = self._get_mock_sentiment_data(ticker, limit)
            result['metadata']['errors'] = [f"Critical error: {str(e)}"]
            return result
    
    def get_stocktwits(
        self, 
        ticker: str,
        limit: int = 30
    ) -> Dict[str, Any]:
        """
        Fetch Stocktwits messages for a ticker.
        
        Args:
            ticker: Stock ticker symbol
            limit: Max messages to return
            
        Returns:
            Dictionary with messages and sentiment ratio
        """
        logger.info(f"Fetching Stocktwits for ticker={ticker}, limit={limit}")
        
        # Check cache
        cache_key = f"stocktwits:{ticker}:{limit}"
        cached_data = self._get_from_cache(cache_key)
        
        if cached_data:
            logger.info("Returning cached Stocktwits data")
            cached_data['metadata'] = cached_data.get('metadata', {})
            cached_data['metadata']['cache_hit'] = True
            return cached_data
        
        # Fetch fresh data with error handling
        errors = []
        warnings = []
        
        try:
            if not self.twitter_monitor or not self.twitter_monitor.stocktwits_fetcher:
                logger.warning("Stocktwits fetcher not available, returning mock data")
                warnings.append("Stocktwits fetcher not initialized - using mock data")
                result = self._get_mock_stocktwits_data(ticker, limit)
                result['metadata']['warnings'] = warnings
                return result
            
            # Fetch from Stocktwits
            try:
                messages = self.twitter_monitor.stocktwits_fetcher.fetch_messages(
                    ticker=ticker,
                    limit=limit
                )
                
                # Transform to API format
                result = self._transform_stocktwits_data(messages, ticker)
                
                # Add metadata
                result['metadata'] = result.get('metadata', {})
                result['metadata']['cache_hit'] = False
                
                # Cache the result
                self._save_to_cache(cache_key, result)
                
                return result
                
            except Exception as e:
                error_msg = f"Stocktwits API error: {str(e)}"
                logger.error(error_msg, exc_info=True)
                errors.append(error_msg)
                
                # Try to return stale cache
                if cache_key in self.cache:
                    logger.warning("Returning stale Stocktwits cache due to error")
                    stale_data = self.cache[cache_key].get('data')
                    if stale_data:
                        stale_data['metadata'] = stale_data.get('metadata', {})
                        stale_data['metadata']['cache_hit'] = True
                        stale_data['metadata']['stale'] = True
                        stale_data['metadata']['errors'] = errors
                        return stale_data
                
                # Return mock data
                logger.warning("Returning mock Stocktwits data due to error")
                result = self._get_mock_stocktwits_data(ticker, limit)
                result['metadata']['errors'] = errors
                return result
            
        except Exception as e:
            logger.error(f"Critical error in get_stocktwits: {e}", exc_info=True)
            result = self._get_mock_stocktwits_data(ticker, limit)
            result['metadata']['errors'] = [f"Critical error: {str(e)}"]
            return result
    
    def validate_accounts(self, accounts: List[str]) -> Dict[str, bool]:
        """
        Validate Twitter account existence.
        
        Args:
            accounts: List of Twitter usernames
            
        Returns:
            Dictionary with validation results
        """
        logger.info(f"Validating {len(accounts)} accounts")
        
        # For now, simple validation (non-empty, alphanumeric + underscore)
        validation_results = {}
        all_valid = True
        
        for account in accounts:
            # Basic validation: alphanumeric + underscore, 1-15 chars
            is_valid = (
                len(account) >= 1 and 
                len(account) <= 15 and
                all(c.isalnum() or c == '_' for c in account)
            )
            validation_results[account] = is_valid
            if not is_valid:
                all_valid = False
        
        return {
            'all_valid': all_valid,
            'accounts': validation_results,
            'total': len(accounts),
            'valid_count': sum(1 for v in validation_results.values() if v)
        }
    
    def update_config(self, accounts: List[str]) -> bool:
        """
        Update monitored accounts in configuration.
        
        Args:
            accounts: List of Twitter usernames
            
        Returns:
            True if successful, False otherwise
        """
        logger.info(f"Updating config with {len(accounts)} accounts")
        
        try:
            # Update the monitor's curated accounts
            if self.twitter_monitor:
                self.twitter_monitor.nitter_fetcher.curated_accounts = accounts
                logger.info("Updated Twitter monitor accounts")
            
            # Clear cache since accounts changed
            self.cache.clear()
            logger.info("Cleared cache after account update")
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to update config: {e}")
            return False
    
    def _generate_cache_key(self, ticker: Optional[str], accounts: Optional[List[str]]) -> str:
        """Generate cache key from parameters."""
        key_parts = [
            ticker or "all",
            ",".join(sorted(accounts)) if accounts else "default"
        ]
        key_string = ":".join(key_parts)
        return hashlib.md5(key_string.encode()).hexdigest()
    
    def _get_from_cache(self, cache_key: str) -> Optional[Dict[str, Any]]:
        """Get data from cache if not expired."""
        if cache_key not in self.cache:
            return None
        
        cached_entry = self.cache[cache_key]
        cache_time = cached_entry.get('cached_at', 0)
        
        # Check if expired
        if time.time() - cache_time > self.cache_ttl:
            logger.debug(f"Cache expired for key: {cache_key}")
            del self.cache[cache_key]
            return None
        
        logger.debug(f"Cache hit for key: {cache_key}")
        return cached_entry.get('data')
    
    def _save_to_cache(self, cache_key: str, data: Dict[str, Any]):
        """Save data to cache with timestamp."""
        self.cache[cache_key] = {
            'data': data,
            'cached_at': time.time()
        }
        logger.debug(f"Saved to cache: {cache_key}")
    
    def _transform_sentiment_data(self, raw_data: Dict[str, Any], ticker: Optional[str], limit: int) -> Dict[str, Any]:
        """Transform Twitter monitor data to API format."""
        tweets_data = raw_data.get('tweets', [])
        sentiment_summary = raw_data.get('sentiment_summary', {})
        
        # Transform tweets
        tweets = []
        for i, tweet in enumerate(tweets_data[:limit]):
            tweets.append({
                'id': f"tweet_{i}",
                'account': tweet.get('author', 'unknown'),
                'text': tweet.get('text', ''),
                'timestamp': tweet.get('timestamp', datetime.now().isoformat()),
                'sentiment': sentiment_summary.get('overall_sentiment', 0.0),
                'tickers': tweet.get('ticker_symbols', []),
                'url': tweet.get('url', '')
            })
        
        # Transform sentiment
        sentiment = {
            'overall_score': sentiment_summary.get('overall_sentiment', 0.0),
            'bullish_args': sentiment_summary.get('bullish_arguments', []),
            'bearish_args': sentiment_summary.get('bearish_arguments', []),
            'themes': sentiment_summary.get('key_themes', []),
            'account_influence': {
                acc['account']: acc['tweet_count'] / max(len(tweets_data), 1)
                for acc in sentiment_summary.get('influential_accounts', [])
            }
        }
        
        # Metadata
        metadata = {
            'total_tweets': len(tweets_data),
            'filtered_tweets': len(tweets),
            'last_updated': datetime.now().isoformat(),
            'cache_hit': raw_data.get('cache_used', False)
        }
        
        return {
            'tweets': tweets,
            'sentiment': sentiment,
            'metadata': metadata
        }
    
    def _transform_stocktwits_data(self, messages: List[Any], ticker: str) -> Dict[str, Any]:
        """Transform Stocktwits data to API format."""
        transformed_messages = []
        bullish_count = 0
        bearish_count = 0
        
        for i, msg in enumerate(messages):
            sentiment = msg.sentiment if hasattr(msg, 'sentiment') else 'neutral'
            
            if sentiment == 'bullish':
                bullish_count += 1
            elif sentiment == 'bearish':
                bearish_count += 1
            
            transformed_messages.append({
                'id': f"stocktwits_{i}",
                'user': msg.user if hasattr(msg, 'user') else 'unknown',
                'text': msg.text if hasattr(msg, 'text') else '',
                'timestamp': msg.timestamp.isoformat() if hasattr(msg, 'timestamp') else datetime.now().isoformat(),
                'sentiment': sentiment,
                'likes': msg.likes if hasattr(msg, 'likes') else 0
            })
        
        # Calculate sentiment ratio
        total = bullish_count + bearish_count
        sentiment_ratio = {
            'bullish': round((bullish_count / total * 100) if total > 0 else 50, 1),
            'bearish': round((bearish_count / total * 100) if total > 0 else 50, 1)
        }
        
        return {
            'messages': transformed_messages,
            'sentiment_ratio': sentiment_ratio
        }
    
    def _get_mock_sentiment_data(self, ticker: Optional[str], limit: int) -> Dict[str, Any]:
        """Generate mock sentiment data for testing."""
        ticker = ticker or "SPY"
        
        mock_tweets = [
            {
                'id': f"tweet_{i}",
                'account': self.DEFAULT_ACCOUNTS[i % len(self.DEFAULT_ACCOUNTS)],
                'text': f"Mock tweet about ${ticker} - sentiment analysis placeholder",
                'timestamp': datetime.now().isoformat(),
                'sentiment': 0.5,
                'tickers': [ticker],
                'url': f"https://twitter.com/mock/status/{i}"
            }
            for i in range(min(limit, 10))
        ]
        
        return {
            'tweets': mock_tweets,
            'sentiment': {
                'overall_score': 0.5,
                'bullish_args': ['Mock bullish argument 1', 'Mock bullish argument 2'],
                'bearish_args': ['Mock bearish argument 1', 'Mock bearish argument 2'],
                'themes': ['Mock theme 1', 'Mock theme 2'],
                'account_influence': {
                    'ChartChampions': 0.8,
                    'unusual_whales': 0.7
                }
            },
            'metadata': {
                'total_tweets': len(mock_tweets),
                'filtered_tweets': len(mock_tweets),
                'last_updated': datetime.now().isoformat(),
                'cache_hit': False,
                'mock_data': True
            }
        }
    
    def _get_mock_stocktwits_data(self, ticker: str, limit: int) -> Dict[str, Any]:
        """Generate mock Stocktwits data for testing."""
        mock_messages = [
            {
                'id': f"stocktwits_{i}",
                'user': f"user{i}",
                'text': f"Mock Stocktwits message about ${ticker}",
                'timestamp': datetime.now().isoformat(),
                'sentiment': 'bullish' if i % 2 == 0 else 'bearish',
                'likes': i * 5
            }
            for i in range(min(limit, 10))
        ]
        
        return {
            'messages': mock_messages,
            'sentiment_ratio': {
                'bullish': 55.0,
                'bearish': 45.0
            },
            'metadata': {
                'mock_data': True
            }
        }


# Singleton instance
_twitter_service_instance: Optional[TwitterService] = None


def get_twitter_service() -> TwitterService:
    """
    Get singleton instance of TwitterService.
    
    Returns:
        TwitterService instance
    """
    global _twitter_service_instance
    
    if _twitter_service_instance is None:
        _twitter_service_instance = TwitterService()
    
    return _twitter_service_instance
