# Thesys C1 Chart Customization Guide

## Overview

While Thesys C1 focuses on chat interfaces, your TradingAgents system includes custom chart visualization using the `lightweight-charts` library. This guide covers how to customize charts in your application.

## Chart Library

**Library:** `lightweight-charts` by TradingView
**Component:** `aiapp/src/components/ChartDisplay.tsx`
**Use Case:** Display OHLCV (Open, High, Low, Close, Volume) candlestick charts

## Current Implementation

### Basic Usage

```tsx
import ChartDisplay from '@/components/ChartDisplay';

<ChartDisplay
  ticker="AAPL"
  timeframe="1D"
  data={ohlcvData}
  theme="dark"
  watermark="Generated from public market data"
  loading={false}
  error={null}
  onRetry={() => fetchData()}
/>
```

### Data Format

```typescript
interface OHLCVData {
  time: number;      // Unix timestamp
  open: number;      // Opening price
  high: number;      // Highest price
  low: number;       // Lowest price
  close: number;     // Closing price
  volume: number;    // Trading volume
}
```

## Customization Options

### 1. Theme Customization

#### Dark Theme (Default)
```tsx
<ChartDisplay
  theme="dark"
  // Results in:
  // - Background: #1a1a1a
  // - Text: #d1d4dc
  // - Grid: #2a2a2a
  // - Crosshair: #758696
/>
```

#### Light Theme
```tsx
<ChartDisplay
  theme="light"
  // Results in:
  // - Background: #ffffff
  // - Text: #191919
  // - Grid: #e1e1e1
  // - Crosshair: #9598a1
/>
```

### 2. Color Schemes

#### Candlestick Colors

**Current (Green/Red):**
```typescript
upColor: '#26a69a',      // Teal green for bullish
downColor: '#ef5350',    // Red for bearish
wickUpColor: '#26a69a',
wickDownColor: '#ef5350',
```

**Alternative: Blue/Orange**
```typescript
upColor: '#2196F3',      // Blue for bullish
downColor: '#FF9800',    // Orange for bearish
wickUpColor: '#2196F3',
wickDownColor: '#FF9800',
```

**Alternative: White/Black**
```typescript
upColor: '#ffffff',      // White for bullish
downColor: '#000000',    // Black for bearish
wickUpColor: '#ffffff',
wickDownColor: '#000000',
```

#### Volume Colors

**Current (Semi-transparent):**
```typescript
color: item.close >= item.open 
  ? '#26a69a80'  // Green with 50% opacity
  : '#ef535080'  // Red with 50% opacity
```

**Alternative: Solid Colors**
```typescript
color: item.close >= item.open 
  ? '#26a69a'    // Solid green
  : '#ef5350'    // Solid red
```

### 3. Chart Dimensions

#### Fixed Height
```tsx
<ChartDisplay
  // Current: 400px fixed height
  // Modify in component:
  height: 400,
/>
```

#### Responsive Height
```typescript
// In ChartDisplay.tsx
const chartHeight = useMediaQuery('(max-width: 768px)') ? 300 : 400;

createChart(chartContainerRef.current, {
  height: chartHeight,
  // ...
});
```

### 4. Watermark Customization

#### Custom Text
```tsx
<ChartDisplay
  watermark="TradingAgents Analysis"
  // or
  watermark="Powered by AI"
  // or
  watermark={`${ticker} - ${new Date().toLocaleDateString()}`}
/>
```

#### Watermark Styling
```typescript
// In ChartDisplay.tsx, modify:
<div
  style={{
    fontSize: '24px',           // Size
    fontWeight: 'bold',         // Weight
    color: 'rgba(255, 255, 255, 0.1)',  // Opacity
    userSelect: 'none',
    transform: 'rotate(-45deg)', // Diagonal
  }}
>
  {watermark}
</div>
```

#### Remove Watermark
```tsx
<ChartDisplay
  watermark=""  // Empty string hides watermark
/>
```

### 5. Grid Customization

#### Dashed Grid Lines
```typescript
grid: {
  vertLines: { 
    color: '#2a2a2a',
    style: 1,  // 0=Solid, 1=Dotted, 2=Dashed, 3=LargeDashed
    visible: true,
  },
  horzLines: { 
    color: '#2a2a2a',
    style: 1,
    visible: true,
  },
},
```

#### Hide Grid
```typescript
grid: {
  vertLines: { visible: false },
  horzLines: { visible: false },
},
```

### 6. Crosshair Customization

#### Style Options
```typescript
crosshair: {
  mode: CrosshairMode.Normal,  // Normal, Magnet, or Hidden
  vertLine: {
    width: 1,
    color: '#758696',
    style: 3,  // 0=Solid, 1=Dotted, 2=Dashed, 3=LargeDashed
    labelBackgroundColor: '#363c4e',
  },
  horzLine: {
    width: 1,
    color: '#758696',
    style: 3,
    labelBackgroundColor: '#363c4e',
  },
},
```

