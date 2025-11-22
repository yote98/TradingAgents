import { NextRequest, NextResponse } from 'next/server';

/**
 * MCP Proxy: Alpha Vantage Quote
 * Fetches real-time stock quotes from Alpha Vantage
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');

  if (!symbol) {
    return NextResponse.json(
      { error: 'Symbol parameter is required' },
      { status: 400 }
    );
  }

  try {
    // Call Alpha Vantage API directly
    const apiKey = 'H0MDWALD76X9X96C';
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data['Global Quote']) {
      const quote = data['Global Quote'];
      return NextResponse.json({
        success: true,
        symbol: quote['01. symbol'],
        price: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
        volume: parseInt(quote['06. volume']),
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to fetch quote', details: data },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Quote error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quote', details: String(error) },
      { status: 500 }
    );
  }
}
