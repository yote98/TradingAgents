# Market Data API Research Prompt

Copy and paste this into ChatGPT, Claude, or Perplexity for comprehensive research:

---

## Research Request: Real-Time Market Data API Comparison

I'm building an AI-powered trading analysis platform (AlphaFlow) that needs reliable, real-time market data. I'm currently experiencing data accuracy issues with free APIs (Yahoo Finance) and need to upgrade to a paid solution.

### My Requirements

**Must Have:**
- Real-time US stock quotes (NASDAQ, NYSE)
- Cryptocurrency support (BTC-USD, ETH-USD, etc.)
- Options chain data with Greeks
- Historical price data (at least 1 year)
- REST API (TypeScript/Node.js integration)
- Reliable uptime (99%+)
- Reasonable rate limits (at least 100 calls/minute)

**Nice to Have:**
- News/sentiment data
- Fundamental data (P/E ratio, market cap, etc.)
- WebSocket support for streaming
- Good documentation
- Active community/support

**Budget:**
- Willing to pay $50-200/month
- Can stretch to $400/month if significantly better value
- Need trial period or money-back guarantee

### Current Situation

I'm currently using:
- Yahoo Finance API (free, unreliable)
- marketdata.app (free tier, 100 calls/day limit)
- Alpha Vantage (free tier, 25 calls/day)

**Problems I'm facing:**
- Inconsistent prices across sources
- Rate limiting on free tiers
- Stale/delayed data
- API downtime

### What I Need From You

Please research and provide:

1. **Top 5-7 paid market data APIs** that meet my requirements
2. **Comparison table** with:
   - Pricing (monthly cost)
   - Real-time vs delayed data
   - Rate limits
   - Coverage (stocks, crypto, options)
   - Trial availability
   - API quality/documentation rating
   - Community reputation
   - Reliability/uptime

3. **Pros and cons** for each provider

4. **Your top 3 recommendations** with reasoning

5. **Red flags** - any providers to avoid and why

6. **Hidden costs** - setup fees, overage charges, etc.

### Specific Providers to Include

Please research these specifically:
- Polygon.io
- Alpaca Markets
- IEX Cloud
- Finnhub
- Twelve Data
- marketdata.app (paid tiers)
- Financial Datasets
- Any other reputable options

### Additional Context

- I'm a solo developer/small team
- Platform will have ~100-1000 users initially
- Each user might trigger 5-10 API calls per analysis
- Need to scale to 10k+ users eventually
- Integration ease matters (I'm using TypeScript/Next.js)

### Output Format

Please provide:
1. Executive summary (2-3 paragraphs)
2. Detailed comparison table
3. Individual provider reviews
4. Final recommendation with reasoning
5. Implementation considerations

**Focus on:** Reliability, accuracy, value for money, and ease of integration.

Thank you!

---

## Alternative Shorter Version (for quick research)

I need a reliable real-time market data API for my trading analysis platform. Requirements: US stocks, crypto, options data, $50-200/month budget. Currently using Yahoo Finance (unreliable). Please compare: Polygon.io, Alpaca, IEX Cloud, Finnhub, Twelve Data, marketdata.app. Need: pricing, rate limits, trial availability, reliability ratings, and your top recommendation. Focus on accuracy and value for money.

---

## For Perplexity (Web Search Optimized)

Compare real-time market data APIs for trading platforms 2024: Polygon.io vs Alpaca Markets vs IEX Cloud vs Finnhub vs Twelve Data. Include pricing, rate limits, reliability reviews, trial availability. Need US stocks + crypto + options data. Budget $50-400/month. Which is best for accuracy and value?

---

## For Reddit Research

Title: "Best real-time market data API for trading platform? (Polygon vs Alpaca vs IEX Cloud)"

Body:
Building an AI trading analysis platform and need reliable real-time data. Currently using Yahoo Finance (inconsistent) and marketdata.app free tier (rate limited).

Requirements:
- US stocks + crypto + options
- Real-time quotes
- Good rate limits
- $50-200/month budget (can stretch to $400)

Considering:
- Polygon.io ($399/month)
- Alpaca Markets ($99/month)
- IEX Cloud ($99/month)
- Finnhub ($59-99/month)
- Twelve Data ($79/month)

Anyone have experience with these? Which is most reliable for production use? Any hidden gotchas?

---

## Usage Instructions

1. **For comprehensive research:** Use the full "Research Request" prompt with ChatGPT o1 or Claude Sonnet
2. **For quick comparison:** Use the "Alternative Shorter Version" with GPT-4 or Claude
3. **For real user experiences:** Post the Reddit version in r/algotrading or r/webdev
4. **For latest info:** Use the Perplexity version (it searches the web)

## Expected Output

You should get:
- Detailed comparison of 5-7 providers
- Pricing breakdown
- Reliability ratings
- Community feedback
- Clear recommendation

Then we can review together and make the decision!
