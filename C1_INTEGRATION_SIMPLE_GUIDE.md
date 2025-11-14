# 🚀 Simple C1 Integration Guide

## The Problem You're Facing

You want to use **Thesys C1's built-in chat system** instead of building your own, but it's not connecting to your TradingAgents backend.

## Why C1 is Better

✅ **Professional UI** - Already built and polished
✅ **Tool calling** - Automatically detects and uses MCP tools
✅ **Streaming** - Real-time responses
✅ **Memory** - Conversation history
✅ **No coding** - Just configure and use

## The Solution (3 Steps)

### Step 1: Start Your MCP Server

Open a terminal and run:

```bash
python mcp_http_server_v2.py
```

You should see:
```
============================================================
TradingAgents MCP Server (Protocol-Compliant)
============================================================
Server running on: http://localhost:8000

For C1 Playground, use:
  URL: http://localhost:8000
  Transport: SSE
============================================================
```

**Keep this terminal open!** The server needs to stay running.

---

### Step 2: Connect C1 to Your Server

1. Go to **https://playground.thesys.ai/**
2. Click **"Add Custom MCP server"** (usually in settings or tools menu)
3. Fill in these EXACT values:

```
Name: TradingAgents
URL: http://localhost:8000
Transport Type: SSE
Bearer Token: (leave empty)
Description: Multi-agent stock analysis
```

4. Click **"Confirm"** or **"Add"**

---

### Step 3: Test It!

In C1 chat, try these commands:

**Test 1: List tools**
```
What tools do you have available from TradingAgents?
```

**Test 2: Analyze a stock**
```
Use the analyze_stock tool to analyze AAPL
```

**Test 3: Get sentiment**
```
Call the get_sentiment tool for TSLA
```

---

## What You Should See

### ✅ Success Looks Like:

1. C1 shows "TradingAgents" in the tools list
2. When you ask for analysis, C1 calls the `analyze_stock` tool
3. You get real-time data with analyst reports
4. Results include current prices, recommendations, and reasoning

### ❌ Failure Looks Like:

1. "Connection error" in C1
2. C1 doesn't show TradingAgents tools
3. C1 answers from its own knowledge instead of calling tools

---

## Troubleshooting

### Problem: "Connection error - server marked as disconnected"

**Solution:**
1. Make sure MCP server is running (check terminal)
2. Use `http://localhost:8000` (not `/mcp/stream`)
3. Select "SSE" transport (not "Streamable HTTP")
4. Remove and re-add the server in C1

### Problem: C1 doesn't call the tools

**Solution:**
Be explicit in your requests:
- ❌ "Analyze AAPL" (too vague)
- ✅ "Use the analyze_stock tool to analyze AAPL" (explicit)

Or update C1's system prompt to always use tools (see below).

### Problem: Server won't start (port in use)

**Solution:**
```bash
# Find what's using port 8000
netstat -ano | findstr :8000

# Kill it (replace PID with actual number)
taskkill /PID <process_id> /F

# Start server again
python mcp_http_server_v2.py
```

---

## Advanced: Make C1 Always Use Tools

Add this to C1's system prompt (in Prompts tab):

```
CRITICAL: When users ask about stocks, you MUST use the available MCP tools:

- analyze_stock: For comprehensive analysis
- calculate_risk: For risk metrics
- backtest_strategy: For backtesting
- get_sentiment: For sentiment analysis

DO NOT provide analysis from your training data. ALWAYS call the appropriate tool first.

Example:
User: "Analyze AAPL"
You: [Call analyze_stock tool with ticker="AAPL"] then present results
```

---

## Why This is Better Than Your Custom Chat

| Feature | Your Custom Chat | C1 Built-in |
|---------|------------------|-------------|
| UI Quality | Custom built | Professional |
| Tool Calling | Manual setup | Automatic |
| Streaming | Custom code | Built-in |
| Memory | Custom code | Built-in |
| Maintenance | You maintain | Thesys maintains |
| Updates | Manual | Automatic |

---

## Quick Reference

**Start server:**
```bash
python mcp_http_server_v2.py
```

**C1 Connection:**
- URL: `http://localhost:8000`
- Transport: `SSE`

**Test command:**
```
Use the analyze_stock tool to analyze AAPL with all analysts
```

---

## Next Steps

Once this is working:

1. ✅ You can remove your custom chat UI (`SimpleChat.tsx`)
2. ✅ Just use C1 Playground for everything
3. ✅ Focus on improving the TradingAgents backend
4. ✅ Let Thesys handle the frontend

**The goal:** Use C1 as your interface, TradingAgents as your brain.

---

## Still Not Working?

Run the diagnostic:
```bash
python diagnose_c1_connection.py
```

This will tell you exactly what's wrong and how to fix it.
