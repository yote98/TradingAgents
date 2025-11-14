# ChartDisplay Component

A professional, interactive chart component for displaying OHLCV (Open, High, Low, Close, Volume) market data using the Lightweight Charts library.

## Features

✅ **Candlestick Chart Rendering** - Professional candlestick visualization with customizable colors
✅ **Volume Bars** - Volume histogram displayed below the price chart
✅ **Theme Support** - Light and dark theme with matching color schemes
✅ **Interactive Controls** - Built-in zoom, pan, and crosshair functionality
✅ **Responsive Design** - Automatically adjusts to container width
✅ **Watermark Overlay** - Customizable watermark for branding
✅ **Loading States** - Elegant loading, error, and empty data states
✅ **Error Handling** - Graceful error display with retry functionality

## Installation

The component requires `lightweight-charts` which is already installed:

```bash
npm install lightweight-charts
```

## Usage

### Basic Example

```tsx
import ChartDisplay, { OHLCVData } from '@/components/ChartDisplay';

const data: OHLCVData[] = [
  { time: 1609459200, open: 100, high: 105, low: 99, close: 103, volume: 1000000 },
  { time: 1609545600, open: 103, high: 108, low: 102, close: 107, volume: 1200000 },
];

function MyChart() {
  return (
    <ChartDisplay
      ticker="AAPL"
      timeframe="1D"
      data={data}
      theme="light"
    />
  );
}
```

### With Loading State

```tsx
<ChartDisplay
  ticker="AAPL"
  timeframe="1D"
  data={[]}
  loading={true}
/>
```

### With Error Handling

```tsx
<ChartDisplay
  ticker="AAPL"
  timeframe="1D"
  data={[]}
  error="Failed to fetch market data"
  onRetry={() => refetchData()}
/>
```

### Dark Theme

```tsx
<ChartDisplay
  ticker="AAPL"
  timeframe="1D"
  data={data}
  theme="dark"
/>
```

### Custom Watermark

```tsx
<ChartDisplay
  ticker="AAPL"
  timeframe="1D"
  data={data}
  watermark="My Trading Dashboard"
/>
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `ticker` | `string` | Yes | - | Stock ticker symbol (e.g., "AAPL") |
| `timeframe` | `string` | Yes | - | Chart timeframe (e.g., "1D", "4H", "15min") |
| `data` | `OHLCVData[]` | Yes | - | Array of OHLCV data points |
| `theme` | `'light' \| 'dark'` | No | `'light'` | Chart color theme |
| `watermark` | `string` | No | `'Generated from public market data'` | Watermark text overlay |
| `loading` | `boolean` | No | `false` | Show loading state |
| `error` | `string \| null` | No | `null` | Error message to display |
| `onRetry` | `() => void` | No | - | Callback for retry button in error state |

## Data Format

The component expects data in the following format:

```typescript
interface OHLCVData {
  time: number;      // Unix timestamp in seconds
  open: number;      // Opening price
  high: number;      // Highest price
  low: number;       // Lowest price
  close: number;     // Closing price
  volume: number;    // Trading volume
}
```

## Chart Features

### Interactive Controls

- **Zoom**: Scroll wheel or pinch gesture
- **Pan**: Click and drag
- **Crosshair**: Hover to see price and time details
- **Auto-fit**: Chart automatically fits content on data update

### Visual Customization

- **Candlestick Colors**:
  - Up (bullish): `#26a69a` (teal)
  - Down (bearish): `#ef5350` (red)
- **Volume Colors**: Semi-transparent matching candlestick colors
- **Grid Lines**: Subtle grid for easy reading
- **Responsive**: Automatically resizes with window

### States

1. **Normal**: Displays chart with data
2. **Loading**: Shows spinner with "Generating chart..." message
3. **Error**: Displays error icon, message, and optional retry button
4. **Empty**: Shows "No chart data available" message

## Integration with ChartGenerator

This component is designed to work seamlessly with the `ChartGenerator` class:

```tsx
import ChartDisplay from '@/components/ChartDisplay';
import { ChartGenerator } from '@/lib/chartGenerator';

function CoachPlanCard({ plan }) {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const generator = new ChartGenerator();
    const tickerInfo = generator.extractTickerInfo(plan.text);
    
    if (tickerInfo) {
      setLoading(true);
      generator.fetchMarketData(tickerInfo.ticker, tickerInfo.timeframe)
        .then(data => {
          setChartData(data);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [plan]);

  if (!chartData) return null;

  return (
    <ChartDisplay
      ticker={tickerInfo.ticker}
      timeframe={tickerInfo.timeframe}
      data={chartData}
      loading={loading}
      error={error}
      onRetry={() => /* retry logic */}
    />
  );
}
```

## Requirements Satisfied

This component satisfies the following requirements from the design document:

- ✅ **Requirement 3.2**: Real-time chart generation with interactive display
- ✅ **Requirement 3.4**: Professional styling with OHLCV data and volume bars
- ✅ **Requirement 4.1**: Configurable chart color schemes
- ✅ **Requirement 4.2**: Watermark/label for generated charts
- ✅ **Requirement 4.3**: Multiple chart types (candlestick with volume)
- ✅ **Requirement 4.5**: Zoom and pan controls for interactive exploration
- ✅ **Requirement 6.5**: Loading indicators during chart generation

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Notes

- Chart renders efficiently with up to 1000+ data points
- Automatic cleanup on unmount prevents memory leaks
- Responsive resize handling with debouncing
- Lightweight Charts library is optimized for performance

## See Also

- [ChartDisplay.example.tsx](./ChartDisplay.example.tsx) - Usage examples
- [ChartGenerator](../lib/chartGenerator.ts) - Data fetching and caching
- [Lightweight Charts Documentation](https://tradingview.github.io/lightweight-charts/)
