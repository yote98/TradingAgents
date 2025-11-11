# Requirements Document

## Introduction

This document specifies requirements for a Financial Twitter/Social Monitor system that enhances the TradingAgents platform by collecting and analyzing social media sentiment from curated financial Twitter accounts and Stocktwits. The system will provide high-quality social sentiment signals by targeting trusted financial commentators and filtering for ticker-specific mentions, integrating seamlessly with the existing Social Sentiment Analyst agent.

## Glossary

- **Twitter Monitor System**: The complete system for fetching, parsing, and analyzing tweets from financial Twitter accounts
- **Nitter**: A free, privacy-focused Twitter frontend that provides RSS feeds without requiring API authentication
- **Stocktwits**: A social media platform specifically designed for stock market discussion and sentiment
- **Curated Account**: A pre-selected Twitter account known for quality financial commentary or analysis
- **Ticker Mention**: A reference to a stock symbol in social media content (e.g., $AAPL, $TSLA)
- **Social Sentiment Analyst**: The existing TradingAgents agent responsible for analyzing social media sentiment
- **RSS Feed**: A web feed format that allows automated retrieval of content updates
- **Sentiment Score**: A numerical value representing the positive, negative, or neutral tone of social media content
- **Data Cache**: Local storage system for previously fetched social media data to reduce API calls and improve performance

## Requirements

### Requirement 1

**User Story:** As a trading analyst, I want to monitor tweets from trusted financial Twitter accounts, so that I can incorporate expert technical and fundamental analysis into my trading decisions.

#### Acceptance Criteria

