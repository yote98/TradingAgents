# C1 Backend API

Flask-based REST API that serves TradingAgents coach plans and analysis data to the C1 frontend application.

## Overview

The C1 Backend API provides:
- **Coach Plans Endpoints**: Fetch trading plans from coaches
- **Analysis Endpoint**: Run TradingAgents stock analysis
- **System Endpoints**: Health checks and metrics

## Quick Start

### 1. Install Dependencies

```bash
# Install C1 API dependencies
pip install -r requirements-c1-api.txt

# Make sure main TradingAgents dependencies are installed
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
# Copy example environment file
cp .env.c1-api.example .env

# Edit .env and add your API keys
# At minimum, set OPENAI_API_KEY
```

### 3. Run the Server

```bash
# Run in development mode
python c1_api_server.py

# Or with custom port
API_PORT=8000 python c1_api_server.py
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Coach Plans

#### Get All Coach Plans
```http
GET /api/coach-plans/all
```

Response:
```json
{
  "coach_d": {
    "plan": "Trading plan text...",
    "created_at": "2024-01-15T10:30:00Z",
    "charts": ["chart1.png"]
  },
  "coach_i": { ... }
}
```

#### Get Specific Coach Plan
```http
GET /api/coach-plans/{coach_id}
```

Valid coach IDs: `coach_d`, `coach_i`, `coach_s`, `coach_n`

### Analysis

#### Run Stock Analysis
```http
POST /api/analyze
Content-Type: application/json

{
  "ticker": "AAPL",
  "analysts": ["market", "fundamentals", "news", "social"],
  "config": {
    "deep_think_llm": "gpt-4o-mini",
    "quick_think_llm": "gpt-4o-mini",
    "max_debate_rounds": 1
  }
}
```

Request Body:
- `ticker` (required): Stock ticker symbol (e.g., "AAPL", "TSLA")
- `analysts` (required): Array of analyst types to include
  - Valid values: `"market"`, `"fundamentals"`, `"news"`, `"social"`
  - Minimum 1 analyst required
- `config` (optional): Analysis configuration
  - `deep_think_llm`: Model for deep analysis (default: "gpt-4o-mini")
  - `quick_think_llm`: Model for quick analysis (default: "gpt-4o-mini")
  - `max_debate_rounds`: Number of debate rounds (default: 1, max: 3)

Response:
```json
{
  "success": true,
  "results": {
    "ticker": "AAPL",
    "timestamp": "2024-01-15T10:30:00Z",
    "analystReports": {
      "market": "Market analysis report...",
      "fundamentals": "Fundamental analysis report...",
      "news": "News sentiment analysis...",
      "social": "Social media sentiment..."
    },
    "bullArguments": [
      "Strong technical setup with breakout above resistance",
      "Positive earnings momentum and revenue growth",
      "Favorable analyst ratings and price targets"
    ],
    "bearArguments": [
      "Overbought RSI indicating potential pullback",
      "High valuation compared to sector peers",
      "Macroeconomic headwinds affecting tech sector"
    ],
    "finalDecision": "BUY",
    "confidence": 0.75,
    "reasoning": "Despite some technical overbought conditions, strong fundamentals and positive sentiment support a buy decision..."
  }
}
```

**Caching**: Analysis results are cached for 5 minutes per ticker to reduce API costs

**Cost Estimates**:
- 1 analyst, 1 round, gpt-4o-mini: ~$0.01-0.02
- 4 analysts, 1 round, gpt-4o-mini: ~$0.05-0.10
- 4 analysts, 3 rounds, o1-preview: ~$0.50-1.00

**Error Codes**:
- `400`: Invalid ticker or analysts array
- `422`: Validation error (invalid analyst type, invalid config)
- `500`: Analysis execution failed
- `503`: TradingAgents service unavailable

**Example curl**:
```bash
# Basic analysis with 2 analysts
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "ticker": "AAPL",
    "analysts": ["market", "fundamentals"]
  }'

