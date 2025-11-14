/**
 * Market Data API Route
 * 
 * Fetches market data using Alpha Vantage MCP tools
 */

import { NextRequest, NextResponse } from 'next/server';

interface MarketDataRequest {
  ticker: string;
  interval: string;
  timeframe: string;
}

interface OHLCVData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * POST /api/market-data
 * 
 * Fetch market data for a given ticker and interval
 */
export async function POST(request: NextRequest) {
  try {
    const body: MarketDataRequest = await request.json();
    const { ticker, interval, timeframe } = body;

    if (!ticker || !interval) {
      return NextResponse.json(
        { error: 'Missing required parameters: ticker, interval' },
        { status: 400 }
      );
    }

    console.log(`[Market Data API] Fetching ${ticker} with interval ${interval}`);

    // Determine which Alpha Vantage function to use
    let alphaVantageFunction: string;
    let alphaVantageInterval: string | undefined;

    if (interval === 'daily') {
      alphaVantageFunction = 'TIME_SERIES_DAILY';
    } else if (interval === 'weekly') {
      alphaVantageFunction = 'TIME_SERIES_WEEKLY';
    } else if (interval === 'monthly') {
      alphaVantageFunction = 'TIME_SERIES_MONTHLY';
    } else {
      // Intraday
      alphaVantageFunction = 'TIME_SERIES_INTRADAY';
      alphaVantageInterval = interval;
    }

    // Call Alpha Vantage MCP
    // Note: In a real implementation, this would use the MCP client
    // For now, we'll use a direct API call as a fallback
    const data = await fetchAlphaVantageData(
      ticker,
      alphaVantageFunction,
      alphaVantageInterval
    );

    // Transform to OHLCV format
    const ohlcvData = transformToOHLCV(data, alphaVantageFunction);

    return NextResponse.json({
      success: true,
      ticker,
      interval,
      timeframe,
      data: ohlcvData,
    });
  } catch (error) {
    console.error('[Market Data API] Error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to fetch market data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Fetch data from Alpha Vantage API
 */
async function fetchAlphaVantageData(
  ticker: string,
  functionName: string,
  interval?: string
): Promise<any> {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

  if (!apiKey) {
    throw new Error('ALPHA_VANTAGE_API_KEY not configured');
  }

  // Build URL
  let url = `https://www.alphavantage.co/query?function=${functionName}&symbol=${ticker}&apikey=${apiKey}`;

  if (interval) {
    url += `&interval=${interval}`;
  }

  // Add outputsize for more data
  if (functionName === 'TIME_SERIES_DAILY' || functionName === 'TIME_SERIES_INTRADAY') {
    url += '&outputsize=compact'; // Last 100 data points
  }

  console.log(`[Market Data API] Calling Alpha Vantage: ${functionName} for ${ticker}`);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Alpha Vantage API error: ${response.statusText}`);
  }

  const data = await response.json();

  // Check for API errors
  if (data['Error Message']) {
    throw new Error(`Alpha Vantage error: ${data['Error Message']}`);
  }

  if (data['Note']) {
    throw new Error('Alpha Vantage API rate limit reached');
  }

  return data;
}

/**
 * Transform Alpha Vantage response to OHLCV format
 */
function transformToOHLCV(rawData: any, functionName: string): OHLCVData[] {
  const data: OHLCVData[] = [];

  // Determine which time series key to use
  let timeSeriesKey: string | null = null;

  const possibleKeys = [
    'Time Series (Daily)',
    'Time Series (Weekly)',
    'Time Series (Monthly)',
    'Time Series (1min)',
    'Time Series (5min)',
    'Time Series (15min)',
    'Time Series (30min)',
    'Time Series (60min)',
  ];

  for (const key of possibleKeys) {
    if (rawData[key]) {
      timeSeriesKey = key;
      break;
    }
  }

  if (!timeSeriesKey) {
    throw new Error('No time series data found in Alpha Vantage response');
  }

  const timeSeries = rawData[timeSeriesKey];

  // Convert to array
  for (const [dateStr, values] of Object.entries(timeSeries)) {
    const timestamp = new Date(dateStr).getTime() / 1000; // Convert to seconds

    data.push({
      time: timestamp,
      open: parseFloat((values as any)['1. open']),
      high: parseFloat((values as any)['2. high']),
      low: parseFloat((values as any)['3. low']),
      close: parseFloat((values as any)['4. close']),
      volume: parseFloat((values as any)['5. volume'] || '0'),
    });
  }

  // Sort by time ascending
  data.sort((a, b) => a.time - b.time);

  // Limit to last 200 points for performance
  if (data.length > 200) {
    return data.slice(-200);
  }

  return data;
}
