# Design Document

## Overview

This design outlines the implementation of browser notifications and chart regeneration features for the Coach Dashboard. The solution integrates with existing infrastructure (C1 API, Alpha Vantage MCP) while adding new client-side capabilities for notifications and chart generation.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Coach Dashboard (React)                  │
│  ┌────────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │  Notification  │  │    Chart     │  │   Dashboard     │ │
│  │    Manager     │  │  Generator   │  │   Component     │ │
│  └────────────────┘  └──────────────┘  └─────────────────┘ │
│           │                  │                    │          │
└───────────┼──────────────────┼────────────────────┼──────────┘
            │                  │                    │
            ▼                  ▼                    ▼
    ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
    │   Browser    │   │ Alpha Vantage│   │   C1 API     │
    │ Notification │   │     MCP      │   │  (Flask)     │
    │     API      │   │   (Market    │   │ (Coach Plans)│
    │              │   │    Data)     │   │              │
    └──────────────┘   └──────────────┘   └──────────────┘
```

### Component Interaction Flow

1. **Dashboard polls C1 API** every 30 seconds for new plans
2. **Notification Manager** compares new plans with previous state
3. **If new plan detected** → trigger browser notification
4. **Chart Generator** parses plan text for ticker/timeframe
5. **Fetch market data** via Alpha Vantage MCP or yfinance
6. **Generate chart** using Lightweight Charts library
7. **Cache result** in localStorage for 5 minutes
8. **Display chart** in dashboard card

## Components and Interfaces

### 1. Notification Manager

**Purpose:** Handle browser notification permissions, creation, and user preferences.

**File:** `aiapp/src/lib/notifications.ts`

```typescript
interface NotificationPreferences {
  enabled: boolean;
  coaches: {
    coach_d: boolean;
    coach_i: boolean;
    coach_s: boolean;
    coach_n: boolean;
  };
  minInterval: number; // seconds between notifications
  sound: boolean;
}

class NotificationManager {
  // Request permission from browser
  async requestPermission(): Promise<NotificationPermission>
  
  // Show notification for new coach plan
  showPlanNotification(coachKey: string, planPreview: string): void
  
  // Check if enough time has passed since last notification
  canNotify(coachKey: string): boolean
  
  // Load/save preferences from localStorage
  getPreferences(): NotificationPreferences
  savePreferences(prefs: NotificationPreferences): void
  
  // Test notification
  testNotification(): void
}
```

### 2. Chart Generator

**Purpose:** Extract ticker data, fetch market data, and generate charts.

**File:** `aiapp/src/lib/chartGenerator.ts`

```typescript
interface ChartData {
  ticker: string;
  timeframe: string;
  data: OHLCVData[];
  generatedAt: number;
}

interface OHLCVData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

class ChartGenerator {
  // Parse ticker and timeframe from plan text
  extractTickerInfo(planText: string): { ticker: string; timeframe: string } | null
  
  // Fetch market data via Alpha Vantage MCP
  async fetchMarketData(ticker: string, timeframe: string): Promise<OHLCVData[]>
  
  // Generate chart image/component
  generateChart(data: OHLCVData[], options: ChartOptions): ChartComponent
  
  // Cache management
  getCachedChart(ticker: string, timeframe: string): ChartData | null
  cacheChart(ticker: string, timeframe: string, data: ChartData): void
  clearOldCache(): void
}
```

### 3. Chart Display Component

**Purpose:** Render interactive charts with custom styling.

**File:** `aiapp/src/components/ChartDisplay.tsx`

```typescript
interface ChartDisplayProps {
  ticker: string;
  timeframe: string;
  data: OHLCVData[];
  theme: 'light' | 'dark';
  watermark?: string;
}

// Uses Lightweight Charts library
// Displays candlestick + volume
// Includes zoom/pan controls
// Shows watermark overlay
```

### 4. Settings Panel Component

**Purpose:** UI for managing notification and chart preferences.

**File:** `aiapp/src/components/SettingsPanel.tsx`

```typescript
interface SettingsPanelProps {
  preferences: NotificationPreferences;
  onSave: (prefs: NotificationPreferences) => void;
}

// Toggle notifications on/off
// Enable/disable per coach
// Set notification interval
// Test notification button
// Chart theme selection
```

### 5. Enhanced Dashboard Component

**Purpose:** Integrate notifications and charts into existing dashboard.

**File:** `aiapp/src/components/CoachDashboard_Simple.tsx` (enhanced)

**Changes:**
- Add notification manager initialization
- Compare previous/current plans to detect new ones
- Trigger notifications on new plans
- Display generated charts alongside plan text
- Add settings button to open preferences panel

## Data Models

### LocalStorage Schema

```typescript
// Notification preferences
localStorage.setItem('coach-dashboard-notifications', JSON.stringify({
  enabled: true,
  coaches: { coach_d: true, coach_i: true, coach_s: true, coach_n: true },
  minInterval: 300, // 5 minutes
  sound: false,
  lastNotificationTime: { coach_d: 0, coach_i: 0, coach_s: 0, coach_n: 0 }
}));

