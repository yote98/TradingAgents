# 🧪 Agent Testing Guide

## What We're Testing

Each of the 4 AI analysts to ensure they produce accurate, reasonable analysis:

1. **Market Analyst** - Technical analysis (RSI, MACD, price trends)
2. **Fundamentals Analyst** - Financial metrics (P/E, revenue, earnings)
3. **News Analyst** - News sentiment and recent developments
4. **Social Analyst** - Social media sentiment (Twitter, Reddit)

## Test Criteria

### Market Analyst ✅
- Mentions price/trading data
- Uses technical indicators (RSI, MACD, moving averages)
- Includes numbers and specific levels
- Reasonable length (100-2000 chars)
- No errors

### Fundamentals Analyst ✅
- Mentions financial metrics (revenue, earnings, P/E)
- Discusses company/business/sector
- Includes numbers
- Reasonable length
- No errors

### News Analyst ✅
- Mentions news/articles/headlines
- Discusses sentiment (positive/negative/bullish/bearish)
- Reasonable length
- No errors

### Social Analyst ✅
- Mentions social media (Twitter, Reddit)
- Discusses community sentiment
- Reasonable length
- No errors

## Running the Tests

```bash
python TEST_AGENTS_INDIVIDUALLY.py
```

**Time:** 5-10 minutes total
- Each analyst: 30-60 seconds
- All together: 2-3 minutes

## What Good Output Looks Like

### Market Analyst Example:
```
AAPL is currently trading at $275.25, showing strong momentum with RSI at 65 
(approaching overbought). MACD shows bullish crossover. Key support at $270, 
resistance at $280. 50-day MA trending upward. Volume above average indicating 
strong interest.
```

### Fundamentals Analyst Example:
```
Apple (AAPL) has a P/E ratio of 28.5, slightly above sector average. Revenue 
growth of 8% YoY. Strong balance sheet with $162B cash. Earnings per share of 
$6.42. Market cap $4.2T. Services segment growing 15% annually.
```

### News Analyst Example:
```
Recent news sentiment is positive (72%). Key headlines: iPhone 16 sales exceed 
expectations, new AI features announced, analyst upgrades from 3 firms. No 
major negative news. Overall bullish sentiment from financial media.
```

### Social Analyst Example:
```
Social media sentiment is bullish (68%). Twitter mentions up 25% this week. 
Reddit r/stocks discussing AAPL positively. StockTwits shows 65% bullish 
sentiment. Key topics: AI integration, new products, strong earnings.
```

## What Bad Output Looks Like

❌ **Too Short:** "AAPL looks good"
❌ **No Data:** "I think Apple is a great company"
❌ **Errors:** "Error fetching data" or "Exception occurred"
❌ **Generic:** "Apple makes iPhones and computers"
❌ **No Numbers:** "Price is high, sentiment is positive"

## Validation Checklist

After running tests, verify:

- [ ] All 4 analysts produce reports
- [ ] Reports contain specific data (numbers, metrics)
- [ ] Reports mention relevant topics (technical/fundamental/news/social)
- [ ] No error messages in output
- [ ] Final decision is generated
- [ ] Decision includes BUY/SELL/HOLD recommendation

## If Tests Fail

### Market Analyst Fails:
- Check yfinance data access
- Verify technical indicators are calculated
- Check OpenAI API is working

### Fundamentals Analyst Fails:
- Check fundamental data source
- Verify company data is available
- Check API rate limits

### News Analyst Fails:
- Check news data source
- Verify news API is working
- Check for rate limiting

### Social Analyst Fails:
- Check Twitter/social APIs
- Verify sentiment analysis is working
- May need API keys for full functionality

## Expected Results

✅ **All Pass:** System is ready for deployment
⚠️  **1-2 Fail:** Review failed analysts, may need API keys or config
❌ **3+ Fail:** System needs debugging before deployment

## Next Steps After Testing

1. **All Pass:** Proceed to deployment
2. **Some Fail:** Fix issues, re-run tests
3. **All Fail:** Check environment variables, API keys, network

## Cost Estimate

Each test run costs approximately:
- Market Analyst: ~$0.01
- Fundamentals Analyst: ~$0.01
- News Analyst: ~$0.01
- Social Analyst: ~$0.01
- Full System: ~$0.05

**Total per test run: ~$0.09**

## Monitoring in Production

After deployment, monitor:
- Response times (should be 30-60 seconds)
- Report quality (check for errors)
- Data freshness (timestamps should be recent)
- API costs (track OpenAI usage)
- User feedback (are recommendations reasonable?)

---

**Remember:** These are AI agents providing analysis, not guarantees. Always validate their recommendations with your own research!
