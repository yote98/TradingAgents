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
        "core_stock_apis": "marketdata",     # Options: marketdata, yfinance, alpha_vantage, local - marketdata has real-time data (30-day free trial)
        "technical_indicators": "yfinance",  # Options: yfinance, alpha_vantage, local
        "fundamental_data": "fmp",           # Options: fmp, alpha_vantage, openai, local - FMP has 250 free calls/day, accurate data
        "news_data": "newsdata",             # Options: newsdata, newsapi, alpha_vantage, openai, google, local - newsdata has 200 free calls/day with sentiment
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
        # Curated Twitter accounts to monitor (Enhanced - 45 accounts)
        "curated_accounts": [
            # Core Financial News & Analysis
            "ChartChampions",      # Technical analysis
            "unusual_whales",      # Options flow
            "DeItaone",           # Breaking news (Walter Bloomberg)
            "zerohedge",          # Market news
            "TradingView",        # Charts and analysis
            "Investingcom",       # Financial news
            "YahooFinance",       # Market updates
            "MarketWatch",        # News and analysis
            "business",           # Bloomberg News
            "WSJ",                # Wall Street Journal
            "Reuters",            # Reuters News
            "FT",                 # Financial Times
            "CNBC",               # CNBC Official
            
            # Market Commentators & Analysts
            "jimcramer",          # Jim Cramer - CNBC
            "carlquintanilla",    # Carl Quintanilla - CNBC
            "ScottWapnerCNBC",    # Scott Wapner - CNBC
            "MelissaLeeCNBC",     # Melissa Lee - CNBC
            "SquawkCNBC",         # CNBC Squawk Box
            
            # Technical Analysis
            "GRDecter",           # Gareth Decter - Technical analyst
            "allstarcharts",      # JC Parets - Technical analysis
            "StockCharts",        # StockCharts platform
            "TrendSpider",        # TrendSpider platform
            
            # Options & Flow
            "spotgamma",          # Options gamma exposure
            "SqueezeMetrics",     # Dark pool data
            "WOLF_Financial",     # Options flow
            
            # Crypto & Tech
            "elonmusk",           # Elon Musk
            "APompliano",         # Anthony Pompliano - Markets/Crypto
            "BitcoinHypers",      # Bitcoin Hyper
            "Luckshuryy",         # Luckshury
            
            # Individual Traders & Analysts
            "CCPool_Daniel",      # Daniel Jordan
            "AlphaCharts",        # Trader/analyst
            "TraderStewie",       # Day trader
            "InvestorsLive",      # Nate Michaud
            "madaznfootballr",    # Active trader
            
            # Institutional & Research (NEW)
            "GoldmanSachs",       # Goldman Sachs research
            "MorganStanley",      # Morgan Stanley
            "jpmorgan",           # JPMorgan Chase
            "BofAML",             # Bank of America
            
            # Additional Quality Sources (NEW)
            "Fxhedgers",          # FX & macro news
            "LiveSquawk",         # Real-time market news
            "FirstSquawk",        # Breaking market news
            "TraderStewie",       # Day trader
            "InvestorsLive",      # Nate Michaud
            "madaznfootballr",    # Trader
            "_TraderR",           # Trader R
            "toroscrypto",        # Toros Crypto
            "follis_",            # Follis
            "c2mtrading",         # C2M Trading
            
            # Institutional & Research
            "GoldmanSachs",       # Goldman Sachs
            "MorganStanley",      # Morgan Stanley
            "jpmorgan",           # JPMorgan
            "BofAML",             # Bank of America
            "FinancialJuice",     # Financial Juice - Market analysis
            "TreeCapital",        # Tree Capital - Trading insights
            
            # Top Tier Traders (High Signal)
            "mrjasonpizzino",     # Jason Pizzino - Macro/crypto
            "CryptoCred",         # Crypto Cred - Technical analysis
            "CryptoDonAlt",       # Crypto Don Alt - Trader
            "ThinkingUSD",        # Thinking USD - Macro trader
            "CryptoBirb",         # Crypto Birb - Technical analysis
            "Pentosh1",           # Pentoshi - Crypto trader
            "CryptoKaleo",        # Crypto Kaleo - Trader
            "CryptoCapo_",        # Crypto Capo - Technical analysis
            "CryptoGodJohn",      # Crypto God John - Trader
            "TeddyCleps",         # Teddy Cleps - Trader
            
            # Market Structure & Data
            "tier10k",            # Tier 10K - Market structure
            "KobeissiLetter",     # The Kobeissi Letter - Market analysis
            "MacroAlf",           # Macro Alf - Macro analysis
            "RaoulGMI",           # Raoul Pal - Macro investor
            "LynAldenContact",    # Lyn Alden - Macro/markets
            
            # High-Volume Traders
            "TraderLion_",        # Trader Lion - Day trading
            "Trader_mcaruso",     # Mike Caruso - Trader
            "Trader1sz",          # Trader 1sz
            "traderstewie",       # Trader Stewie (duplicate check)
            "MrZackMorris",       # Zack Morris - Momentum trader
            
            # Smart Money & Whales
            "lookonchain",        # LookOnChain - Whale tracking
            "whale_alert",        # Whale Alert - Large transactions
            "WatcherGuru",        # Watcher Guru - Breaking news
            "Fxhedgers",          # FX Hedgers - Breaking news
            
            # Technical Analysis Experts
            "CryptoBullet1",      # Crypto Bullet - TA
            "CryptoWzrd",         # Crypto Wizard - TA
            "CryptoGirlNova",     # Crypto Girl Nova - TA
            "CryptoMichNL",       # Crypto Mich - TA
            "CryptoTony__",       # Crypto Tony - TA
            "MorganStanley",      # Morgan Stanley
            "jpmorgan",           # JPMorgan
            "BofAML",             # Bank of America
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
