# Free News Sources for Trading - Research Report

**Goal**: Find free news sources similar to FinancialJuice  
**Date**: November 12, 2025

## ✅ Already Monitoring (via Twitter - FREE)

You're already getting news from these accounts:
- **FinancialJuice** ✅ (Added to your Twitter list!)
- **TreeCapital** ✅ (Added to your Twitter list!)
- **DeItaone** (Walter Bloomberg) - Breaking news
- **Fxhedgers** - FX & market breaking news
- **WatcherGuru** - Breaking financial news
- **The Kobeissi Letter** - Market analysis
- **ZeroHedge** - Alternative market news

## 🆓 Free News APIs & RSS Feeds

### 1. **RSS Feeds (100% Free)**

#### Financial News RSS Feeds:
```python
FREE_NEWS_RSS_FEEDS = {
    # Major Financial News
    "Bloomberg Markets": "https://www.bloomberg.com/feed/podcast/bloomberg-markets.xml",
    "Reuters Business": "https://www.reutersagency.com/feed/?taxonomy=best-topics&post_type=best",
    "MarketWatch": "https://www.marketwatch.com/rss/",
    "Yahoo Finance": "https://finance.yahoo.com/news/rssindex",
    "Seeking Alpha": "https://seekingalpha.com/feed.xml",
    "Benzinga": "https://www.benzinga.com/feed",
    
    # Crypto News
    "CoinDesk": "https://www.coindesk.com/arc/outboundfeeds/rss/",
    "Cointelegraph": "https://cointelegraph.com/rss",
    "Decrypt": "https://decrypt.co/feed",
    
    # Tech/Business
    "TechCrunch": "https://techcrunch.com/feed/",
    "The Verge": "https://www.theverge.com/rss/index.xml",
    "Ars Technica": "https://feeds.arstechnica.com/arstechnica/index",
    
    # Economic Data
    "Federal Reserve": "https://www.federalreserve.gov/feeds/press_all.xml",
    "SEC Filings": "https://www.sec.gov/cgi-bin/browse-edgar?action=getcurrent&CIK=&type=&company=&dateb=&owner=include&start=0&count=40&output=atom",
}
```

### 2. **Free News APIs**

#### A. **Finnhub (FREE Tier)**
- **Cost**: FREE (60 API calls/minute)
- **Features**: Company news, market news, press releases
- **Quality**: Excellent
- **Sign up**: https://finnhub.io/register

```python
# Example usage
import finnhub
finnhub_client = finnhub.Client(api_key="YOUR_FREE_KEY")
news = finnhub_client.company_news('AAPL', _from="2025-11-01", to="2025-11-12")
```

#### B. **NewsAPI (FREE Tier)**
- **Cost**: FREE (100 requests/day)
- **Features**: 80,000+ sources, historical news
- **Limitation**: 1-month old news only on free tier
- **Sign up**: https://newsapi.org/register

```python
# Example usage
from newsapi import NewsApiClient
newsapi = NewsApiClient(api_key='YOUR_FREE_KEY')
news = newsapi.get_everything(q='AAPL', language='en', sort_by='publishedAt')
```

#### C. **Polygon.io (FREE Tier)**
- **Cost**: FREE (5 API calls/minute)
- **Features**: Stock news, market data
- **Quality**: Good
- **Sign up**: https://polygon.io/

#### D. **IEX Cloud (FREE Tier)**
- **Cost**: FREE (50,000 messages/month)
- **Features**: Company news, market data
- **Quality**: Excellent
- **Sign up**: https://iexcloud.io/

### 3. **Reddit as News Source (FREE)**

#### Financial Subreddits:
- r/wallstreetbets - Retail sentiment
- r/stocks - Stock discussions
- r/investing - Investment news
- r/StockMarket - Market news
- r/options - Options trading
- r/CryptoCurrency - Crypto news

**Access**: Use Reddit API (free) or PRAW library

