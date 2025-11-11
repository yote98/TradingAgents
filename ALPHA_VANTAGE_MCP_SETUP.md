# Alpha Vantage MCP Setup for Kiro IDE

## ✅ What I Just Did

1. ✅ **Cloned** the official Alpha Vantage MCP repository
2. ✅ **Configured** Kiro IDE to use Alpha Vantage MCP
3. ✅ **Auto-approved** common tools for seamless use

## 📁 Files Created

- `.kiro/settings/mcp.json` - MCP configuration for Kiro
- `alpha_vantage_mcp/` - Official Alpha Vantage MCP repository

## 🎯 How to Access MCP in Kiro

### Quick Access:
1. Press **`Ctrl+Shift+P`** (Command Palette)
2. Type **"MCP"**
3. Select **"MCP: View Server Status"**

### Check if Alpha Vantage is Connected:
Look for `alphavantage` server status - it should show as "Connected" or "Running"

## 🚀 Available Tools

Your MCP server now has access to **100+ Alpha Vantage tools**:

### Core Stock Data
- `TIME_SERIES_DAILY` - Daily stock prices
- `TIME_SERIES_INTRADAY` - Intraday data
- `GLOBAL_QUOTE` - Latest price
- `SYMBOL_SEARCH` - Search stocks

### Company Fundamentals
- `COMPANY_OVERVIEW` - Company info
- `INCOME_STATEMENT` - Income statements
- `BALANCE_SHEET` - Balance sheets
- `CASH_FLOW` - Cash flow data
- `EARNINGS` - Earnings data

### Market Intelligence
- `NEWS_SENTIMENT` - News & sentiment
- `TOP_GAINERS_LOSERS` - Market movers
- `INSIDER_TRANSACTIONS` - Insider trading
- `EARNINGS_CALL_TRANSCRIPT` - Earnings calls

### Technical Indicators
- `RSI` - Relative Strength Index
- `MACD` - MACD indicator
- `SMA` - Simple Moving Average
- `EMA` - Exponential Moving Average
- `BBANDS` - Bollinger Bands
- And 40+ more indicators!

### Economic Data
- `REAL_GDP` - GDP data
- `UNEMPLOYMENT` - Unemployment rates
- `CPI` - Inflation data
- `FEDERAL_FUNDS_RATE` - Interest rates

### Options & Forex
- `REALTIME_OPTIONS` - Options data
- `FX_DAILY` - Forex rates
- `DIGITAL_CURRENCY_DAILY` - Crypto data

## 💬 How to Use MCP Tools

### In Kiro Chat, ask me:

```
"Use MCP to get the latest quote for AAPL"

"Get company overview for NVDA using Alpha Vantage MCP"

"Fetch daily stock data for TSLA via MCP"

"Use MCP to get RSI indicator for MSFT"

"Get news sentiment for GOOGL using MCP"

"Show me top gainers and losers via MCP"
```

## 🔧 Configuration Details

Your `.kiro/settings/mcp.json` is configured with:

```json
{
  "mcpServers": {
    "alphavantage": {
      "command": "uvx",
      "args": ["av-mcp", "YOUR_API_KEY"],
      "disabled": false,
      "autoApprove": [...]
    }
  }
}
```

### Auto-Approved Tools
These tools work without asking for permission:
- Stock data tools
- Company fundamentals
- News & sentiment
- Technical indicators
- Insider transactions

## 📊 Testing MCP

### Test 1: Check Connection
Ask me: **"List available MCP tools"**

### Test 2: Get Stock Quote
Ask me: **"Use MCP to get AAPL quote"**

### Test 3: Get Company Data
Ask me: **"Get NVDA company overview via MCP"**

## 🔄 Reconnecting MCP

If MCP isn't working:

1. **Open Command Palette** (`Ctrl+Shift+P`)
2. **Type:** "MCP: Reconnect Servers"
3. **Press Enter**
4. **Wait** for "Connected" status

## 📍 Where to Find MCP Settings

### Method 1: Command Palette
- Press `Ctrl+Shift+P`
- Type "MCP"
- Select "Open Kiro MCP Settings"

### Method 2: File Explorer
- Navigate to `.kiro/settings/mcp.json`
- Click to edit

### Method 3: Settings Menu
- Click ⚙️ (Settings icon)
- Look for "MCP" section

## 🎓 Example Prompts

### Stock Analysis
```
"Use MCP to analyze AAPL:
1. Get latest quote
2. Get company overview
3. Get RSI indicator
4. Get news sentiment"
```

### Market Overview
```
"Use MCP to show me:
1. Top 10 gainers today
2. Top 10 losers today
3. Most active stocks"
```

### Fundamental Analysis
```
"Use MCP to get NVDA fundamentals:
1. Income statement
2. Balance sheet
3. Cash flow
4. Earnings data"
```

### Technical Analysis
```
"Use MCP to calculate for TSLA:
1. RSI (14 days)
2. MACD
3. Bollinger Bands
4. SMA (50 days)"
```

## 💰 Cost & Rate Limits

### Your Alpha Vantage Key
- **Free tier**: 25 requests/day
- **TradingAgents users**: 60 requests/min, no daily limit
- **API Key**: Already configured in MCP

### MCP vs Direct API
- **MCP**: Uses your Alpha Vantage key
- **Cost**: Same as direct API calls
- **Benefit**: Easier to use, integrated with Kiro

## 🔍 Troubleshooting

### MCP Not Showing?
1. Restart Kiro IDE
2. Check Command Palette for MCP commands
3. Verify `.kiro/settings/mcp.json` exists

### Server Not Connecting?
1. Check if `uvx` is installed: `uvx --version`
2. If not, install `uv`: `pip install uv`
3. Reconnect via Command Palette

### Tools Not Working?
1. Verify API key in mcp.json
2. Check Alpha Vantage rate limits
3. Try reconnecting MCP server

## 📚 Full Tool Reference

See the cloned repository for complete documentation:
```
alpha_vantage_mcp/README.md
```

Or visit: https://github.com/alphavantage/alpha_vantage_mcp

## 🎯 Next Steps

1. **Open Command Palette** (`Ctrl+Shift+P`)
2. **Type "MCP"** and check server status
3. **Ask me to use MCP tools** in chat
4. **Explore** the 100+ available tools!

## 💡 Integration with TradingAgents

You can now enhance TradingAgents with MCP:

```python
# In your analysis, you can now ask me to:
# "Use MCP to get additional data for NVDA"
# And I'll fetch it using Alpha Vantage MCP!
```

## 🎉 You're All Set!

Your Kiro IDE now has access to Alpha Vantage MCP with:
- ✅ 100+ financial data tools
- ✅ Real-time stock quotes
- ✅ Company fundamentals
- ✅ Technical indicators
- ✅ News & sentiment
- ✅ Economic data
- ✅ And much more!

**Try it now:** Ask me to "Use MCP to get AAPL quote"!
