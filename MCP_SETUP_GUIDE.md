# MCP Setup Guide for Kiro IDE

## ✅ What I Just Did

I created the MCP configuration file at:
```
.kiro/settings/mcp.json
```

This configures Alpha Vantage as an MCP server with your API key.

## 🎯 How to Access MCP Settings in Kiro Dashboard

### Method 1: Command Palette (Easiest)

1. **Open Command Palette:**
   - Press `Ctrl+Shift+P` (Windows)
   - Or click the gear icon ⚙️ in the top right

2. **Search for MCP:**
   - Type "MCP" in the search box
   - You'll see options like:
     - "Open Kiro MCP Settings"
     - "MCP: Reconnect Servers"
     - "MCP: View Server Status"

3. **Select "Open Kiro MCP Settings"**
   - This opens the MCP configuration UI

### Method 2: Settings Menu

1. **Click the Settings icon** (⚙️) in the top right corner
2. **Look for "MCP" or "Model Context Protocol"** section
3. **Click to open MCP settings**

### Method 3: File Explorer

1. **Open the file explorer** in Kiro
2. **Navigate to:** `.kiro/settings/mcp.json`
3. **Click to edit** the configuration directly

### Method 4: Kiro Feature Panel

1. **Look for the Kiro panel** on the left sidebar
2. **Find "MCP Servers" section**
3. **Click to view/manage servers**

## 📋 What's Configured

Your MCP configuration includes:

### Alpha Vantage MCP Server
- **Server Name:** `alpha-vantage`
- **Status:** Enabled
- **API Key:** Configured (from your .env)

### Auto-Approved Tools
These tools will work without asking for permission:
- ✅ `get_quote` - Get stock quotes
- ✅ `get_company_overview` - Company information
- ✅ `get_income_statement` - Financial statements
- ✅ `get_balance_sheet` - Balance sheet data
- ✅ `get_cash_flow` - Cash flow statements
- ✅ `get_earnings` - Earnings data
- ✅ `get_news_sentiment` - News and sentiment
- ✅ `search_symbol` - Search for stock symbols

## 🔧 How to Use MCP Tools

### In Kiro Chat

Once MCP is connected, you can ask me to use these tools:

```
"Use MCP to get the latest quote for AAPL"
"Get company overview for NVDA using MCP"
"Fetch income statement for TSLA via MCP"
```

### Check MCP Status

To verify MCP is working:

1. **Open Command Palette** (`Ctrl+Shift+P`)
2. **Type:** "MCP: View Server Status"
3. **Check if** `alpha-vantage` shows as "Connected"

## 🚀 Testing MCP

Let me test if MCP is available:

### Test Command
Ask me: "List available MCP tools"

Or: "Use MCP to get a quote for AAPL"

## 📝 Configuration File Location

Your MCP config is at:
```
C:\Users\CVN B850I GAMING\.kiro\TradingAgents\.kiro\settings\mcp.json
```

## 🔄 Reconnecting MCP

If MCP isn't working:

1. **Open Command Palette** (`Ctrl+Shift+P`)
2. **Type:** "MCP: Reconnect Servers"
3. **Press Enter**
4. **Wait** for connection confirmation

## ⚙️ Modifying MCP Settings

### To Add More Tools to Auto-Approve:

Edit `.kiro/settings/mcp.json` and add to the `autoApprove` array:

```json
"autoApprove": [
  "get_quote",
  "get_company_overview",
  "your_new_tool_name"
]
```

### To Disable MCP:

Change `"disabled": false` to `"disabled": true`

### To Add Another MCP Server:

Add a new entry in `mcpServers`:

```json
{
  "mcpServers": {
    "alpha-vantage": { ... },
    "another-server": {
      "command": "uvx",
      "args": ["another-mcp-server"],
      "disabled": false
    }
  }
}
```

## 🎯 Next Steps

1. **Open Kiro Command Palette** (`Ctrl+Shift+P`)
2. **Search for "MCP"**
3. **Check server status**
4. **Test by asking me to use MCP tools**

## 📚 Available MCP Commands in Kiro

- `MCP: View Server Status` - Check connection
- `MCP: Reconnect Servers` - Restart connections
- `MCP: Open Settings` - Edit configuration
- `MCP: View Logs` - See MCP logs
- `MCP: Disable Server` - Temporarily disable
- `MCP: Enable Server` - Re-enable server

## 🔍 Troubleshooting

### MCP Not Showing Up?

1. **Restart Kiro IDE**
2. **Check if `uvx` is installed:**
   ```powershell
   uvx --version
   ```
3. **If not installed, install `uv`:**
   ```powershell
   pip install uv
   ```

### Server Not Connecting?

1. **Check API key** in mcp.json
2. **Verify internet connection**
3. **Try reconnecting** via Command Palette
4. **Check logs** for errors

### Can't Find MCP Settings?

1. **Update Kiro** to latest version
2. **Check if MCP feature is enabled** in Kiro settings
3. **Look in Settings → Extensions → MCP**

## 💡 Pro Tips

1. **Auto-approve common tools** to avoid constant prompts
2. **Use MCP for real-time data** instead of cached data
3. **Combine MCP with TradingAgents** for enhanced analysis
4. **Monitor API usage** to avoid rate limits

## 🎉 You're All Set!

Your MCP configuration is ready. Now:
1. Open Kiro Command Palette
2. Search for "MCP"
3. Check the server status
4. Start using MCP tools!

Let me know if you need help finding the MCP settings in Kiro!
