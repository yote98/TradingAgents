# ETF and Options Support

## Current Status

### ✅ ETF Support
- **Fully Supported**: ETFs work exactly like stocks
- All analysis features work: technical, fundamental, news, sentiment
- Examples: SPY, QQQ, DIA, IWM, ARKK, XLK, etc.
- Just use the ETF ticker symbol like any stock

### 🔧 Options Support (Available via Alpha Vantage MCP)
We have access to Alpha Vantage options data through MCP tools:

**Available Tools:**
- `mcp_alphavantage_REALTIME_OPTIONS` - Real-time options data
- `mcp_alphavantage_HISTORICAL_OPTIONS` - Historical options chain

**Options Data Includes:**
- Strike prices
- Expiration dates
- Call/Put prices
- Open interest
- Volume
- Greeks (if enabled)

## How to Use

### ETF Analysis
```
User: "Analyze SPY"
User: "Compare QQQ to SPY"
User: "What's the sentiment on ARKK?"
```

### Options Analysis (Future Enhancement)
To enable options analysis, we need to:
1. Create an options analysis agent
2. Integrate Alpha Vantage options tools
3. Add options-specific UI components

## Magnificent 7 Knowledge

The AI now knows that "Magnificent 7" or "Mag 7" refers to:
1. AAPL - Apple
2. MSFT - Microsoft
3. GOOGL - Alphabet (Google)
4. AMZN - Amazon
5. NVDA - NVIDIA
6. META - Meta (Facebook)
7. TSLA - Tesla

**Example Queries:**
```
"Analyze the Magnificent 7"
"Compare Mag 7 performance"
"Which of the Magnificent 7 is best to buy?"
```

## Implementation Notes

### ETFs
- No code changes needed - already works
- ETF data comes from same APIs as stocks
- MarketData.app supports ETFs

### Options (To Implement)
Would require:
1. New API route: `/api/options-analysis`
2. Options-specific agent in TradingAgents
3. UI component for options chain display
4. Integration with Alpha Vantage MCP tools

## Testing

### Test ETF Analysis
```bash
# In chat interface
"Analyze SPY"
"Compare QQQ to DIA"
"What's the sentiment on ARKK?"
```

### Test Magnificent 7 Knowledge
```bash
"Analyze the Magnificent 7"
"Compare AAPL to other Mag 7 stocks"
"Which Magnificent 7 stock is best?"
```
