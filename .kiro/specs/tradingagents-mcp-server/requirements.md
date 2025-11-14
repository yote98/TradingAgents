# Requirements Document

## Introduction

This specification defines a Model Context Protocol (MCP) server that exposes TradingAgents multi-agent analysis capabilities to Thesys C1 and other MCP-compatible AI assistants. The MCP server will wrap the existing TradingAgents framework, providing standardized tool interfaces for stock analysis, backtesting, risk management, and social sentiment monitoring.

## Glossary

- **MCP Server**: A server implementing the Model Context Protocol that exposes tools and resources to AI assistants
- **TradingAgents System**: The existing multi-agent LLM framework for financial trading analysis
- **C1**: Thesys C1, an AI assistant platform that supports MCP integration
- **Tool**: An MCP-exposed function that can be called by AI assistants
- **Resource**: An MCP-exposed data source that can be read by AI assistants
- **Analyst**: A specialized AI agent (Market, Fundamentals, News, Social) that analyzes stocks
- **Debate Round**: A structured discussion between Bull and Bear researchers
- **Coach Plan**: Human-provided trading guidance stored in Discord

## Requirements

### Requirement 1: MCP Server Infrastructure

**User Story:** As a developer, I want a properly configured MCP server, so that C1 can discover and use TradingAgents tools.

#### Acceptance Criteria

1. THE MCP_Server SHALL implement the Model Context Protocol specification version 1.0 or later
2. WHEN the MCP_Server starts, THE MCP_Server SHALL register all available tools with their schemas
3. WHEN the MCP_Server starts, THE MCP_Server SHALL bind to a configurable host and port
4. THE MCP_Server SHALL log all tool invocations with timestamps and parameters
5. WHEN an error occurs during tool execution, THE MCP_Server SHALL return structured error responses compliant with MCP error format

### Requirement 2: Stock Analysis Tool

**User Story:** As a C1 user, I want to analyze stocks using multiple AI analysts, so that I can get comprehensive market insights.

#### Acceptance Criteria

1. THE MCP_Server SHALL expose a tool named "analyze_stock" with parameters for ticker symbol and analyst selection
2. WHEN "analyze_stock" is invoked with a valid ticker, THE MCP_Server SHALL execute the TradingAgents analysis workflow
3. THE MCP_Server SHALL accept an array parameter "analysts" containing values from the set ["market", "fundamentals", "news", "social"]
4. WHEN the analysis completes, THE MCP_Server SHALL return structured results containing analyst reports, bull/bear debate summary, and trading recommendation
5. THE MCP_Server SHALL support optional configuration parameters including "deep_think_llm", "quick_think_llm", and "max_debate_rounds"
6. WHEN analysis execution time exceeds 60 seconds, THE MCP_Server SHALL provide progress updates to the client

### Requirement 3: Backtesting Tool

**User Story:** As a C1 user, I want to backtest trading strategies on historical data, so that I can evaluate strategy performance.

#### Acceptance Criteria

1. THE MCP_Server SHALL expose a tool named "backtest_strategy" with parameters for ticker, date range, and strategy configuration
2. WHEN "backtest_strategy" is invoked, THE MCP_Server SHALL execute the TradingAgents backtesting engine
3. THE MCP_Server SHALL accept parameters "start_date" and "end_date" in ISO 8601 format
4. WHEN backtesting completes, THE MCP_Server SHALL return performance metrics including total return, Sharpe ratio, maximum drawdown, and win rate
5. THE MCP_Server SHALL support strategy parameters including "initial_capital", "position_size_pct", and "stop_loss_pct"

### Requirement 4: Risk Calculation Tool

**User Story:** As a C1 user, I want to calculate position sizing and risk metrics, so that I can manage portfolio risk effectively.

#### Acceptance Criteria

1. THE MCP_Server SHALL expose a tool named "calculate_risk" with parameters for ticker, account size, and risk tolerance
2. WHEN "calculate_risk" is invoked, THE MCP_Server SHALL calculate position size using the TradingAgents risk management system
3. THE MCP_Server SHALL accept parameters "account_value", "risk_per_trade_pct", and "current_price"
4. WHEN risk calculation completes, THE MCP_Server SHALL return recommended position size, stop loss price, and risk-reward ratio
5. THE MCP_Server SHALL validate that "risk_per_trade_pct" is between 0.1 and 10.0 percent