```python
import praw
reddit = praw.Reddit(client_id='YOUR_ID', client_secret='YOUR_SECRET', user_agent='YOUR_APP')
hot_posts = reddit.subreddit('stocks').hot(limit=10)
```

### 4. **Telegram Channels (FREE)**

Many financial news sources have free Telegram channels:
- **FinancialJuice** - Has Telegram channel
- **The Kobeissi Letter** - Telegram available
- **Whale Alert** - Crypto whale movements
- **Crypto News Aggregators** - Various free channels

### 5. **Google News RSS (FREE)**

Create custom RSS feeds for any topic:
```
https://news.google.com/rss/search?q=AAPL+stock&hl=en-US&gl=US&ceid=US:en
```

Replace `AAPL+stock` with any search term.

## 📊 Comparison: Free vs Paid

| Source | Cost | Quality | Real-time | Sentiment | Best For |
|--------|------|---------|-----------|-----------|----------|
| **Twitter (Nitter)** | FREE | High | Yes | Manual | Breaking news, sentiment |
| **RSS Feeds** | FREE | Medium | Delayed | No | General news |
| **Finnhub Free** | FREE | High | Yes | No | Company news |
| **NewsAPI Free** | FREE | Medium | Delayed | No | Historical news |
| **Reddit** | FREE | Medium | Yes | Community | Retail sentiment |
| **Alpha Vantage** | $50/mo | High | Yes | Yes | Professional trading |

## 🎯 Recommended Free Setup

### Tier 1: Already Have (FREE)
✅ **85 Twitter accounts** via Nitter RSS  
✅ **Alpha Vantage** (you have a key!)  
✅ **OpenAI** fallback for analysis  

### Tier 2: Easy Additions (FREE)
1. **Finnhub Free API** - 60 calls/min
2. **RSS Feeds** - MarketWatch, Yahoo Finance, Seeking Alpha
3. **Reddit** - r/stocks, r/wallstreetbets

### Tier 3: If Needed (FREE)
4. **NewsAPI Free** - 100 requests/day
5. **Google News RSS** - Custom searches
6. **Telegram** - Financial channels

## 🚀 Implementation Priority

### Already Working:
1. ✅ Twitter monitoring (85 accounts including FinancialJuice)
2. ✅ Alpha Vantage API key configured
3. ✅ News Analyst functional

### Quick Wins (Add These):
1. **Finnhub Free** - Best free news API
   - Sign up: https://finnhub.io/register
   - Add key to `.env`: `FINNHUB_API_KEY=your_key`
   
2. **RSS Feeds** - Zero setup
   - Already supported by your system
   - Just add feed URLs to config

3. **Reddit** - Great for sentiment
   - Sign up: https://www.reddit.com/prefs/apps
   - Add to `.env`: `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET`

## 💡 Best Free Alternative to Alpha Vantage

If you want to save $50/month, use this combo:

**Free Stack**:
- **Finnhub** (60 calls/min) - Company news
- **RSS Feeds** (unlimited) - General news  
- **Twitter** (via Nitter) - Breaking news & sentiment
- **Reddit** (unlimited) - Retail sentiment
- **OpenAI** (pay per use) - Analysis

**Total Cost**: $0-5/month (just OpenAI usage)

## 📝 Summary

### You Already Have:
✅ **Alpha Vantage API key** configured  
✅ **85 Twitter accounts** including FinancialJuice  
✅ **News Analyst** ready to use  
✅ **Best free setup** already in place!

### To Add More (All FREE):
1. Finnhub API (best free news API)
2. RSS feeds (MarketWatch, Yahoo Finance)
3. Reddit (retail sentiment)

### Recommendation:
**Your current setup is excellent!** You have:
- Alpha Vantage (professional news)
- 85 Twitter accounts (real-time sentiment)
- OpenAI (smart analysis)

This is better than most paid setups! 🎉

Want me to add Finnhub or RSS feeds to your system?
