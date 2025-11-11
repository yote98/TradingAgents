"""
Unit tests for Twitter API endpoints and service layer.

Tests cover:
- TwitterService caching behavior
- Account validation logic
- Error handling scenarios
- API endpoint responses
"""

import pytest
import time
import json
from datetime import datetime
from unittest.mock import Mock, patch, MagicMock

# Import the Flask app and services
from c1_api_server import create_app
from c1_api.services.twitter_service import TwitterService, get_twitter_service


@pytest.fixture
def app():
    """Create Flask app for testing."""
    app = create_app({'TESTING': True})
    return app


@pytest.fixture
def client(app):
    """Create test client."""
    return app.test_client()


@pytest.fixture
def twitter_service():
    """Create TwitterService instance for testing."""
    service = TwitterService()
    # Clear cache before each test
    service.cache.clear()
    return service


class TestTwitterService:
    """Test TwitterService class functionality."""
    
    def test_cache_key_generation(self, twitter_service):
        """Test cache key generation is consistent."""
        key1 = twitter_service._generate_cache_key("AAPL", ["account1", "account2"])
        key2 = twitter_service._generate_cache_key("AAPL", ["account2", "account1"])
        
        # Should be same regardless of account order
        assert key1 == key2
        
        # Different ticker should produce different key
        key3 = twitter_service._generate_cache_key("MSFT", ["account1", "account2"])
        assert key1 != key3
    
    def test_caching_behavior(self, twitter_service):
        """Test that caching works correctly."""
        cache_key = "test_key"
        test_data = {"test": "data"}
        
        # Save to cache
        twitter_service._save_to_cache(cache_key, test_data)
        
        # Should retrieve from cache
        cached = twitter_service._get_from_cache(cache_key)
        assert cached == test_data
        
        # Should return None for non-existent key
        assert twitter_service._get_from_cache("nonexistent") is None
    
    def test_cache_expiration(self, twitter_service):
        """Test that cache expires after TTL."""
        # Set very short TTL for testing
        twitter_service.cache_ttl = 1
        
        cache_key = "test_key"
        test_data = {"test": "data"}
        
        # Save to cache
        twitter_service._save_to_cache(cache_key, test_data)
        
        # Should retrieve immediately
        assert twitter_service._get_from_cache(cache_key) == test_data
        
        # Wait for expiration
        time.sleep(1.1)
        
        # Should return None after expiration
        assert twitter_service._get_from_cache(cache_key) is None
    
    def test_account_validation_valid(self, twitter_service):
        """Test validation of valid Twitter accounts."""
        valid_accounts = ["ChartChampions", "unusual_whales", "user123"]
        result = twitter_service.validate_accounts(valid_accounts)
        
        assert result['all_valid'] is True
        assert result['total'] == 3
        assert result['valid_count'] == 3
        assert all(result['accounts'].values())
    
    def test_account_validation_invalid(self, twitter_service):
        """Test validation of invalid Twitter accounts."""
        invalid_accounts = [
            "valid_account",
            "",  # Empty
            "a" * 16,  # Too long
            "invalid@account",  # Invalid character
        ]
        result = twitter_service.validate_accounts(invalid_accounts)
        
        assert result['all_valid'] is False
        assert result['total'] == 4
        assert result['valid_count'] == 1  # Only first one is valid
        assert result['accounts']['valid_account'] is True
        assert result['accounts'][''] is False
    
    def test_update_config(self, twitter_service):
        """Test updating monitored accounts configuration."""
        new_accounts = ["account1", "account2", "account3"]
        
        # Mock the twitter monitor
        twitter_service.twitter_monitor = Mock()
        twitter_service.twitter_monitor.nitter_fetcher = Mock()
        
        # Update config
        result = twitter_service.update_config(new_accounts)
        
        assert result is True
        assert twitter_service.twitter_monitor.nitter_fetcher.curated_accounts == new_accounts
        # Cache should be cleared
        assert len(twitter_service.cache) == 0
    
    def test_mock_sentiment_data_structure(self, twitter_service):
        """Test that mock sentiment data has correct structure."""
        result = twitter_service._get_mock_sentiment_data("AAPL", 10)
        
        # Check structure
        assert 'tweets' in result
        assert 'sentiment' in result
        assert 'metadata' in result
        
        # Check tweets
        assert isinstance(result['tweets'], list)
        assert len(result['tweets']) <= 10
        
        # Check sentiment
        sentiment = result['sentiment']
        assert 'overall_score' in sentiment
        assert 'bullish_args' in sentiment
        assert 'bearish_args' in sentiment
        assert 'themes' in sentiment
        assert 'account_influence' in sentiment
        
        # Check metadata
        metadata = result['metadata']
        assert 'total_tweets' in metadata
        assert 'last_updated' in metadata
        assert metadata['mock_data'] is True
    
    def test_mock_stocktwits_data_structure(self, twitter_service):
        """Test that mock Stocktwits data has correct structure."""
        result = twitter_service._get_mock_stocktwits_data("AAPL", 10)
        
        # Check structure
        assert 'messages' in result
        assert 'sentiment_ratio' in result
        
        # Check messages
        assert isinstance(result['messages'], list)
        assert len(result['messages']) <= 10
        
        # Check sentiment ratio
        ratio = result['sentiment_ratio']
        assert 'bullish' in ratio
        assert 'bearish' in ratio
        assert isinstance(ratio['bullish'], float)
        assert isinstance(ratio['bearish'], float)
    
    def test_get_sentiment_uses_cache(self, twitter_service):
        """Test that get_sentiment uses cache when available."""
        # Pre-populate cache
        cache_key = twitter_service._generate_cache_key("AAPL", None)
        cached_data = {"cached": True, "metadata": {"cache_hit": False}}
        twitter_service._save_to_cache(cache_key, cached_data)
        
        # Get sentiment should return cached data
        result = twitter_service.get_sentiment(ticker="AAPL")
        
        assert result['cached'] is True
        assert result['metadata']['cache_hit'] is True
    
    def test_get_sentiment_error_handling(self, twitter_service):
        """Test that get_sentiment handles errors gracefully."""
        # Mock twitter monitor to raise exception
        twitter_service.twitter_monitor = Mock()
        twitter_service.twitter_monitor.get_sentiment_data = Mock(side_effect=Exception("Test error"))
        
        # Should return mock data instead of crashing
        result = twitter_service.get_sentiment(ticker="AAPL")
        
        assert 'tweets' in result
        assert 'metadata' in result
        assert 'errors' in result['metadata']
        assert len(result['metadata']['errors']) > 0


