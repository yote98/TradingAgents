"""
Historical Data Manager

Manages historical market data retrieval, caching, and validation for backtesting.
Uses Alpha Vantage MCP for data fetching.
"""

import os
import json
import logging
from typing import Tuple, List, Optional
from datetime import datetime, timedelta
import pandas as pd

logger = logging.getLogger(__name__)


class HistoricalDataManager:
    """
    Manages historical data retrieval and caching for backtesting.
    
    Fetches data from Alpha Vantage MCP and caches locally to minimize API calls.
    """
    
    def __init__(self, cache_dir: str = "backtest_data_cache"):
        """
        Initialize the Historical Data Manager.
        
        Args:
            cache_dir: Directory for caching historical data
        """
        self.cache_dir = cache_dir
        self.data_cache = {}  # In-memory cache
        
        # Create cache directory if it doesn't exist
        os.makedirs(self.cache_dir, exist_ok=True)
        
        logger.info(f"HistoricalDataManager initialized with cache_dir: {cache_dir}")
    
    def get_historical_data(
        self,
        ticker: str,
        start_date: str,
        end_date: str,
        interval: str = "daily"
    ) -> pd.DataFrame:
        """
        Retrieve historical data for a ticker.
        
        Checks cache first, then fetches from Alpha Vantage MCP if needed.
        
        Args:
            ticker: Stock symbol
            start_date: Start date (YYYY-MM-DD)
            end_date: End date (YYYY-MM-DD)
            interval: Data frequency (daily, weekly, intraday)
            
        Returns:
            DataFrame with OHLCV data indexed by date
        """
        cache_key = f"{ticker}_{start_date}_{end_date}_{interval}"
        
        # Check in-memory cache
        if cache_key in self.data_cache:
            logger.debug(f"Using in-memory cache for {cache_key}")
            return self.data_cache[cache_key].copy()
        
        # Check file cache
        cached_file = self._get_cache_file_path(cache_key)
        if os.path.exists(cached_file):
            logger.debug(f"Loading from file cache: {cached_file}")
            data = self._load_from_cache(cached_file)
            self.data_cache[cache_key] = data
            return data.copy()
        
        # Fetch from MCP
        logger.info(f"Fetching data from MCP for {ticker} ({start_date} to {end_date})")
        data = self._fetch_from_mcp(ticker, start_date, end_date, interval)
        
        # Cache it
        self._save_to_cache(cached_file, data)
        self.data_cache[cache_key] = data
        
        return data.copy()
    
    def _fetch_from_mcp(
        self,
        ticker: str,
        start_date: str,
        end_date: str,
        interval: str
    ) -> pd.DataFrame:
        """
        Fetch data from Alpha Vantage MCP.
        
        For now, this is a placeholder that would integrate with the MCP.
        In production, this would call the Alpha Vantage MCP tools.
        """
        try:
            # TODO: Integrate with Alpha Vantage MCP
            # For now, use yfinance as fallback
            import yfinance as yf
            
            ticker_obj = yf.Ticker(ticker)
            
            if interval == "daily":
                data = ticker_obj.history(start=start_date, end=end_date, interval="1d")
            elif interval == "weekly":
                data = ticker_obj.history(start=start_date, end=end_date, interval="1wk")
            elif interval == "intraday":
                data = ticker_obj.history(start=start_date, end=end_date, interval="1h")
            else:
                raise ValueError(f"Unsupported interval: {interval}")
            
            # Standardize column names
            data.columns = [col.lower() for col in data.columns]
            
            # Ensure we have the required columns
            required_cols = ['open', 'high', 'low', 'close', 'volume']
            for col in required_cols:
                if col not in data.columns:
                    raise ValueError(f"Missing required column: {col}")
            
            return data
            
        except Exception as e:
            logger.error(f"Failed to fetch data for {ticker}: {e}")
            raise
    
    def _get_cache_file_path(self, cache_key: str) -> str:
        """Generate cache file path for a cache key."""
        return os.path.join(self.cache_dir, f"{cache_key}.parquet")
    
    def _save_to_cache(self, filepath: str, data: pd.DataFrame):
        """Save DataFrame to cache file."""
        try:
            data.to_parquet(filepath)
            logger.debug(f"Saved to cache: {filepath}")
        except Exception as e:
            logger.warning(f"Failed to save cache: {e}")
    
    def _load_from_cache(self, filepath: str) -> pd.DataFrame:
        """Load DataFrame from cache file."""
        try:
            return pd.read_parquet(filepath)
        except Exception as e:
            logger.warning(f"Failed to load cache: {e}")
            raise
    
    def validate_data(
        self,
        data: pd.DataFrame,
        start_date: str,
        end_date: str
    ) -> Tuple[bool, List[str]]:
        """
        Validate data completeness and quality.
        
        Args:
            data: DataFrame to validate
            start_date: Expected start date
            end_date: Expected end date
            
        Returns:
            Tuple of (is_valid, list_of_issues)
        """
        issues = []
        
        # Check if data is empty
        if data.empty:
            issues.append("Data is empty")
            return False, issues
        
        # Check for required columns
        required_cols = ['open', 'high', 'low', 'close', 'volume']
        missing_cols = [col for col in required_cols if col not in data.columns]
        if missing_cols:
            issues.append(f"Missing columns: {missing_cols}")
        
        # Check for NaN values
        nan_counts = data[required_cols].isna().sum()
        if nan_counts.any():
            issues.append(f"NaN values found: {nan_counts[nan_counts > 0].to_dict()}")
        
        # Check date range
        actual_start = data.index.min()
        actual_end = data.index.max()
        expected_start = pd.to_datetime(start_date)
        expected_end = pd.to_datetime(end_date)
        
        if actual_start > expected_start:
            issues.append(f"Data starts later than expected: {actual_start} vs {expected_start}")
        
        if actual_end < expected_end:
            issues.append(f"Data ends earlier than expected: {actual_end} vs {expected_end}")
        
        # Check for gaps (missing trading days)
        date_diffs = data.index.to_series().diff()
        large_gaps = date_diffs[date_diffs > timedelta(days=7)]  # More than a week
        if len(large_gaps) > 0:
            issues.append(f"Found {len(large_gaps)} large gaps in data")
        
        is_valid = len(issues) == 0
        return is_valid, issues
    
    def get_trading_dates(
        self,
        start_date: str,
        end_date: str,
        data: Optional[pd.DataFrame] = None
    ) -> List[str]:
        """
        Get list of valid trading dates in range.
        
        Args:
            start_date: Start date (YYYY-MM-DD)
            end_date: End date (YYYY-MM-DD)
            data: Optional DataFrame to extract dates from
            
        Returns:
            List of trading dates as strings (YYYY-MM-DD)
        """
        if data is not None:
            # Extract dates from provided data
            dates = data.index
            dates = dates[(dates >= start_date) & (dates <= end_date)]
            return [d.strftime('%Y-%m-%d') for d in dates]
        else:
            # Generate business days (excluding weekends)
            date_range = pd.bdate_range(start=start_date, end=end_date)
            return [d.strftime('%Y-%m-%d') for d in date_range]
    
    def clear_cache(self, ticker: Optional[str] = None):
        """
        Clear cached data.
        
        Args:
            ticker: If provided, clear only this ticker's cache. Otherwise clear all.
        """
        if ticker:
            # Clear specific ticker from memory
            keys_to_remove = [k for k in self.data_cache.keys() if k.startswith(ticker)]
            for key in keys_to_remove:
                del self.data_cache[key]
            
            # Clear specific ticker from file cache
            for filename in os.listdir(self.cache_dir):
                if filename.startswith(ticker):
                    os.remove(os.path.join(self.cache_dir, filename))
            
            logger.info(f"Cleared cache for {ticker}")
        else:
            # Clear all cache
            self.data_cache.clear()
            
            for filename in os.listdir(self.cache_dir):
                os.remove(os.path.join(self.cache_dir, filename))
            
            logger.info("Cleared all cache")
