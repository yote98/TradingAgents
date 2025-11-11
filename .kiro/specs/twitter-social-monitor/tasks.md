# Implementation Plan

- [x] 1. Set up project structure and configuration



  - Create `tradingagents/dataflows/twitter_monitor.py` module
  - Add Twitter monitor configuration section to `default_config.py`
  - Create cache directory structure for Twitter data
  - Add `feedparser` dependency to `requirements.txt`


  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 8.4_

- [ ] 2. Implement data models and core classes
  - Define `Tweet` dataclass with all required fields
  - Define `StocktwitsMessage` dataclass with sentiment and engagement data

  - Define `SentimentReport` dataclass for aggregated results
  - Create `TwitterSocialMonitor` class skeleton with initialization
  - _Requirements: 1.3, 3.4, 4.2_

- [ ] 3. Implement NitterFetcher for RSS scraping
  - Create `NitterFetcher` class with Nitter instance rotation logic
  - Implement RSS feed fetching with requests and feedparser
  - Implement RSS XML parsing to extract tweet data

  - Add ticker mention detection (dollar-sign, hashtag, plain text formats)
  - Implement rate limiting with configurable delay between requests
  - Add retry logic with exponential backoff for failed requests
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.3, 2.4, 7.1, 7.4_

- [ ] 4. Implement StockwitsFetcher for API integration
  - Create `StockwitsFetcher` class with optional API token support

  - Implement Stocktwits API request method with authentication
  - Parse Stocktwits API responses into `StocktwitsMessage` objects
  - Add rate limit detection and handling
  - Implement graceful fallback when API is unavailable or credentials missing
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 7.3_

- [ ] 5. Implement caching system
  - Create cache directory management (auto-create if missing)

  - Implement cache key generation based on ticker and timestamp
  - Add cache read method with expiration checking
  - Add cache write method with JSON serialization
  - Implement cache invalidation based on configured duration
  - Organize cache files by ticker symbol for easy management
  - _Requirements: 2.5, 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 6. Implement SentimentAnalyzer with LLM integration
  - Create `SentimentAnalyzer` class with LLM initialization

  - Implement individual content sentiment scoring using LLM
  - Add batch processing for multiple tweets to reduce API calls
  - Implement theme extraction from aggregated content
  - Create account ranking logic based on relevance and mentions
  - Generate structured sentiment report with bullish/bearish arguments
  - Add confidence scoring based on content volume and consistency
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 10.1, 10.2, 10.3, 10.4, 10.5_


- [ ] 7. Implement TwitterSocialMonitor orchestration
  - Implement main `get_sentiment_data()` method coordinating all components
  - Add cache checking before fetching new data
  - Coordinate parallel fetching from NitterFetcher and StockwitsFetcher
  - Aggregate results from all data sources
  - Implement error collection and partial result handling
  - Add cache saving after successful data fetch

  - _Requirements: 1.1, 1.2, 6.2, 6.4, 7.2, 7.5, 8.1_

- [ ] 8. Create tool function for Social Sentiment Analyst integration
  - Add `get_twitter_sentiment()` tool function to analyst tools
  - Implement configuration loading from default_config
  - Format TwitterSocialMonitor results into readable report string
  - Add tool to Social Sentiment Analyst's available tools list

  - Ensure consistent formatting with existing social media tools (Reddit)
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 9. Implement error handling and resilience
  - Add try-except blocks for all external API calls
  - Implement Nitter instance failover when one instance is down
  - Add logging for all errors, warnings, and cache operations
  - Ensure no unhandled exceptions propagate to Social Sentiment Analyst
  - Implement graceful degradation returning partial results when possible
  - _Requirements: 2.2, 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 10. Add configuration validation and account management
  - Implement configuration validation on TwitterSocialMonitor initialization
  - Add account list reloading from configuration
  - Validate Nitter instances are accessible on startup
  - Log warnings for invalid or inaccessible accounts
  - Support dynamic account addition/removal via config updates
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ]* 11. Create unit tests for core components
  - Write tests for RSS parsing with mock feed data
  - Write tests for ticker mention detection logic
  - Write tests for Stocktwits API response parsing

  - Write tests for cache hit/miss scenarios
  - Write tests for sentiment scoring logic
  - Write tests for error handling and failover
  - _Requirements: All requirements (validation)_

- [ ]* 12. Create integration tests
  - Write integration test for full Twitter monitoring flow


  - Test Social Sentiment Analyst integration with Twitter tool
  - Test caching behavior across multiple analysis runs
  - Test graceful degradation when Nitter instances are unavailable
  - _Requirements: 6.1, 6.2, 6.3, 7.1, 7.2, 8.1_

- [ ] 13. Create example usage and documentation
  - Create example script demonstrating Twitter monitor usage
  - Add configuration examples with different account lists
  - Document how to add/remove Twitter accounts
  - Create troubleshooting guide for common issues
  - Add performance optimization tips to documentation
  - _Requirements: 5.1, 9.1, 9.2_

- [ ] 14. Test with real data and optimize
  - Run analysis on multiple tickers with active Twitter discussion
  - Verify sentiment accuracy against manual review
  - Measure and optimize fetch performance
  - Test cache effectiveness and hit rates
  - Validate LLM costs are within expected range
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 10.1, 10.2, 10.3_