class TestTwitterAPIEndpoints:
    """Test Twitter API endpoints."""
    
    def test_get_sentiment_endpoint(self, client):
        """Test GET /api/twitter/sentiment endpoint."""
        response = client.get('/api/twitter/sentiment?ticker=AAPL&limit=10')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        
        # Check response structure
        assert 'tweets' in data
        assert 'sentiment' in data
        assert 'metadata' in data
    
    def test_get_sentiment_invalid_limit(self, client):
        """Test sentiment endpoint with invalid limit."""
        response = client.get('/api/twitter/sentiment?limit=500')
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
    
    def test_get_stocktwits_endpoint(self, client):
        """Test GET /api/twitter/stocktwits endpoint."""
        response = client.get('/api/twitter/stocktwits?ticker=AAPL')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        
        # Check response structure
        assert 'messages' in data
        assert 'sentiment_ratio' in data
    
    def test_get_stocktwits_missing_ticker(self, client):
        """Test Stocktwits endpoint without ticker."""
        response = client.get('/api/twitter/stocktwits')
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
    
    def test_update_accounts_endpoint(self, client):
        """Test POST /api/twitter/accounts endpoint."""
        payload = {
            'accounts': ['ChartChampions', 'unusual_whales']
        }
        
        response = client.post(
            '/api/twitter/accounts',
            data=json.dumps(payload),
            content_type='application/json'
        )
        
        assert response.status_code == 200
        data = json.loads(response.data)
        
        assert 'success' in data
        assert 'accounts' in data
        assert 'validated' in data
    
    def test_update_accounts_invalid_payload(self, client):
        """Test accounts endpoint with invalid payload."""
        # Missing accounts field
        response = client.post(
            '/api/twitter/accounts',
            data=json.dumps({}),
            content_type='application/json'
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
    
    def test_update_accounts_invalid_type(self, client):
        """Test accounts endpoint with invalid account type."""
        payload = {
            'accounts': 'not_a_list'  # Should be a list
        }
        
        response = client.post(
            '/api/twitter/accounts',
            data=json.dumps(payload),
            content_type='application/json'
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
    
    def test_rate_limiting(self, client):
        """Test that rate limiting works."""
        # Make multiple rapid requests
        responses = []
        for i in range(65):  # Exceed the 60 per minute limit
            response = client.get('/api/twitter/sentiment?ticker=AAPL')
            responses.append(response.status_code)
        
        # Should have at least one 429 (rate limit) response
        assert 429 in responses
    
    def test_error_response_format(self, client):
        """Test that error responses have consistent format."""
        response = client.get('/api/twitter/sentiment?limit=999')
        
        # Should be either 400 (validation error) or 429 (rate limit)
        assert response.status_code in [400, 429]
        data = json.loads(response.data)
        
        # Check error response structure
        assert 'error' in data
        assert 'status' in data
        assert 'timestamp' in data
        assert data['status'] in [400, 429]


class TestDataTransformation:
    """Test data transformation methods."""
    
    def test_transform_sentiment_data(self, twitter_service):
        """Test transformation of raw Twitter data to API format."""
        raw_data = {
            'tweets': [
                {
                    'author': 'test_user',
                    'text': 'Test tweet about $AAPL',
                    'timestamp': '2025-11-11T10:00:00',
                    'ticker_symbols': ['AAPL'],
                    'url': 'https://twitter.com/test'
                }
            ],
            'sentiment_summary': {
                'overall_sentiment': 0.75,
                'bullish_arguments': ['Arg 1', 'Arg 2'],
                'bearish_arguments': ['Arg 3'],
                'key_themes': ['Theme 1'],
                'influential_accounts': [
                    {'account': 'test_user', 'tweet_count': 1}
                ]
            }
        }
        
        result = twitter_service._transform_sentiment_data(raw_data, 'AAPL', 50)
        
        # Check transformation
        assert len(result['tweets']) == 1
        assert result['tweets'][0]['account'] == 'test_user'
        assert result['sentiment']['overall_score'] == 0.75
        assert len(result['sentiment']['bullish_args']) == 2
        assert 'metadata' in result
    
    def test_transform_stocktwits_data(self, twitter_service):
        """Test transformation of Stocktwits data to API format."""
        # Create mock Stocktwits messages
        mock_messages = []
        for i in range(10):
            msg = Mock()
            msg.sentiment = 'bullish' if i % 2 == 0 else 'bearish'
            msg.user = f'user{i}'
            msg.text = f'Message {i}'
            msg.timestamp = datetime.now()
            msg.likes = i * 5
            mock_messages.append(msg)
        
        result = twitter_service._transform_stocktwits_data(mock_messages, 'AAPL')
        
        # Check transformation
        assert len(result['messages']) == 10
        assert 'sentiment_ratio' in result
        assert result['sentiment_ratio']['bullish'] + result['sentiment_ratio']['bearish'] == 100


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
