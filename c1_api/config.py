"""
Configuration module for C1 Backend API
Manages environment variables and application settings
"""

import os
from typing import List
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Config:
    """Application configuration"""
    
    # Server configuration
    API_HOST: str = os.getenv('API_HOST', '0.0.0.0')
    API_PORT: int = int(os.getenv('API_PORT', '5000'))
    DEBUG_MODE: bool = os.getenv('DEBUG_MODE', 'false').lower() == 'true'
    
    # CORS configuration
    CORS_ORIGINS: List[str] = os.getenv(
        'CORS_ORIGINS',
        'http://localhost:3000'
    ).split(',')
    
    # Mock mode for testing without Discord
    USE_MOCK_MODE: bool = os.getenv('USE_MOCK_MODE', 'false').lower() == 'true'
    
    # Discord configuration (optional)
    DISCORD_BOT_TOKEN: str = os.getenv('DISCORD_BOT_TOKEN', '')
    
    # OpenAI API key (required for analysis)
    OPENAI_API_KEY: str = os.getenv('OPENAI_API_KEY', '')
    
    # Request timeout (seconds)
    REQUEST_TIMEOUT: int = int(os.getenv('REQUEST_TIMEOUT', '120'))
    
    # Cache TTL for coach plans (seconds)
    COACH_PLANS_CACHE_TTL: int = int(os.getenv('COACH_PLANS_CACHE_TTL', '30'))
    
    # Twitter configuration
    TWITTER_CACHE_TTL: int = int(os.getenv('TWITTER_CACHE_TTL', '300'))  # 5 minutes
    TWITTER_MAX_TWEETS: int = int(os.getenv('TWITTER_MAX_TWEETS', '100'))
    TWITTER_RATE_LIMIT: int = int(os.getenv('TWITTER_RATE_LIMIT', '60'))  # requests per minute
    TWITTER_DEFAULT_ACCOUNTS: List[str] = os.getenv(
        'TWITTER_DEFAULT_ACCOUNTS',
        'ChartChampions,unusual_whales,TradingView,Benzinga,MarketWatch'
    ).split(',')
    STOCKTWITS_API_TOKEN: str = os.getenv('STOCKTWITS_API_TOKEN', '')
    
    @classmethod
    def validate(cls) -> None:
        """Validate required configuration"""
        if not cls.OPENAI_API_KEY:
            print("WARNING: OPENAI_API_KEY not set. Analysis endpoint will not work.")
        
        if not cls.USE_MOCK_MODE and not cls.DISCORD_BOT_TOKEN:
            print("WARNING: DISCORD_BOT_TOKEN not set and mock mode disabled. Coach plans may not work.")
    
    @classmethod
    def get_config_dict(cls) -> dict:
        """Get configuration as dictionary"""
        return {
            'API_HOST': cls.API_HOST,
            'API_PORT': cls.API_PORT,
            'DEBUG_MODE': cls.DEBUG_MODE,
            'CORS_ORIGINS': cls.CORS_ORIGINS,
            'USE_MOCK_MODE': cls.USE_MOCK_MODE,
            'REQUEST_TIMEOUT': cls.REQUEST_TIMEOUT,
            'COACH_PLANS_CACHE_TTL': cls.COACH_PLANS_CACHE_TTL,
            'TWITTER_CACHE_TTL': cls.TWITTER_CACHE_TTL,
            'TWITTER_MAX_TWEETS': cls.TWITTER_MAX_TWEETS,
            'TWITTER_RATE_LIMIT': cls.TWITTER_RATE_LIMIT,
            'TWITTER_DEFAULT_ACCOUNTS': cls.TWITTER_DEFAULT_ACCOUNTS,
        }
