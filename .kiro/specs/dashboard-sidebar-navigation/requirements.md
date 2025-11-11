# Requirements Document

## Introduction

This specification defines the requirements for adding a comprehensive sidebar navigation system to the C1 Dashboard. The enhancement will transform the current tab-based navigation into a professional sidebar layout with multiple sections including Home, Coaches, Social Sentiment, Analysis, Backtesting, Risk Management, and Settings. This will provide better organization, easier navigation, and a foundation for future feature expansion.

## Glossary

- **Dashboard**: The main C1 web application interface for viewing trading insights
- **Sidebar**: A vertical navigation panel on the left side of the screen
- **Section**: A distinct area of functionality accessible via sidebar navigation
- **Active Section**: The currently displayed section in the main content area
- **Mobile Breakpoint**: Screen width threshold (768px) where layout adapts for mobile devices
- **Collapsible Sidebar**: Sidebar that can be hidden/shown on mobile devices
- **Route State**: Application state that determines which section is displayed
- **TradingAgents Backend**: Python backend API that runs stock analyses
- **Coach Plans**: AI-generated trading insights from Discord coaches
- **Social Sentiment**: Twitter and Stocktwits sentiment analysis data

## Requirements

### Requirement 1: Sidebar Navigation Structure

**User Story:** As a dashboard user, I want a persistent sidebar navigation so that I can quickly access different sections of the application.

#### Acceptance Criteria

1. WHEN the Dashboard loads, THE Dashboard SHALL display a sidebar on the left side of the screen with navigation items
2. THE Sidebar SHALL contain seven navigation items: Home, Coaches, Social, Analyze, Backtest, Risk, and Settings
3. WHEN a user clicks a navigation item, THE Dashboard SHALL display the corresponding section in the main content area
4. THE Sidebar SHALL visually indicate which section is currently active with highlighting
5. WHILE a section is active, THE Sidebar SHALL maintain the active state indicator until a different section is selected

### Requirement 2: Home Section

**User Story:** As a dashboard user, I want a home overview section so that I can see a summary of recent activity and quick stats at a glance.

#### Acceptance Criteria

1. WHEN the Dashboard loads, THE Dashboard SHALL display the Home section by default
2. THE Home Section SHALL display a welcome message with the current date
3. THE Home Section SHALL display recent activity including latest analyses, new coach plans, and sentiment updates
4. THE Home Section SHALL display quick statistics including total analyses run and recent performance metrics
5. THE Home Section SHALL provide quick action buttons to navigate to Analyze and Coaches sections

### Requirement 3: Coaches Section Integration

**User Story:** As a dashboard user, I want to view coach plans in the sidebar navigation so that the interface is consistent with other sections.

#### Acceptance Criteria

1. WHEN a user selects the Coaches navigation item, THE Dashboard SHALL display the existing coach plans grid
2. THE Coaches Section SHALL maintain all existing functionality including auto-refresh and notifications
3. THE Coaches Section SHALL display coach cards in a responsive grid layout
4. THE Coaches Section SHALL fetch coach plans from the backend API every 30 seconds
5. THE Coaches Section SHALL show loading states while fetching data

### Requirement 4: Social Sentiment Section Integration

**User Story:** As a dashboard user, I want to view social sentiment in the sidebar navigation so that I can access Twitter and Stocktwits data easily.

#### Acceptance Criteria

1. WHEN a user selects the Social navigation item, THE Dashboard SHALL display the Twitter feed panel
2. THE Social Section SHALL include a ticker input field for filtering tweets
3. THE Social Section SHALL display the TwitterFeedPanel component with all existing features
4. THE Social Section SHALL maintain auto-refresh functionality for tweets
5. THE Social Section SHALL include the optional Stocktwits panel toggle

### Requirement 5: Analyze Section

**User Story:** As a dashboard user, I want to run new stock analyses from the dashboard so that I don't need to use command-line tools.

#### Acceptance Criteria

1. WHEN a user selects the Analyze navigation item, THE Dashboard SHALL display an analysis configuration form
2. THE Analyze Section SHALL provide a ticker input field that accepts valid stock symbols
3. THE Analyze Section SHALL provide analyst selection checkboxes for Market, Fundamentals, News, and Social analysts
4. THE Analyze Section SHALL provide a configuration panel for debate rounds and model selection
5. WHEN a user clicks "Run Analysis", THE Dashboard SHALL call the TradingAgents backend API and display a loading state
6. WHEN the analysis completes, THE Dashboard SHALL display analyst reports, debate transcripts, and final trading decision
7. IF the analysis fails, THEN THE Dashboard SHALL display an error message with retry option

### Requirement 6: Backtest Section

**User Story:** As a dashboard user, I want to run historical backtests from the dashboard so that I can validate trading strategies.

#### Acceptance Criteria

1. WHEN a user selects the Backtest navigation item, THE Dashboard SHALL display a backtest configuration form
2. THE Backtest Section SHALL provide ticker input, date range selection, and strategy configuration options
3. WHEN a user clicks "Run Backtest", THE Dashboard SHALL call the backtesting API and display a loading state
4. WHEN the backtest completes, THE Dashboard SHALL display performance metrics including win rate, total return, and Sharpe ratio
5. THE Backtest Section SHALL display equity curve and drawdown charts
6. THE Backtest Section SHALL provide an option to download backtest results as JSON

