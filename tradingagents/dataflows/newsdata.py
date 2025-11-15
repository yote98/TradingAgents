"""
NewsData.io integration for news and social sentiment
Free tier: 200 API calls/day with sentiment analysis
API Docs: https://newsdata.io/documentation
"""

import os
import requests
from typing import Annotated
from datetime import datetime, timedelta
import json


def get_newsdata_news(
    query: Annotated[str, "Search query or ticker symbol"],
    start_date: Annotated[str, "Start date in yyyy-mm-dd format"],
    end_date: Annotated[str, "End date in yyyy-mm-dd format"]
) -> str:
    """
    Get news articles from NewsData.io with sentiment analysis
    
    Args:
        query: Search query or stock ticker
        start_date: Start date
        end_date: End date
    
    Returns:
        JSON string with articles and sentiment
    """
    api_key = os.getenv("NEWSDATA_API_KEY")
    
    if not api_key:
        return "Error: NEWSDATA_API_KEY not set in environment variables"
    
    url = "https://newsdata.io/api/1/news"
    
    params = {
        "apikey": api_key,
        "q": query,
        "language": "en",
        "category": "business",
        "from_date": start_date,
        "to_date": end_date
    }
    
    try:
        response = requests.get(url, params=params, timeout=15)
        response.raise_for_status()
        
        data = response.json()
        
        if data.get("status") != "success":
            return f"Error: {data.get('message', 'Unknown error from NewsData.io')}"
        
        articles = data.get("results", [])
        
        if not articles:
            return f"No news found for '{query}' between {start_date} and {end_date}"
        
        # Format articles with sentiment
        formatted_articles = []
        for article in articles[:20]:  # Limit to 20 articles
            formatted_articles.append({
                "title": article.get("title", ""),
                "description": article.get("description", ""),
                "source": article.get("source_id", ""),
                "published": article.get("pubDate", ""),
                "url": article.get("link", ""),
                "sentiment": article.get("sentiment", "neutral"),  # NewsData.io provides sentiment
                "category": article.get("category", []),
                "keywords": article.get("keywords", [])
            })
        
        result = {
            "query": query,
            "total_results": len(formatted_articles),
            "date_range": f"{start_date} to {end_date}",
            "articles": formatted_articles,
            "source": "NewsData.io",
            "sentiment_included": True
        }
        
        return json.dumps(result, indent=2)
        
    except requests.exceptions.RequestException as e:
        return f"Error fetching news from NewsData.io: {str(e)}"
    except Exception as e:
        return f"Error processing NewsData.io response: {str(e)}"


def get_newsdata_sentiment(
    ticker: Annotated[str, "Stock ticker symbol"]
) -> dict:
    """
    Get aggregated sentiment for a stock from recent news
    
    Args:
        ticker: Stock ticker (e.g., AAPL, TSLA)
    
    Returns:
        Dictionary with sentiment scores and summary
    """
    api_key = os.getenv("NEWSDATA_API_KEY")
    
    if not api_key:
        return {"error": "NEWSDATA_API_KEY not set"}
    
    # Get news from last 7 days
    end_date = datetime.now()
    start_date = end_date - timedelta(days=7)
    
    url = "https://newsdata.io/api/1/news"
    
    params = {
        "apikey": api_key,
        "q": ticker,
        "language": "en",
        "category": "business",
        "from_date": start_date.strftime("%Y-%m-%d"),
        "to_date": end_date.strftime("%Y-%m-%d")
    }
    
    try:
        response = requests.get(url, params=params, timeout=15)
        response.raise_for_status()
        
        data = response.json()
        articles = data.get("results", [])
        
        if not articles:
            return {
                "ticker": ticker,
                "sentiment_score": 0,
                "sentiment": "neutral",
                "article_count": 0,
                "message": "No recent news found"
            }
        
        # Aggregate sentiment
        sentiments = {"positive": 0, "negative": 0, "neutral": 0}
        for article in articles:
            sentiment = article.get("sentiment", "neutral")
            if sentiment in sentiments:
                sentiments[sentiment] += 1
        
        total = sum(sentiments.values())
        sentiment_score = (sentiments["positive"] - sentiments["negative"]) / total if total > 0 else 0
        
        # Determine overall sentiment
        if sentiment_score > 0.2:
            overall = "bullish"
        elif sentiment_score < -0.2:
            overall = "bearish"
        else:
            overall = "neutral"
        
        return {
            "ticker": ticker,
            "sentiment_score": round(sentiment_score, 2),
            "sentiment": overall,
            "article_count": total,
            "positive": sentiments["positive"],
            "negative": sentiments["negative"],
            "neutral": sentiments["neutral"],
            "date_range": f"Last 7 days",
            "source": "NewsData.io"
        }
        
    except Exception as e:
        return {"error": str(e)}


if __name__ == "__main__":
    # Test the connection
    print("Testing NewsData.io connection...")
    result = get_newsdata_sentiment("AAPL")
    print(json.dumps(result, indent=2))
