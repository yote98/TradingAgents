# Dashboard Navigation Guide

## Overview

The C1 Dashboard features a comprehensive sidebar navigation system that provides easy access to all trading analysis tools and features. This guide covers all sections, keyboard shortcuts, and troubleshooting tips.

## Table of Contents

- [Getting Started](#getting-started)
- [Navigation Sections](#navigation-sections)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Mobile Usage](#mobile-usage)
- [Features by Section](#features-by-section)
- [Troubleshooting](#troubleshooting)
- [Tips & Best Practices](#tips--best-practices)

---

## Getting Started

### First Time Setup

1. **Access the Dashboard**: Navigate to `/dashboard` in your browser
2. **Default View**: The Home section loads by default
3. **Navigation**: Click any sidebar item to switch sections
4. **Persistence**: Your last viewed section is remembered across sessions

### Interface Layout

```
┌─────────────────────────────────────────────┐
│  ┌──────────┬──────────────────────────┐   │
│  │          │                           │   │
│  │ Sidebar  │    Main Content Area     │   │
│  │          │                           │   │
│  │ • Home   │   <Active Section>       │   │
│  │ • Coaches│                           │   │
│  │ • Social │                           │   │
│  │ • Analyze│                           │   │
│  │ • Backtest                           │   │
│  │ • Risk   │                           │   │
│  │ • Settings                           │   │
│  │          │                           │   │
│  └──────────┴──────────────────────────┘   │
└─────────────────────────────────────────────┘
```

---

## Navigation Sections

### 1. Home 🏠

**Purpose**: Dashboard overview with recent activity and quick stats

**Features**:
- Welcome message with current date
- Recent activity feed (analyses, coach plans, sentiment updates)
- Quick statistics cards (total analyses, win rate, recent returns)
- Quick action buttons to jump to Analyze or Coaches sections

**When to Use**: 
- Starting your trading day
- Getting a quick overview of recent activity
- Checking performance metrics at a glance

---

### 2. Coaches 👥

**Purpose**: View AI-generated trading insights from Discord coaches

**Features**:
- Real-time coach plans display
- Auto-refresh every 30 seconds
- Coach cards with timestamps and analysis
- Notification system for new plans
- Responsive grid layout

**When to Use**:
- Reviewing daily trading plans
- Getting insights from multiple coaching perspectives
- Monitoring coach activity and recommendations

**Tips**:
- Plans auto-refresh - no need to manually reload
- Click on coach cards for detailed analysis
- Enable notifications in Settings for instant alerts

---

### 3. Social 🐦

**Purpose**: Monitor Twitter and Stocktwits sentiment for stocks

**Features**:
- Twitter feed with real-time tweets
- Ticker-based filtering
- Sentiment analysis indicators
- Optional Stocktwits integration
- Auto-refresh functionality

**When to Use**:
- Gauging market sentiment for specific tickers
- Monitoring social media buzz
- Identifying trending stocks
- Tracking influencer opinions

**Tips**:
- Enter a ticker symbol to filter relevant tweets
- Toggle Stocktwits for additional social data
- Sentiment indicators help identify bullish/bearish trends

---

### 4. Analyze 📊

**Purpose**: Run comprehensive stock analyses using AI agents

**Features**:
- Ticker input with validation
- Analyst selection (Market, Fundamentals, News, Social)
- Configuration options (debate rounds, model selection)
- Real-time analysis execution
- Detailed results display with bull/bear arguments
- Final trading decision with confidence score

**When to Use**:
- Researching a new stock opportunity
- Getting multi-perspective analysis
- Validating trading ideas
- Preparing for trading decisions

**How to Use**:
1. Enter a valid stock ticker (e.g., AAPL, TSLA)
2. Select which analysts to include (minimum 1)
3. Configure debate rounds (1-3 recommended)
4. Choose LLM model (gpt-4o-mini for speed, o1-preview for depth)
5. Click "Run Analysis"
6. Review analyst reports and final decision

**Tips**:
- Use gpt-4o-mini for faster, cost-effective analyses
- Include all 4 analysts for comprehensive coverage
- Results are cached for 5 minutes to save API costs
- Higher debate rounds provide more thorough analysis but cost more

---

### 5. Backtest 📈

**Purpose**: Test trading strategies against historical data

**Features**:
- Ticker and date range selection
- Strategy configuration
- Performance metrics (win rate, total return, Sharpe ratio)
- Equity curve visualization
- Drawdown charts
- Trade history table
- Download results as JSON

**When to Use**:
- Validating trading strategies
- Analyzing historical performance
- Comparing different approaches
- Risk assessment before live trading

**How to Use**:
1. Enter stock ticker
2. Select start and end dates
3. Choose or configure strategy
4. Click "Run Backtest"
5. Review performance metrics and charts
6. Download results for further analysis

**Tips**:
- Use longer date ranges for more reliable results
- Compare multiple strategies on the same ticker
- Pay attention to max drawdown for risk assessment
- Results are cached to avoid redundant calculations

---

### 6. Risk 🛡️

**Purpose**: Analyze portfolio risk and calculate position sizing

**Features**:
- Portfolio value input
- Risk tolerance configuration
- Position sizing calculator (Kelly Criterion)
- Stop-loss level calculator
- Risk/reward ratio analysis
- Portfolio risk summary
- Visual risk indicators

**When to Use**:
- Before entering new positions
- Managing existing portfolio risk
- Setting stop-loss levels
- Determining appropriate position sizes

**How to Use**:
1. Enter your total portfolio value
2. Set your risk tolerance (% per trade)
3. Input position details (ticker, entry price)
4. Review calculated metrics:
   - Recommended position size
   - Stop-loss levels
   - Risk/reward ratios
   - Total portfolio exposure

**Tips**:
- All calculations are client-side (no API costs)
- Conservative risk tolerance: 1-2% per trade
- Aggressive risk tolerance: 3-5% per trade
- Never risk more than you can afford to lose
- Use stop-losses to protect capital

---

### 7. Settings ⚙️

**Purpose**: Configure dashboard preferences and API settings

**Features**:
- Notification preferences (per-coach toggles)
- API configuration (backend URL, timeout)
- Theme selection (light/dark mode)
- Auto-save to localStorage
- Settings validation

**When to Use**:
- First-time setup
- Customizing notification preferences
- Changing theme
- Updating API endpoints

**Configuration Options**:

**Notifications**:
- Enable/disable notifications globally
- Toggle notifications per coach
- Analysis completion alerts

**API Settings**:
- Backend URL (default: http://localhost:5000)
- Request timeout (default: 30 seconds)

**Appearance**:
- Light mode (default)
- Dark mode (coming soon)

---

## Keyboard Shortcuts

### Navigation Shortcuts

| Shortcut | Action |
|----------|--------|
| `Alt + 1` | Navigate to Home |
| `Alt + 2` | Navigate to Coaches |
| `Alt + 3` | Navigate to Social |
| `Alt + 4` | Navigate to Analyze |
| `Alt + 5` | Navigate to Backtest |
| `Alt + 6` | Navigate to Risk |
| `Alt + 7` | Navigate to Settings |

### General Shortcuts

| Shortcut | Action |
|----------|--------|
| `Tab` | Cycle through navigation items |
| `Enter` | Activate focused navigation item |
| `Escape` | Close mobile sidebar (mobile only) |
| `?` | Show keyboard shortcuts help |

### Tips for Keyboard Navigation

- Use `Tab` to move focus through the sidebar
- Press `Enter` when a section is focused to navigate
- Keyboard shortcuts work from anywhere in the dashboard
- Focus indicators show which element is currently selected

---

## Mobile Usage

### Mobile Layout

On screens smaller than 768px, the dashboard adapts to mobile:

1. **Collapsed Sidebar**: Sidebar shows only icons by default
2. **Menu Button**: Tap the hamburger menu to expand sidebar
3. **Overlay Mode**: Sidebar appears as an overlay on top of content
4. **Auto-Close**: Sidebar closes automatically after selecting a section

### Mobile Gestures

- **Tap Menu Icon**: Open sidebar
- **Tap Section**: Navigate and close sidebar
- **Tap Outside**: Close sidebar overlay
- **Swipe Left**: Close sidebar (if supported)

### Mobile Tips

- All touch targets are minimum 44px for easy tapping
- Sidebar overlay has a semi-transparent background
- Landscape mode provides more screen space
- All features work identically on mobile and desktop

---

## Features by Section

### Data Refresh Rates

| Section | Refresh Rate | Manual Refresh |
|---------|--------------|----------------|
| Home | On navigation | ✓ |
| Coaches | 30 seconds | ✓ |
| Social | 60 seconds | ✓ |
| Analyze | On demand | N/A |
| Backtest | On demand | N/A |
| Risk | Real-time | N/A |
| Settings | N/A | N/A |

### API Cost Estimates

| Section | Cost per Use | Notes |
|---------|--------------|-------|
| Home | $0 | Cached data only |
| Coaches | $0 | Fetches from database |
| Social | $0 | Fetches from Twitter API |
| Analyze | $0.01-$0.50 | Depends on analysts and model |
| Backtest | $0.01-$0.10 | Depends on date range |
| Risk | $0 | Client-side calculations |
| Settings | $0 | Local storage only |

### Performance Optimization

- **Code Splitting**: Sections load on-demand
- **Caching**: API responses cached for 5 minutes
- **Lazy Loading**: Images and charts load as needed
- **Memoization**: Expensive calculations are cached
- **Debouncing**: User inputs debounced by 300ms

---

## Troubleshooting

### Common Issues

#### 1. Sidebar Not Displaying

**Symptoms**: Sidebar is missing or not visible

**Solutions**:
- Refresh the page (Ctrl+R or Cmd+R)
- Clear browser cache and reload
- Check browser console for errors (F12)
- Verify you're on the `/dashboard` route

#### 2. Section Not Loading

**Symptoms**: Blank content area or loading spinner stuck

**Solutions**:
- Check your internet connection
- Verify backend API is running (Settings → API Config)
- Check browser console for network errors
- Try navigating to a different section and back

#### 3. Analysis Fails to Run

**Symptoms**: Error message when running analysis

**Possible Causes**:
- Invalid ticker symbol
- Backend API not running
- API key not configured
- Network timeout

**Solutions**:
- Verify ticker symbol is valid (e.g., AAPL, not Apple)
- Check backend is running: `python c1_api_server.py`
- Verify API keys in `.env` file
- Increase timeout in Settings if needed
- Check backend logs for detailed errors

#### 4. Backtest Not Completing

**Symptoms**: Backtest hangs or fails

**Solutions**:
- Reduce date range (try 3-6 months first)
- Verify ticker has historical data for selected dates
- Check backend logs for errors
- Ensure sufficient system memory

#### 5. Keyboard Shortcuts Not Working

**Symptoms**: Alt+Number shortcuts don't navigate

**Solutions**:
- Ensure no input field is focused
- Try clicking outside any input first
- Check if browser extensions are intercepting shortcuts
- Use Tab+Enter navigation as alternative

#### 6. Mobile Sidebar Won't Close

**Symptoms**: Sidebar stays open on mobile

**Solutions**:
- Tap outside the sidebar area
- Press the Escape key
- Tap a navigation item to close automatically
- Refresh the page if stuck

#### 7. Settings Not Saving

**Symptoms**: Settings reset after page reload

**Solutions**:
- Check browser localStorage is enabled
- Verify you're not in private/incognito mode
- Clear browser cache and try again
- Check browser console for storage errors

#### 8. Slow Performance

**Symptoms**: Dashboard feels sluggish or unresponsive

**Solutions**:
- Close unused browser tabs
- Clear browser cache
- Disable browser extensions temporarily
- Check system resources (CPU, memory)
- Use Chrome/Edge for best performance
- Reduce number of active analysts in Analyze section

---

## Tips & Best Practices

### General Usage

1. **Start with Home**: Get an overview before diving into specific sections
2. **Use Keyboard Shortcuts**: Faster navigation with Alt+Number
3. **Monitor Costs**: Check API cost estimates before running analyses
4. **Cache Awareness**: Results are cached for 5 minutes - no need to re-run immediately
5. **Mobile Friendly**: All features work on mobile devices

### Analysis Workflow

1. **Check Social First**: Gauge sentiment before deep analysis
2. **Run Analysis**: Use Analyze section for comprehensive research
3. **Backtest Strategy**: Validate approach with historical data
4. **Calculate Risk**: Use Risk section before entering positions
5. **Monitor Coaches**: Check for additional insights

### Cost Optimization

1. **Use gpt-4o-mini**: Faster and cheaper for most analyses
2. **Limit Debate Rounds**: 1-2 rounds usually sufficient
3. **Select Specific Analysts**: Don't always need all 4
4. **Leverage Caching**: Wait 5 minutes before re-analyzing same ticker
5. **Batch Analysis**: Analyze multiple tickers in one session

### Risk Management

1. **Always Calculate Position Size**: Use Risk section before trading
2. **Set Stop-Losses**: Never enter without a stop-loss plan
3. **Respect Risk Tolerance**: Don't exceed your configured limits
4. **Diversify**: Don't put all capital in one position
5. **Review Backtest Results**: Understand historical performance

### Productivity Tips

1. **Customize Notifications**: Enable only relevant coach notifications
2. **Use Quick Actions**: Home section provides fast navigation
3. **Bookmark Dashboard**: Add `/dashboard` to browser favorites
4. **Learn Shortcuts**: Memorize Alt+1 through Alt+7
5. **Check Recent Activity**: Stay updated with Home section feed

---

## Browser Compatibility

### Supported Browsers

- ✅ Chrome 90+ (Recommended)
- ✅ Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+

### Required Features

- JavaScript enabled
- LocalStorage enabled
- Cookies enabled
- Modern CSS support (Grid, Flexbox)

---

## Getting Help

### Resources

- **Documentation**: Check `c1_api/README.md` for API details
- **Examples**: See `examples/` directory for code samples
- **Issues**: Report bugs on GitHub (if applicable)

### Support Channels

1. Check this guide first
2. Review browser console for errors (F12)
3. Check backend logs for API issues
4. Consult project README for setup issues

---

## Appendix

### Glossary

- **Ticker**: Stock symbol (e.g., AAPL for Apple Inc.)
- **Analyst**: AI agent that analyzes specific market aspects
- **Debate Round**: Iteration of bull/bear argument exchange
- **Backtest**: Testing strategy against historical data
- **Position Sizing**: Calculating appropriate investment amount
- **Stop-Loss**: Price level to exit losing position
- **Risk/Reward**: Ratio of potential profit to potential loss
- **Sharpe Ratio**: Risk-adjusted return metric
- **Drawdown**: Peak-to-trough decline in portfolio value

### Version History

- **v1.0.0**: Initial sidebar navigation release
  - 7 navigation sections
  - Keyboard shortcuts
  - Mobile responsive design
  - State persistence
  - Performance optimizations

---

## Quick Reference Card

```
┌─────────────────────────────────────────────┐
│         DASHBOARD QUICK REFERENCE           │
├─────────────────────────────────────────────┤
│ SECTIONS                                    │
│  Alt+1  Home      - Overview & stats        │
│  Alt+2  Coaches   - AI trading plans        │
│  Alt+3  Social    - Twitter sentiment       │
│  Alt+4  Analyze   - Run stock analysis      │
│  Alt+5  Backtest  - Test strategies         │
│  Alt+6  Risk      - Position sizing         │
│  Alt+7  Settings  - Configure dashboard     │
├─────────────────────────────────────────────┤
│ NAVIGATION                                  │
│  Tab       - Cycle through items            │
│  Enter     - Activate focused item          │
│  Escape    - Close mobile sidebar           │
│  ?         - Show shortcuts help            │
├─────────────────────────────────────────────┤
│ TIPS                                        │
│  • Results cached for 5 minutes             │
│  • Use gpt-4o-mini for cost savings         │
│  • All calculations in Risk are free        │
│  • Mobile: Tap menu to open sidebar         │
└─────────────────────────────────────────────┘
```

---

**Last Updated**: November 2025  
**Version**: 1.0.0