# Full analysis with custom config
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "ticker": "TSLA",
    "analysts": ["market", "fundamentals", "news", "social"],
    "config": {
      "deep_think_llm": "o1-preview",
      "max_debate_rounds": 2
    }
  }'
```

### Backtesting

#### Run Backtest
```http
POST /api/backtest
Content-Type: application/json

{
  "ticker": "AAPL",
  "startDate": "2023-01-01",
  "endDate": "2023-12-31",
  "strategy": "momentum",
  "config": {
    "initialCapital": 100000,
    "positionSize": 0.1,
    "stopLoss": 0.05,
    "takeProfit": 0.15
  }
}
```

Request Body:
- `ticker` (required): Stock ticker symbol
- `startDate` (required): Backtest start date (YYYY-MM-DD format)
- `endDate` (required): Backtest end date (YYYY-MM-DD format)
- `strategy` (required): Strategy name
  - Valid values: `"momentum"`, `"mean_reversion"`, `"breakout"`, `"custom"`
- `config` (optional): Strategy configuration
  - `initialCapital`: Starting capital (default: 100000)
  - `positionSize`: Position size as fraction of capital (default: 0.1)
  - `stopLoss`: Stop loss percentage (default: 0.05)
  - `takeProfit`: Take profit percentage (default: 0.15)

Response:
```json
{
  "success": true,
  "results": {
    "ticker": "AAPL",
    "period": {
      "start": "2023-01-01",
      "end": "2023-12-31"
    },
    "performance": {
      "totalReturn": 0.234,
      "winRate": 0.65,
      "sharpeRatio": 1.45,
      "maxDrawdown": -0.12,
      "totalTrades": 45,
      "winningTrades": 29,
      "losingTrades": 16,
      "avgWin": 0.045,
      "avgLoss": -0.028,
      "profitFactor": 2.1
    },
    "trades": [
      {
        "date": "2023-01-15",
        "action": "BUY",
        "price": 150.25,
        "quantity": 66,
        "pnl": 0
      },
      {
        "date": "2023-01-22",
        "action": "SELL",
        "price": 157.80,
        "quantity": 66,
        "pnl": 498.30
      }
    ],
    "equityCurve": [
      { "date": "2023-01-01", "value": 100000 },
      { "date": "2023-01-02", "value": 100150 },
      { "date": "2023-01-03", "value": 100320 }
    ],
    "drawdownCurve": [
      { "date": "2023-01-01", "value": 0 },
      { "date": "2023-01-02", "value": -0.002 },
      { "date": "2023-01-03", "value": 0 }
    ],
    "monthlyReturns": {
      "2023-01": 0.045,
      "2023-02": 0.023,
      "2023-03": -0.012
    }
  }
}
```

**Caching**: Backtest results are cached for 5 minutes per ticker/date range combination

**Cost Estimates**:
- 3-month backtest: ~$0.01-0.02
- 1-year backtest: ~$0.02-0.05
- 5-year backtest: ~$0.05-0.10

**Performance Notes**:
- Longer date ranges take more time to process
- First run may be slower due to data fetching
- Subsequent runs use cached market data

**Error Codes**:
- `400`: Invalid ticker, dates, or strategy
- `422`: Validation error (end date before start date, invalid config)
- `500`: Backtest execution failed
- `503`: Backtesting service unavailable

**Example curl**:
```bash
# Basic backtest
curl -X POST http://localhost:5000/api/backtest \
  -H "Content-Type: application/json" \
  -d '{
    "ticker": "AAPL",
    "startDate": "2023-01-01",
    "endDate": "2023-06-30",
    "strategy": "momentum"
  }'

# Backtest with custom config
curl -X POST http://localhost:5000/api/backtest \
  -H "Content-Type: application/json" \
  -d '{
    "ticker": "TSLA",
    "startDate": "2023-01-01",
    "endDate": "2023-12-31",
    "strategy": "breakout",
    "config": {
      "initialCapital": 50000,
      "positionSize": 0.2,
      "stopLoss": 0.03,
      "takeProfit": 0.20
    }
  }'
