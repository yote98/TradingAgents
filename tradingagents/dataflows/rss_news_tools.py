"""
RSS News Feed Tools

Free news aggregation from RSS feeds - no API keys required!
"""

import feedparser
import requests
from datetime import datetime, timedelta
from typing import List, Dict, Any
import logging
from langchain_core.tools import tool

logger = logging.getLogger(__name__)


# Top financial RSS feeds (100% FREE)
FINANCIAL_RSS_FEEDS = {
    # Major Financial News
    "MarketWatch": "https://www.marketwatch.com/rss/topstories",
    "Yahoo Finance": "https://finance.yahoo.com/news/rssindex",
    "Seeking Alpha": "https://seekingalpha.com/feed.xml",
    "Benzinga": "https://www.benzinga.com/feed",
    "Investing.com": "https://www.investing.com/rss/news.rss",
    
    # Business News
    "Reuters Business": "https://www.reutersagency.com/feed/?taxonomy=best-topics&post_type=best",
    "CNBC": "https://www.cnbc.com/id/100003114/device/rss/rss.html",
    "Bloomberg": "https://www.bloomberg.com/feed/podcast/bloomberg-markets.xml",
    
    # Crypto News
    "CoinDesk": "https://www.coindesk.com/arc/outboundfeeds/rss/",
    "Cointelegraph": "https://cointelegraph.com/rss",
    "Decrypt": "https://decrypt.co/feed",
    
    # Tech/Business
    "TechCrunch": "https://techcrunch.com/feed/",
    "The Verge": "https://www.theverge.com/rss/index.xml",
    
    # Economic Data
    "Federal Reserve": "https://www.federalreserve.gov/feeds/press_all.xml",
}


def fetch_rss_feed(feed_url: str, max_items: int = 10) -> List[Dict[str, Any]]:
    """
    Fetch and parse an RSS feed.
    
    Args:
        feed_url: URL of the RSS feed
        max_items: Maximum number of items to return
        
    Returns:
        List of news articles with title, link, published date, summary
    """
    try:
        feed = feedparser.parse(feed_url)
        articles = []
        
        for entry in feed.entries[:max_items]:
            article = {
                "title": entry.get("title", ""),
                "link": entry.get("link", ""),
                "published": entry.get("published", ""),
                "summary": entry.get("summary", entry.get("description", "")),
                "source": feed.feed.get("title", "Unknown"),
            }
            articles.append(article)
        
        return articles
        
    except Exception as e:
        logger.error(f"Error fetching RSS feed {feed_url}: {e}")
        return []


def fetch_all_financial_news(max_per_feed: int = 5) -> str:
    """
    Fetch news from all configured RSS feeds.
    
    Args:
        max_per_feed: Maximum articles per feed
        
    Returns:
        Formatted news report
    """
    all_articles = []
    
    for source_name, feed_url in FINANCIAL_RSS_FEEDS.items():
        logger.info(f"Fetching RSS feed: {source_name}")
        articles = fetch_rss_feed(feed_url, max_per_feed)
        
        for article in articles:
            article["source"] = source_name
            all_articles.append(article)
    
    # Format as readable report
    report = "=== Financial News from RSS Feeds ===\n\n"
    report += f"Total Articles: {len(all_articles)}\n"
    report += f"Sources: {len(FINANCIAL_RSS_FEEDS)}\n\n"
    
    for i, article in enumerate(all_articles[:50], 1):  # Limit to 50 articles
        report += f"{i}. [{article['source']}] {article['title']}\n"
        report += f"   Link: {article['link']}\n"
        if article['summary']:
            summary = article['summary'][:200] + "..." if len(article['summary']) > 200 else article['summary']
            report += f"   {summary}\n"
        report += f"   Published: {article['published']}\n\n"
    
    return report


def search_rss_news(ticker: str, max_articles: int = 20) -> str:
    """
    Search RSS feeds for ticker-specific news.
    
    Args:
        ticker: Stock ticker symbol
        max_articles: Maximum articles to return
        
    Returns:
        Formatted news report filtered by ticker
    """
    all_articles = []
    
    # Fetch from all feeds
    for source_name, feed_url in FINANCIAL_RSS_FEEDS.items():
        articles = fetch_rss_feed(feed_url, max_items=10)
        for article in articles:
            article["source"] = source_name
            all_articles.append(article)
    
    # Filter by ticker mention
    ticker_upper = ticker.upper()
    filtered = []
    
    for article in all_articles:
        text = f"{article['title']} {article['summary']}".upper()
        if ticker_upper in text or f"${ticker_upper}" in text:
            filtered.append(article)
    
    # Format report
    report = f"=== RSS News for {ticker} ===\n\n"
    report += f"Found {len(filtered)} articles mentioning {ticker}\n\n"
    
    for i, article in enumerate(filtered[:max_articles], 1):
        report += f"{i}. [{article['source']}] {article['title']}\n"
        report += f"   Link: {article['link']}\n"
        if article['summary']:
            summary = article['summary'][:200] + "..." if len(article['summary']) > 200 else article['summary']
            report += f"   {summary}\n"
        report += f"   Published: {article['published']}\n\n"
    
    return report


@tool
def get_rss_news(ticker: str = None, max_articles: int = 20) -> str:
    """
    Fetch financial news from free RSS feeds.
    
    This tool aggregates news from 13+ major financial news sources via RSS feeds.
    No API keys required - completely free!
    
    Sources include: MarketWatch, Yahoo Finance, Seeking Alpha, Benzinga,
    Reuters, CNBC, Bloomberg, CoinDesk, TechCrunch, and more.
    
    Args:
        ticker: Optional stock ticker to filter news (e.g., "AAPL")
        max_articles: Maximum number of articles to return (default: 20)
        
    Returns:
        Formatted news report with headlines, summaries, and links
        
    Example:
        >>> get_rss_news("AAPL", 10)
        "=== RSS News for AAPL ===
        Found 8 articles mentioning AAPL
        
        1. [MarketWatch] Apple Reports Record Earnings
        ..."
    """
    try:
        if ticker:
            return search_rss_news(ticker, max_articles)
        else:
            return fetch_all_financial_news(max_per_feed=5)
            
    except Exception as e:
        return f"Error fetching RSS news: {str(e)}"


# For direct use (not as LangChain tool)
def get_rss_news_direct(ticker: str = None, max_articles: int = 20) -> str:
    """Direct function call (not LangChain tool)"""
    return get_rss_news.invoke({"ticker": ticker, "max_articles": max_articles})


if __name__ == "__main__":
    # Test the RSS news fetcher
    print("Testing RSS News Fetcher...\n")
    
    # Test 1: General news
    print("=" * 70)
    print("TEST 1: General Financial News")
    print("=" * 70)
    news = fetch_all_financial_news(max_per_feed=3)
    print(news[:1000])  # Print first 1000 chars
    
    # Test 2: Ticker-specific news
    print("\n" + "=" * 70)
    print("TEST 2: AAPL-Specific News")
    print("=" * 70)
    aapl_news = search_rss_news("AAPL", max_articles=5)
    print(aapl_news)
