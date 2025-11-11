"""
Twitter API Routes

Provides REST endpoints for fetching Twitter sentiment data and managing accounts.
"""

import logging
import time
from functools import wraps
from flask import Blueprint, jsonify, request
from datetime import datetime
from typing import Dict, Any

from c1_api.services.twitter_service import get_twitter_service
from c1_api.config import Config


logger = logging.getLogger(__name__)

# Simple rate limiting storage
_rate_limit_storage = {}


def rate_limit(max_requests: int = 60, window: int = 60):
    """
    Rate limiting decorator.
    
    Args:
        max_requests: Maximum requests allowed in window
        window: Time window in seconds
    """
    def decorator(f):
        @wraps(f)
        def wrapped(*args, **kwargs):
            # Get client identifier (IP address)
            client_id = request.remote_addr
            current_time = time.time()
            
            # Initialize or clean up old entries
            if client_id not in _rate_limit_storage:
                _rate_limit_storage[client_id] = []
            
            # Remove old requests outside the window
            _rate_limit_storage[client_id] = [
                req_time for req_time in _rate_limit_storage[client_id]
                if current_time - req_time < window
            ]
            
            # Check rate limit
            if len(_rate_limit_storage[client_id]) >= max_requests:
                logger.warning(f"Rate limit exceeded for {client_id}")
                return create_error_response(
                    f'Rate limit exceeded. Maximum {max_requests} requests per {window} seconds.',
                    429
                )
            
            # Add current request
            _rate_limit_storage[client_id].append(current_time)
            
            return f(*args, **kwargs)
        return wrapped
    return decorator

# Create Blueprint for Twitter routes
twitter_bp = Blueprint('twitter', __name__, url_prefix='/api/twitter')


def create_error_response(message: str, status_code: int) -> tuple:
    """
    Create standardized error response.
    
    Args:
        message: Error message
        status_code: HTTP status code
        
    Returns:
        Tuple of (response_dict, status_code)
    """
    return jsonify({
        'error': message,
        'status': status_code,
        'timestamp': datetime.now().isoformat()
    }), status_code


def create_success_response(data: Any, status_code: int = 200) -> tuple:
    """
    Create standardized success response.
    
    Args:
        data: Response data
        status_code: HTTP status code
        
    Returns:
        Tuple of (response_dict, status_code)
    """
    return jsonify(data), status_code


@twitter_bp.route('/sentiment', methods=['GET'])
@rate_limit(max_requests=Config.TWITTER_RATE_LIMIT, window=60)
def get_sentiment():
    """
    Get Twitter sentiment data for a ticker.
    
    Query Parameters:
        ticker (optional): Stock ticker to filter tweets
        accounts (optional): Comma-separated list of accounts to monitor
        limit (optional): Max tweets to return (default: 50)
    
    Returns:
        JSON response with tweets and sentiment analysis
        
    Example Response:
        {
            "tweets": [
                {
                    "id": "string",
                    "account": "ChartChampions",
                    "text": "Tweet content...",
                    "timestamp": "2025-11-11T10:30:00Z",
                    "sentiment": 0.75,
                    "tickers": ["AAPL", "MSFT"],
                    "url": "https://twitter.com/..."
                }
            ],
            "sentiment": {
                "overall_score": 0.65,
                "bullish_args": ["Strong technical setup", "..."],
                "bearish_args": ["Overbought RSI", "..."],
                "themes": ["Tech rally", "Fed policy", "..."],
                "account_influence": {
                    "ChartChampions": 0.85,
                    "unusual_whales": 0.72
                }
            },
            "metadata": {
                "total_tweets": 150,
                "filtered_tweets": 25,
                "last_updated": "2025-11-11T10:35:00Z",
                "cache_hit": true
            }
        }
    """
    try:
        # Get query parameters
        ticker = request.args.get('ticker')
        accounts = request.args.get('accounts')
        limit = request.args.get('limit', 50, type=int)
        
        # Validate limit
        if limit < 1 or limit > 200:
            logger.warning(f"Invalid limit: {limit}")
            return create_error_response(
                'Limit must be between 1 and 200',
                400
            )
        
        # Parse accounts if provided
        account_list = None
        if accounts:
            account_list = [acc.strip() for acc in accounts.split(',') if acc.strip()]
        
        logger.info(f"Fetching sentiment for ticker={ticker}, accounts={account_list}, limit={limit}")
        
        # Get Twitter service
        twitter_service = get_twitter_service()
        
        # Fetch sentiment data
        result = twitter_service.get_sentiment(
            ticker=ticker,
            accounts=account_list,
            limit=limit
        )
        
        logger.info(f"Successfully fetched sentiment data")
        return create_success_response(result)
        
    except ValueError as e:
        logger.warning(f"Validation error: {e}")
        return create_error_response(str(e), 400)
    except Exception as e:
        logger.error(f"Error fetching sentiment: {e}", exc_info=True)
        return create_error_response(
            'Internal server error while fetching sentiment data',
            500
        )


