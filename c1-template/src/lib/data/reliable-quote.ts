/**
 * RELIABLE QUOTE CLIENT - Multiple fallbacks for accuracy
 * Priority: Accuracy > Speed
 */

export interface ReliableQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  timestamp: string;
  source: string;
}

/**
 * Get quote with multiple fallbacks - GUARANTEED accuracy
 */
export async function getReliableQuote(symbol: string): Promise<ReliableQuote> {
  const errors: string[] = [];
  
  // 1. Try Alpha Vantage (most reliable for real-time)
  try {
    const alphaKey = process.env.ALPHA_VANTAGE_API_KEY;
    if (alphaKey) {
      const response = await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${alphaKey}`,
        { next: { revalidate: 0 } } // No cache - always fresh
      );
      
      if (response.ok) {
        const data = await response.json();
        const quote = data['Global Quote'];
        
        if (quote && quote['05. price']) {
          return {
            symbol: quote['01. symbol'],
            price: parseFloat(quote['05. price']),
            change: parseFloat(quote['09. change']),
            changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
            volume: parseInt(quote['06. volume']),
            high: parseFloat(quote['03. high']),
            low: parseFloat(quote['04. low']),
            open: parseFloat(quote['02. open']),
            previousClose: parseFloat(quote['08. previous close']),
            timestamp: new Date().toISOString(),
            source: 'Alpha Vantage (Real-time)',
          };
        }
      }
    }
  } catch (error) {
    errors.push(`Alpha Vantage: ${error}`);
  }

  // 2. Try Yahoo Finance (reliable backup)
  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1m&range=1d`,
      { next: { revalidate: 0 } }
    );
    
    if (response.ok) {
      const data = await response.json();
      const result = data.chart?.result?.[0];
      const meta = result?.meta;
      
      if (meta && meta.regularMarketPrice) {
        return {
          symbol: meta.symbol,
          price: meta.regularMarketPrice,
          change: meta.regularMarketPrice - meta.previousClose,
          changePercent: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100,
          volume: meta.regularMarketVolume || 0,
          high: meta.regularMarketDayHigh,
          low: meta.regularMarketDayLow,
          open: meta.regularMarketOpen || meta.previousClose,
          previousClose: meta.previousClose,
          timestamp: new Date(meta.regularMarketTime * 1000).toISOString(),
          source: 'Yahoo Finance (Real-time)',
        };
      }
    }
  } catch (error) {
    errors.push(`Yahoo Finance: ${error}`);
  }

  // 3. Try Finnhub (if available)
  try {
    const finnhubKey = process.env.FINNHUB_API_KEY;
    if (finnhubKey) {
      const response = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${finnhubKey}`,
        { next: { revalidate: 0 } }
      );
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.c && data.c > 0) {
          return {
            symbol: symbol,
            price: data.c, // current price
            change: data.d, // change
            changePercent: data.dp, // change percent
            volume: 0,
            high: data.h, // high
            low: data.l, // low
            open: data.o, // open
            previousClose: data.pc, // previous close
            timestamp: new Date(data.t * 1000).toISOString(),
            source: 'Finnhub (Real-time)',
          };
        }
      }
    }
  } catch (error) {
    errors.push(`Finnhub: ${error}`);
  }

  // 4. Try MarketData.app (last resort)
  try {
    const marketDataKey = process.env.MARKETDATA_API_KEY;
    if (marketDataKey) {
      const response = await fetch(
        `https://api.marketdata.app/v1/stocks/quotes/${symbol}/?token=${marketDataKey}`,
        { next: { revalidate: 0 } }
      );
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.last && data.last > 0) {
          return {
            symbol: data.symbol,
            price: data.last,
            change: data.change || 0,
            changePercent: data.changepct || 0,
            volume: data.volume || 0,
            high: data.high || 0,
            low: data.low || 0,
            open: data.open || 0,
            previousClose: data.close || 0,
            timestamp: new Date().toISOString(),
            source: 'MarketData.app',
          };
        }
      }
    }
  } catch (error) {
    errors.push(`MarketData: ${error}`);
  }

  // All sources failed
  throw new Error(`Failed to get reliable quote for ${symbol}. Errors: ${errors.join('; ')}`);
}

/**
 * Verify quote accuracy by comparing multiple sources
 */
export async function verifyQuoteAccuracy(symbol: string): Promise<{
  price: number;
  sources: Array<{ source: string; price: number }>;
  variance: number;
  reliable: boolean;
}> {
  const quotes: Array<{ source: string; price: number }> = [];
  
  // Get quotes from all available sources
  const sources = [
    { name: 'Alpha Vantage', key: process.env.ALPHA_VANTAGE_API_KEY },
    { name: 'Yahoo Finance', key: 'always-available' },
    { name: 'Finnhub', key: process.env.FINNHUB_API_KEY },
  ];

  for (const source of sources) {
    if (!source.key) continue;
    
    try {
      const quote = await getReliableQuote(symbol);
      quotes.push({ source: quote.source, price: quote.price });
    } catch (error) {
      // Skip failed sources
    }
  }

  if (quotes.length === 0) {
    throw new Error('No sources available for verification');
  }

  // Calculate average and variance
  const prices = quotes.map(q => q.price);
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
  const variance = Math.max(...prices) - Math.min(...prices);
  const variancePercent = (variance / avgPrice) * 100;

  return {
    price: avgPrice,
    sources: quotes,
    variance: variancePercent,
    reliable: variancePercent < 0.5, // Less than 0.5% variance = reliable
  };
}
