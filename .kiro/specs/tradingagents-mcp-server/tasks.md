# Implementation Plan

- [x] 1. Set up project structure and core MCP server



  - Create package directory structure (mcp_server/, protocol/, tools/, etc.)
  - Set up pyproject.toml with dependencies (mcp, tradingagents, asyncio)
  - Create main server.py entry point with CLI interface





  - _Requirements: 1.1, 1.2, 10.2_

- [ ] 2. Implement MCP protocol layer
- [x] 2.1 Create protocol handler and transport


  - Implement MCPServer class with tool/resource registration
  - Create stdio transport for C1 integration
  - Implement request/response handling with MCP message format
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 2.2 Define tool and resource schemas
  - Create Tool and Resource dataclasses
  - Implement JSON schema validation for tool inputs





  - Create schema definitions for all 5 tools
  - _Requirements: 1.2, 2.1, 3.1, 4.1, 5.1_

- [x]* 2.3 Write protocol layer tests

  - Test tool registration and discovery
  - Test request/response handling
  - Test schema validation
  - _Requirements: 1.1, 1.2_

- [ ] 3. Implement TradingAgents adapter
- [ ] 3.1 Create adapter interface
  - Implement TradingAgentsAdapter class
  - Add lazy initialization of TradingAgentsGraph
  - Create state management for graph execution





  - _Requirements: 2.2, 2.3_

- [ ] 3.2 Implement result formatting
  - Create formatters for analysis results
  - Create formatters for backtest results

  - Create formatters for risk calculations
  - Create formatters for sentiment data
  - _Requirements: 2.4, 3.4, 4.4, 5.4_

- [ ]* 3.3 Write adapter tests
  - Test graph initialization
  - Test result formatting
  - Mock TradingAgents responses





  - _Requirements: 2.2, 2.4_

- [ ] 4. Implement analyze_stock tool
- [ ] 4.1 Create AnalyzeStockTool handler
  - Implement execute method with parameter validation
  - Integrate with TradingAgentsAdapter
  - Handle analyst selection (market, fundamentals, news, social)
  - Format response with analyst reports, debate, and recommendation
  - _Requirements: 2.1, 2.2, 2.3, 2.4_






- [ ] 4.2 Add progress reporting
  - Implement progress updates for long-running analysis
  - Add timeout handling (60 seconds default)
  - _Requirements: 2.6_

- [ ]* 4.3 Write analyze_stock tests
  - Test with different analyst combinations
  - Test with config overrides


  - Test timeout handling

  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 5. Implement backtest_strategy tool
- [ ] 5.1 Create BacktestStrategyTool handler
  - Implement execute method with date range validation
  - Integrate with TradingAgents backtesting engine

  - Handle strategy configuration parameters
  - Format response with performance metrics and trades
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ]* 5.2 Write backtest_strategy tests
  - Test with various date ranges
  - Test with different strategy configs
  - Test performance metric calculations
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 6. Implement calculate_risk tool
- [x] 6.1 Create CalculateRiskTool handler




  - Implement execute method with risk parameter validation
  - Integrate with TradingAgents risk management system
  - Calculate position sizing and stop loss levels
  - Format response with risk metrics
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ]* 6.2 Write calculate_risk tests
  - Test position sizing calculations
  - Test risk parameter validation
  - Test edge cases (very high/low risk)
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 7. Implement get_sentiment tool
- [ ] 7.1 Create GetSentimentTool handler
  - Implement execute method with source selection
  - Integrate with Twitter, StockTwits, and Reddit APIs
  - Aggregate sentiment scores across sources
  - Format response with sentiment metrics and trending topics
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 7.2 Add sentiment caching
  - Implement 5-minute cache for sentiment data
  - Add cache key generation based on ticker and sources
  - _Requirements: 5.5_

- [ ]* 7.3 Write get_sentiment tests
  - Test with different source combinations
  - Test sentiment aggregation
  - Test caching behavior
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 8. Implement coach_plans resource
- [ ] 8.1 Create CoachPlansResource handler
  - Implement read method with ticker filtering
  - Integrate with Discord enhanced storage
  - Filter plans by date (last 30 days)
  - Format response with coach metadata
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ]* 8.2 Write coach_plans tests
  - Test ticker filtering
  - Test date filtering
  - Test with no ticker (recent plans)
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 9. Implement configuration management
- [ ] 9.1 Create ServerConfig class
  - Define configuration dataclass with all settings
  - Implement from_env() class method
  - Add validation for required API keys
  - Create default configuration values
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 9.2 Handle missing API keys gracefully
  - Log warnings for missing keys
  - Disable tools that require missing keys
  - Provide clear error messages to users
  - _Requirements: 7.5_

