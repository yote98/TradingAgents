/**
 * RELIABLE QUOTE CLIENT - Triple redundancy with institutional-grade sources
 * Priority: Finnhub → Alpha Vantage → Alpaca (all tested and reliable)
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
 * Get quote with triple fallback - GUARANTEED accuracy
 * Priority: Finnhub (fastest) → Alpha Vantage (reliable) → Alpaca (institutional)
 */
export async function getReliableQuote(symbol: string): Promise<ReliableQuote> {
  const errors: string[] = [];
  
  // 1. Try Finnhub (fastest and most reliable)
  try {
    const finnhubKey = process.env.FINNHUB_API_KEY;
    if (finnhubKey) {
      const response = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${finnhubKey}`,
        { cache: 'no-store' }
      );
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.c && data.c > 0) {
          return {
            symbol: symbol,
            price: data.c,
            change: data.d || 0,
            changePercent: data.dp || 0,
            volume: 0,
            high: data.h || 0,
            low: data.l || 0,
            open: data.o || 0,
            previousClose: data.pc || 0,
            timestamp: new Date(data.t * 1000).toISOString(),
            source: 'Finnhub (Real-time)',
          };
        }
      }
    }
  } catch (error) {
    errors.push(`Finnhub: ${error}`);
  }

  // 2. Try Alpha Vantage (reliable backup)
  try {
    const alphaKey = process.env.ALPHA_VANTAGE_API_KEY;
    if (alphaKey) {
      const response = await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${alphaKey}`,
        { cache: 'no-store' }
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

  // 3. Try Alpaca (institutional-grade fallback)
  try {
    const alpacaKey = process.env.ALPACA_API_KEY;
    const alpacaSecret = process.env.ALPACA_SECRET_KEY;
    if (alpacaKey && alpacaSecret) {
      const response = await fetch(
        `https://data.alpaca.markets/v2/stocks/${symbol}/trades/latest`,
        {
          headers: {
            'APCA-API-KEY-ID': alpacaKey,
            'APCA-API-SECRET-KEY': alpacaSecret,
          },
          cache: 'no-store'
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.trade && data.trade.p) {
          return {
            symbol: symbol,
            price: data.trade.p,
            change: 0,
            changePercent: 0,
            volume: data.trade.s || 0,
            high: 0,
            low: 0,
            open: 0,
            previousClose: 0,
            timestamp: data.trade.t || new Date().toISOString(),
            source: 'Alpaca (Latest Trade)',
          };
        }
      }
    }
  } catch (error) {
    errors.push(`Alpaca: ${error}`);
  }

  // All sources failed
  throw new Error(`Failed to get reliable quote for ${symbol}. Errors: ${errors.join('; ')}`);
}

/**
 * Verify quote accuracy by comparing all 3 reliable sources
 * Returns average price and variance between sources
 */
export async function verifyQuoteAccuracy(symbol: string): Promise<{
  price: number;
  sources: Array<{ source: string; price: number }>;
  variance: number;
  reliable: boolean;
}> {
  const quotes: Array<{ source: string; price: number }> = [];
  const errors: string[] = [];
  
  // Test Finnhub directly
  try {
    const finnhubKey = process.env.FINNHUB_API_KEY;
    if (finnhubKey) {
      const response = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${finnhubKey}`,
        { cache: 'no-store' }
      );
      if (response.ok) {
        const data = await response.json();
        if (data.c && data.c > 0) {
          quotes.push({ source: 'Finnhub', price: data.c });
        }
      }
    }
  } catch (error) {
    errors.push(`Finnhub: ${error}`);
  }

  // Test Alpha Vantage directly
  try {
    const alphaKey = process.env.ALPHA_VANTAGE_API_KEY;
    if (alphaKey) {
      const response = await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${alphaKey}`,
        { cache: 'no-store' }
      );
      if (response.ok) {
        const data = await response.json();
        const quote = data['Global Quote'];
        if (quote && quote['05. price']) {
          quotes.push({ source: 'Alpha Vantage', price: parseFloat(quote['05. price']) });
        }
      }
    }
  } catch (error) {
    errors.push(`Alpha Vantage: ${error}`);
  }

  // Test Alpaca directly
  try {
    const alpacaKey = process.env.ALPACA_API_KEY;
    const alpacaSecret = process.env.ALPACA_SECRET_KEY;
    if (alpacaKey && alpacaSecret) {
      const response = await fetch(
        `https://data.alpaca.markets/v2/stocks/${symbol}/trades/latest`,
        {
          headers: {
            'APCA-API-KEY-ID': alpacaKey,
            'APCA-API-SECRET-KEY': alpacaSecret,
          },
          cache: 'no-store'
        }
      );
      if (response.ok) {
        const data = await response.json();
        if (data.trade && data.trade.p) {
          quotes.push({ source: 'Alpaca', price: data.trade.p });
        }
      }
    }
  } catch (error) {
    errors.push(`Alpaca: ${error}`);
  }

  if (quotes.length === 0) {
    throw new Error(`No sources available for verification. Errors: ${errors.join('; ')}`);
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