@twitter_bp.route('/stocktwits', methods=['GET'])
@rate_limit(max_requests=Config.TWITTER_RATE_LIMIT, window=60)
def get_stocktwits():
    """
    Get Stocktwits messages for a ticker.
    
    Query Parameters:
        ticker (required): Stock ticker symbol
        limit (optional): Max messages to return (default: 30)
    
    Returns:
        JSON response with Stocktwits messages
        
    Example Response:
        {
            "messages": [
                {
                    "id": "string",
                    "user": "username",
                    "text": "Message content...",
                    "timestamp": "2025-11-11T10:30:00Z",
                    "sentiment": "bullish",
                    "likes": 15
                }
            ],
            "sentiment_ratio": {
                "bullish": 65,
                "bearish": 35
            }
        }
    """
    try:
        # Get query parameters
        ticker = request.args.get('ticker')
        limit = request.args.get('limit', 30, type=int)
        
        # Validate ticker
        if not ticker:
            logger.warning("Ticker parameter is required")
            return create_error_response(
                'Ticker parameter is required',
                400
            )
        
        # Validate limit
        if limit < 1 or limit > 100:
            logger.warning(f"Invalid limit: {limit}")
            return create_error_response(
                'Limit must be between 1 and 100',
                400
            )
        
        logger.info(f"Fetching Stocktwits for ticker={ticker}, limit={limit}")
        
        # Get Twitter service
        twitter_service = get_twitter_service()
        
        # Fetch Stocktwits data
        result = twitter_service.get_stocktwits(
            ticker=ticker,
            limit=limit
        )
        
        logger.info(f"Successfully fetched Stocktwits data")
        return create_success_response(result)
        
    except ValueError as e:
        logger.warning(f"Validation error: {e}")
        return create_error_response(str(e), 400)
    except Exception as e:
        logger.error(f"Error fetching Stocktwits: {e}", exc_info=True)
        return create_error_response(
            'Internal server error while fetching Stocktwits data',
            500
        )


@twitter_bp.route('/accounts', methods=['POST'])
@rate_limit(max_requests=10, window=3600)  # 10 updates per hour
def update_accounts():
    """
    Update monitored Twitter accounts list.
    
    Request Body:
        {
            "accounts": ["ChartChampions", "unusual_whales", "..."]
        }
    
    Returns:
        JSON response with updated accounts
        
    Example Response:
        {
            "success": true,
            "accounts": ["ChartChampions", "unusual_whales", "..."],
            "validated": true
        }
    """
    try:
        # Get request body
        data = request.get_json()
        
        if not data or 'accounts' not in data:
            logger.warning("Missing accounts in request body")
            return create_error_response(
                'Request body must contain "accounts" array',
                400
            )
        
        accounts = data['accounts']
        
        # Validate accounts is a list
        if not isinstance(accounts, list):
            logger.warning("Accounts must be an array")
            return create_error_response(
                'Accounts must be an array',
                400
            )
        
        # Validate account names
        if not all(isinstance(acc, str) and acc.strip() for acc in accounts):
            logger.warning("Invalid account names")
            return create_error_response(
                'All accounts must be non-empty strings',
                400
            )
        
        # Clean account names
        accounts = [acc.strip() for acc in accounts]
        
        logger.info(f"Updating accounts: {accounts}")
        
        # Get Twitter service
        twitter_service = get_twitter_service()
        
        # Validate accounts
        validation_result = twitter_service.validate_accounts(accounts)
        
        # Update configuration
        success = twitter_service.update_config(accounts)
        
        result = {
            'success': success,
            'accounts': accounts,
            'validated': validation_result.get('all_valid', False),
            'validation_details': validation_result
        }
        
        logger.info(f"Successfully updated accounts")
        return create_success_response(result)
        
    except ValueError as e:
        logger.warning(f"Validation error: {e}")
        return create_error_response(str(e), 400)
    except Exception as e:
        logger.error(f"Error updating accounts: {e}", exc_info=True)
        return create_error_response(
            'Internal server error while updating accounts',
            500
        )


# Error handlers for this blueprint
@twitter_bp.errorhandler(404)
def not_found(error):
    """Handle 404 errors."""
    return create_error_response('Resource not found', 404)


@twitter_bp.errorhandler(429)
def rate_limit_exceeded(error):
    """Handle 429 rate limit errors."""
    return create_error_response('Rate limit exceeded. Please try again later.', 429)


@twitter_bp.errorhandler(500)
def internal_error(error):
    """Handle 500 errors."""
    logger.error(f"Internal server error: {error}", exc_info=True)
    return create_error_response('Internal server error', 500)
