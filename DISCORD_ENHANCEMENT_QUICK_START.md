# Discord Webhook Enhancement - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Option 1: Mock Mode (No Discord Required)

Perfect for testing and development!

```python
# 1. Set mock mode
import os
os.environ['MOCK_MODE'] = 'true'

# 2. Import components
from tradingagents.integrations.discord_enhanced.config import ConfigManager
from tradingagents.integrations.discord_enhanced.storage import StorageManager
from tradingagents.integrations.discord_enhanced.service import PlanService
from tradingagents.integrations.discord_enhanced.mock import populate_mock_data

# 3. Initialize
config = ConfigManager()
storage = StorageManager('./data/test.db')
service = PlanService(storage)

# 4. Populate with mock data
summary = populate_mock_data(service)
print(f"✅ {summary['successful']} plans posted!")

# 5. Fetch plans
plans = service.get_all_plans_for_api()
for coach, plan in plans.items():
    print(f"\n{coach}:")
    print(f"  {plan['plan'][:100]}...")
```

### Option 2: Production Mode (With Discord)

```python
# 1. Set environment variables
import os
os.environ['DISCORD_BOT_TOKEN'] = 'your_token_here'
os.environ['DATABASE_PATH'] = './data/coach_plans.db'
os.environ['API_PORT'] = '5000'

# 2. Run the enhanced server
# python examples/discord_bot_server_enhanced.py
```

## 📋 Common Tasks

### Fetch a Coach Plan

```python
from tradingagents.integrations.discord_enhanced.client import EnhancedWebhookClient

client = EnhancedWebhookClient('http://localhost:5000')
plan = client.fetch_coach_plan('d', '2024-11-09')

print(f"Plan: {plan['plan']}")
print(f"Charts: {plan['charts']}")
```

### Check System Health

```bash
curl http://localhost:5000/health
```

Or in Python:
```python
client = EnhancedWebhookClient('http://localhost:5000')
health = client.check_health()
print(f"Status: {health['status']}")
```

### View Metrics

```bash
curl http://localhost:5000/metrics
```

### Clear Cache

```python
client = EnhancedWebhookClient('http://localhost:5000')
cleared = client.clear_cache()
print(f"Cleared {cleared} cached plans")
```

## 🧪 Running Tests

```bash
# Test individual components
python test_storage_implementation.py
python test_service_layer.py
python test_flask_api.py
python test_webhook_client.py
python test_mock_mode.py
python test_logging_system.py

# All tests should pass!
```

## 📊 Monitoring

### Check Logs

```bash
# View logs
tail -f ./logs/discord_bot.log

# View with JSON formatting
tail -f ./logs/discord_bot.log | jq
```

### Monitor Metrics

```python
client = EnhancedWebhookClient('http://localhost:5000')

# Client metrics
metrics = client.get_metrics()
print(f"Cache hit rate: {metrics['requests']['cache_hit_rate_percent']}%")

# Server metrics
server_metrics = client.get_server_metrics()
print(f"Uptime: {server_metrics['uptime_seconds']}s")
print(f"Total plans: {server_metrics['database']['total_plans']}")
```

## 🔧 Configuration

### Environment Variables

```bash
# Required (unless mock mode)
DISCORD_BOT_TOKEN=your_token_here

# Optional
DATABASE_PATH=./data/coach_plans.db
API_PORT=5000
API_HOST=0.0.0.0
LOG_LEVEL=INFO
LOG_FILE=./logs/discord_bot.log
CACHE_TTL_SECONDS=3600
MAX_CACHE_SIZE=100
MOCK_MODE=false
```

### Configuration File (Optional)

Create `config.yaml`:

```yaml
discord:
  bot_token: ${DISCORD_BOT_TOKEN}

database:
  path: ./data/coach_plans.db

api:
  port: 5000
  host: 0.0.0.0

logging:
  level: INFO
  file: ./logs/discord_bot.log
  max_size_mb: 10
  backup_count: 5

cache:
  ttl_seconds: 3600
  max_size: 100

mock:
  enabled: false
```

## 🎯 Use Cases

### 1. Development & Testing

```python
# Use mock mode - no Discord needed!
os.environ['MOCK_MODE'] = 'true'
# ... initialize and test
```

### 2. Integration with TradingAgents

```python
from tradingagents.integrations.discord_enhanced.client import EnhancedWebhookClient

# In your coach agent
client = EnhancedWebhookClient('http://localhost:5000')
plan = client.fetch_coach_plan('d')  # Fetches today's plan

# Use the plan in your analysis
print(f"Coach D says: {plan['plan']}")
```

### 3. Batch Processing

```python
from datetime import datetime, timedelta

client = EnhancedWebhookClient('http://localhost:5000')

# Fetch plans for last 7 days
for i in range(7):
    date = (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d')
    plans = client.fetch_all_coach_plans(date)
    print(f"{date}: {len(plans)} plans")
```

## 🐛 Troubleshooting

### Issue: "Missing required configuration: discord_bot_token"

**Solution**: Set `MOCK_MODE=true` for testing, or provide Discord token

```bash
export MOCK_MODE=true
# or
export DISCORD_BOT_TOKEN=your_token_here
```

### Issue: Database locked

**Solution**: Close other connections or use a different database file

```python
storage = StorageManager('./data/test_new.db')
```

### Issue: Cache not working

**Solution**: Check cache metrics and clear if needed

```python
metrics = client.get_metrics()
print(f"Cache hits: {metrics['requests']['cache_hits']}")
client.clear_cache()  # Reset cache
```

## 📚 API Reference

### Endpoints

- `GET /` - API information
- `GET /health` - Health check
- `GET /metrics` - System metrics
- `GET /api/coach-plans/?coach=<name>&date=<date>` - Get plan
- `GET /api/coach-plans/all?date=<date>` - Get all plans
- `GET /api/coach-plans/history?coach=<name>&date=<date>` - Get history

### Client Methods

```python
client = EnhancedWebhookClient('http://localhost:5000')

# Fetch plans
plan = client.fetch_coach_plan('d', '2024-11-09')
all_plans = client.fetch_all_coach_plans('2024-11-09')

# Monitoring
health = client.check_health()
metrics = client.get_metrics()
server_metrics = client.get_server_metrics()

# Cache management
client.clear_cache()
```

## 💡 Tips & Best Practices

1. **Use Mock Mode for Development** - No Discord setup required
2. **Monitor Cache Hit Rate** - Should be 70-90% for good performance
3. **Check Health Regularly** - Use `/health` endpoint
4. **Enable JSON Logging in Production** - Better for log aggregation
5. **Set Appropriate Cache TTL** - Default 1 hour works for most cases
6. **Review Logs** - Check `./logs/discord_bot.log` for issues

## 🎓 Examples

See the `examples/` directory for more:
- `discord_bot_server_enhanced.py` - Full server example
- `use_enhanced_client.py` - Client usage examples

## 📞 Support

- Check logs: `./logs/discord_bot.log`
- Run tests to verify: `python test_*.py`
- Review documentation: `DISCORD_ENHANCEMENT_FINAL_STATUS.md`

---

**Ready to go!** Start with mock mode and you'll be up and running in minutes. 🚀
