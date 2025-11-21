import { NextRequest, NextResponse } from 'next/server';
import { getReliableQuote } from '@/lib/data/reliable-quote';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * DEBUG ENDPOINT: Test which data source is being used and what price it returns
 * Usage: GET /api/debug-price?symbol=NVDA
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbol = searchParams.get('symbol') || 'NVDA';

  const diagnostics = {
    timestamp: new Date().toISOString(),
    symbol,
    environment: {
      hasFinnhubKey: !!process.env.FINNHUB_API_KEY,
      hasAlphaVantageKey: !!process.env.ALPHA_VANTAGE_API_KEY,
      hasAlpacaKey: !!process.env.ALPACA_API_KEY,
      hasMarketDataKey: !!process.env.MARKETDATA_API_KEY,
    },
    results: {} as any,
  };

  try {
    // Test the reliable quote function
    const quote = await getReliableQuote(symbol);
    
    diagnostics.results = {
      success: true,
      quote,
      source: quote.source || 'unknown',
      price: quote.price,
      timestamp: quote.timestamp,
    };
  } catch (error) {
    diagnostics.results = {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }

  return NextResponse.json(diagnostics, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
