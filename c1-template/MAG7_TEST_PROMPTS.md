# Magnificent 7 Test Prompts

## Test Cases for Magnificent 7 Knowledge

### Basic Mag 7 Queries
```
"What is the Magnificent 7?"
"Tell me about the Mag 7"
"Analyze the Magnificent 7"
"Which Magnificent 7 stock is best?"
```

**Expected Behavior:**
- AI should recognize these are the 7 big tech stocks
- AI should offer to analyze them in groups of 3
- AI should list: AAPL, MSFT, GOOGL, AMZN, NVDA, META, TSLA

### Specific Mag 7 Analysis
```
"Compare AAPL, MSFT, and GOOGL from the Mag 7"
"Analyze NVDA, META, and TSLA"
"Which is better: AAPL or MSFT?"
```

**Expected Behavior:**
- System auto-fetches real-time data for specified tickers
- AI provides comparison with StockCard components
- Shows bull/bear analysis for each

### ETF Queries
```
"Analyze SPY"
"Compare QQQ to SPY"
"What's the sentiment on ARKK?"
"Should I buy DIA or IWM?"
```

**Expected Behavior:**
- Works exactly like stock analysis
- AI mentions it's an ETF
- Shows same analysis depth as stocks

### Options Queries (Future)
```
"Show me AAPL options"
"What are the call options for TSLA?"
"Analyze SPY options chain"
```

**Current Behavior:**
- AI should explain options data is available via Alpha Vantage
- May suggest using specific tickers for stock analysis instead
- Future: Will show options chain with strikes, expiry, Greeks

## What the AI Now Knows

### Magnificent 7 Members
1. **AAPL** - Apple Inc. (iPhone, Mac, Services)
2. **MSFT** - Microsoft Corporation (Windows, Azure, Office)
3. **GOOGL** - Alphabet Inc. (Google Search, YouTube, Cloud)
4. **AMZN** - Amazon.com Inc. (E-commerce, AWS, Prime)
5. **NVDA** - NVIDIA Corporation (GPUs, AI chips, Gaming)
6. **META** - Meta Platforms Inc. (Facebook, Instagram, WhatsApp)
7. **TSLA** - Tesla Inc. (Electric vehicles, Energy, AI)

### Common ETFs
- **SPY** - S&P 500 (most liquid)
- **QQQ** - Nasdaq-100 (tech-heavy)
- **DIA** - Dow Jones Industrial Average
- **IWM** - Russell 2000 (small caps)
- **ARKK** - ARK Innovation (growth/tech)
- **XLK** - Technology sector

### Sector ETFs
- **XLF** - Financials
- **XLE** - Energy
- **XLV** - Healthcare
- **XLI** - Industrials

## Testing Checklist

- [ ] AI recognizes "Magnificent 7" or "Mag 7"
- [ ] AI offers to analyze in groups of 3
- [ ] AI correctly lists all 7 stocks
- [ ] ETF analysis works (SPY, QQQ, etc.)
- [ ] AI mentions when analyzing an ETF
- [ ] Comparison of 2-3 stocks works
- [ ] Real-time prices are accurate
- [ ] StockCard components render properly

## Known Limitations

1. **Max 3 stocks at once** - To prevent timeouts
2. **No options UI yet** - Data available via MCP, needs UI
3. **ETF-specific metrics** - Currently treats ETFs like stocks (could add expense ratio, holdings, etc.)