### Requirement 5: Social Sentiment Tool

**User Story:** As a C1 user, I want to retrieve social media sentiment for stocks, so that I can gauge market psychology.

#### Acceptance Criteria

1. THE MCP_Server SHALL expose a tool named "get_sentiment" with a parameter for ticker symbol
2. WHEN "get_sentiment" is invoked, THE MCP_Server SHALL fetch sentiment data from configured social media sources
3. THE MCP_Server SHALL support sentiment sources including Twitter, StockTwits, and Reddit
4. WHEN sentiment data is retrieved, THE MCP_Server SHALL return aggregated sentiment score, volume metrics, and top trending topics
5. THE MCP_Server SHALL cache sentiment data for 5 minutes to avoid rate limiting

### Requirement 6: Coach Plans Resource

**User Story:** As a C1 user, I want to access human coach trading plans, so that I can incorporate expert judgment into analysis.

#### Acceptance Criteria

1. THE MCP_Server SHALL expose a resource named "coach_plans" that provides access to stored Discord coach plans
2. WHEN the "coach_plans" resource is read with a ticker parameter, THE MCP_Server SHALL return relevant coach plans for that ticker
3. THE MCP_Server SHALL return coach plans with metadata including coach name, timestamp, and confidence level
4. WHEN no ticker is specified, THE MCP_Server SHALL return the 10 most recent coach plans across all tickers
5. THE MCP_Server SHALL filter coach plans to only include those from the last 30 days

### Requirement 7: Configuration Management

**User Story:** As a developer, I want to configure the MCP server through environment variables, so that I can deploy it in different environments.

#### Acceptance Criteria

1. THE MCP_Server SHALL read configuration from environment variables and a config file
2. THE MCP_Server SHALL support configuration of API keys for OpenAI, Anthropic, Alpha Vantage, and Twitter
3. THE MCP_Server SHALL support configuration of LLM model names for deep thinking and quick thinking operations
4. THE MCP_Server SHALL support configuration of data vendor preferences for stock data, fundamentals, and news
5. WHEN a required API key is missing, THE MCP_Server SHALL log a warning and disable tools that require that key

### Requirement 8: Error Handling and Resilience

**User Story:** As a C1 user, I want clear error messages when tools fail, so that I can understand what went wrong.

#### Acceptance Criteria

1. WHEN a tool receives invalid parameters, THE MCP_Server SHALL return an error with a descriptive message indicating which parameter is invalid
2. WHEN an API rate limit is exceeded, THE MCP_Server SHALL return an error indicating the rate limit and retry time
3. WHEN the TradingAgents system encounters an internal error, THE MCP_Server SHALL return a sanitized error message without exposing internal details
4. THE MCP_Server SHALL implement timeout handling for all tool executions with a default timeout of 120 seconds
5. WHEN a timeout occurs, THE MCP_Server SHALL cancel the operation and return a timeout error

### Requirement 9: Logging and Observability

**User Story:** As a developer, I want comprehensive logging, so that I can debug issues and monitor usage.

#### Acceptance Criteria

1. THE MCP_Server SHALL log all tool invocations with timestamp, tool name, parameters, and execution time
2. THE MCP_Server SHALL log all errors with stack traces to a separate error log file
3. THE MCP_Server SHALL support configurable log levels including DEBUG, INFO, WARNING, and ERROR
4. THE MCP_Server SHALL rotate log files daily and retain logs for 30 days
5. THE MCP_Server SHALL expose a health check endpoint that returns server status and uptime

### Requirement 10: Installation and Deployment

**User Story:** As a developer, I want simple installation instructions, so that I can quickly set up the MCP server.

#### Acceptance Criteria

1. THE MCP_Server SHALL be installable via pip as a Python package
2. THE MCP_Server SHALL provide a command-line interface for starting the server with "tradingagents-mcp start"
3. THE MCP_Server SHALL include example configuration files for common deployment scenarios
4. THE MCP_Server SHALL provide clear documentation for adding the server to C1's MCP configuration
5. WHEN the server starts successfully, THE MCP_Server SHALL print the connection details and available tools to the console
