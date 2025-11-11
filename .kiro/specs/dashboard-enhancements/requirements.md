# Requirements Document

## Introduction

This document outlines requirements for enhancing the Coach Dashboard with browser notifications for new coach plans and chart regeneration capabilities to avoid copyright issues while providing professional, customizable visualizations.

## Glossary

- **Dashboard**: The web-based Coach Dashboard displaying AI trading coach plans
- **Coach Plan**: A trading insight posted by an AI coach via Discord
- **Browser Notification**: Native OS notification shown when dashboard is not in focus
- **Chart Regeneration**: Creating new charts from raw market data instead of using external chart images
- **Notification Permission**: Browser API permission required to show notifications

## Requirements

### Requirement 1: Browser Notifications for New Coach Plans

**User Story:** As a trader, I want to receive browser notifications when new coach plans are posted, so that I can stay informed even when the dashboard is not actively visible.

#### Acceptance Criteria

1. WHEN THE Dashboard detects a new coach plan during its polling cycle, THE Dashboard SHALL display a browser notification
2. WHEN a user first visits THE Dashboard, THE Dashboard SHALL request notification permission from the browser
3. IF notification permission is denied, THEN THE Dashboard SHALL continue functioning without notifications
4. WHEN a notification is clicked, THE Dashboard SHALL bring the browser tab into focus and scroll to the new plan
5. THE Dashboard SHALL include the coach name and a preview of the plan text in the notification body

### Requirement 2: Chart Data Extraction and Parsing

**User Story:** As a system, I want to extract ticker symbols and timeframes from coach plan text, so that I can fetch the appropriate market data for chart generation.

#### Acceptance Criteria

1. WHEN THE Dashboard receives a coach plan with chart references, THE Dashboard SHALL parse the plan text to extract ticker symbols
2. THE Dashboard SHALL identify timeframe information from the plan text (e.g., "1D", "4H", "15min")
3. IF ticker or timeframe cannot be determined, THEN THE Dashboard SHALL use default values or skip chart generation
4. THE Dashboard SHALL validate extracted ticker symbols against known market symbols
5. THE Dashboard SHALL log extraction results for debugging purposes

### Requirement 3: Real-time Chart Generation

**User Story:** As a trader, I want to see professionally styled charts generated from real market data, so that I can visualize coach insights without copyright concerns.

#### Acceptance Criteria

1. WHEN THE Dashboard has valid ticker and timeframe data, THE Dashboard SHALL fetch OHLCV data from a market data provider
2. THE Dashboard SHALL generate an interactive chart using the fetched market data
3. THE Dashboard SHALL apply custom styling (colors, theme) that matches the dashboard design
4. THE Dashboard SHALL display the generated chart alongside or instead of external chart URLs
5. WHERE Alpha Vantage API is configured, THE Dashboard SHALL use Alpha Vantage as the data source
6. WHERE yfinance is available, THE Dashboard SHALL use yfinance as a fallback data source
7. THE Dashboard SHALL cache generated charts to avoid redundant API calls
8. IF chart generation fails, THEN THE Dashboard SHALL display the original chart URL as fallback

### Requirement 4: Chart Customization and Branding

**User Story:** As a system administrator, I want to customize chart appearance and add branding, so that charts are visually consistent with the dashboard and clearly marked as regenerated.

#### Acceptance Criteria

1. THE Dashboard SHALL allow configuration of chart color schemes via settings
2. THE Dashboard SHALL add a watermark or label indicating "Generated from public market data"
3. THE Dashboard SHALL support multiple chart types (candlestick, line, area)
4. THE Dashboard SHALL include volume bars when displaying OHLCV data
5. THE Dashboard SHALL provide zoom and pan controls for interactive exploration

### Requirement 5: Notification Settings and Preferences

**User Story:** As a trader, I want to control which coaches trigger notifications and notification frequency, so that I only receive alerts for relevant information.

#### Acceptance Criteria

1. THE Dashboard SHALL provide a settings panel for notification preferences
2. THE Dashboard SHALL allow users to enable/disable notifications per coach type
3. THE Dashboard SHALL allow users to set a minimum time interval between notifications
4. THE Dashboard SHALL remember user preferences across browser sessions
5. THE Dashboard SHALL provide a "Test Notification" button to verify notification setup

### Requirement 6: Performance and Resource Management

**User Story:** As a system, I want to manage API usage and browser resources efficiently, so that the dashboard remains responsive and cost-effective.

#### Acceptance Criteria

1. THE Dashboard SHALL limit chart generation API calls to avoid rate limits
2. THE Dashboard SHALL cache generated chart images in browser storage
3. THE Dashboard SHALL reuse cached charts when the same ticker and timeframe are requested within 5 minutes
4. THE Dashboard SHALL clean up old cached charts to prevent storage bloat
5. THE Dashboard SHALL display loading indicators during chart generation
6. IF API rate limit is reached, THEN THE Dashboard SHALL display a friendly error message and fall back to chart URLs
