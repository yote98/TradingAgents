# ✅ Fixed! TradingAgents MCP for C1 Playground

## What Was Wrong

The previous server wasn't MCP protocol-compliant. C1 Playground expects JSON-RPC 2.0 over SSE, not a simple REST API.

## ✅ Fixed Server Running

The new protocol-compliant server is now running on port 8000.

## 🔗 Connect to C1 Playground

### Step 1: Add Custom MCP Server

1. Go to https://playground.thesys.ai/
2. Click "Add Custom MCP server"
3. Fill in:

```
Name: TradingAgents

URL: http://localhost:8000

Transport Type: SSE

Bearer Token: (leave empty)

Description: Multi-agent stock analysis with backtesting
```

4. Click "Confirm"

### Step 2: Test It

Try asking C1:

```
"List the available tools from TradingAgents"
```

```
"Analyze AAPL stock using the analyze_stock tool"
```

## 🛠️ Available Tools

1. **analyze_stock** - Full multi-agent analysis
   - ticker (required)
   - max_debate_rounds (optional, default: 1)

2. **backtest_strategy** - Run backtests
   - ticker, start_date, end_date (required)
   - initial_capital (optional, default: 100000)

3. **calculate_risk** - Risk metrics
   - ticker, position_size, entry_price (required)

4. **get_sentiment** - News sentiment
   - ticker (required)

## 📦 Available Resources

- **coach://plans** - Historical coach trading plans

## 🔧 Server Commands

### Start the server:
```bash
python mcp_http_server_v2.py
```

### Stop the server:
Press `Ctrl+C` in the terminal

### Check if running:
```bash
curl http://localhost:8000
```

## 🎯 Key Differences from Before

| Old Server | New Server |
|------------|------------|
| Simple REST API | MCP Protocol (JSON-RPC 2.0) |
| `/mcp/stream` endpoint | Root `/` endpoint |
| "Streamable HTTP" transport | "SSE" transport |
| Custom format | Standard MCP format |

## 💡 Troubleshooting

### "Connection error - server marked as disconnected"
- Make sure you're using `http://localhost:8000` (not `/mcp/stream`)
- Select "SSE" as transport type (not "Streamable HTTP")
- Restart the server if it was running the old version

### Server won't start
```bash
# Kill any process on port 8000
netstat -ano | findstr :8000
taskkill /PID <process_id> /F

# Then start the new server
python mcp_http_server_v2.py
```

### C1 still can't connect
1. Stop the old server completely
2. Start the new server: `python mcp_http_server_v2.py`
3. In C1, remove the old TradingAgents server
4. Add it again with the new settings (URL: `http://localhost:8000`, Transport: `SSE`)

## 🎉 Success Indicators

✅ Server starts with "Protocol-Compliant" message
✅ C1 shows "0 selected tools" (not connection error)
✅ Clicking dropdown shows 4 tools
✅ Tools can be called from C1

## 📝 Files

- **`mcp_http_server_v2.py`** - New protocol-compliant server (USE THIS ONE)
- **`mcp_http_server.py`** - Old server (don't use)
- **`C1_FIXED_SETUP.md`** - This guide

---

**The server is ready! Add it to C1 Playground now with these exact settings:**
- URL: `http://localhost:8000`
- Transport: `SSE`