1. WHEN the Twitter Monitor System is initialized, THE System SHALL load a configurable list of curated financial Twitter accounts from the configuration file
2. WHEN the Twitter Monitor System fetches tweets, THE System SHALL retrieve the most recent tweets from each curated account using Nitter RSS feeds
3. WHEN a tweet is retrieved, THE System SHALL extract the tweet text, timestamp, author, and any embedded links
4. WHEN processing tweets, THE System SHALL filter tweets to include only those mentioning the specified stock ticker symbol
5. WHEN the ticker filter is applied, THE System SHALL recognize ticker mentions in formats including dollar-sign notation ($AAPL), hashtag notation (#AAPL), and plain text (AAPL)

### Requirement 2

**User Story:** As a system administrator, I want the Twitter monitoring to work without paid API access, so that I can minimize operational costs while still gathering valuable social sentiment data.

#### Acceptance Criteria

1. THE Twitter Monitor System SHALL fetch Twitter data using Nitter RSS feeds without requiring Twitter API authentication
2. WHEN Nitter RSS feeds are unavailable, THE System SHALL log an error message and continue operation with available data sources
3. THE System SHALL implement rate limiting to avoid overwhelming Nitter instances with more than 10 requests per minute
4. WHEN fetching data from Nitter, THE System SHALL rotate between multiple Nitter instance URLs to distribute load
5. THE System SHALL cache fetched tweets locally for a configurable time period to minimize redundant requests

### Requirement 3

**User Story:** As a trading analyst, I want to access Stocktwits sentiment data, so that I can understand retail investor sentiment and community discussion around specific stocks.

#### Acceptance Criteria

1. THE Twitter Monitor System SHALL integrate with the Stocktwits API to fetch messages for specified ticker symbols
2. WHEN fetching Stocktwits data, THE System SHALL retrieve the most recent messages with a configurable limit (default 30 messages)
3. WHEN Stocktwits API credentials are not provided, THE System SHALL operate using only Twitter data sources without failing
4. THE System SHALL extract message text, sentiment label (bullish/bearish), timestamp, and user information from Stocktwits responses
5. WHEN Stocktwits rate limits are reached, THE System SHALL log a warning and use cached data if available

### Requirement 4

**User Story:** As a trading analyst, I want the system to provide sentiment analysis of social media content, so that I can quickly understand the overall market sentiment without reading every post.

#### Acceptance Criteria

1. WHEN social media content is collected, THE System SHALL analyze the sentiment of each tweet or message using the configured LLM
2. THE System SHALL assign a sentiment score to each piece of content on a scale from -1.0 (very bearish) to +1.0 (very bullish)
3. THE System SHALL aggregate individual sentiment scores into an overall sentiment summary for the specified ticker
4. WHEN generating sentiment analysis, THE System SHALL identify and extract key themes, concerns, and bullish or bearish arguments
5. THE System SHALL provide a confidence score for the sentiment analysis based on the volume and consistency of social media content

### Requirement 5

**User Story:** As a system administrator, I want to configure which Twitter accounts to monitor and system behavior, so that I can customize the monitoring to match my trading strategy and data sources.

#### Acceptance Criteria

1. THE Twitter Monitor System SHALL read configuration from a dedicated configuration file or section in the default configuration
2. THE System SHALL support configuration of curated Twitter account usernames as a list
3. THE System SHALL support configuration of Nitter instance URLs as a list for rotation
4. THE System SHALL support configuration of Stocktwits API credentials (optional)
5. THE System SHALL support configuration of cache duration, rate limits, and maximum tweets per account

### Requirement 6

**User Story:** As a trading analyst, I want the Twitter monitoring to integrate seamlessly with the existing Social Sentiment Analyst, so that I can access Twitter data through the same interface as other social media sources.

#### Acceptance Criteria

1. THE Twitter Monitor System SHALL provide a tool function that the Social Sentiment Analyst can invoke to fetch Twitter data
2. WHEN the Social Sentiment Analyst requests Twitter data, THE System SHALL return a structured report containing tweets, sentiment analysis, and key insights
3. THE System SHALL format Twitter data consistently with existing social media data sources (Reddit) for uniform processing
4. WHEN Twitter data is unavailable, THE System SHALL return an empty result without causing the Social Sentiment Analyst to fail
5. THE System SHALL include Twitter sentiment analysis in the Social Sentiment Analyst's final report alongside other social media sources

### Requirement 7

**User Story:** As a trading analyst, I want the system to handle errors gracefully, so that temporary issues with Twitter or Stocktwits do not disrupt my entire analysis workflow.

#### Acceptance Criteria

1. WHEN a Nitter instance is unreachable, THE System SHALL attempt to fetch data from alternative Nitter instances in the configured list
2. WHEN all Nitter instances fail, THE System SHALL log an error and return cached data if available
3. WHEN the Stocktwits API returns an error, THE System SHALL log the error and continue with Twitter data only
4. WHEN network timeouts occur, THE System SHALL retry the request up to 3 times with exponential backoff
5. THE System SHALL never raise unhandled exceptions that would terminate the Social Sentiment Analyst's execution

### Requirement 8

**User Story:** As a trading analyst, I want the system to cache social media data, so that I can reduce API calls, improve performance, and access historical sentiment trends.

#### Acceptance Criteria

1. THE Twitter Monitor System SHALL cache all fetched tweets and Stocktwits messages in the local data cache directory
2. WHEN fetching data for a ticker, THE System SHALL first check the cache for recent data within the configured cache duration
3. THE System SHALL store cached data with timestamps to enable cache expiration logic
4. WHEN cached data is used, THE System SHALL log that cached data is being returned
5. THE System SHALL organize cached data by ticker symbol and date for efficient retrieval and management

### Requirement 9

**User Story:** As a system administrator, I want to easily add or remove Twitter accounts from monitoring, so that I can adapt to changes in account quality or relevance over time.

#### Acceptance Criteria

1. THE Twitter Monitor System SHALL support adding new Twitter accounts by updating the configuration file without code changes
2. THE System SHALL support removing Twitter accounts by deleting them from the configuration file
3. WHEN the configuration is updated, THE System SHALL reload the account list on the next analysis run
4. THE System SHALL validate that configured Twitter accounts exist and are accessible via Nitter
5. WHEN an invalid account is configured, THE System SHALL log a warning and skip that account without failing

### Requirement 10

**User Story:** As a trading analyst, I want to see which Twitter accounts are most influential for a given ticker, so that I can understand which sources are driving sentiment.

#### Acceptance Criteria

1. WHEN generating a sentiment report, THE System SHALL include attribution showing which Twitter accounts contributed to the analysis
2. THE System SHALL rank Twitter accounts by relevance based on the number of ticker mentions and engagement metrics
3. THE System SHALL include sample tweets from the most influential accounts in the sentiment report
4. WHEN multiple accounts discuss the same topic, THE System SHALL identify consensus views and contrarian opinions
5. THE System SHALL provide a breakdown of sentiment by account category (technical analysts, news sources, influencers)