### Requirement 7: Risk Management Section

**User Story:** As a dashboard user, I want to analyze portfolio risk from the dashboard so that I can make informed position sizing decisions.

#### Acceptance Criteria

1. WHEN a user selects the Risk navigation item, THE Dashboard SHALL display a risk analysis form
2. THE Risk Section SHALL provide inputs for portfolio value, position size, and risk tolerance
3. THE Risk Section SHALL calculate and display risk metrics including position size recommendations and stop-loss levels
4. THE Risk Section SHALL display risk/reward ratio calculations
5. THE Risk Section SHALL provide a portfolio risk summary with visual indicators

### Requirement 8: Settings Section Enhancement

**User Story:** As a dashboard user, I want to configure application settings from the dashboard so that I can customize my experience.

#### Acceptance Criteria

1. WHEN a user selects the Settings navigation item, THE Dashboard SHALL display a settings configuration panel
2. THE Settings Section SHALL include notification preferences with toggles for each coach
3. THE Settings Section SHALL include API configuration options for backend URL
4. THE Settings Section SHALL include theme selection options (light/dark mode)
5. WHEN a user changes settings, THE Dashboard SHALL save preferences to localStorage

### Requirement 9: Mobile Responsive Design

**User Story:** As a mobile dashboard user, I want the sidebar to adapt to my screen size so that I can use the dashboard on any device.

#### Acceptance Criteria

1. WHEN the screen width is less than 768px, THE Dashboard SHALL display a collapsed sidebar with only icons visible
2. WHEN a mobile user taps the menu icon, THE Dashboard SHALL expand the sidebar as an overlay
3. WHEN a mobile user selects a navigation item, THE Dashboard SHALL close the sidebar overlay and display the selected section
4. WHEN a mobile user taps outside the sidebar overlay, THE Dashboard SHALL close the sidebar
5. THE Dashboard SHALL maintain touch-friendly tap targets with minimum 44px height

### Requirement 10: Navigation State Persistence

**User Story:** As a dashboard user, I want my selected section to persist across page refreshes so that I don't lose my place.

#### Acceptance Criteria

1. WHEN a user selects a section, THE Dashboard SHALL save the active section to localStorage
2. WHEN the Dashboard loads, THE Dashboard SHALL restore the previously active section from localStorage
3. IF no previous section is saved, THEN THE Dashboard SHALL default to the Home section
4. THE Dashboard SHALL update the browser URL to reflect the active section
5. WHEN a user navigates using browser back/forward buttons, THE Dashboard SHALL display the corresponding section

### Requirement 11: Loading and Error States

**User Story:** As a dashboard user, I want clear feedback when sections are loading or encounter errors so that I understand the application state.

#### Acceptance Criteria

1. WHEN a section is loading data, THE Dashboard SHALL display a loading skeleton or spinner
2. IF a section fails to load data, THEN THE Dashboard SHALL display an error message with details
3. THE Dashboard SHALL provide a retry button for failed operations
4. WHEN retrying a failed operation, THE Dashboard SHALL clear the previous error and show loading state
5. THE Dashboard SHALL display success notifications for completed operations

### Requirement 12: Keyboard Navigation

**User Story:** As a dashboard user, I want to navigate using keyboard shortcuts so that I can work more efficiently.

#### Acceptance Criteria

1. WHEN a user presses Alt+1 through Alt+7, THE Dashboard SHALL navigate to the corresponding section
2. WHEN a user presses the Tab key, THE Dashboard SHALL cycle focus through navigation items
3. WHEN a navigation item has focus and user presses Enter, THE Dashboard SHALL activate that section
4. WHEN a user presses Escape on mobile, THE Dashboard SHALL close the sidebar overlay
5. THE Dashboard SHALL display keyboard shortcuts in a help tooltip

### Requirement 13: Performance Optimization

**User Story:** As a dashboard user, I want the application to load quickly and respond smoothly so that I have a good user experience.

#### Acceptance Criteria

1. THE Dashboard SHALL lazy-load section components that are not immediately visible
2. THE Dashboard SHALL cache API responses for 5 minutes to reduce redundant requests
3. THE Dashboard SHALL debounce user inputs with 300ms delay to prevent excessive API calls
4. THE Dashboard SHALL use React.memo for components that don't need frequent re-renders
5. THE Dashboard SHALL achieve a Lighthouse performance score of 90 or higher

### Requirement 14: Accessibility Compliance

**User Story:** As a dashboard user with accessibility needs, I want the interface to be fully accessible so that I can use all features.

#### Acceptance Criteria

1. THE Dashboard SHALL provide ARIA labels for all interactive elements
2. THE Dashboard SHALL maintain proper heading hierarchy (h1, h2, h3)
3. THE Dashboard SHALL ensure color contrast ratios meet WCAG AA standards (4.5:1 for normal text)
4. THE Dashboard SHALL support screen reader navigation with semantic HTML
5. THE Dashboard SHALL provide focus indicators for all interactive elements
