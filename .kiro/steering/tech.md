# Technology Stack

## Core Framework

- **Python**: 3.10+ required (3.13 recommended)
- **LangGraph**: Multi-agent orchestration and workflow management
- **LangChain**: LLM integration (OpenAI, Anthropic, Google GenAI)

## Key Dependencies

- **Data Sources**: yfinance, Alpha Vantage API, eodhd, finnhub, akshare, tushare
- **LLM Providers**: langchain-openai, langchain-anthropic, langchain-google-genai
- **Analysis**: pandas, stockstats, backtrader (backtesting)
- **Storage**: chromadb (vector storage), redis (caching)
- **CLI/UI**: rich, questionary, typer, chainlit
- **Web Scraping**: parsel, feedparser, praw (Reddit)

## Project Structure

```
tradingagents/
├── agents/          # Agent implementations (analysts, researchers, traders)
│   ├── coaches/     # Optional human coach integration
│   └── utils/       # Agent utilities, states, memory
├── dataflows/       # Data fetching and caching layer
├── graph/           # LangGraph workflow setup and orchestration
└── integrations/    # External integrations (Discord webhooks)

cli/                 # Interactive CLI interface
examples/            # Usage examples and demos
docs/                # Documentation
eval_results/        # Analysis results and logs
```

## Configuration

- **Config File**: `tradingagents/default_config.py` - central configuration
- **Environment**: `.env` file for API keys (OPENAI_API_KEY, ALPHA_VANTAGE_API_KEY)
- **Data Vendors**: Configurable per category (core_stock_apis, technical_indicators, fundamental_data, news_data)
- **LLM Models**: Separate "deep thinking" (o4-mini, o1-preview) and "quick thinking" (gpt-4o-mini) models

## Common Commands

### Setup
```bash
# Install dependencies
pip install -r requirements.txt

# Install as editable package
pip install -e .

# Set up environment
cp .env.example .env
# Edit .env with API keys
```

### Running Analysis
```bash
# Interactive CLI
python -m cli.main

# Basic Python usage
python main.py

# Complete demo
python demo_complete_system.py

# Batch analysis
python examples/batch_analysis.py
```

### Discord Integration (Optional)
```bash
# Install Discord dependencies
pip install -r requirements-discord.txt

# Run Discord bot server
python examples/discord_bot_server.py
```

## Development Notes

- **Debug Mode**: Set `debug=True` in TradingAgentsGraph to see agent reasoning
- **Cost Optimization**: Use gpt-4o-mini for testing (framework makes many API calls)
- **Data Caching**: Cached in `tradingagents/dataflows/data_cache/`
- **Results**: Saved to `eval_results/{ticker}/` with full state logs
- **Memory System**: Agents maintain memory for reflection and learning
