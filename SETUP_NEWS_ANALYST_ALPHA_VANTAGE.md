# Setup News Analyst with Alpha Vantage

**Cost**: $50/month (Premium plan)  
**Benefit**: Professional-grade news with sentiment analysis  
**Current**: Using OpenAI fallback (free but limited)

## Step 1: Get Alpha Vantage API Key

1. Go to: https://www.alphavantage.co/support/#api-key
2. Enter your email
3. Click "GET FREE API KEY"
4. You'll receive a key instantly (looks like: `ABC123XYZ456`)

**Note**: Free tier gives you 25 requests/day. For serious trading, upgrade to Premium ($50/month) for unlimited requests.

## Step 2: Add API Key to Your System

### Option A: Using .env file (Recommended)

1. Open or create `.env` file in your project root
2. Add this line:
```bash
ALPHA_VANTAGE_API_KEY=your_actual_key_here
```

3. Save the file

### Option B: Using Windows Environment Variable

```powershell
# Run in PowerShell (as Administrator)
[System.Environment]::SetEnvironmentVariable('ALPHA_VANTAGE_API_KEY', 'your_actual_key_here', 'User')
```

## Step 3: Verify It's Working

The system will automatically use Alpha Vantage once the key is set. No code changes needed!

Test it:
```python
from tradingagents.graph.trading_graph import TradingAgentsGraph

# Run with news analyst
graph = TradingAgentsGraph(selected_analysts=["news"])
final_state, _, _ = graph.propagate("AAPL", "2025-11-12")

# Check the report
print(final_state["news_report"])
```

## What You Get with Alpha Vantage

### News Feed API
- Real-time news articles
- 1000+ sources (Bloomberg, Reuters, WSJ, etc.)
- Sentiment scores (-1.0 to 1.0)
- Relevance scores
- Company-specific filtering
- Topic categorization

### Example News Data:
```json
{
  "title": "Apple Reports Record Q4 Earnings",
  "source": "Bloomberg",
  "sentiment": 0.85,
  "relevance": 0.95,
  "topics": ["earnings", "technology"],
  "tickers": ["AAPL"],
  "time_published": "2025-11-12T14:30:00"
}
```

## Current vs Upgraded

| Feature | Current (OpenAI) | With Alpha Vantage |
|---------|------------------|-------------------|
| **Cost** | Free | $50/month |
| **Sources** | General web | 1000+ premium |
| **Real-time** | No | Yes |
| **Sentiment** | Manual analysis | Built-in scores |
| **Company Filter** | Limited | Excellent |
| **Rate Limit** | Pay per use | Unlimited |
| **Quality** | Good | Excellent |

## Alternative: Keep Using OpenAI (Free)

Your current setup works fine! OpenAI provides:
- ✅ General news coverage
- ✅ Good analysis quality
- ✅ No monthly fees
- ❌ Not real-time
- ❌ No sentiment scores
- ❌ Limited company filtering

**Recommendation**: 
- **For testing/learning**: Keep using OpenAI (free)
- **For serious trading**: Upgrade to Alpha Vantage ($50/month)

## Pricing Comparison

### Alpha Vantage Plans:
- **Free**: 25 requests/day (good for testing)
- **Premium**: $50/month - Unlimited requests
- **Enterprise**: Custom pricing

### Other News APIs:
- **NewsAPI**: $0-449/month
- **Finnhub**: $0-99/month  
- **EODHD**: $20-80/month

**Alpha Vantage is the best value** for stock market news!

## Troubleshooting

### Issue: "ALPHA_VANTAGE_API_KEY not set"
**Solution**: Check your .env file or environment variable

### Issue: "Rate limit exceeded"
**Solution**: Upgrade from free to Premium plan ($50/month)

### Issue: News still using OpenAI
**Solution**: Restart your Python process after setting the API key

## Summary

✅ **Added**: FinancialJuice and TreeCapital to Twitter accounts  
✅ **Total**: 85 premium Twitter accounts monitored  
✅ **News**: Currently using OpenAI (free)  
📈 **Upgrade**: Add Alpha Vantage key for professional news ($50/month)  

Your system is ready to use as-is, or upgrade for even better news coverage!
