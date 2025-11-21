import { NextRequest, NextResponse } from 'next/server';
import { getMarketDataClient } from '@/lib/data/marketdata-client';

/**
 * GET /api/quote?symbol=NVDA
 * Quick stock quote endpoint (no full analysis)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');

    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol parameter is required' },
        { status: 400 }
      );
    }

    const client = getMarketDataClient();
    const quote = await client.getQuote(symbol);

    return NextResponse.json({
      success: true,
      symbol: quote.symbol,
      price: quote.price,
      change: quote.change,
      changePercent: quote.changePercent,
      volume: quote.volume,
      high: quote.high,
      low: quote.low,
      open: quote.open,
      previousClose: quote.previousClose,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Quote error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch quote',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
