# Design Document

## Overview

This document outlines the technical design for implementing a comprehensive sidebar navigation system in the C1 Dashboard. The design transforms the current tab-based interface into a professional sidebar layout with seven distinct sections, providing better organization and scalability for future features.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Dashboard Page                        │
│  ┌──────────┬──────────────────────────────────────┐   │
│  │          │                                       │   │
│  │ Sidebar  │        Main Content Area             │   │
│  │          │                                       │   │
│  │ Nav      │   <ActiveSection />                  │   │
│  │ Items    │                                       │   │
│  │          │                                       │   │
│  └──────────┴──────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
DashboardLayout
├── Sidebar
│   ├── Logo
│   ├── NavigationItems[]
│   │   ├── NavItem (Home)
│   │   ├── NavItem (Coaches)
│   │   ├── NavItem (Social)
│   │   ├── NavItem (Analyze)
│   │   ├── NavItem (Backtest)
│   │   ├── NavItem (Risk)
│   │   └── NavItem (Settings)
│   └── UserProfile
│
└── MainContent
    ├── HomeSection
    ├── CoachesSection
    ├── SocialSection
    ├── AnalyzeSection
    ├── BacktestSection
    ├── RiskSection
    └── SettingsSection
```

## Components and Interfaces

### 1. DashboardLayout Component

**Purpose**: Main layout container that manages sidebar and content area

**Props**:
```typescript
interface DashboardLayoutProps {
  children?: React.ReactNode;
}
```

**State**:
```typescript
interface DashboardLayoutState {
  activeSection: SectionType;
  sidebarCollapsed: boolean;
  isMobile: boolean;
}

type SectionType = 'home' | 'coaches' | 'social' | 'analyze' | 'backtest' | 'risk' | 'settings';
```

**Responsibilities**:
- Manage active section state
- Handle mobile/desktop layout switching
- Persist active section to localStorage
- Provide section navigation context

### 2. Sidebar Component

**Purpose**: Navigation sidebar with section links

**Props**:
```typescript
interface SidebarProps {
  activeSection: SectionType;
  onSectionChange: (section: SectionType) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  isMobile: boolean;
}
```

**Features**:
- Responsive design (full width on desktop, overlay on mobile)
- Active state highlighting
- Smooth transitions
- Keyboard navigation support

**Styling**:
- Width: 240px (desktop), 100% (mobile overlay)
- Background: gradient from slate-800 to slate-900
- Active item: blue-600 background with border-left accent
- Hover effects: subtle background lightening

### 3. NavItem Component

**Purpose**: Individual navigation item

**Props**:
```typescript
interface NavItemProps {
  section: SectionType;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
  collapsed: boolean;
}
```

**States**:
- Default: gray-300 text, transparent background
- Hover: gray-100 text, white/10 background
- Active: white text, blue-600 background, blue-400 left border
- Focus: blue-500 ring outline

### 4. HomeSection Component

**Purpose**: Dashboard overview with recent activity and quick stats

**State**:
```typescript
interface HomeSectionState {
  recentActivity: Activity[];
  quickStats: QuickStats;
  loading: boolean;
}

interface Activity {
  id: string;
  type: 'analysis' | 'coach_plan' | 'sentiment';
  title: string;
  timestamp: Date;
  summary: string;
}

interface QuickStats {
  totalAnalyses: number;
  avgWinRate: number;
  recentReturn: number;
  activeCoaches: number;
}
```

**Layout**:
```
┌─────────────────────────────────────────┐
│  Welcome back! Today is [Date]          │
├─────────────────────────────────────────┤
│  Recent Activity                        │
│  • NVDA analysis completed              │
│  • New coach plan from Day Trading      │
│  • Twitter sentiment: Bullish on AAPL   │
├─────────────────────────────────────────┤
│  Quick Stats                            │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │
│  │ 24   │ │ 65%  │ │ +2.3%│ │  4   │  │
│  │Analys│ │Win   │ │Return│ │Active│  │
│  └──────┘ └──────┘ └──────┘ └──────┘  │
├─────────────────────────────────────────┤
│  Quick Actions                          │
│  [Run Analysis] [View Coaches]          │
└─────────────────────────────────────────┘
```

### 5. AnalyzeSection Component

**Purpose**: Run new stock analyses

**State**:
```typescript
interface AnalyzeSectionState {
  ticker: string;
  selectedAnalysts: AnalystType[];
  config: AnalysisConfig;
  running: boolean;
  results: AnalysisResults | null;
  error: string | null;
}

type AnalystType = 'market' | 'fundamentals' | 'news' | 'social';

interface AnalysisConfig {
  maxDebateRounds: number;
  deepThinkModel: string;
  quickThinkModel: string;
}

