# Implementation Plan

- [x] 1. Set up project dependencies and configuration





  - Install lightweight-charts library for chart rendering
  - Configure TypeScript types for Notification API
  - Set up localStorage utility functions
  - _Requirements: 1.1, 3.1_

- [x] 2. Implement Notification Manager





- [x] 2.1 Create NotificationManager class with permission handling


  - Write NotificationManager class in `aiapp/src/lib/notifications.ts`
  - Implement requestPermission() method using browser Notification API
  - Add permission state checking and error handling
  - _Requirements: 1.2, 1.3_

- [x] 2.2 Implement notification preferences system

  - Create NotificationPreferences interface
  - Implement getPreferences() and savePreferences() methods
  - Add localStorage persistence for user preferences
  - Implement default preferences for first-time users
  - _Requirements: 5.1, 5.4_

- [x] 2.3 Add notification throttling and display logic

  - Implement canNotify() method with time-based throttling
  - Create showPlanNotification() method to display notifications
  - Add notification click handler to focus dashboard
  - Implement per-coach notification tracking
  - _Requirements: 1.1, 1.4, 5.3_

- [x] 2.4 Add notification testing utilities

  - Implement testNotification() method for user testing
  - Add debug logging for notification events
  - _Requirements: 5.5_

- [x] 3. Implement Chart Generator





- [x] 3.1 Create ticker and timeframe extraction logic


  - Write ChartGenerator class in `aiapp/src/lib/chartGenerator.ts`
  - Implement extractTickerInfo() with regex patterns for common formats
  - Add validation for extracted ticker symbols
  - Handle various timeframe formats (1D, 4H, 15min, etc.)
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 3.2 Implement market data fetching via Alpha Vantage MCP


  - Create fetchMarketData() method using Alpha Vantage MCP tools
  - Map timeframes to appropriate Alpha Vantage intervals
  - Transform API response to OHLCVData format
  - Add error handling for API failures
  - _Requirements: 3.1, 3.5, 3.6_

- [x] 3.3 Add chart caching system

  - Implement getCachedChart() and cacheChart() methods
  - Create cache key generation from ticker and timeframe
  - Add timestamp-based cache expiration (5 minutes)
  - Implement clearOldCache() for cleanup
  - Store cache in localStorage with size limits
  - _Requirements: 3.7, 6.2, 6.3, 6.4_

- [x] 3.4 Add fallback and error handling


  - Implement fallback to original chart URLs on failure
  - Add retry logic for transient errors
  - Handle API rate limiting gracefully
  - Log errors for debugging
  - _Requirements: 3.8, 6.6_

- [x] 4. Create Chart Display Component






- [x] 4.1 Build ChartDisplay React component

  - Create ChartDisplay component in `aiapp/src/components/ChartDisplay.tsx`
  - Integrate Lightweight Charts library
  - Implement candlestick chart rendering
  - Add volume bars below price chart
  - _Requirements: 3.2, 3.4_


- [x] 4.2 Add chart styling and customization
  - Implement theme support (light/dark)
  - Apply custom color schemes matching dashboard
  - Add watermark overlay "Generated from public market data"
  - Make chart responsive for different screen sizes
  - _Requirements: 4.1, 4.2, 4.3_


- [x] 4.3 Implement chart interactivity
  - Add zoom and pan controls
  - Implement crosshair for price/time display
  - Add loading state during data fetch
  - Handle empty or invalid data gracefully
  - _Requirements: 4.5, 6.5_

- [x] 5. Create Settings Panel Component





- [x] 5.1 Build SettingsPanel UI component


  - Create SettingsPanel component in `aiapp/src/components/SettingsPanel.tsx`
  - Add toggle for global notification enable/disable
  - Create per-coach notification toggles
  - Add notification interval slider/input
  - _Requirements: 5.1, 5.2, 5.3_


- [x] 5.2 Implement settings persistence and testing

  - Connect settings to NotificationManager
  - Save changes to localStorage on update
  - Add "Test Notification" button
  - Show current notification permission status
  - _Requirements: 5.4, 5.5_

- [x] 6. Integrate features into Dashboard





- [x] 6.1 Enhance CoachDashboard component with notifications


  - Initialize NotificationManager on component mount
  - Request notification permission on first visit
  - Compare previous and current plans to detect new ones
  - Trigger notifications for new plans
  - Store previous plans state for comparison
  - _Requirements: 1.1, 1.2, 1.5_

- [x] 6.2 Add chart generation to dashboard cards


  - Integrate ChartGenerator into dashboard
  - Parse plan text for ticker information
  - Generate charts for plans with valid ticker data
  - Display generated charts in plan cards
  - Show loading state during generation
  - Fall back to original chart URLs on error
  - _Requirements: 2.1, 3.1, 3.2, 3.8_

- [x] 6.3 Add settings button and panel to dashboard


  - Add settings icon/button to dashboard header
  - Implement modal or slide-out panel for settings
  - Connect SettingsPanel component
  - Show notification permission status
  - _Requirements: 5.1_

- [x] 7. Add performance optimizations





- [x] 7.1 Implement lazy loading for charts


  - Use Intersection Observer to detect visible cards
  - Only generate charts for visible cards
  - Load chart library on demand
  - _Requirements: 6.1, 6.2_

- [x] 7.2 Add API rate limiting protection


  - Track API calls per minute
  - Queue chart generation requests if approaching limit
  - Show appropriate messages when rate limited
  - _Requirements: 6.1, 6.6_

- [x] 7.3 Optimize localStorage usage


  - Monitor localStorage size
  - Implement LRU eviction for chart cache
  - Handle QuotaExceededError gracefully
  - _Requirements: 6.4_

- [x] 8. Testing and validation




  - Test notification flow in multiple browsers
  - Verify chart generation with various ticker formats
  - Test cache expiration and cleanup
  - Validate settings persistence
  - Test error handling and fallbacks
  - Verify mobile responsiveness
  - _Requirements: All_
