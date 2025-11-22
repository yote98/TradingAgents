# 🎯 Financial Datasets MCP Integration

## What This Solves

Instead of manually fetching stock data in the chat route, we let the AI **automatically call MCP tools** when it detects stock symbols!

## Setup Steps

### 1. Get Your API Key

1. Go to https://financialdatasets.ai/
2. Sign up for an account
3. Get your API key from the dashboard
4. Add to `.env`:

```bash
FINANCIAL_DATASETS_API_KEY=your_key_here
```

### 2. Update MCP Config

Already done! Check `.kiro/settings/mcp.json`:

```json
{
  "mcpServers": {
    "financialdatasets": {
      "url": "https://mcp.financialdatasets.ai/mcp",
      "headers": {
        "X-API-KEY": "YOUR_API_KEY_HERE"
      },
      "disabled": false,
      "autoApprove": [
        "get_stock_price",
        "get_company_info",
        "get_analyst_estimates"
      ]
    }
  }
}
```

### 3. Update C1 Template to Use MCP Tools

The key is to **pass MCP tools to Thesys AI** so it can call them automatically!

Update `c1-template/src/app/api/chat/route.ts`:

```typescript
// Import MCP client
import { MCPClient } from '@crayonai/mcp-client';

// Initialize MCP client
const mcpClient = new MCPClient({
  servers: {
    financialdatasets: {
      url: 'https://mcp.financialdatasets.ai/mcp',
      headers: {
        'X-API-KEY': process.env.FINANCIAL_DATASETS_API_KEY!
      }
    }
  }
});

// Get available tools
const mcpTools = await mcpClient.listTools();

// Pass tools to Thesys AI
const llmStream = await client.chat.completions.create({
  model: "c1/anthropic/claude-sonnet-4/v-20250930",
  messages: messageStore.getOpenAICompatibleMessageList(),
  tools: mcpTools, // 🎯 AI can now call MCP tools!
  stream: true,
  temperature: 0.1,
  max_tokens: 2048,
});
```

### 4. How It Works

**Before (Manual):**
```
User: "What's NVDA price?"
  ↓
Chat Route detects "NVDA"
  ↓
Manually fetch from /api/analyze
  ↓
Inject data into conversation
  ↓
AI responds with data
```

**After (Automatic with MCP):**
```
User: "What's NVDA price?"
  ↓
AI sees message
  ↓
AI automatically calls get_stock_price("NVDA") via MCP
  ↓
MCP returns real-time data
  ↓
AI responds with fresh data
```

## Available MCP Tools

From Financial Datasets:

1. **get_stock_price** - Real-time stock quotes
2. **get_company_info** - Company fundamentals
3. **get_analyst_estimates** - Analyst ratings & targets
4. **get_earnings** - Earnings data
5. **get_insider_trades** - Insider trading activity
6. **get_institutional_ownership** - Institutional holdings
7. **get_news** - Company news
8. **search_stocks** - Search for tickers

## Benefits

✅ **Automatic** - AI detects when it needs data and fetches it
✅ **Real-time** - Always fresh market data
✅ **No manual parsing** - AI handles tool calls natively
✅ **Multiple sources** - Can combine Alpha Vantage + Financial Datasets
✅ **Scalable** - Works for any number of stocks

## Testing

1. Start the server:
```bash
cd c1-template
npm run dev
```

2. Go to http://localhost:3002

3. Ask: "What's NVDA price?"

4. Watch the console - you should see:
```
🔧 AI calling tool: get_stock_price
📊 Tool result: { symbol: "NVDA", price: 180.45, ... }
✅ AI response with real-time data
```

## Next Steps

1. Get Financial Datasets API key
2. Add to `.env`
3. Update MCP config with your key
4. Implement MCP tool calling in chat route
5. Test with "What's NVDA price?"

## Documentation

- Financial Datasets MCP: https://docs.financialdatasets.ai/mcp-server
- C1 Tool Calling: https://docs.thesys.dev/tool-calling
- MCP Protocol: https://modelcontextprotocol.io/

---

**The key insight**: Let the AI decide when to fetch data, not your code! 🎯