interface AnalysisResults {
  ticker: string;
  timestamp: Date;
  analystReports: Record<AnalystType, string>;
  bullArguments: string[];
  bearArguments: string[];
  finalDecision: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  reasoning: string;
}
```

**API Integration**:
```typescript
// POST /api/analyze
interface AnalyzeRequest {
  ticker: string;
  analysts: AnalystType[];
  config: AnalysisConfig;
}

interface AnalyzeResponse {
  success: boolean;
  results?: AnalysisResults;
  error?: string;
}
```

**Layout**:
```
┌─────────────────────────────────────────┐
│  Run Stock Analysis                     │
├─────────────────────────────────────────┤
│  Ticker: [____]                         │
│                                         │
│  Select Analysts:                       │
│  ☑ Market Analyst                       │
│  ☑ Fundamentals Analyst                 │
│  ☐ News Analyst                         │
│  ☐ Social Analyst                       │
│                                         │
│  Configuration:                         │
│  Debate Rounds: [1] ▼                   │
│  Model: [gpt-4o-mini] ▼                 │
│                                         │
│  [Run Analysis]                         │
├─────────────────────────────────────────┤
│  Results (when available)               │
│  • Analyst Reports                      │
│  • Bull/Bear Arguments                  │
│  • Final Decision                       │
└─────────────────────────────────────────┘
```

### 6. BacktestSection Component

**Purpose**: Run historical backtests

**State**:
```typescript
interface BacktestSectionState {
  ticker: string;
  startDate: Date;
  endDate: Date;
  strategy: string;
  running: boolean;
  results: BacktestResults | null;
  error: string | null;
}

interface BacktestResults {
  ticker: string;
  period: { start: Date; end: Date };
  totalReturn: number;
  winRate: number;
  sharpeRatio: number;
  maxDrawdown: number;
  trades: Trade[];
  equityCurve: DataPoint[];
}

interface Trade {
  date: Date;
  action: 'BUY' | 'SELL';
  price: number;
  quantity: number;
  pnl: number;
}

interface DataPoint {
  date: Date;
  value: number;
}
```

**API Integration**:
```typescript
// POST /api/backtest
interface BacktestRequest {
  ticker: string;
  startDate: string;
  endDate: string;
  strategy: string;
}

interface BacktestResponse {
  success: boolean;
  results?: BacktestResults;
  error?: string;
}
```

### 7. RiskSection Component

**Purpose**: Portfolio risk analysis and position sizing

**State**:
```typescript
interface RiskSectionState {
  portfolioValue: number;
  riskTolerance: number; // percentage
  positions: Position[];
  calculations: RiskCalculations | null;
}

interface Position {
  ticker: string;
  shares: number;
  entryPrice: number;
  currentPrice: number;
}

interface RiskCalculations {
  portfolioRisk: number;
  positionSizes: Record<string, number>;
  stopLosses: Record<string, number>;
  riskRewardRatios: Record<string, number>;
  totalExposure: number;
}
```

**Calculations** (Client-side, no API cost):
```typescript
// Position sizing: Kelly Criterion or fixed percentage
function calculatePositionSize(
  portfolioValue: number,
  riskPerTrade: number,
  stopLossPercent: number
): number {
  return (portfolioValue * riskPerTrade) / stopLossPercent;
}

// Stop-loss calculation
function calculateStopLoss(
  entryPrice: number,
  riskPercent: number
): number {
  return entryPrice * (1 - riskPercent);
}

// Risk/Reward ratio
function calculateRiskReward(
  entryPrice: number,
  stopLoss: number,
  target: number
): number {
  const risk = entryPrice - stopLoss;
  const reward = target - entryPrice;
  return reward / risk;
}
```

## Data Models

### Navigation State

```typescript
interface NavigationState {
  activeSection: SectionType;
  history: SectionType[];
  sidebarCollapsed: boolean;
}
```

### User Preferences

```typescript
interface UserPreferences {
  theme: 'light' | 'dark';
  defaultSection: SectionType;
  notifications: NotificationPreferences;
  apiConfig: APIConfig;
}

interface NotificationPreferences {
  enableNotifications: boolean;
  coachNotifications: Record<string, boolean>;
  analysisNotifications: boolean;
}

interface APIConfig {
  backendUrl: string;
  timeout: number;
}
```

### Local Storage Schema

```typescript
// Key: 'dashboard_state'
interface DashboardState {
  activeSection: SectionType;
  timestamp: number;
}

// Key: 'user_preferences'
interface StoredPreferences extends UserPreferences {
  version: string;
}

// Key: 'analysis_cache'
interface AnalysisCache {
  [ticker: string]: {
    results: AnalysisResults;
    timestamp: number;
  };
}
```

## Error Handling

### Error Types

```typescript
enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_ERROR = 'API_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
}

