# TradingAgents MCP for C1 Playground

## Quick Setup Guide

### Step 1: Start the HTTP Server

Run the MCP HTTP server:

```bash
python mcp_http_server.py
```

You should see:
```
============================================================
TradingAgents MCP HTTP Server
============================================================
Server running on: http://localhost:8000
Health check: http://localhost:8000/health
List tools: http://localhost:8000/mcp/tools

For C1 Playground, use:
  URL: http://localhost:8000/mcp/stream
  Transport: Streamable HTTP
============================================================
```

### Step 2: Add to C1 Playground

1. Open C1 Playground (https://playground.thesys.ai/)
2. Click "Add Custom MCP server"
3. Fill in the form:

**Name:** `TradingAgents`

**URL:** `http://localhost:8000/mcp/stream`

**Transport Type:** Select `Streamable HTTP`

**Bearer Token:** Leave empty (optional)

**Description:** 
```
Multi-agent stock analysis system with backtesting, risk management, and sentiment analysis
```

4. Click "Confirm"

### Step 3: Test the Connection

In C1 Playground, try asking:

```
"Analyze AAPL stock using the TradingAgents MCP"
```

or

```
"Use the analyze_stock tool to analyze Tesla"
```

## Available Tools

### 1. analyze_stock
Run comprehensive multi-agent stock analysis
- **ticker**: Stock symbol (e.g., AAPL, TSLA)
- **max_debate_rounds**: Number of debate rounds (default: 1)

### 2. backtest_strategy
Run backtesting on a trading strategy
- **ticker**: Stock symbol
- **start_date**: Start date (YYYY-MM-DD)
- **end_date**: End date (YYYY-MM-DD)
- **initial_capital**: Starting capital (default: 100000)

### 3. calculate_risk
Calculate risk metrics for a position
- **ticker**: Stock symbol
- **position_size**: Number of shares
- **entry_price**: Entry price per share

### 4. get_sentiment
Get sentiment analysis from news and social media
- **ticker**: Stock symbol

## Available Resources

### coach://plans
Access historical coach trading plans from Discord

## Troubleshooting

### Server won't start
- Make sure port 8000 is not in use
- Check that Flask is installed: `python -m pip install flask flask-cors`

### C1 Playground can't connect
- Verify the server is running: Visit http://localhost:8000/health
- Make sure you're using `http://localhost:8000/mcp/stream` as the URL
- Select "Streamable HTTP" as transport type

### Tools not working
- Check server logs for errors
- Verify your .env file has required API keys (OPENAI_API_KEY, etc.)
- Test tools directly: `curl http://localhost:8000/mcp/tools`

## Testing the Server

### Check health
```bash
curl http://localhost:8000/health
```

### List available tools
```bash
curl http://localhost:8000/mcp/tools
```

### Test a tool directly
```bash
curl -X POST http://localhost:8000/mcp/call \
  -H "Content-Type: application/json" \
  -d '{"tool": "get_sentiment", "arguments": {"ticker": "AAPL"}}'
```

## Notes

- The server must be running for C1 Playground to access it
- Keep the terminal window open while using C1 Playground
- The server runs on localhost only (not accessible from internet)
- For production use, consider adding authentication and HTTPS

## Next Steps

Once connected, you can:
1. Ask C1 to analyze stocks using your TradingAgents system
2. Run backtests through natural language
3. Get risk calculations and sentiment analysis
4. Access coach plans from your Discord integration

Enjoy using TradingAgents with C1 Playground! 🚀
