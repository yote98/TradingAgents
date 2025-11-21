import { NextRequest, NextResponse } from 'next/server';
import { getReliableQuote, verifyQuoteAccuracy } from '@/lib/data/reliable-quote';

// CRITICAL: Disable ALL caching for price data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/quote?symbol=NVDA&verify=true
 * RELIABLE stock quote with multiple source fallbacks
 * Use verify=true to cross-check multiple sources for accuracy
 * 
 * ZERO CACHING - Always returns fresh data
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const verify = searchParams.get('verify') === 'true';

    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol parameter is required' },
        { status: 400 }
      );
    }

    // Verify accuracy across multiple sources if requested
    if (verify) {
      const verification = await verifyQuoteAccuracy(symbol);
      return NextResponse.json({
        success: true,
        symbol: symbol,
        price: verification.price,
        sources: verification.sources,
        variance: verification.variance,
        reliable: verification.reliable,
        warning: verification.reliable ? null : 'High variance detected between sources',
        timestamp: new Date().toISOString(),
      });
    }

    // Get reliable quote with automatic fallbacks
    const quote = await getReliableQuote(symbol);

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
      source: quote.source,
      timestamp: quote.timestamp,
    });
  } catch (error) {
    console.error('Quote error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch quote from all sources',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
