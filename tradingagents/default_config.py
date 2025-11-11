import os

DEFAULT_CONFIG = {
    "project_dir": os.path.abspath(os.path.join(os.path.dirname(__file__), ".")),
    "results_dir": os.getenv("TRADINGAGENTS_RESULTS_DIR", "./results"),
    "data_dir": "/Users/yluo/Documents/Code/ScAI/FR1-data",
    "data_cache_dir": os.path.join(
        os.path.abspath(os.path.join(os.path.dirname(__file__), ".")),
        "dataflows/data_cache",
    ),
    # LLM settings
    "llm_provider": "openai",
    "deep_think_llm": "o4-mini",
    "quick_think_llm": "gpt-4o-mini",
    "backend_url": "https://api.openai.com/v1",
    # Debate and discussion settings
    "max_debate_rounds": 1,
    "max_risk_discuss_rounds": 1,
    "max_recur_limit": 100,
    # Data vendor configuration
    # Category-level configuration (default for all tools in category)
    "data_vendors": {
        "core_stock_apis": "yfinance",       # Options: yfinance, alpha_vantage, local
        "technical_indicators": "yfinance",  # Options: yfinance, alpha_vantage, local
        "fundamental_data": "alpha_vantage", # Options: openai, alpha_vantage, local
        "news_data": "alpha_vantage",        # Options: openai, alpha_vantage, google, local
    },
    # Tool-level configuration (takes precedence over category-level)
    "tool_vendors": {
        # Example: "get_stock_data": "alpha_vantage",  # Override category default
        # Example: "get_news": "openai",               # Override category default
    },
    # Discord webhook configuration for coach daily plans
    "discord_webhooks": {
        "coach_d": os.getenv("DISCORD_COACH_D_WEBHOOK", ""),
        "coach_i": os.getenv("DISCORD_COACH_I_WEBHOOK", ""),
        "coach_s": os.getenv("DISCORD_COACH_S_WEBHOOK", ""),
        "coach_n": os.getenv("DISCORD_COACH_N_WEBHOOK", ""),
        "summary_webhook": os.getenv("DISCORD_SUMMARY_WEBHOOK", ""),  # For sending results back
    },
    # Coach configuration
    "enable_coaches": True,  # Set to False to disable coach agents
    "selected_coaches": ["coach_d", "coach_i", "coach_s", "coach_n"],  # Which coaches to use
    
    # Twitter/Social Monitor configuration
    "twitter_monitor": {
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
        "stocktwits_api_token": os.getenv("STOCKTWITS_API_TOKEN", None),  # Optional
        "stocktwits_message_limit": 30,
        
        # Fetching behavior
        "max_tweets_per_account": 20,
        "request_timeout": 10,  # seconds
        "max_retries": 3,
        "rate_limit_delay": 6,  # seconds between requests (10 req/min)
        
        # Caching
        "cache_duration": 3600,  # 1 hour in seconds
        "cache_directory": os.path.join(
            os.path.abspath(os.path.join(os.path.dirname(__file__), ".")),
            "dataflows/data_cache/twitter",
        ),
        
        # Sentiment analysis
        "use_llm_sentiment": True,
        "sentiment_batch_size": 50,  # Process tweets in batches
    },
}
