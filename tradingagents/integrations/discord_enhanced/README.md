# Enhanced Discord Integration

Production-ready Discord integration for the TradingAgents coach system.

## Features

- **Persistent Storage**: SQLite database for coach plans (survives restarts)
- **Comprehensive Error Handling**: Graceful degradation and detailed logging
- **Health Monitoring**: `/health` and `/metrics` endpoints
- **Mock Mode**: Test without Discord setup
- **Caching**: Reduce API calls with intelligent caching
- **Chart Attachments**: Support for multiple chart images per plan
- **Edit/Delete**: Coaches can modify their plans

## Directory Structure

```
discord_enhanced/
├── __init__.py          # Package initialization
├── config.py            # Configuration management
├── storage.py           # Database persistence layer
├── service.py           # Business logic layer
├── bot.py               # Discord bot implementation
├── api.py               # Flask API server
├── client.py            # Enhanced webhook client
├── mock.py              # Mock mode for testing
└── README.md            # This file
```

## Configuration

### Environment Variables

Required:
- `DISCORD_BOT_TOKEN`: Your Discord bot token

Optional (with defaults):
- `DATABASE_PATH`: Path to SQLite database (default: `./data/coach_plans.db`)
- `API_PORT`: Flask API port (default: `5000`)
- `API_HOST`: Flask API host (default: `0.0.0.0`)
- `LOG_LEVEL`: Logging level (default: `INFO`)
- `LOG_FILE`: Log file path (default: `./logs/discord_bot.log`)
- `CACHE_TTL_SECONDS`: Cache TTL (default: `3600`)
- `MAX_CACHE_SIZE`: Max cached plans (default: `100`)
- `MOCK_MODE`: Enable mock mode (default: `false`)

### Configuration File

Optionally use `config.yaml` for structured configuration:

```yaml
discord:
  bot_token: ${DISCORD_BOT_TOKEN}
  reconnect_attempts: 5

database:
  path: ./data/coach_plans.db

api:
  port: 5000
  host: 0.0.0.0

logging:
  level: INFO
  file: ./logs/discord_bot.log
```

## Usage

### Basic Setup

```python
from tradingagents.integrations.discord_enhanced import ConfigManager

# Load configuration
config = ConfigManager(config_file='config.yaml')

# Access configuration
print(f"API Port: {config.api_port}")
print(f"Database: {config.database_path}")
print(f"Mock Mode: {config.mock_mode}")
```

### Mock Mode (Testing)

Set `MOCK_MODE=true` to test without Discord:

```bash
export MOCK_MODE=true
python examples/discord_bot_server.py
```

Mock mode provides realistic test data for all coaches without requiring Discord credentials.

## Development

This package is part of the Discord webhook enhancement spec. See:
- `.kiro/specs/discord-webhook-enhancement/requirements.md`
- `.kiro/specs/discord-webhook-enhancement/design.md`
- `.kiro/specs/discord-webhook-enhancement/tasks.md`

## Implementation Status

- [x] Task 1: Configuration management
- [ ] Task 2: Persistence layer
- [ ] Task 3: Service layer
- [ ] Task 4: Discord bot
- [ ] Task 5: Flask API
- [ ] Task 6: Webhook client
- [ ] Task 7: Mock mode
