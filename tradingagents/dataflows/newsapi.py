"""
NewsAPI.org integration for news (fallback source)
Free tier: 100 API calls/day
API Docs: https://newsapi.org/docs
"""

import os
import requests
from typing import Annotated
from datetime import datetime
import json


def get_newsapi_news(
    query: Annotated[str, "Search query or ticker symbol"],
    start_date: Annotated[str, "Start date in yyyy-mm-dd format"],
    end_date: Annotated[str, "End date in yyyy-mm-dd format"]
) -> str:
    """
    Get news articles from NewsAPI.org
    
    Args:
        query: Search query or stock ticker
        start_date: Start date
        end_date: End date
    
    Returns:
        JSON string with articles
    """
    api_key = os.getenv("NEWSAPI_API_KEY")
    
    if not api_key:
        return "Error: NEWSAPI_API_KEY not set in environment variables"
    
    url = "https://newsapi.org/v2/everything"
    
    params = {
        "apiKey": api_key,
        "q": query,
        "from": start_date,
        "to": end_date,
        "language": "en",
        "sortBy": "relevancy",
        "pageSize": 20
    }
    
    try:
        response = requests.get(url, params=params, timeout=15)
        response.raise_for_status()
        
        data = response.json()
        
        if data.get("status") != "ok":
            return f"Error: {data.get('message', 'Unknown error from NewsAPI.org')}"
        
        articles = data.get("articles", [])
        
        if not articles:
            return f"No news found for '{query}' between {start_date} and {end_date}"
        
        # Format articles
        formatted_articles = []
        for article in articles:
            formatted_articles.append({
                "title": article.get("title", ""),
                "description": article.get("description", ""),
                "source": article.get("source", {}).get("name", ""),
                "published": article.get("publishedAt", ""),
                "url": article.get("url", ""),
                "author": article.get("author", ""),
                "content": article.get("content", "")
            })
        
        result = {
            "query": query,
            "total_results": len(formatted_articles),
            "date_range": f"{start_date} to {end_date}",
            "articles": formatted_articles,
            "source": "NewsAPI.org"
        }
        
        return json.dumps(result, indent=2)
        
    except requests.exceptions.RequestException as e:
        return f"Error fetching news from NewsAPI.org: {str(e)}"
    except Exception as e:
        return f"Error processing NewsAPI.org response: {str(e)}"


def get_newsapi_headlines(
    query: Annotated[str, "Search query or ticker symbol"]
) -> str:
    """
    Get top headlines from NewsAPI.org
    
    Args:
        query: Search query or stock ticker
    
    Returns:
        JSON string with top headlines
    """
    api_key = os.getenv("NEWSAPI_API_KEY")
    
    if not api_key:
        return "Error: NEWSAPI_API_KEY not set"
    
    url = "https://newsapi.org/v2/top-headlines"
    
    params = {
        "apiKey": api_key,
        "q": query,
        "language": "en",
        "category": "business",
        "pageSize": 10
    }
    
    try:
        response = requests.get(url, params=params, timeout=15)
        response.raise_for_status()
        
        data = response.json()
        
        if data.get("status") != "ok":
            return f"Error: {data.get('message', 'Unknown error')}"
        
        articles = data.get("articles", [])
        
        formatted_articles = []
        for article in articles:
            formatted_articles.append({
                "title": article.get("title", ""),
                "description": article.get("description", ""),
                "source": article.get("source", {}).get("name", ""),
                "published": article.get("publishedAt", ""),
                "url": article.get("url", "")
            })
        
        result = {
            "query": query,
            "total_results": len(formatted_articles),
            "headlines": formatted_articles,
            "source": "NewsAPI.org"
        }
        
        return json.dumps(result, indent=2)
        
    except Exception as e:
        return f"Error: {str(e)}"


if __name__ == "__main__":
    # Test the connection
    print("Testing NewsAPI.org connection...")
    result = get_newsapi_headlines("AAPL")
    print(result[:500] if len(result) > 500 else result)
