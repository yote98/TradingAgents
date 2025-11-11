# Discord Integration - Quick Start Guide

Get your Discord bot server running in 5 minutes!

## 🚀 Super Quick Start

### Option 1: Automated Setup (Easiest)
```bash
python quick_start.py
```

This interactive script will:
- Check dependencies
- Help you configure the bot
- Run diagnostics
- Start the server

### Option 2: Manual Setup (3 Steps)

**Step 1: Install Dependencies**
```bash
pip install discord.py flask flask-cors requests
```

**Step 2: Set Discord Token**
```bash
# Windows PowerShell
$env:DISCORD_BOT_TOKEN="your_bot_token_here"

# Linux/Mac
export DISCORD_BOT_TOKEN="your_bot_token_here"

# OR use mock mode (no Discord needed)
$env:MOCK_MODE="true"
```

**Step 3: Start Server**
```bash
python examples/discord_bot_server_enhanced.py
```

## 🧪 Test the System

### Run Diagnostics
```bash
python test_discord_system.py
```

This will test:
- ✓ Dependencies installed
- ✓ Configuration valid
- ✓ Modules import correctly
- ✓ Database works
- ✓ Service layer works
- ✓ API server responds
- ✓ Webhook client works
- ✓ All files present

### Test Discord Commands

In your Discord server:
```
!plan d Watch for breakout above $950
!plans
!myplans
!edit d Updated plan text
!history d
```

### Test API

```bash
# Health check
curl http://localhost:5000/health

# Get plan
curl "http://localhost:5000/api/coach-plans/?coach=d"

# Get all plans
curl "http://localhost:5000/api/coach-plans/all"

# Get metrics
curl http://localhost:5000/metrics
```

### Test Python Client

```bash
python examples/use_enhanced_client.py
```

## 📁 What You Have

### Core Components
- ✅ **Config** - Environment & YAML configuration
- ✅ **Storage** - SQLite database with persistence
- ✅ **Service** - Business logic & validation
- ✅ **Bot** - Discord bot with 6 commands
- ✅ **API** - REST API with 6 endpoints
- ✅ **Client** - Enhanced webhook client with caching
- ✅ **Logging** - Structured logging with rotation
- ✅ **Server** - Main orchestration script

### Discord Commands
```
!plan <coach> <text>           Post a plan
!edit <coach> [date] <text>    Edit your plan
!delete <coach> [date]         Delete your plan
!plans [date]                  List all plans
!myplans [date]                List your plans
!history <coach> [date]        View edit history
```

### API Endpoints
```
GET /                          API info
GET /health                    Health check
GET /metrics                   Metrics
GET /api/coach-plans/          Get plan
GET /api/coach-plans/all       Get all plans
GET /api/coach-plans/history   Get history
```

### Coach Names
- `d` - Coach D (Day Trading)
- `i` - Coach I (Intraday)
- `s` - Coach S (Swing)
- `n` - Coach N (News/Events)

## 🔧 Configuration

### Environment Variables
```bash
DISCORD_BOT_TOKEN=your_token    # Required (unless mock mode)
DATABASE_PATH=./data/plans.db   # Optional
API_PORT=5000                   # Optional
LOG_LEVEL=INFO                  # Optional
MOCK_MODE=false                 # Optional
```

### Config File (config.yaml)
```yaml
discord:
  bot_token: "your_token"

database:
  path: ./data/coach_plans.db

api:
  port: 5000
  host: 0.0.0.0

logging:
  level: INFO
  file: ./logs/discord_bot.log
```

## 📚 Documentation

- **DISCORD_SETUP_AND_TEST.md** - Complete setup & testing guide
- **DISCORD_ENHANCEMENT_SUMMARY.md** - System overview & usage
- **test_discord_system.py** - Diagnostic script
- **quick_start.py** - Interactive setup script

## 🐛 Troubleshooting

### Bot won't connect
```bash
# Check token is set
echo $env:DISCORD_BOT_TOKEN

# Enable mock mode for testing
$env:MOCK_MODE="true"
```

### Dependencies missing
```bash
pip install discord.py flask flask-cors requests
```

### Port already in use
```bash
# Use different port
$env:API_PORT="5001"
```

### Run diagnostics
```bash
python test_discord_system.py
```

## ✅ Success Checklist

- [ ] Dependencies installed
- [ ] Discord bot token set (or mock mode enabled)
- [ ] Server starts without errors
- [ ] Health check returns "healthy"
- [ ] Can post plans via Discord
- [ ] Can fetch plans via API
- [ ] Webhook client works
- [ ] All diagnostics pass

## 🎯 Next Steps

1. **Test Everything** - Run through all tests
2. **Integrate with TradingAgents** - Use `EnhancedWebhookClient`
3. **Build Website** - Use the REST API
4. **Add Twitter** - Extend the system
5. **Deploy to Production** - Set up systemd/Docker

## 💡 Tips

- Use **mock mode** for development: `$env:MOCK_MODE="true"`
- Check **logs** for errors: `./logs/discord_bot.log`
- Run **diagnostics** if issues: `python test_discord_system.py`
- Read **full guide**: `DISCORD_SETUP_AND_TEST.md`

## 🆘 Need Help?

1. Run diagnostics: `python test_discord_system.py`
2. Check logs: `./logs/discord_bot.log`
3. Review documentation: `DISCORD_SETUP_AND_TEST.md`
4. Verify configuration is correct
5. Test each component individually

## 🎉 You're Ready!

Your Discord integration is production-ready with:
- Persistent storage
- Rich Discord commands
- REST API for TradingAgents
- Health monitoring
- Comprehensive logging
- Error handling
- Caching & metrics

**Start building!** 🚀
