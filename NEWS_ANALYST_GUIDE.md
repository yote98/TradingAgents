# News Analyst - Complete Guide

**Status**: ✅ Fully Functional  
**Location**: `tradingagents/agents/analysts/news_analyst.py`

## Yes, You Have a News Analyst!

Your system includes a **dedicated News Analyst** that analyzes:
- Company-specific news
- Global macroeconomic news
- Market trends
- Recent events affecting trading

## What It Does

### 1. Company-Specific News
Searches for news about the specific ticker you're analyzing:
- Earnings reports
- Product launches
- Executive changes
- Regulatory news
- Analyst upgrades/downgrades
- Mergers & acquisitions

### 2. Global Macroeconomic News
Analyzes broader market context:
- Federal Reserve decisions
- Economic indicators (GDP, inflation, unemployment)
- Geopolitical events
- Sector trends
- Market sentiment
- Global market movements

### 3. Comprehensive Analysis
Generates a detailed report including:
- Current state of the world relevant to trading
- Company-specific developments
- Macro trends affecting the stock
- Sentiment analysis (bullish/bearish)
- Key insights for traders
- Organized markdown table of key points

## Data Sources

### Current Setup (FREE)

**Primary**: OpenAI (via `get_news` tool)
- Uses OpenAI's knowledge and web search
- No additional API costs
- Good quality, general news

**Fallback Chain**:
```
Alpha Vantage → OpenAI → Google → Local
```

### How It Works

1. **Company News**:
   ```python
   get_news(query="AAPL earnings", start_date="2025-11-05", end_date="2025-11-12")
   ```
   - Searches for ticker-specific news
   - Last 7 days by default
   - Returns relevant articles

2. **Global News**:
   ```python
   get_global_news(curr_date="2025-11-12", look_back_days=7, limit=10)
   ```
   - Fetches macro news
   - Market-moving events
   - Economic indicators

## Upgrading News Sources

### Option 1: Alpha Vantage (Recommended)

**Cost**: $50/month (Premium plan)  
**Benefits**:
- Real-time news feed
- Sentiment scores included
- 1000+ sources
- Company-specific filtering

**Setup**:
```bash
# Add to .env
ALPHA_VANTAGE_API_KEY=your_key_here
```

**Get API Key**: https://www.alphavantage.co/support/#api-key

### Option 2: NewsAPI

**Cost**: $0-449/month  
**Benefits**:
- 80,000+ sources
- Historical news
- Advanced filtering
- Developer-friendly

**Setup**:
```python
# In default_config.py
"news_apis": {
    "newsapi": {
        "enabled": True,
        "api_key": os.getenv("NEWSAPI_KEY"),
        "sources": ["bloomberg", "reuters", "wsj"],
    }
}
```

**Get API Key**: https://newsapi.org/

### Option 3: Finnhub

**Cost**: $0-99/month  
**Benefits**:
- Real-time news
- Company news feed
- Market news
- Free tier available

**Setup**:
```python
"news_apis": {
    "finnhub": {
        "enabled": True,
        "api_key": os.getenv("FINNHUB_API_KEY"),
    }
}
```

**Get API Key**: https://finnhub.io/

### Option 4: EODHD

**Cost**: $20-80/month  
**Benefits**:
- Financial news
- Economic calendar
- Earnings calendar
- Good value

**Get API Key**: https://eodhistoricaldata.com/

## Current Configuration

```python
# In default_config.py
"news_data": {
    "primary_vendor": "alpha_vantage",  # Will fallback to OpenAI if not configured
    "fallback_vendors": ["openai", "google", "local"],
}
```

## Testing the News Analyst

### Quick Test

```python
from tradingagents.graph.trading_graph import TradingAgentsGraph
from datetime import datetime

# Initialize with only news analyst
graph = TradingAgentsGraph(
    selected_analysts=["news"],
    debug=True
)

# Run analysis
ticker = "AAPL"
trade_date = datetime.now().strftime("%Y-%m-%d")
final_state, decision, coach_plans = graph.propagate(ticker, trade_date)

# Check the report
print(final_state["news_report"])
```

### Expected Output