```

### Twitter Sentiment

#### Get Twitter Sentiment
```http
GET /api/twitter/sentiment?ticker=AAPL&accounts=ChartChampions,unusual_whales&limit=50
```

Query Parameters:
- `ticker` (optional): Stock ticker to filter tweets
- `accounts` (optional): Comma-separated list of Twitter accounts
- `limit` (optional): Max tweets to return (default: 50, max: 100)

Response:
```json
{
  "tweets": [
    {
      "id": "1234567890",
      "account": "ChartChampions",
      "text": "$AAPL breaking out above resistance...",
      "timestamp": "2025-11-11T10:30:00Z",
      "sentiment": 0.75,
      "tickers": ["AAPL"],
      "url": "https://twitter.com/ChartChampions/status/1234567890"
    }
  ],
  "sentiment": {
    "overall_score": 0.65,
    "bullish_args": [
      "Strong technical setup with breakout above $180",
      "Positive earnings momentum"
    ],
    "bearish_args": [
      "Overbought RSI at 75",
      "Resistance at $185"
    ],
    "themes": ["Tech rally", "Earnings season", "AI momentum"],
    "account_influence": {
      "ChartChampions": 0.85,
      "unusual_whales": 0.72
    }
  },
  "metadata": {
    "total_tweets": 150,
    "filtered_tweets": 25,
    "last_updated": "2025-11-11T10:35:00Z",
    "cache_hit": true
  }
}
```

**Caching**: Responses cached for 5 minutes per ticker/accounts combination

**Error Codes**:
- `400`: Invalid ticker or account format
- `429`: Rate limit exceeded (60 requests/minute)
- `500`: Twitter monitor service unavailable
- `503`: Service temporarily unavailable

**Example curl**:
```bash
# Get sentiment for AAPL
curl "http://localhost:5000/api/twitter/sentiment?ticker=AAPL"

# Get sentiment from specific accounts
curl "http://localhost:5000/api/twitter/sentiment?accounts=ChartChampions,unusual_whales&limit=30"

# Get all tweets (no filter)
curl "http://localhost:5000/api/twitter/sentiment?limit=100"
```

#### Get Stocktwits Data
```http
GET /api/twitter/stocktwits?ticker=AAPL&limit=30
```

Query Parameters:
- `ticker` (required): Stock ticker symbol
- `limit` (optional): Max messages to return (default: 30, max: 50)

Response:
```json
{
  "messages": [
    {
      "id": "456789012",
      "user": "trader123",
      "text": "AAPL looking strong here, buying the dip",
      "timestamp": "2025-11-11T10:30:00Z",
      "sentiment": "bullish",
      "likes": 15
    }
  ],
  "sentiment_ratio": {
    "bullish": 65,
    "bearish": 35
  },
  "metadata": {
    "total_messages": 30,
    "last_updated": "2025-11-11T10:35:00Z",
    "cache_hit": false
  }
}
```

**Caching**: Responses cached for 5 minutes per ticker

**Error Codes**:
- `400`: Missing or invalid ticker
- `429`: Rate limit exceeded
- `500`: Stocktwits API unavailable
- `503`: Service temporarily unavailable

**Example curl**:
```bash
# Get Stocktwits messages for AAPL
curl "http://localhost:5000/api/twitter/stocktwits?ticker=AAPL"

# Get more messages
curl "http://localhost:5000/api/twitter/stocktwits?ticker=TSLA&limit=50"
```

#### Update Monitored Accounts
```http
POST /api/twitter/accounts
Content-Type: application/json

{
  "accounts": ["ChartChampions", "unusual_whales", "TradingView"]
}
```

Request Body:
- `accounts` (required): Array of Twitter usernames (without @ symbol)

Response:
```json
{
  "success": true,
  "accounts": ["ChartChampions", "unusual_whales", "TradingView"],
  "validated": true,
  "invalid_accounts": []
}
```

**Validation**: Accounts are validated before being saved

**Error Codes**:
- `400`: Invalid request body or account format
- `422`: One or more accounts failed validation
- `500`: Configuration update failed

**Example curl**:
```bash
# Update monitored accounts
curl -X POST http://localhost:5000/api/twitter/accounts \
  -H "Content-Type: application/json" \
  -d '{"accounts": ["ChartChampions", "unusual_whales"]}'
