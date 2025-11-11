"""
Enhanced webhook client for TradingAgents to fetch coach plans.

Provides caching, retry logic, and metrics tracking for reliable
plan retrieval from the Discord bot server API.
"""

import requests
import logging
from typing import Dict, Optional, Any
from datetime import datetime, timedelta
from collections import OrderedDict
import time


logger = logging.getLogger(__name__)


class EnhancedWebhookClient:
    """Enhanced client for fetching coach plans with caching and metrics."""
    
    def __init__(
        self,
        api_base_url: str = "http://localhost:5000",
        cache_ttl_seconds: int = 3600,
        max_cache_size: int = 100,
        timeout: int = 10,
        max_retries: int = 3
    ):
        """
        Initialize enhanced webhook client.
        
        Args:
            api_base_url: Base URL of the Discord bot server API
            cache_ttl_seconds: Cache time-to-live in seconds
            max_cache_size: Maximum number of plans to cache
            timeout: Request timeout in seconds
            max_retries: Maximum number of retry attempts
        """
        self.api_base_url = api_base_url.rstrip('/')
        self.cache_ttl_seconds = cache_ttl_seconds
        self.max_cache_size = max_cache_size
        self.timeout = timeout
        self.max_retries = max_retries
        
        # LRU cache using OrderedDict
        self._cache: OrderedDict[str, Dict[str, Any]] = OrderedDict()
        
        # Metrics tracking
        self.metrics = {
            'requests_total': 0,
            'cache_hits': 0,
            'cache_misses': 0,
            'api_errors': 0,
            'api_success': 0,
            'retry_count': 0
        }
        
        logger.info(f"EnhancedWebhookClient initialized: {api_base_url}")
    
    def _get_cache_key(self, coach_name: str, date: str) -> str:
        """
        Generate cache key for a plan.
        
        Args:
            coach_name: Coach identifier
            date: Date string
            
        Returns:
            Cache key string
        """
        return f"{coach_name}_{date}"
    
    def _get_from_cache(self, cache_key: str) -> Optional[Dict[str, Any]]:
        """
        Get plan from cache if not expired.
        
        Args:
            cache_key: Cache key to lookup
            
        Returns:
            Cached plan data or None if not found/expired
        """
        if cache_key not in self._cache:
            return None
        
        cached_data = self._cache[cache_key]
        cached_time = cached_data['_cached_at']
        
        # Check if expired
        age_seconds = (datetime.now() - cached_time).total_seconds()
        if age_seconds > self.cache_ttl_seconds:
            # Expired, remove from cache
            del self._cache[cache_key]
            logger.debug(f"Cache expired for {cache_key}")
            return None
        
        # Move to end (most recently used)
        self._cache.move_to_end(cache_key)
        
        logger.debug(f"Cache hit for {cache_key} (age: {age_seconds:.1f}s)")
        self.metrics['cache_hits'] += 1
        
        # Return data without internal metadata
        result = cached_data.copy()
        del result['_cached_at']
        return result
    
    def _put_in_cache(self, cache_key: str, data: Dict[str, Any]) -> None:
        """
        Put plan data in cache with LRU eviction.
        
        Args:
            cache_key: Cache key
            data: Plan data to cache
        """
        # Add cache timestamp
        cached_data = data.copy()
        cached_data['_cached_at'] = datetime.now()
        
        # Add to cache
        self._cache[cache_key] = cached_data
        self._cache.move_to_end(cache_key)
        
        # Evict oldest if over size limit
        while len(self._cache) > self.max_cache_size:
            oldest_key = next(iter(self._cache))
            del self._cache[oldest_key]
            logger.debug(f"Evicted {oldest_key} from cache (LRU)")
        
        logger.debug(f"Cached {cache_key}")
    
    def clear_cache(self) -> int:
        """
        Clear all cached plans.
        
        Returns:
            Number of plans cleared
        """
        count = len(self._cache)
        self._cache.clear()
        logger.info(f"Cleared {count} plans from cache")
        return count
    
    def _fetch_from_api(
        self,
        endpoint: str,
        params: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Fetch data from API with retry logic.
        
        Args:
            endpoint: API endpoint path
            params: Query parameters
            
        Returns:
            API response data
            
        Raises:
            requests.RequestException: If all retries fail
        """
        url = f"{self.api_base_url}{endpoint}"
        last_error = None
        
        for attempt in range(1, self.max_retries + 1):
            try:
                logger.debug(f"API request (attempt {attempt}): {url}")
                
                response = requests.get(
                    url,
                    params=params,
                    timeout=self.timeout
                )
                
                response.raise_for_status()
                
                self.metrics['api_success'] += 1
                return response.json()
                
            except requests.Timeout as e:
                last_error = e
                logger.warning(f"API timeout (attempt {attempt}): {e}")
                self.metrics['retry_count'] += 1
                
                if attempt < self.max_retries:
                    time.sleep(1 * attempt)  # Exponential backoff
                    
            except requests.RequestException as e:
                last_error = e
                logger.error(f"API error (attempt {attempt}): {e}")
                self.metrics['api_errors'] += 1
                
                if attempt < self.max_retries:
                    time.sleep(1 * attempt)
        
        # All retries failed
        logger.error(f"All {self.max_retries} attempts failed for {url}")
        raise last_error
    
    def fetch_coach_plan(
        self,
        coach_name: str,
        date: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Fetch daily plan and charts for a specific coach.
        
        Args:
            coach_name: Coach identifier (d, i, s, n)
            date: Trading date in YYYY-MM-DD format (defaults to today)
            
        Returns:
            Dictionary with 'plan' (str) and 'charts' (list of URLs)
        """
        self.metrics['requests_total'] += 1
        
        if not date:
            date = datetime.now().strftime('%Y-%m-%d')
        
        # Check cache first
        cache_key = self._get_cache_key(coach_name, date)
        cached_data = self._get_from_cache(cache_key)
        
        if cached_data is not None:
            return cached_data
        
        # Cache miss
        self.metrics['cache_misses'] += 1
        logger.info(f"Fetching plan for coach {coach_name} on {date}")
        
        try:
            # Fetch from API
            data = self._fetch_from_api(
                '/api/coach-plans/',
                params={'coach': coach_name, 'date': date}
            )
            
            # Cache the result
            self._put_in_cache(cache_key, data)
            
            return data
            
        except Exception as e:
            logger.error(f"Failed to fetch plan for {coach_name}: {e}")
            
            # Return fallback response
            return {
                'plan': f"Error fetching plan for coach {coach_name}: {str(e)}",
                'charts': [],
                'error': str(e)
            }
    
    def fetch_all_coach_plans(
        self,
        date: Optional[str] = None
    ) -> Dict[str, Dict[str, Any]]:
        """
        Fetch daily plans and charts for all coaches.
        
        Args:
            date: Trading date in YYYY-MM-DD format (defaults to today)
            
        Returns:
            Dictionary mapping coach names to their plans and charts
        """
        self.metrics['requests_total'] += 1
        
        if not date:
            date = datetime.now().strftime('%Y-%m-%d')
        
        logger.info(f"Fetching all plans for {date}")
        
        try:
            # Fetch from API
            data = self._fetch_from_api(
                '/api/coach-plans/all',
                params={'date': date}
            )
            
            # Cache individual plans
            for coach_name, plan_data in data.items():
                cache_key = self._get_cache_key(coach_name, date)
                self._put_in_cache(cache_key, plan_data)
            
            return data
            
        except Exception as e:
            logger.error(f"Failed to fetch all plans: {e}")
            
            # Return empty dict on error
            return {}
    
    def check_health(self) -> Dict[str, Any]:
        """
        Check health of the Discord bot server.
        
        Returns:
            Health check response with status and component info
        """
        try:
            data = self._fetch_from_api('/health')
            logger.info(f"Health check: {data.get('status', 'unknown')}")
            return data
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return {
                'status': 'unhealthy',
                'error': str(e)
            }
    
    def get_metrics(self) -> Dict[str, Any]:
        """
        Get client metrics including cache statistics.
        
        Returns:
            Dictionary with client metrics
        """
        total_requests = self.metrics['requests_total']
        cache_hits = self.metrics['cache_hits']
        cache_misses = self.metrics['cache_misses']
        
        # Calculate cache hit rate
        cache_requests = cache_hits + cache_misses
        hit_rate = (cache_hits / cache_requests * 100) if cache_requests > 0 else 0
        
        return {
            'requests': {
                'total': total_requests,
                'cache_hits': cache_hits,
                'cache_misses': cache_misses,
                'cache_hit_rate_percent': round(hit_rate, 2)
            },
            'api': {
                'success': self.metrics['api_success'],
                'errors': self.metrics['api_errors'],
                'retries': self.metrics['retry_count']
            },
            'cache': {
                'size': len(self._cache),
                'max_size': self.max_cache_size,
                'ttl_seconds': self.cache_ttl_seconds
            }
        }
    
    def get_server_metrics(self) -> Dict[str, Any]:
        """
        Get metrics from the Discord bot server.
        
        Returns:
            Server metrics including uptime and database stats
        """
        try:
            data = self._fetch_from_api('/metrics')
            return data
        except Exception as e:
            logger.error(f"Failed to get server metrics: {e}")
            return {'error': str(e)}


# Convenience function for backward compatibility
def create_client(api_base_url: str = "http://localhost:5000") -> EnhancedWebhookClient:
    """
    Create an enhanced webhook client instance.
    
    Args:
        api_base_url: Base URL of the Discord bot server API
        
    Returns:
        EnhancedWebhookClient instance
    """
    return EnhancedWebhookClient(api_base_url=api_base_url)
