# Product Overview

TradingAgents is a multi-agent LLM framework for financial trading analysis that mirrors real-world trading firms. The system deploys specialized AI agents (analysts, researchers, traders, risk managers) that collaboratively evaluate market conditions and inform trading decisions through structured debates and analysis.

## Core Capabilities

- **Automated Analysis**: 4 specialized analysts (Market, Fundamentals, News, Social) analyze stocks using real-time data
- **Research Debate**: Bull/Bear researchers debate findings to balance gains vs risks
- **Trading Decisions**: Trader proposes actions based on comprehensive insights
- **Risk Management**: Multi-perspective risk evaluation before final approval
- **Optional Human Guidance**: External "coaches" can provide human judgment via Discord integration

## Key Design Principles

- **Research-focused**: Built for research purposes, not production trading advice
- **Modular**: Agents can be enabled/disabled independently
- **Configurable**: Supports multiple LLM providers (OpenAI, Anthropic, Google)
- **Data-flexible**: Works with yfinance, Alpha Vantage, or local data sources
- **Transparent**: Debug mode shows agent reasoning and decision-making process

## Target Use Cases

- Academic research on multi-agent trading systems
- Backtesting trading strategies with AI agents
- Exploring LLM-based financial analysis workflows
- Educational demonstrations of agent collaboration