```

### System

#### Health Check
```http
GET /health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### Metrics
```http
GET /metrics
```

Response:
```json
{
  "uptime": 3600,
  "requests": 150,
  "errors": 2,
  "error_rate": 0.013
}
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `API_HOST` | `0.0.0.0` | Server host |
| `API_PORT` | `5000` | Server port |
| `DEBUG_MODE` | `false` | Enable debug mode |
| `CORS_ORIGINS` | `http://localhost:3000` | Allowed CORS origins (comma-separated) |
| `USE_MOCK_MODE` | `false` | Use mock data instead of Discord |
| `DISCORD_BOT_TOKEN` | - | Discord bot token (optional) |
| `OPENAI_API_KEY` | - | OpenAI API key (required) |
| `REQUEST_TIMEOUT` | `120` | Request timeout in seconds |
| `COACH_PLANS_CACHE_TTL` | `30` | Cache TTL for coach plans |
| `TWITTER_CACHE_DURATION` | `300` | Twitter data cache duration (seconds) |
| `TWITTER_MAX_TWEETS` | `100` | Maximum tweets to return per request |
| `TWITTER_RATE_LIMIT` | `60` | Twitter API rate limit (requests/minute) |
| `STOCKTWITS_API_TOKEN` | - | Stocktwits API token (optional) |
| `TWITTER_DEFAULT_ACCOUNTS` | See config | Default Twitter accounts to monitor |

### Mock Mode

For development without Discord:

```bash
# In .env file
USE_MOCK_MODE=true
```

This will return sample coach plans without requiring Discord bot setup.

## Project Structure

```
c1_api/
├── __init__.py           # Package initialization
├── config.py             # Configuration management
├── routes/               # API route blueprints
│   ├── __init__.py
│   ├── coach_plans.py    # Coach plans endpoints
│   ├── analysis.py       # Analysis endpoints
│   └── system.py         # System endpoints
└── services/             # Business logic
    ├── __init__.py
    ├── coach_service.py  # Coach plans service
    └── analysis_service.py # Analysis service

c1_api_server.py          # Main server entry point
requirements-c1-api.txt   # API dependencies
```

## Development

### Running Tests

```bash
# Run all tests
pytest tests/test_c1_api/

# Run specific test file
pytest tests/test_c1_api/test_coach_service.py

# Run with coverage
pytest --cov=c1_api tests/test_c1_api/
```

### Debug Mode

Enable debug mode for detailed logging:

```bash
DEBUG_MODE=true python c1_api_server.py
```

**WARNING**: Never enable debug mode in production!

## Deployment

### Production Server

For production, use a WSGI server like gunicorn:

```bash
# Install gunicorn
pip install gunicorn

# Run with gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 c1_api_server:app
```

### Docker (Optional)

```dockerfile
FROM python:3.10-slim

WORKDIR /app
COPY requirements.txt requirements-c1-api.txt ./
RUN pip install -r requirements.txt -r requirements-c1-api.txt

COPY . .

CMD ["python", "c1_api_server.py"]
```

## Troubleshooting

### CORS Errors

If you see CORS errors in the browser:

1. Check `CORS_ORIGINS` includes your frontend URL
2. Restart the API server after changing .env
3. Clear browser cache

### Coach Plans Not Loading

1. Check if `USE_MOCK_MODE=true` in .env
2. If using real Discord, verify `DISCORD_BOT_TOKEN` is set
3. Check API logs for errors

### Analysis Endpoint Fails

1. Verify `OPENAI_API_KEY` is set correctly
2. Check you have sufficient OpenAI credits
3. Try with `gpt-4o-mini` model for lower cost

## Support

For issues or questions:
- Check the main TradingAgents documentation
- Review the spec files in `.kiro/specs/c1-backend-api/`
- Check API logs for detailed error messages
