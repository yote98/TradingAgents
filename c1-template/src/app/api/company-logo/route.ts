import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory cache for logos (lasts for the lifetime of the serverless function)
const logoCache = new Map<string, { url: string; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Company domain mapping for common tickers (for Clearbit fallback)
const TICKER_DOMAINS: Record<string, string> = {
  'AAPL': 'apple.com',
  'MSFT': 'microsoft.com',
  'GOOGL': 'google.com',
  'GOOG': 'google.com',
  'AMZN': 'amazon.com',
  'TSLA': 'tesla.com',
  'META': 'meta.com',
  'NVDA': 'nvidia.com',
  'AMD': 'amd.com',
  'NFLX': 'netflix.com',
  'DIS': 'disney.com',
  'PYPL': 'paypal.com',
  'INTC': 'intel.com',
  'CSCO': 'cisco.com',
  'ADBE': 'adobe.com',
  'CRM': 'salesforce.com',
  'ORCL': 'oracle.com',
  'IBM': 'ibm.com',
  'QCOM': 'qualcomm.com',
  'TXN': 'ti.com',
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ticker = searchParams.get('ticker')?.toUpperCase();

  if (!ticker) {
    return NextResponse.json({ error: 'Ticker required' }, { status: 400 });
  }

  // Check cache first
  const cached = logoCache.get(ticker);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return NextResponse.json(
      { logoUrl: cached.url },
      { 
        headers: { 
          'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' 
        } 
      }
    );
  }

  try {
    // Try Clearbit first (fast, no API key needed)
    const domain = TICKER_DOMAINS[ticker];
    if (domain) {
      const clearbitUrl = `https://logo.clearbit.com/${domain}`;
      
      // Test if logo exists
      const testResponse = await fetch(clearbitUrl, { method: 'HEAD' });
      if (testResponse.ok) {
        logoCache.set(ticker, { url: clearbitUrl, timestamp: Date.now() });
        return NextResponse.json(
          { logoUrl: clearbitUrl },
          { 
            headers: { 
              'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' 
            } 
          }
        );
      }
    }

    // Fallback to FMP if Clearbit fails
    const fmpApiKey = process.env.FMP_API_KEY;
    if (fmpApiKey) {
      const response = await fetch(
        `https://financialmodelingprep.com/api/v3/profile/${ticker}?apikey=${fmpApiKey}`,
        { next: { revalidate: 86400 } } // Cache for 24 hours
      );

      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0 && data[0].image) {
          const logoUrl = data[0].image;
          logoCache.set(ticker, { url: logoUrl, timestamp: Date.now() });
          return NextResponse.json(
            { logoUrl },
            { 
              headers: { 
                'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' 
              } 
            }
          );
        }
      }
    }

    return NextResponse.json({ logoUrl: null });
  } catch (error) {
    console.error('Error fetching company logo:', error);
    return NextResponse.json({ logoUrl: null });
  }
}