- [ ]* 9.3 Write configuration tests
  - Test environment variable loading
  - Test missing key handling
  - Test configuration validation
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 10. Implement caching layer
- [ ] 10.1 Create CacheManager class
  - Implement get/set methods with TTL support
  - Add cache key generation from tool name and params
  - Implement file-based cache storage
  - Add cache cleanup for expired entries
  - _Requirements: 2.6, 5.5_

- [ ] 10.2 Integrate caching with tools
  - Add caching to analyze_stock (5 min TTL)
  - Add caching to get_sentiment (5 min TTL)
  - Add caching to backtest_strategy (24 hour TTL)
  - Skip caching for calculate_risk (real-time)
  - _Requirements: 2.6, 5.5_

- [ ]* 10.3 Write caching tests
  - Test cache hit/miss behavior
  - Test TTL expiration
  - Test cache key generation
  - _Requirements: 2.6, 5.5_

- [ ] 11. Implement error handling
- [ ] 11.1 Create error classes
  - Define MCPError base class
  - Create InvalidParameterError, RateLimitError, TimeoutError, InternalError
  - Implement error response formatting
  - _Requirements: 8.1, 8.2, 8.3_

- [ ] 11.2 Add error handling to tools
  - Add try/catch blocks to all tool handlers
  - Implement timeout handling with asyncio.wait_for
  - Add parameter validation with descriptive errors
  - Sanitize internal errors before returning to client
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ]* 11.3 Write error handling tests
  - Test invalid parameter errors
  - Test timeout errors
  - Test rate limit errors
  - Test internal error sanitization
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 12. Implement logging and observability
- [ ] 12.1 Set up logging configuration
  - Configure structured logging with timestamps
  - Create separate log files for errors
  - Implement log rotation (daily, 30 day retention)
  - Add configurable log levels
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [ ] 12.2 Add logging to all components
  - Log tool invocations with parameters and execution time
  - Log errors with stack traces
  - Log cache hits/misses
  - Add correlation IDs for request tracing
  - _Requirements: 9.1, 9.2_

- [ ] 12.3 Create health check endpoint
  - Implement /health endpoint returning server status
  - Include uptime and available tools in response
  - Check TradingAgents system connectivity
  - _Requirements: 9.5_

- [ ] 13. Create CLI interface
- [ ] 13.1 Implement CLI commands
  - Create "tradingagents-mcp start" command
  - Add --config flag for custom config file
  - Add --log-level flag for runtime log level
  - Print connection details and available tools on startup
  - _Requirements: 10.2, 10.3, 10.5_

- [ ]* 13.2 Write CLI tests
  - Test command parsing
  - Test config file loading
  - Test startup output
  - _Requirements: 10.2, 10.3, 10.5_

- [ ] 14. Create package and installation
- [ ] 14.1 Set up Python package
  - Create pyproject.toml with dependencies
  - Add package metadata (name, version, description)
  - Configure entry points for CLI
  - Create requirements.txt
  - _Requirements: 10.1, 10.2_

- [ ] 14.2 Create example configurations
  - Create example .env file
  - Create example config.yaml
  - Create example C1 MCP configuration
  - _Requirements: 10.3, 10.4_

- [ ] 14.3 Write installation documentation
  - Document pip installation steps
  - Document environment variable setup
  - Document C1 integration steps
  - Create quick start guide
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [ ] 15. Integration testing
- [ ] 15.1 Test with C1 MCP client
  - Add server to C1 MCP configuration
  - Test tool discovery in C1
  - Test analyze_stock execution from C1
  - Test backtest_strategy execution from C1
  - Test error scenarios from C1
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1_

- [ ] 15.2 Test end-to-end workflows
  - Test complete stock analysis workflow
  - Test backtesting workflow
  - Test risk calculation workflow
  - Test sentiment analysis workflow
  - Test coach plans access
  - _Requirements: 2.1, 3.1, 4.1, 5.1, 6.1_

- [ ] 16. Documentation and examples
- [ ] 16.1 Create user documentation
  - Write README with overview and features
  - Document all tools with examples
  - Document configuration options
  - Add troubleshooting guide
  - _Requirements: 10.3, 10.4_

- [ ] 16.2 Create developer documentation
  - Document architecture and components
  - Add API reference for all classes
  - Create contribution guide
  - Document testing procedures
  - _Requirements: 10.3_

- [ ] 16.3 Create example scripts
  - Create example Python script using MCP client
  - Create example C1 prompts for each tool
  - Create example Docker deployment
  - _Requirements: 10.3, 10.4_