#### Magnet Mode (Snap to Data Points)
```typescript
crosshair: {
  mode: CrosshairMode.Magnet,  // Snaps to nearest data point
  // ...
},
```

### 7. Price Scale Customization

#### Right Price Scale
```typescript
rightPriceScale: {
  borderColor: '#2a2a2a',
  scaleMargins: {
    top: 0.1,     // 10% margin at top
    bottom: 0.2,  // 20% margin at bottom
  },
  mode: 0,  // 0=Normal, 1=Logarithmic, 2=Percentage, 3=IndexedTo100
},
```

#### Logarithmic Scale
```typescript
rightPriceScale: {
  mode: 1,  // Logarithmic - useful for large price ranges
},
```

### 8. Time Scale Customization

#### Show Seconds
```typescript
timeScale: {
  borderColor: '#2a2a2a',
  timeVisible: true,
  secondsVisible: true,  // Show seconds in timestamps
  rightOffset: 12,       // Space on right side
  barSpacing: 6,         // Space between bars
  minBarSpacing: 0.5,    // Minimum space when zoomed in
},
```

#### Custom Time Format
```typescript
timeScale: {
  timeVisible: true,
  tickMarkFormatter: (time: number) => {
    const date = new Date(time * 1000);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  },
},
```

### 9. Volume Histogram Position

#### Bottom 30% (Current)
```typescript
volumeSeries.priceScale().applyOptions({
  scaleMargins: {
    top: 0.7,    // Volume takes bottom 30%
    bottom: 0,
  },
});
```

#### Bottom 20%
```typescript
volumeSeries.priceScale().applyOptions({
  scaleMargins: {
    top: 0.8,    // Volume takes bottom 20%
    bottom: 0,
  },
});
```

#### Hide Volume
```typescript
// Simply don't add the volume series
// Comment out:
// const volumeSeries = chart.addSeries(HistogramSeries, {...});
```

### 10. Loading & Error States

#### Custom Loading Spinner
```tsx
// In ChartDisplay.tsx
if (loading) {
  return (
    <div className="flex items-center justify-center h-[400px]">
      <YourCustomSpinner />
      <p>Loading chart data...</p>
    </div>
  );
}
```

#### Custom Error Display
```tsx
if (error) {
  return (
    <YourCustomErrorComponent 
      error={error}
      onRetry={onRetry}
    />
  );
}
```

## Advanced Customizations

### 1. Multiple Indicators

#### Add Moving Average
```typescript
// After creating candlestick series
const maSeries = chart.addLineSeries({
  color: '#2196F3',
  lineWidth: 2,
  title: 'MA(20)',
});

// Calculate and set MA data
const maData = calculateMovingAverage(data, 20);
maSeries.setData(maData);
```

#### Add Bollinger Bands
```typescript
const upperBandSeries = chart.addLineSeries({
  color: 'rgba(33, 150, 243, 0.5)',
  lineWidth: 1,
});

const lowerBandSeries = chart.addLineSeries({
  color: 'rgba(33, 150, 243, 0.5)',
  lineWidth: 1,
});

// Set band data
upperBandSeries.setData(upperBandData);
lowerBandSeries.setData(lowerBandData);
```

### 2. Custom Markers

#### Add Buy/Sell Signals
```typescript
candlestickSeries.setMarkers([
  {
    time: 1642425600,
    position: 'belowBar',
    color: '#26a69a',
    shape: 'arrowUp',
    text: 'Buy',
  },
  {
    time: 1642512000,
    position: 'aboveBar',
    color: '#ef5350',
    shape: 'arrowDown',
    text: 'Sell',
  },
]);
```

### 3. Price Lines

#### Add Support/Resistance Lines
```typescript
candlestickSeries.createPriceLine({
  price: 150.00,
  color: '#26a69a',
  lineWidth: 2,
  lineStyle: 2,  // Dashed
  axisLabelVisible: true,
  title: 'Support',
});

candlestickSeries.createPriceLine({
  price: 180.00,
  color: '#ef5350',
  lineWidth: 2,
  lineStyle: 2,
  axisLabelVisible: true,
  title: 'Resistance',
});
```

### 4. Custom Tooltips

#### Show Price on Hover
```typescript
chart.subscribeCrosshairMove((param) => {
  if (!param.time) return;
  
  const data = param.seriesData.get(candlestickSeries);
  if (data) {
    console.log('Price:', data.close);
    // Update custom tooltip element
  }
});
```

### 5. Export Chart

