/**
 * Example usage of ChartDisplay component
 * 
 * This file demonstrates how to use the ChartDisplay component
 * with sample market data.
 */

import ChartDisplay, { OHLCVData } from './ChartDisplay';

// Sample OHLCV data for demonstration
const sampleData: OHLCVData[] = [
  { time: 1609459200, open: 100, high: 105, low: 99, close: 103, volume: 1000000 },
  { time: 1609545600, open: 103, high: 108, low: 102, close: 107, volume: 1200000 },
  { time: 1609632000, open: 107, high: 110, low: 106, close: 108, volume: 1100000 },
  { time: 1609718400, open: 108, high: 112, low: 107, close: 111, volume: 1300000 },
  { time: 1609804800, open: 111, high: 115, low: 110, close: 113, volume: 1400000 },
];

export function ChartDisplayExample() {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Chart Display Examples</h2>
      
      {/* Basic usage with light theme */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">Light Theme</h3>
        <ChartDisplay
          ticker="AAPL"
          timeframe="1D"
          data={sampleData}
          theme="light"
        />
      </div>

      {/* Dark theme */}
      <div className="mb-8 bg-gray-900 p-4 rounded">
        <h3 className="text-xl font-semibold mb-2 text-white">Dark Theme</h3>
        <ChartDisplay
          ticker="AAPL"
          timeframe="1D"
          data={sampleData}
          theme="dark"
        />
      </div>

      {/* Loading state */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">Loading State</h3>
        <ChartDisplay
          ticker="AAPL"
          timeframe="1D"
          data={[]}
          loading={true}
        />
      </div>

      {/* Error state */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">Error State</h3>
        <ChartDisplay
          ticker="AAPL"
          timeframe="1D"
          data={[]}
          error="Failed to fetch market data"
          onRetry={() => console.log('Retry clicked')}
        />
      </div>

      {/* Empty data state */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">Empty Data State</h3>
        <ChartDisplay
          ticker="AAPL"
          timeframe="1D"
          data={[]}
        />
      </div>

      {/* Custom watermark */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">Custom Watermark</h3>
        <ChartDisplay
          ticker="AAPL"
          timeframe="1D"
          data={sampleData}
          watermark="Custom Trading Dashboard"
        />
      </div>
    </div>
  );
}

export default ChartDisplayExample;
