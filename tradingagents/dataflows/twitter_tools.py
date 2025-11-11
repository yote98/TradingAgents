"""
Twitter/Social Monitor Tool Functions

Tool functions for integrating Twitter and Stocktwits sentiment analysis
with the TradingAgents Social Sentiment Analyst.
"""

from langchain_core.tools import tool
from tradingagents.dataflows.twitter_monitor import TwitterSocialMonitor, format_twitter_report
from tradingagents.default_config import DEFAULT_CONFIG


@tool
def get_twitter_sentiment(ticker: str, timeframe: str = "24h") -> str:
    """
    Fetch and analyze Twitter and Stocktwits sentiment for a stock ticker.
    
    This tool monitors curated financial Twitter accounts (Chart Champions, Unusual Whales,
    Walter Bloomberg, etc.) and Stocktwits to provide social sentiment analysis.
    
    Args:
        ticker: Stock symbol (e.g., "AAPL", "TSLA", "GOOGL")
        timeframe: Time window for data - "24h" for last 24 hours, "7d" for last week
        
    Returns:
        Formatted report containing:
        - Overall sentiment score (-1.0 to 1.0)
        - Bullish and bearish arguments
        - Key themes and discussion topics
        - Most influential accounts
        - Sample tweets
        
    Example:
        >>> get_twitter_sentiment("AAPL", "24h")
        "=== Twitter/Social Sentiment Report for $AAPL ===
        Overall Sentiment: 0.65 (Bullish)
        ..."
    """
    try:
        # Get configuration
        config = DEFAULT_CONFIG.get("twitter_monitor", {})
        
        # Initialize monitor (without LLM for now - will add later)
        monitor = TwitterSocialMonitor(config=config, llm=None)
        
        # Fetch sentiment data
        data = monitor.get_sentiment_data(ticker=ticker, timeframe=timeframe)
        
        # Format as readable report
        report = format_twitter_report(data)
        
        return report
        
    except Exception as e:
        return f"Error fetching Twitter sentiment for {ticker}: {str(e)}"


@tool
def get_twitter_sentiment_with_llm(ticker: str, llm, timeframe: str = "24h") -> str:
    """
    Fetch and analyze Twitter/Stocktwits sentiment with LLM-powered analysis.
    
    This is an enhanced version that uses LLM for deeper sentiment analysis.
    
    Args:
        ticker: Stock symbol
        llm: LLM instance for sentiment analysis
        timeframe: Time window for data
        
    Returns:
        Formatted sentiment report with LLM analysis
    """
    try:
        config = DEFAULT_CONFIG.get("twitter_monitor", {})
        monitor = TwitterSocialMonitor(config=config, llm=llm)
        
        data = monitor.get_sentiment_data(ticker=ticker, timeframe=timeframe)
        report = format_twitter_report(data)
        
        return report
        
    except Exception as e:
        return f"Error fetching Twitter sentiment for {ticker}: {str(e)}"
