# Discord System - Setup and Testing Guide

Complete guide to set up, run, and test your enhanced Discord integration.

## 📋 Prerequisites

### 1. Install Dependencies
```bash
pip install discord.py flask flask-cors
```

### 2. Create Discord Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Go to "Bot" section
4. Click "Add Bot"
5. Enable these **Privileged Gateway Intents**:
   - ✅ MESSAGE CONTENT INTENT
   - ✅ SERVER MEMBERS INTENT
6. Copy the bot token
7. Go to "OAuth2" → "URL Generator"
8. Select scopes: `bot`
9. Select permissions: `Send Messages`, `Read Messages/View Channels`, `Read Message History`
10. Copy the generated URL and invite bot to your server

## ⚙️ Configuration

### Option 1: Environment Variables (Quick Start)

```bash
# Windows (PowerShell)
$env:DISCORD_BOT_TOKEN="your_bot_token_here"
$env:DATABASE_PATH="./data/coach_plans.db"
$env:API_PORT="5000"
$env:LOG_LEVEL="INFO"

# Linux/Mac
export DISCORD_BOT_TOKEN="your_bot_token_here"
export DATABASE_PATH="./data/coach_plans.db"
export API_PORT="5000"
export LOG_LEVEL="INFO"
```

### Option 2: Configuration File (Recommended)

Create `config.yaml`:
```yaml
discord:
  bot_token: "your_bot_token_here"

database:
  path: ./data/coach_plans.db

api:
  port: 5000
  host: 0.0.0.0

logging:
  level: INFO
  file: ./logs/discord_bot.log
```

## 🚀 Running the System

### Start the Server

```bash
# With environment variables
python examples/discord_bot_server_enhanced.py

# With config file
python examples/discord_bot_server_enhanced.py --config config.yaml

# Mock mode (no Discord required - for testing)
python examples/discord_bot_server_enhanced.py --mock
```

You should see:
```
============================================================
Enhanced Discord Bot Server Starting
============================================================
Database: ./data/coach_plans.db
API: http://0.0.0.0:5000
Mock Mode: False
============================================================
Startup validation passed
Starting Flask API on 0.0.0.0:5000
Starting Discord bot...
YourBot#1234 has connected to Discord!
Bot is in 1 guild(s)
```

## 🧪 Testing the System

### Test 1: Health Check (API)

Open a new terminal:
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00",
  "components": {
    "database": {
      "status": "up",
      "plan_count": 0
    },
    "discord_bot": {
      "status": "connected"
    }
  }
}
```

### Test 2: Post a Plan (Discord)

In your Discord server, type:
```
!plan d Watch for breakout above $950
```

Expected response from bot:
```
✅ Plan recorded for **Coach D (Day Trading)** on 2024-01-15
Preview: Watch for breakout above $950
```

### Test 3: Post Plan with Chart (Discord)

1. Type: `!plan i Looking for pullback to support`
2. Attach an image (chart screenshot)
3. Send

Expected response:
```
✅ Plan recorded for **Coach I (Intraday)** on 2024-01-15 with 1 chart(s)
Preview: Looking for pullback to support
```

### Test 4: List Plans (Discord)

```
!plans
```

Expected response:
```
📋 **Coach Plans for 2024-01-15**

**Coach D (Day Trading)** (by YourUsername):
Watch for breakout above $950

**Coach I (Intraday)** (by YourUsername):
Looking for pullback to support
📊 1 chart(s) attached
```

### Test 5: Edit a Plan (Discord)

```
!edit d Updated: Watch for breakout above $975
```

Expected response:
```
✅ Plan updated for coach_d on 2024-01-15
```

### Test 6: View Your Plans (Discord)

```
!myplans
```

Shows only your plans.

### Test 7: View History (Discord)

```
!history d
```

Shows edit history for coach d's plan.

### Test 8: Fetch via API

```bash
# Get specific coach plan
curl "http://localhost:5000/api/coach-plans/?coach=d"

# Get all plans for today
curl "http://localhost:5000/api/coach-plans/all"

# Get plan for specific date
curl "http://localhost:5000/api/coach-plans/?coach=d&date=2024-01-15"
```

### Test 9: Use Enhanced Client (Python)

Create `test_client.py`:
```python
from tradingagents.integrations.discord_enhanced import create_client

# Create client
client = create_client("http://localhost:5000")

# Check health
health = client.check_health()
print(f"Status: {health['status']}")

# Fetch plan
plan = client.fetch_coach_plan('d')
print(f"Plan: {plan['plan']}")
print(f"Charts: {plan.get('charts', [])}")

