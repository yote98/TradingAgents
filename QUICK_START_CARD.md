# 🚀 TradingAgents MCP - Quick Start Card

## For C1 Playground

### 1. Start Server
```bash
python mcp_http_server.py
```

### 2. Add to C1
- **URL:** `http://localhost:8000/mcp/stream`
- **Transport:** Streamable HTTP
- **Name:** TradingAgents

### 3. Try It
```
"Analyze AAPL stock using TradingAgents"
```

---

## For Kiro IDE

### 1. Already Configured ✅
Config at: `~/.kiro/settings/mcp.json`

### 2. Restart Kiro
Or reconnect MCP servers from MCP Server view

### 3. Use Tools
Ask Kiro to use MCP tools or access them directly

---

## Quick Tests

### Test HTTP Server:
```bash
curl http://localhost:8000/health
```

### Test Tools:
```bash
curl http://localhost:8000/mcp/tools
```

---

## 4 Main Tools

1. **analyze_stock** - Full analysis
2. **backtest_strategy** - Run backtests  
3. **calculate_risk** - Risk metrics
4. **get_sentiment** - News sentiment

---

## Troubleshooting

**Server won't start?**
- Check port 8000 is free
- Install: `pip install flask flask-cors`

**C1 can't connect?**
- Server running? Check health endpoint
- Correct URL? `http://localhost:8000/mcp/stream`
- Transport type? "Streamable HTTP"

**Kiro can't find tools?**
- Restart Kiro completely
- Check MCP Server view
- Verify mcp.json config

---

## Files to Know

- `mcp_http_server.py` - HTTP server for C1
- `MCP_C1_READY.md` - Full C1 setup guide
- `SETUP_COMPLETE_SUMMARY.md` - Complete overview
- `~/.kiro/settings/mcp.json` - Kiro config

---

**That's it! You're ready to go! 🎉**
