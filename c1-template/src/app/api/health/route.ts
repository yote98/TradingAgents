import { NextResponse } from 'next/server';
import { getMarketDataClient } from '@/lib/data/marketdata-client';

/**
 * Health check endpoint to verify API connections
 */
export async function GET() {
  const checks = {
    timestamp: new Date().toISOString(),
    environment: {
      MARKETDATA_API_KEY: !!process.env.MARKETDATA_API_KEY,
      ALPHA_VANTAGE_API_KEY: !!process.env.ALPHA_VANTAGE_API_KEY,
      FMP_API_KEY: !!process.env.FMP_API_KEY,
      OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
    },
    services: {} as Record<string, any>,
  };

  // Test MarketData.app connection
  try {
    const client = getMarketDataClient();
    const quote = await client.getQuote('AAPL');
    checks.services.marketdata = {
      status: 'ok',
      price: quote.price,
    };
  } catch (error) {
    checks.services.marketdata = {
      status: 'error',
      error: error instanceof Error ? error.message : String(error),
    };
  }

  const allOk = Object.values(checks.services).every(
    (service: any) => service.status === 'ok'
  );

  return NextResponse.json(checks, {
    status: allOk ? 200 : 503,
  });
}
