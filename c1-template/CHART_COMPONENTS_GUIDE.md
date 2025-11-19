# Chart Components Guide

## Overview
We've added professional chart components similar to TheSys UI to make analysis more visual and data-rich.

## Available Charts

### 1. SectorPerformanceChart
**Purpose**: Show sector returns in a bar chart format

**Example Usage**:
```tsx
<SectorPerformanceChart 
  data={[
    { sector: "Info Tech", return: 3.2 },
    { sector: "Health Care", return: 2.5 },
    { sector: "Comm Services", return: 2.1 },
    { sector: "Financials", return: 1.8 },
    { sector: "Industrials", return: 1.5 },
    { sector: "Consumer Discr.", return: 1.2 },
    { sector: "Energy", return: -0.5 }
  ]}
/>
```

**Features**:
- Green bars for positive returns
- Red bars for negative returns
- Automatic sorting by performance
- Professional Bloomberg-style formatting

---

### 2. PortfolioPieChart
**Purpose**: Show allocation breakdowns (portfolio, sector, holdings)

**Example Usage**:
```tsx
<PortfolioPieChart 
  data={[
    { name: "Info Tech", value: 45.0 },
    { name: "Comm Services", value: 18.0 },
    { name: "Health Care", value: 14.0 },
    { name: "Financials", value: 10.0 },
    { name: "Other", value: 13.0 }
  ]}
  title="S&P 500 Sector Allocation"
/>
```

**Features**:
- Automatic color assignment
- Percentage labels on slices
- Legend with values
- Custom title support

---

### 3. PriceLineChart
**Purpose**: Display price history and trends over time

**Example Usage**:
```tsx
<PriceLineChart 
  data={[
    { date: "2024-01", price: 150.25 },
    { date: "2024-02", price: 155.80 },
    { date: "2024-03", price: 152.40 },
    { date: "2024-04", price: 160.15 },
    { date: "2024-05", price: 165.90 }
  ]}
  title="AAPL Price Trend (6 Months)"
  showArea={true}
/>
```

**Features**:
- Line or area chart (toggle with showArea)
- Gradient fill for area charts
- Responsive to data range
- Clean grid and axes

---

### 4. PerformanceComparisonChart
**Purpose**: Compare multiple stocks across different metrics

**Example Usage**:
```tsx
<PerformanceComparisonChart 
  data={[
    { name: "AAPL", ytdReturn: 15.2, peRatio: 30.5, dividend: 0.5 },
    { name: "MSFT", ytdReturn: 18.7, peRatio: 35.2, dividend: 0.8 },
    { name: "GOOGL", ytdReturn: 12.3, peRatio: 28.1, dividend: 0.0 }
  ]}
  metrics={["ytdReturn", "peRatio", "dividend"]}
  title="Magnificent 7 Comparison"
/>
```

**Features**:
- Multiple metrics side-by-side
- Color-coded bars for each metric
- Legend for clarity
- Grouped comparison view

---

## When to Use Each Chart

| Scenario | Recommended Chart |
|----------|------------------|
| Sector performance analysis | SectorPerformanceChart |
| Portfolio allocation | PortfolioPieChart |
| ETF holdings breakdown | PortfolioPieChart |
| Price history/trends | PriceLineChart |
| Stock comparison | PerformanceComparisonChart |
| Multi-metric analysis | PerformanceComparisonChart |

## Design Philosophy

All charts follow these principles:
- **Dark theme** - Matches the app's aesthetic
- **Professional colors** - Green for positive, red for negative
- **Clean typography** - Easy to read labels and values
- **Responsive** - Adapts to container size
- **Minimal decoration** - Focus on data, not decoration

## Integration with AI

The AI automatically knows about these components and will use them when:
- Analyzing sectors
- Comparing stocks
- Showing trends
- Breaking down allocations

The charts are rendered inline with the analysis, creating a rich, visual experience similar to TheSys UI.

## Technical Details

**Library**: Recharts (React charting library)
**Styling**: Tailwind CSS with custom dark theme
**Location**: `c1-template/src/components/charts/`

## Future Enhancements

Potential additions:
- Candlestick charts for OHLC data
- Volume charts
- Technical indicator overlays (RSI, MACD)
- Heatmaps for correlation analysis
- Treemaps for market cap visualization