interface AppError {
  type: ErrorType;
  message: string;
  details?: any;
  retryable: boolean;
}
```

### Error Handling Strategy

1. **Network Errors**: Show retry button, cache last successful data
2. **API Errors**: Display error message from backend, log to console
3. **Validation Errors**: Show inline validation messages
4. **Timeout Errors**: Show timeout message with retry option

### Error Boundaries

```typescript
<ErrorBoundary
  fallback={<ErrorFallback />}
  onError={(error, errorInfo) => {
    console.error('Section error:', error, errorInfo);
  }}
>
  <ActiveSection />
</ErrorBoundary>
```

## Testing Strategy

### Unit Tests

1. **Component Tests**:
   - Sidebar navigation item rendering
   - Active state highlighting
   - Mobile collapse/expand behavior
   - Section switching logic

2. **Hook Tests**:
   - useNavigation hook state management
   - useLocalStorage persistence
   - useMediaQuery responsive behavior

3. **Utility Tests**:
   - Risk calculation functions
   - Date formatting utilities
   - Validation functions

### Integration Tests

1. **Navigation Flow**:
   - Click navigation item → section displays
   - Browser back/forward → correct section
   - Keyboard shortcuts → section changes

2. **API Integration**:
   - Run analysis → results display
   - Run backtest → charts render
   - Error handling → error message shows

3. **State Persistence**:
   - Select section → refresh page → section restored
   - Change preferences → reload → preferences saved

### E2E Tests (Optional)

1. Complete user journey: Home → Analyze → View Results
2. Mobile responsive behavior
3. Keyboard navigation flow

## Performance Considerations

### Code Splitting

```typescript
// Lazy load section components
const HomeSection = lazy(() => import('./sections/HomeSection'));
const AnalyzeSection = lazy(() => import('./sections/AnalyzeSection'));
const BacktestSection = lazy(() => import('./sections/BacktestSection'));
// ... etc
```

### Memoization

```typescript
// Memoize expensive calculations
const riskCalculations = useMemo(
  () => calculateRisk(portfolioValue, positions),
  [portfolioValue, positions]
);

// Memoize components that don't change often
const Sidebar = memo(SidebarComponent);
```

### Caching Strategy

1. **API Response Caching**: 5 minutes for analysis results
2. **Component State Caching**: Preserve section state when switching
3. **Image Caching**: Use browser cache for static assets

### Bundle Size Optimization

1. Tree-shake unused code
2. Use dynamic imports for sections
3. Minimize third-party dependencies
4. Use production builds

## Accessibility

### ARIA Labels

```typescript
<nav aria-label="Main navigation">
  <button
    aria-label="Navigate to Home section"
    aria-current={active ? 'page' : undefined}
  >
    Home
  </button>
</nav>
```

### Keyboard Navigation

- Tab: Move focus through navigation items
- Enter/Space: Activate focused item
- Alt+1-7: Jump to specific section
- Escape: Close mobile sidebar

### Screen Reader Support

- Semantic HTML (nav, main, section, article)
- Proper heading hierarchy
- Live regions for dynamic content updates
- Focus management on section changes

### Color Contrast

- Text: 4.5:1 minimum contrast ratio
- Interactive elements: 3:1 minimum
- Focus indicators: Visible and high contrast

## Security Considerations

### Input Validation

```typescript
// Ticker validation
function validateTicker(ticker: string): boolean {
  return /^[A-Z]{1,5}$/.test(ticker);
}

// Date validation
function validateDateRange(start: Date, end: Date): boolean {
  return start < end && end <= new Date();
}
```

### API Security

- Use HTTPS for all API calls
- Implement CORS properly
- Sanitize user inputs before sending to backend
- Handle API keys securely (environment variables)

### XSS Prevention

- Sanitize all user-generated content
- Use React's built-in XSS protection
- Avoid dangerouslySetInnerHTML unless necessary

## Deployment Considerations

### Environment Variables

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_CACHE_DURATION=300000
```

### Build Configuration

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest"
  }
}
```

### Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Migration Strategy

### Phase 1: Layout Structure (No Breaking Changes)

1. Create new DashboardLayout component
2. Implement Sidebar component
3. Add navigation state management
4. Test on development environment

### Phase 2: Section Integration

1. Wrap existing Coaches section
2. Wrap existing Social section
3. Create new Home section
4. Test navigation between sections

### Phase 3: New Features

1. Implement Analyze section
2. Implement Backtest section
3. Implement Risk section
4. Enhance Settings section

### Phase 4: Polish and Optimization

1. Add animations and transitions
2. Optimize performance
3. Conduct accessibility audit
4. User acceptance testing

## Future Enhancements

1. **Real-time Updates**: WebSocket integration for live data
2. **Collaborative Features**: Share analyses with team members
3. **Advanced Charting**: Interactive TradingView-style charts
4. **Portfolio Tracking**: Track multiple portfolios
5. **Alerts System**: Custom price and sentiment alerts
6. **Mobile App**: Native iOS/Android applications