#### Save as Image
```typescript
const saveChart = () => {
  if (chartRef.current) {
    const canvas = chartContainerRef.current?.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${ticker}-chart.png`;
      link.href = url;
      link.click();
    }
  }
};
```

## Integration with Thesys C1

### Display Charts in Chat

```tsx
// In your chat message handler
const processMessage = async ({ messages }) => {
  const lastMessage = messages[messages.length - 1];
  
  if (lastMessage.content.includes('show chart')) {
    const ticker = extractTicker(lastMessage.content);
    const chartData = await fetchChartData(ticker);
    
    return {
      content: `Here's the chart for ${ticker}:`,
      components: [
        <ChartDisplay
          ticker={ticker}
          data={chartData}
          theme="dark"
        />
      ]
    };
  }
};
```

### Embed in Dashboard

```tsx
// In your dashboard section
<div className="chart-section">
  <h2>Market Analysis</h2>
  <ChartDisplay
    ticker={selectedTicker}
    timeframe={selectedTimeframe}
    data={chartData}
    theme={theme}
  />
</div>
```

## Performance Optimization

### 1. Lazy Loading
```tsx
import dynamic from 'next/dynamic';

const ChartDisplay = dynamic(
  () => import('@/components/ChartDisplay'),
  { ssr: false, loading: () => <ChartSkeleton /> }
);
```

### 2. Data Throttling
```typescript
// Limit data points for performance
const throttleData = (data: OHLCVData[], maxPoints: number = 500) => {
  if (data.length <= maxPoints) return data;
  
  const step = Math.ceil(data.length / maxPoints);
  return data.filter((_, index) => index % step === 0);
};
```

### 3. Memoization
```tsx
const memoizedChart = useMemo(() => (
  <ChartDisplay
    ticker={ticker}
    data={data}
    theme={theme}
  />
), [ticker, data, theme]);
```

## Theming Integration

### Match C1 Theme

```tsx
// Sync chart theme with C1Chat theme
const c1Theme = {
  dark: {
    background: '#1a1a1a',
    text: '#d1d4dc',
    primary: '#14b8a6',
  },
  light: {
    background: '#ffffff',
    text: '#191919',
    primary: '#14b8a6',
  },
};

<ChartDisplay
  theme={isDark ? 'dark' : 'light'}
  // Custom colors matching C1
/>
```

### CSS Variables

```css
/* In globals.css */
.chart-container {
  --chart-background: var(--c1-background-color);
  --chart-text: var(--c1-text-color);
  --chart-primary: var(--c1-primary-color);
}
```

## Best Practices

### 1. Responsive Design
```tsx
// Adjust chart size based on screen
const chartHeight = useMediaQuery('(max-width: 768px)') ? 300 : 400;
```

### 2. Error Handling
```tsx
// Always provide fallback
{error ? (
  <ErrorDisplay error={error} onRetry={onRetry} />
) : (
  <ChartDisplay data={data} />
)}
```

### 3. Loading States
```tsx
// Show skeleton while loading
{loading ? <ChartSkeleton /> : <ChartDisplay data={data} />}
```

### 4. Accessibility
```tsx
<div role="img" aria-label={`${ticker} price chart`}>
  <ChartDisplay data={data} />
</div>
```

## Example: Complete Custom Chart

```tsx
import ChartDisplay from '@/components/ChartDisplay';

export default function CustomChart() {
  const [data, setData] = useState<OHLCVData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchChartData('AAPL')
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="chart-wrapper">
      <ChartDisplay
        ticker="AAPL"
        timeframe="1D"
        data={data}
        theme="dark"
        watermark="TradingAgents"
        loading={loading}
        error={error}
        onRetry={() => window.location.reload()}
      />
    </div>
  );
}
```

## Resources

**Lightweight Charts Documentation:**
- Docs: https://tradingview.github.io/lightweight-charts/
- Examples: https://tradingview.github.io/lightweight-charts/tutorials/
- API: https://tradingview.github.io/lightweight-charts/docs/api/

**Your Implementation:**
- Component: `aiapp/src/components/ChartDisplay.tsx`
- Example: `aiapp/src/components/ChartDisplay.example.tsx`
- Tests: `aiapp/src/components/__tests__/ChartDisplay.test.tsx`

## Summary

Your chart implementation uses `lightweight-charts` for professional financial visualizations. Key customization points:

✅ **Theme** - Dark/Light modes
✅ **Colors** - Candlestick and volume colors
✅ **Dimensions** - Height and width
✅ **Watermark** - Custom branding
✅ **Grid** - Style and visibility
✅ **Crosshair** - Interaction modes
✅ **Indicators** - Moving averages, bands
✅ **Markers** - Buy/sell signals
✅ **Export** - Save as image

Your charts integrate seamlessly with the Thesys C1 Jade theme! 📊
