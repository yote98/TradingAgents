# 5 Analyst Testing Guide

Test each analyst individually in the chat interface at http://localhost:3000/chat

---

## 1️⃣ Market Analyst (Technical Analysis)

**What it does:** Analyzes price action, trends, technical indicators (RSI, MACD, moving averages)

**Test Prompts:**
```
What's the technical setup for NVDA?
```
```
Is TSLA showing bullish or bearish momentum?
```
```
Give me the technical analysis for AAPL
```

**What to look for:**
- ✅ RSI value (0-100)
- ✅ MACD signal (bullish/bearish)
- ✅ Trend direction (uptrend/downtrend/sideways)
- ✅ Support/resistance levels
- ✅ Signal: bullish/bearish/neutral
- ✅ Confidence score

---

## 2️⃣ Fundamental Analyst (Valuation)

**What it does:** Analyzes P/E ratio, revenue, earnings, growth metrics, valuation

**Test Prompts:**
```
Is NVDA overvalued or undervalued?
```
```
What are the fundamentals for AAPL?
```
```
Analyze TSLA's valuation metrics
```

**What to look for:**
- ✅ P/E ratio
- ✅ Market cap
- ✅ Revenue growth
- ✅ Profit margins
- ✅ Valuation signal: undervalued/fair/overvalued
- ✅ Key strengths and concerns

---

## 3️⃣ News Analyst (Sentiment)

**What it does:** Analyzes recent news articles, headlines, overall sentiment

**Test Prompts:**
```
What's the news sentiment for NVDA?
```
```
Any recent news about TSLA?
```
```
What are people saying about AAPL in the news?
```

**What to look for:**
- ✅ Sentiment: positive/negative/neutral
- ✅ Recent headlines (last 24-48 hours)
- ✅ Key topics/themes
- ✅ Impact on stock
- ✅ Confidence score

---

## 4️⃣ Social Analyst (Reddit/Twitter) 🆕

**What it does:** Analyzes social media sentiment from Reddit and Twitter

**Test Prompts:**
```
What's the social sentiment for NVDA?
```
```
What are retail investors saying about TSLA?
```
```
Check Reddit and Twitter buzz for AAPL
```

**What to look for:**
- ✅ Overall sentiment score (-100 to +100)
- ✅ Reddit sentiment
- ✅ Twitter sentiment
- ✅ Mention volume
- ✅ Trending topics
- ✅ Signal: bullish/bearish/neutral

---

## 5️⃣ Options Analyst (Derivatives Flow)

**What it does:** Analyzes options activity, put/call ratio, implied volatility

**Test Prompts:**
```
What's the options flow for NVDA?
```
```
Analyze AAPL options activity
```
```
Is there unusual options activity in TSLA?
```

**What to look for:**
- ✅ Put/Call ratio
- ✅ Implied Volatility (IV)
- ✅ Unusual activity
- ✅ Bullish/bearish positioning
- ✅ Key strike prices
- ✅ Expiration dates

---

## 🎯 Full System Test

**Test all 5 analysts together:**

```
Analyze NVDA
```
```
Should I buy TSLA?
```
```
Give me a complete analysis of AAPL
```

**What to look for:**
- ✅ All 5 analysts appear
- ✅ Each shows their analysis
- ✅ Bull vs Bear debate section
- ✅ Final recommendation
- ✅ Risk assessment
- ✅ Real-time price displayed

---

## 📊 Test Different Asset Types

### Stocks
```
Analyze NVDA
Analyze AAPL
Analyze TSLA
```

### ETFs
```
What do you think about SPY?
Analyze QQQ
```

### Crypto
```
Analyze BTC
What's your take on ETH?
```

---

## ✅ Success Criteria

Each analyst should:
1. **Respond within 5-10 seconds**
2. **Show confidence score** (0-100%)
3. **Give clear signal** (bullish/bearish/neutral)
4. **Provide specific data** (not generic responses)
5. **Display in clean format** (not error messages)

---

## 🐛 Common Issues to Watch For

❌ **"Data unavailable"** - API key issue
❌ **"Error fetching"** - Backend connection issue
❌ **Generic responses** - Agent not using real data
❌ **Missing analyst** - Integration issue
❌ **Slow response (>30s)** - API timeout

---

## 🎬 Testing Order

1. **Start simple:** Test Market Analyst first (fastest)
2. **Add complexity:** Test Fundamental Analyst (needs more data)
3. **Test new feature:** Social Analyst (just added)
4. **Test premium:** Options Analyst (may be limited)
5. **Full system:** All 5 together

---

## 💡 Pro Tips

- **Use popular stocks** (AAPL, NVDA, TSLA) - more data available
- **Test during market hours** - more accurate data
- **Try different phrasings** - test natural language understanding
- **Check price accuracy** - compare with Yahoo Finance
- **Look for consistency** - analysts should agree on major points

---

## 📝 Report Template

After testing, note:

```
Analyst: [Name]
Stock: [Ticker]
Prompt: [What you asked]
Response Time: [Seconds]
Data Quality: ✅/⚠️/❌
Signal: [bullish/bearish/neutral]
Confidence: [0-100%]
Issues: [Any problems]
```

---

## 🚀 Ready to Test!

1. Make sure frontend is running: `npm run dev` in c1-template
2. Open http://localhost:3000/chat
3. Start with: **"Analyze NVDA"**
4. Watch all 5 analysts work together!

Good luck! 🎉