// Chart cache
localStorage.setItem('coach-dashboard-charts', JSON.stringify({
  'AAPL-1D': { ticker: 'AAPL', timeframe: '1D', data: [...], generatedAt: 1234567890 },
  'TSLA-4H': { ticker: 'TSLA', timeframe: '4H', data: [...], generatedAt: 1234567890 }
}));

// Settings
localStorage.setItem('coach-dashboard-settings', JSON.stringify({
  chartTheme: 'light',
  showOriginalCharts: false,
  autoGenerateCharts: true
}));
```

## Error Handling

### Notification Errors

1. **Permission Denied**
   - Show one-time banner: "Enable notifications in browser settings to get alerts"
   - Continue dashboard functionality normally
   - Don't repeatedly ask for permission

2. **Notification API Not Supported**
   - Detect on load: `if (!('Notification' in window))`
   - Hide notification settings
   - Show info message in settings panel

### Chart Generation Errors

1. **Ticker Extraction Failed**
   - Log warning
   - Skip chart generation
   - Show original chart URL if available

2. **API Rate Limit Reached**
   - Show friendly message: "Chart generation temporarily unavailable (rate limit)"
   - Display original chart URL as fallback
   - Cache error state to avoid repeated attempts

3. **Invalid Market Data**
   - Validate OHLCV data structure
   - Show error message in chart area
   - Provide "Retry" button

4. **Network Errors**
   - Retry once after 2 seconds
   - If still fails, show fallback
   - Cache failure to avoid repeated attempts

## Testing Strategy

### Unit Tests

1. **Notification Manager**
   - Test permission request flow
   - Test notification throttling (minInterval)
   - Test preference save/load
   - Mock browser Notification API

2. **Chart Generator**
   - Test ticker extraction with various text formats
   - Test timeframe parsing
   - Test cache hit/miss logic
   - Mock Alpha Vantage API responses

3. **Chart Display**
   - Test rendering with valid data
   - Test error states
   - Test theme switching
   - Test watermark display

### Integration Tests

1. **End-to-End Notification Flow**
   - New plan arrives → notification shows
   - Click notification → dashboard focuses
   - Throttling works correctly

2. **End-to-End Chart Generation**
   - Plan with ticker → chart generated
   - Cache works correctly
   - Fallback to URL on error

### Manual Testing

1. Test in multiple browsers (Chrome, Firefox, Edge)
2. Test with notifications enabled/disabled
3. Test with various ticker formats in plan text
4. Test API rate limiting behavior
5. Test cache expiration
6. Test settings persistence across sessions

## Implementation Notes

### Libraries to Use

1. **Lightweight Charts** (by TradingView)
   - Pros: Fast, professional, TradingView-style
   - Cons: Slightly larger bundle size
   - Install: `npm install lightweight-charts`

2. **Browser Notification API**
   - Native browser API, no library needed
   - Check support: `'Notification' in window`

3. **Alpha Vantage MCP**
   - Already configured in your system
   - Use existing MCP tools for data fetching

### Performance Considerations

1. **Chart Caching**
   - Cache for 5 minutes (configurable)
   - Use ticker+timeframe as cache key
   - Implement LRU eviction if cache grows large

2. **Lazy Loading**
   - Only generate charts when card is visible
   - Use Intersection Observer API
   - Load chart library on demand

3. **API Rate Limiting**
   - Track API calls per minute
   - Queue requests if approaching limit
   - Show loading state during queue

### Security Considerations

1. **Input Validation**
   - Sanitize ticker symbols (alphanumeric only)
   - Validate timeframe values against whitelist
   - Prevent XSS in plan text display

2. **API Key Protection**
   - Alpha Vantage API calls go through MCP (server-side)
   - Never expose API keys in client code

3. **LocalStorage Limits**
   - Monitor storage usage
   - Implement cleanup for old data
   - Handle QuotaExceededError gracefully

## Deployment Considerations

1. **Browser Compatibility**
   - Notification API: Chrome 22+, Firefox 22+, Safari 7+
   - Lightweight Charts: All modern browsers
   - Provide graceful degradation for older browsers

2. **Mobile Support**
   - Notifications work on mobile browsers
   - Charts are responsive and touch-friendly
   - Consider reduced chart complexity on mobile

3. **Progressive Enhancement**
   - Dashboard works without notifications
   - Dashboard works without generated charts
   - Each feature is optional and independent
