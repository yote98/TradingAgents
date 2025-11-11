"""
Test script to verify Enhanced Webhook Client implementation meets all requirements.
"""

import os
import sys
import time
from pathlib import Path
from datetime import datetime
from unittest.mock import Mock, patch
import json

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent))

from tradingagents.integrations.discord_enhanced.client import EnhancedWebhookClient


def test_webhook_client():
    """Test all webhook client functionality."""
    
    print("=" * 60)
    print("Testing Enhanced Webhook Client Implementation")
    print("=" * 60)
    
    try:
        # Test 1: Client initialization
        print("\n✓ Test 1: Client Initialization")
        client = EnhancedWebhookClient(
            api_base_url="http://localhost:5000",
            cache_ttl_seconds=60,
            max_cache_size=10,
            timeout=5,
            max_retries=2
        )
        assert client.api_base_url == "http://localhost:5000", "Should set API URL"
        assert client.cache_ttl_seconds == 60, "Should set cache TTL"
        assert client.max_cache_size == 10, "Should set max cache size"
        print(f"  Client initialized with cache TTL: {client.cache_ttl_seconds}s")
        print(f"  Max cache size: {client.max_cache_size}")
        
        # Test 2: Cache key generation
        print("\n✓ Test 2: Cache Key Generation")
        key1 = client._get_cache_key("coach_d", "2024-11-09")
        key2 = client._get_cache_key("coach_i", "2024-11-09")
        assert key1 == "coach_d_2024-11-09", "Should generate correct key"
        assert key2 == "coach_i_2024-11-09", "Should generate correct key"
        assert key1 != key2, "Different coaches should have different keys"
        print(f"  Generated keys: {key1}, {key2}")
        
        # Test 3: Cache put and get
        print("\n✓ Test 3: Cache Put and Get")
        test_data = {
            'plan': 'Test plan content',
            'charts': ['chart1.png', 'chart2.png'],
            'author': 'test_user'
        }
        cache_key = "coach_d_2024-11-09"
        client._put_in_cache(cache_key, test_data)
        
        cached = client._get_from_cache(cache_key)
        assert cached is not None, "Should retrieve cached data"
        assert cached['plan'] == test_data['plan'], "Should match original data"
        assert len(cached['charts']) == 2, "Should have 2 charts"
        assert '_cached_at' not in cached, "Should not expose internal metadata"
        print(f"  Cached and retrieved data successfully")
        
        # Test 4: Cache expiration
        print("\n✓ Test 4: Cache Expiration")
        # Create client with very short TTL
        short_ttl_client = EnhancedWebhookClient(cache_ttl_seconds=1)
        short_ttl_client._put_in_cache("test_key", test_data)
        
        # Wait for expiration
        time.sleep(1.5)
        
        expired = short_ttl_client._get_from_cache("test_key")
        assert expired is None, "Should return None for expired cache"
        print(f"  Cache correctly expired after TTL")
        
        # Test 5: LRU eviction
        print("\n✓ Test 5: LRU Cache Eviction")
        small_cache_client = EnhancedWebhookClient(max_cache_size=3)
        
        # Add 4 items (should evict oldest)
        for i in range(4):
            small_cache_client._put_in_cache(f"key_{i}", {'data': f'value_{i}'})
        
        # First item should be evicted
        assert small_cache_client._get_from_cache("key_0") is None, "Oldest should be evicted"
        assert small_cache_client._get_from_cache("key_3") is not None, "Newest should exist"
        assert len(small_cache_client._cache) == 3, "Should maintain max size"
        print(f"  LRU eviction working: cache size = {len(small_cache_client._cache)}")
        
        # Test 6: Clear cache
        print("\n✓ Test 6: Clear Cache")
        client._put_in_cache("key1", {'data': 'value1'})
        client._put_in_cache("key2", {'data': 'value2'})
        
        count = client.clear_cache()
        assert count >= 2, "Should clear at least 2 items"
        assert len(client._cache) == 0, "Cache should be empty"
        print(f"  Cleared {count} items from cache")
        
        # Test 7: Metrics tracking
        print("\n✓ Test 7: Metrics Tracking")
        client.metrics['requests_total'] = 10
        client.metrics['cache_hits'] = 7
        client.metrics['cache_misses'] = 3
        client.metrics['api_success'] = 3
        client.metrics['api_errors'] = 0
        
        metrics = client.get_metrics()
        assert metrics['requests']['total'] == 10, "Should track total requests"
        assert metrics['requests']['cache_hits'] == 7, "Should track cache hits"
        assert metrics['requests']['cache_misses'] == 3, "Should track cache misses"
        assert metrics['requests']['cache_hit_rate_percent'] == 70.0, "Should calculate hit rate"
        print(f"  Metrics tracked:")
        print(f"    Total requests: {metrics['requests']['total']}")
        print(f"    Cache hit rate: {metrics['requests']['cache_hit_rate_percent']}%")
        
        # Test 8: Mock API fetch with success
        print("\n✓ Test 8: API Fetch (Mocked Success)")
        with patch('requests.get') as mock_get:
            mock_response = Mock()
            mock_response.status_code = 200
            mock_response.json.return_value = {
                'plan': 'NVDA bullish pattern',
                'charts': ['chart1.png'],
                'author': 'coach_d'
            }
            mock_get.return_value = mock_response
            
            result = client._fetch_from_api('/api/coach-plans/', {'coach': 'd', 'date': '2024-11-09'})
            assert result['plan'] == 'NVDA bullish pattern', "Should return API data"
            assert len(result['charts']) == 1, "Should have 1 chart"
            print(f"  API fetch successful: {result['plan'][:40]}...")
        
        # Test 9: Mock API fetch with retry
        print("\n✓ Test 9: API Fetch with Retry (Mocked)")
        with patch('requests.get') as mock_get:
            # First call times out, second succeeds
            from requests.exceptions import Timeout
            
            mock_response_success = Mock()
            mock_response_success.status_code = 200
            mock_response_success.json.return_value = {'plan': 'Success after retry'}
            
            # First call raises Timeout, second succeeds
            mock_get.side_effect = [Timeout("Connection timeout"), mock_response_success]
            
            result = client._fetch_from_api('/api/test')
            assert result['plan'] == 'Success after retry', "Should succeed after retry"
            assert mock_get.call_count == 2, "Should have made 2 attempts"
            print(f"  Retry logic working: succeeded on attempt 2")
        
        # Test 10: Mock fetch_coach_plan with caching
        print("\n✓ Test 10: Fetch Coach Plan with Caching")
        with patch('requests.get') as mock_get:
            mock_response = Mock()
            mock_response.status_code = 200
            mock_response.json.return_value = {
                'plan': 'Test plan from API',
                'charts': [],
                'author': 'test_user'
            }
            mock_get.return_value = mock_response
            
            # First call - should hit API
            result1 = client.fetch_coach_plan('d', '2024-11-09')
            assert result1['plan'] == 'Test plan from API', "Should fetch from API"
            api_calls_1 = mock_get.call_count
            
            # Second call - should hit cache
            result2 = client.fetch_coach_plan('d', '2024-11-09')
            assert result2['plan'] == 'Test plan from API', "Should return same data"
            api_calls_2 = mock_get.call_count
            
            assert api_calls_2 == api_calls_1, "Should not make additional API call (cached)"
            print(f"  First call: API hit")
            print(f"  Second call: Cache hit (no API call)")
        
        # Test 11: Mock fetch_all_coach_plans
        print("\n✓ Test 11: Fetch All Coach Plans")
        with patch('requests.get') as mock_get:
            mock_response = Mock()
            mock_response.status_code = 200
            mock_response.json.return_value = {
                'coach_d': {'plan': 'Day trading plan', 'charts': []},
                'coach_i': {'plan': 'Intraday plan', 'charts': []},
                'coach_s': {'plan': 'Swing plan', 'charts': []}
            }
            mock_get.return_value = mock_response
            
            result = client.fetch_all_coach_plans('2024-11-09')
            assert len(result) == 3, "Should return 3 plans"
            assert 'coach_d' in result, "Should include coach_d"
            assert 'coach_i' in result, "Should include coach_i"
            assert 'coach_s' in result, "Should include coach_s"
            print(f"  Fetched {len(result)} plans")
            
            # Verify individual plans were cached
            cached_d = client._get_from_cache('coach_d_2024-11-09')
            assert cached_d is not None, "Should cache individual plans"
            print(f"  Individual plans cached for future use")
        
        # Test 12: Mock error handling
        print("\n✓ Test 12: Error Handling (Fallback)")
        # Clear cache first to ensure we hit the API
        client.clear_cache()
        
        with patch('requests.get') as mock_get:
            from requests.exceptions import RequestException
            mock_get.side_effect = RequestException("Network error")
            
            result = client.fetch_coach_plan('d', '2024-11-10')  # Different date to avoid cache
            assert 'error' in result, "Should include error field"
            assert 'Error fetching plan' in result['plan'], "Should have error message"
            print(f"  Error handled gracefully: {result['plan'][:50]}...")
        
        # Test 13: Mock health check
        print("\n✓ Test 13: Health Check")
        with patch('requests.get') as mock_get:
            mock_response = Mock()
            mock_response.status_code = 200
            mock_response.json.return_value = {
                'status': 'healthy',
                'components': {
                    'database': {'status': 'up'},
                    'discord_bot': {'status': 'connected'}
                }
            }
            mock_get.return_value = mock_response
            
            health = client.check_health()
            assert health['status'] == 'healthy', "Should return health status"
            print(f"  Health check: {health['status']}")
        
        # Test 14: Mock server metrics
        print("\n✓ Test 14: Get Server Metrics")
        with patch('requests.get') as mock_get:
            mock_response = Mock()
            mock_response.status_code = 200
            mock_response.json.return_value = {
                'uptime_seconds': 3600,
                'requests': {'total': 100, 'error': 5},
                'database': {'total_plans': 42}
            }
            mock_get.return_value = mock_response
            
            metrics = client.get_server_metrics()
            assert metrics['uptime_seconds'] == 3600, "Should return server metrics"
            assert metrics['database']['total_plans'] == 42, "Should include DB stats"
            print(f"  Server uptime: {metrics['uptime_seconds']}s")
            print(f"  Total plans: {metrics['database']['total_plans']}")
        
        # Test 15: Convenience function
        print("\n✓ Test 15: Convenience Function")
        from tradingagents.integrations.discord_enhanced.client import create_client
        convenience_client = create_client("http://test:8000")
        assert convenience_client.api_base_url == "http://test:8000", "Should create client"
        print(f"  Convenience function working")
        
        print("\n" + "=" * 60)
        print("✅ ALL TESTS PASSED!")
        print("=" * 60)
        print("\nEnhanced Webhook Client Implementation Summary:")
        print("  ✓ LRU cache with TTL expiration")
        print("  ✓ Cache hit/miss tracking")
        print("  ✓ Automatic cache eviction")
        print("  ✓ API retry logic with exponential backoff")
        print("  ✓ Timeout handling")
        print("  ✓ Comprehensive metrics tracking")
        print("  ✓ Error handling with fallback responses")
        print("  ✓ Health check support")
        print("  ✓ Server metrics retrieval")
        print("  ✓ Fetch single coach plan")
        print("  ✓ Fetch all coach plans")
        print("  ✓ Cache clearing")
        
        return True
        
    except Exception as e:
        print(f"\n❌ TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = test_webhook_client()
    sys.exit(0 if success else 1)
