'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  createChart,
  IChartApi,
  CandlestickData,
  HistogramData,
  Time,
  ColorType,
  CrosshairMode,
  CandlestickSeries,
  HistogramSeries
} from 'lightweight-charts';

export interface OHLCVData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ChartDisplayProps {
  ticker: string;
  timeframe: string;
  data: OHLCVData[];
  theme?: 'light' | 'dark';
  watermark?: string;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export default function ChartDisplay({
  ticker,
  timeframe,
  data,
  theme = 'light',
  watermark = 'Generated from public market data',
  loading = false,
  error = null,
  onRetry
}: ChartDisplayProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<any>(null);
  const volumeSeriesRef = useRef<any>(null);
  const [chartReady, setChartReady] = useState(false);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current || loading || error) return;

    // Create chart instance
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { type: ColorType.Solid, color: theme === 'dark' ? '#1a1a1a' : '#ffffff' },
        textColor: theme === 'dark' ? '#d1d4dc' : '#191919',
      },
      grid: {
        vertLines: { color: theme === 'dark' ? '#2a2a2a' : '#e1e1e1' },
        horzLines: { color: theme === 'dark' ? '#2a2a2a' : '#e1e1e1' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          width: 1,
          color: theme === 'dark' ? '#758696' : '#9598a1',
          style: 3, // Dashed
          labelBackgroundColor: theme === 'dark' ? '#363c4e' : '#4682b4',
        },
        horzLine: {
          width: 1,
          color: theme === 'dark' ? '#758696' : '#9598a1',
          style: 3,
          labelBackgroundColor: theme === 'dark' ? '#363c4e' : '#4682b4',
        },
      },
      rightPriceScale: {
        borderColor: theme === 'dark' ? '#2a2a2a' : '#e1e1e1',
      },
      timeScale: {
        borderColor: theme === 'dark' ? '#2a2a2a' : '#e1e1e1',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    // Add candlestick series
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    // Add volume series
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '', // Set as overlay
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.7, // Position volume at bottom 30%
        bottom: 0,
      },
    });

    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;
    volumeSeriesRef.current = volumeSeries;
    setChartReady(true);

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [theme, watermark, loading, error]);

  // Update chart data
  useEffect(() => {
    if (!chartReady || !candlestickSeriesRef.current || !volumeSeriesRef.current || !data || data.length === 0) {
      return;
    }

    try {
      // Transform data for candlestick series
      const candlestickData: CandlestickData<Time>[] = data.map((item) => ({
        time: item.time as Time,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
      }));

      // Transform data for volume series with color based on price movement
      const volumeData: HistogramData<Time>[] = data.map((item) => ({
        time: item.time as Time,
        value: item.volume,
        color: item.close >= item.open ? '#26a69a80' : '#ef535080', // Semi-transparent
      }));

      candlestickSeriesRef.current.setData(candlestickData);
      volumeSeriesRef.current.setData(volumeData);

      // Fit content to view
      if (chartRef.current) {
        chartRef.current.timeScale().fitContent();
      }
    } catch (err) {
      console.error('Error updating chart data:', err);
    }
  }, [data, chartReady]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Generating chart...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
        <div className="text-center px-4">
          <svg
            className="mx-auto h-12 w-12 text-red-400 mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
            Failed to generate chart
          </p>
          <p className="text-xs text-red-600 dark:text-red-400 mb-3">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  // Empty data state
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <p className="text-sm text-gray-600 dark:text-gray-400">No chart data available</p>
        </div>
      </div>
    );
  }

  // Chart display
  return (
    <div className="relative">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {ticker} - {timeframe}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {data.length} data points
        </div>
      </div>
      <div className="relative">
        <div
          ref={chartContainerRef}
          className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
          style={{ width: '100%', height: '400px' }}
        />
        {/* Watermark overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            userSelect: 'none',
          }}
        >
          {watermark}
        </div>
      </div>
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
        Interactive chart - Use mouse to zoom and pan
      </div>
    </div>
  );
}
