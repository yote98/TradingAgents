# TradingAgents MCP Server

A Model Context Protocol (MCP) server that exposes TradingAgents multi-agent analysis capabilities to AI assistants like Thesys C1.

## Features

- **Stock Analysis**: Multi-agent analysis using Market, Fundamentals, News, and Social analysts
- **Backtesting**: Test trading strategies on historical data
- **Risk Management**: Calculate position sizing and risk metrics
- **Social Sentiment**: Retrieve sentiment from Twitter, StockTwits, and Reddit
- **Coach Plans**: Access human trading guidance from Discord

## Installation

```bash
# Install from source
git clone https://github.com/yourusername/tradingagents-mcp-server
cd tradingagents-mcp-server
pip install -e .
```

## Quick Start

1. Set up environment variables:

```bash
export OPENAI_API_KEY=sk-...
export ALPHA_VANTAGE_API_KEY=...
```

2. Start the server:

```bash
tradingagents-mcp start
```

## Configuration

### Environment Variables

```bash
# Server
MCP_HOST=localhost
MCP_PORT=3000
MCP_TRANSPORT=stdio
MCP_LOG_LEVEL=INFO

# LLM Configuration
OPENAI_API_KEY=sk-...
DEEP_THINK_LLM=gpt-4o-mini
QUICK_THINK_LLM=gpt-4o-mini
MAX_DEBATE_ROUNDS=1

# Data APIs
ALPHA_VANTAGE_API_KEY=...
TWITTER_BEARER_TOKEN=...

# Caching
CACHE_ENABLED=true
CACHE_DIR=.cache/mcp
CACHE_TTL_SECONDS=300
```

### C1 Integration

Add to your C1 MCP configuration:

```json
{
  "mcpServers": {
    "tradingagents": {
      "command": "tradingagents-mcp",
      "args": ["start"],
      "env": {
        "OPENAI_API_KEY": "sk-...",
        "ALPHA_VANTAGE_API_KEY": "...",
        "DEEP_THINK_LLM": "gpt-4o-mini",
        "MAX_DEBATE_ROUNDS": "1"
      }
    }
  }
}
```

## Available Tools

### analyze_stock

Runs comprehensive multi-agent stock analysis.

```python
{
  "ticker": "AAPL",
  "analysts": ["market", "fundamentals", "news", "social"],
  "config": {
    "deep_think_llm": "gpt-4o-mini",
    "max_debate_rounds": 1
  }
}
```

### backtest_strategy

Tests trading strategies on historical data.

```python
{
  "ticker": "TSLA",
  "start_date": "2024-01-01",
  "end_date": "2024-11-01",
  "strategy_config": {
    "initial_capital": 10000,
    "position_size_pct": 10
  }
}
```

### calculate_risk

Calculates position sizing and risk metrics.

```python
{
  "ticker": "NVDA",
  "account_value": 10000,
  "risk_per_trade_pct": 2.0,
  "current_price": 450.00
}
```

### get_sentiment

Retrieves social media sentiment.

```python
{
  "ticker": "AAPL",
  "sources": ["twitter", "stocktwits", "reddit"],
  "timeframe": "24h"
}
```

## Development

```bash
# Install development dependencies
pip install -e ".[dev]"

# Run tests
pytest

# Format code
black mcp_server/

# Lint code
ruff check mcp_server/
```

## License

MIT

## Contributing

Contributions welcome! Please open an issue or PR.