# Get metrics
metrics = client.get_metrics()
print(f"Cache hit rate: {metrics['requests']['cache_hit_rate_percent']}%")
```

Run it:
```bash
python test_client.py
```

### Test 10: Metrics Endpoint

```bash
curl http://localhost:5000/metrics
```

Expected response:
```json
{
  "timestamp": "2024-01-15T10:30:00",
  "uptime_seconds": 300,
  "requests": {
    "total": 10,
    "success": 10,
    "error": 0,
    "error_rate_percent": 0.0
  },
  "database": {
    "total_plans": 2,
    "total_charts": 1,
    "total_edits": 1
  }
}
```

## 🔍 Troubleshooting

### Bot Not Connecting

**Problem:** Bot doesn't connect to Discord

**Solutions:**
1. Check `DISCORD_BOT_TOKEN` is set correctly
2. Verify bot has MESSAGE CONTENT INTENT enabled
3. Check bot is invited to your server
4. Review logs: `./logs/discord_bot.log`

### Database Errors

**Problem:** Database errors or permission issues

**Solutions:**
1. Ensure `./data/` directory exists and is writable
2. Check disk space
3. Delete database and restart: `rm ./data/coach_plans.db`

### API Not Responding

**Problem:** Can't reach API endpoints

**Solutions:**
1. Check port 5000 is not in use: `netstat -an | findstr 5000` (Windows)
2. Try different port: `$env:API_PORT="5001"`
3. Check firewall settings
4. Verify Flask started: look for "Starting Flask API" in logs

### Commands Not Working

**Problem:** Discord commands don't respond

**Solutions:**
1. Ensure bot has "Send Messages" permission
2. Check MESSAGE CONTENT INTENT is enabled
3. Verify bot is online in Discord
4. Check logs for errors

### Authorization Errors

**Problem:** Can't edit/delete plans

**Solution:** Only the original author can edit/delete their plans. This is by design for security.

## 📊 Monitoring

### Check Logs

```bash
# View logs
cat ./logs/discord_bot.log

# Follow logs in real-time (Linux/Mac)
tail -f ./logs/discord_bot.log

# Follow logs (Windows PowerShell)
Get-Content ./logs/discord_bot.log -Wait
```

### Database Inspection

```bash
# Install sqlite3 if needed
# Windows: Download from https://www.sqlite.org/download.html

# Open database
sqlite3 ./data/coach_plans.db

# View tables
.tables

# View plans
SELECT * FROM coach_plans;

# View charts
SELECT * FROM plan_charts;

# View history
SELECT * FROM plan_history;

# Exit
.quit
```

## ✅ Success Checklist

- [ ] Discord bot connects successfully
- [ ] Can post plans via `!plan` command
- [ ] Plans appear in database
- [ ] API health check returns "healthy"
- [ ] Can fetch plans via API
- [ ] Enhanced client works
- [ ] Can edit plans (as original author)
- [ ] Can view plan history
- [ ] Metrics endpoint shows data
- [ ] Logs are being written

## 🎯 Next Steps

Once all tests pass:

1. **Integration with TradingAgents**
   - Update coach agents to use `EnhancedWebhookClient`
   - Test end-to-end flow

2. **Build Web Dashboard**
   - Create React/Vue frontend
   - Use the REST API we built
   - Display plans, charts, metrics

3. **Production Deployment**
   - Set up systemd service (Linux)
   - Configure reverse proxy (nginx)
   - Set up SSL certificates
   - Configure backups

4. **Add Twitter Integration**
   - Create separate spec
   - Extend current system
   - Reuse database and API

## 📝 Quick Reference

### Discord Commands
```
!plan <coach> <text>           - Post a plan
!edit <coach> [date] <text>    - Edit your plan
!delete <coach> [date]         - Delete your plan
!plans [date]                  - List all plans
!myplans [date]                - List your plans
!history <coach> [date]        - View edit history
```

### API Endpoints
```
GET /                          - API info
GET /health                    - Health check
GET /metrics                   - Metrics
GET /api/coach-plans/          - Get plan (params: coach, date)
GET /api/coach-plans/all       - Get all plans (param: date)
GET /api/coach-plans/history   - Get history (params: coach, date)
```

### Coach Names
- `d` - Coach D (Day Trading)
- `i` - Coach I (Intraday)
- `s` - Coach S (Swing)
- `n` - Coach N (News/Events)

## 🆘 Getting Help

If you encounter issues:

1. Check logs: `./logs/discord_bot.log`
2. Verify configuration
3. Test each component individually
4. Review error messages carefully
5. Check Discord bot permissions

## 🎉 You're Ready!

Your Discord integration is now fully functional and ready for production use!