```markdown
# News Analysis for AAPL - November 12, 2025

## Company-Specific News

### Recent Developments
- Apple announced Q4 earnings beat expectations with $102.47B revenue
- iPhone 16 sales showing strong momentum in early launch period
- Services revenue grew 15% YoY, reaching new record
- China market showing signs of recovery after recent weakness

### Analyst Activity
- Goldman Sachs raised price target to $250 (from $230)
- Morgan Stanley maintains Overweight rating
- JPMorgan notes strong App Store growth

## Macroeconomic Context

### Federal Reserve
- Fed held rates steady at 5.25-5.50%
- Powell signals potential rate cuts in Q1 2026
- Inflation trending toward 2% target

### Market Sentiment
- Tech sector showing strength
- Consumer spending remains resilient
- Holiday season outlook positive

## Key Insights for Traders

| Category | Insight | Impact |
|----------|---------|--------|
| Earnings | Beat expectations | Bullish |
| China | Recovery signs | Bullish |
| Valuation | P/E at 32x | Neutral |
| Fed Policy | Rate cut potential | Bullish |
| Competition | Android pressure | Bearish |

## Recommendation Context
News sentiment is moderately bullish with strong fundamentals offset by valuation concerns.
```

## Comparison: News vs Social Analyst

| Feature | News Analyst | Social Analyst |
|---------|--------------|----------------|
| **Focus** | Official news, press releases | Community sentiment, tweets |
| **Sources** | News APIs, press | Twitter, Stocktwits |
| **Timeframe** | Last 7 days | Last 24 hours |
| **Quality** | High (verified sources) | Medium (unverified) |
| **Speed** | Slower (official news) | Faster (real-time) |
| **Cost** | $0-50/month | Free |
| **Best For** | Fundamental events | Sentiment shifts |

## Using Both Together

The **best approach** is to use both:

```python
# Run with both analysts
graph = TradingAgentsGraph(
    selected_analysts=["news", "social"],
    debug=False
)
```

**Why?**
- News Analyst: Official developments, earnings, macro trends
- Social Analyst: Real-time sentiment, community reaction, momentum

**Example**:
- News: "Apple announces record earnings"
- Social: "Twitter buzzing about iPhone 16 demand"
- Combined: Strong fundamental + positive sentiment = High confidence signal

## Customizing the News Analyst

### Adjust Time Window

Edit `news_analyst.py`:
```python
# Change from 7 days to 14 days
get_global_news(curr_date=current_date, look_back_days=14, limit=20)
```

### Add More News Sources

Edit `default_config.py`:
```python
"news_data": {
    "primary_vendor": "alpha_vantage",
    "fallback_vendors": ["newsapi", "finnhub", "openai"],
    "sources": [
        "bloomberg",
        "reuters",
        "wsj",
        "ft",
        "cnbc",
    ]
}
```

### Focus on Specific Topics

Modify the system message in `news_analyst.py`:
```python
system_message = (
    "Focus on: earnings reports, product launches, regulatory changes, "
    "and macroeconomic indicators. Ignore celebrity news and gossip."
)
```

## Best Practices

### 1. Use Alpha Vantage for Better News
- $50/month is worth it for serious trading
- Real-time news with sentiment scores
- Better than free OpenAI fallback

### 2. Combine with Other Analysts
```python
selected_analysts=["market", "fundamentals", "news", "social"]
```

### 3. Check News Report Quality
```python
if len(final_state["news_report"]) < 500:
    print("Warning: Short news report, may need better data source")
```

### 4. Monitor for Breaking News
- News Analyst captures last 7 days
- For real-time alerts, consider webhooks
- Social Analyst better for immediate reactions

## Troubleshooting

### Issue: Generic news report

**Cause**: Using OpenAI fallback without Alpha Vantage  
**Solution**: Add Alpha Vantage API key

### Issue: No company-specific news

**Cause**: Small cap stock with limited coverage  
**Solution**: Focus on sector/industry news instead

### Issue: Slow performance

**Cause**: Multiple API calls  
**Solution**: Enable caching, reduce look_back_days

## Summary

✅ **You have a fully functional News Analyst**  
✅ **Currently using OpenAI (free fallback)**  
✅ **Upgrade to Alpha Vantage for $50/month for better news**  
✅ **Works great with Social Analyst for complete picture**  
✅ **Generates comprehensive reports with key insights**

Your News Analyst is ready to use right now! For best results, add an Alpha Vantage API key.
