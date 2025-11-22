# Where the 5 Analysts Get Their Price Data

## Data Flow Diagram

```
User Query → /api/chat → Auto-detect tickers → Fetch data → Inject into AI
                                    ↓
                            /api/analyze (for full analysis)
                            /api/quote (for simple prices)
                                    ↓
                            analyzeStock() orchestrator
                                    ↓
                    ┌───────────────┴───────────────┐
                    ↓                               ↓
            5 Analysts Run                    Quote Data
                    ↓                               ↓
            All call marketdata-client.getQuote()
                    ↓
            ┌───────┴───────┐
            ↓               ↓
    1. Yahoo Finance    2. Backend API
       (FREE)              (marketdata.app)
```

## The 5 Analysts and Their Data Sources

### 1. **Market Analyst** (`market-agent.ts`)
**Fetches from:** `marketdata-client.getQuote(ticker)`
- **Primary:** Yahoo Finance API (FREE)
- **Fallback:** Backend API → marketdata.app
- **Gets:** Current price, volume, high, low, open, previous close
- **Also fetches:** Historical data for technical indicators (RSI, MACD, SMA)

### 2. **Fundamental Analyst** (`fundamental-agent.ts`)
**Fetches from:** `marketdata-client.getQuote(ticker)` + `getFundamentals(ticker)`
- **Primary:** Yahoo Finance API (FREE)
- **Fallback:** Backend API → marketdata.app
- **Gets:** Current price, market cap, P/E ratio, fundamentals

### 3. **News Analyst** (`news-agent.ts`)
**Fetches from:** 
- `marketdata-client.getNews(ticker)` → marketdata.app
- `getAlphaVantageNews(ticker)` → Alpha Vantage API
- **Price data:** Same as above (Yahoo Finance → Backend)

### 4. **Social Analyst** (if enabled)
**Fetches from:** `social-sentiment-client.ts`
- Reddit API
- StockTwits (via backend)
- **Price data:** Same as above (Yahoo Finance → Backend)

### 5. **Options Analyst** (`options-agent.ts`)
**Fetches from:** `options-client.ts`
- **Primary:** marketdata.app API (options chain data)
- **Fallback:** Alpha Vantage (options data)
- **Gets:** Options contracts, Greeks, put/call ratio, implied volatility, unusual activity
- **Does NOT fetch stock price directly** - uses price from orchestrator

## Current Data Source Priority

### For Stock Quotes (Current Price):

```typescript
// marketdata-client.ts getQuote() method:

1. Yahoo Finance (FREE) ✅
   https://query1.finance.yahoo.com/v8/finance/chart/{ticker}
   
   IF FAILS ↓
   
2. Backend API → marketdata.app (PAID)
   http://localhost:5000/quote/{ticker}
   → https://api.marketdata.app/v1/stocks/quotes/{ticker}
   
   IF FAILS ↓
   
3. Throws Error ❌
```

## The Problem

**Multiple data sources = inconsistent prices:**

1. **Yahoo Finance** - Free but sometimes delayed/inaccurate
2. **marketdata.app** - Paid but you're on free tier (limited calls)
3. **Different APIs return different prices** at the same moment
4. **AI gets confused** when comparing multiple stocks

## Current Status

**All 5 analysts use the SAME data source chain:**
- ✅ Yahoo Finance (primary, FREE)
- ⚠️ marketdata.app (fallback, FREE TIER - 100 calls/day)

**The issue:** Yahoo Finance is free but:
- Sometimes returns stale data
- Can be rate-limited
- Not always accurate for real-time trading

## Solution: One Paid Source

Replace the entire chain with **one reliable paid API:**

### Option 1: Polygon.io ($399/month)
```typescript
// New polygon-client.ts
async getQuote(ticker: string): Promise<Quote> {
  const response = await fetch(
    `https://api.polygon.io/v2/aggs/ticker/${ticker}/prev?apiKey=${this.apiKey}`
  );
  // Returns accurate, real-time data
  // Works for stocks, crypto, options
  // No rate limits
}
```

### Option 2: Alpaca Markets ($99/month)
```typescript
// New alpaca-client.ts
async getQuote(ticker: string): Promise<Quote> {
  const response = await fetch(
    `https://data.alpaca.markets/v2/stocks/${ticker}/quotes/latest`,
    { headers: { 'APCA-API-KEY-ID': this.apiKey } }
  );
  // Real-time data
  // Includes crypto
  // Good for trading integration later
}
```

## Recommendation

**Replace `marketdata-client.ts` with `polygon-client.ts`:**

1. All 5 analysts automatically use Polygon
2. One source = consistent prices
3. Real-time data = accurate analysis
4. No more hallucinations from mixed sources

**Cost:** $399/month but eliminates all data accuracy issues

---

**Current State:** FREE (Yahoo Finance) + FREE TIER (marketdata.app)
**Recommended State:** PAID (Polygon.io $399/month) - one reliable source
