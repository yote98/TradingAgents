/**
 * Options Data Client
 * Fetches options chain, Greeks, and unusual activity
 * Uses Alpha Vantage + MarketData.app
 */

export interface OptionsContract {
  contractSymbol: string;
  strike: number;
  expiration: string;
  type: 'call' | 'put';
  lastPrice: number;
  bid: number;
  ask: number;
  volume: number;
  openInterest: number;
  impliedVolatility?: number;
  delta?: number;
  gamma?: number;
  theta?: number;
  vega?: number;
}

export interface OptionsChainData {
  symbol: string;
  calls: OptionsContract[];
  puts: OptionsContract[];
  putCallRatio: number;
  totalVolume: number;
  unusualActivity: OptionsContract[];
}

export interface OptionsAnalysis {
  putCallRatio: number;
  impliedVolatility: number;
  maxPain: number;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  unusualActivity: {
    contract: string;
    type: 'call' | 'put';
    volume: number;
    reason: string;
  }[];
  summary: string;
}

/**
 * Get options chain from MarketData.app
 */
async function getMarketDataOptions(ticker: string): Promise<OptionsContract[]> {
  const apiKey = process.env.MARKETDATA_API_KEY;
  
  if (!apiKey) {
    console.warn('MarketData API key not found');
    return [];
  }

  try {
    const response = await fetch(
      `https://api.marketdata.app/v1/options/chain/${ticker}/?token=${apiKey}`,
      { next: { revalidate: 300 } } // Cache for 5 minutes
    );

    if (!response.ok) {
      throw new Error(`MarketData API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.s !== 'ok') {
      return [];
    }

    // Parse the response
    const contracts: OptionsContract[] = [];
    const symbols = data.optionSymbol || [];
    
    for (let i = 0; i < symbols.length; i++) {
      contracts.push({
        contractSymbol: symbols[i],
        strike: data.strike?.[i] || 0,
        expiration: data.expiration?.[i] || '',
        type: data.side?.[i] === 'call' ? 'call' : 'put',
        lastPrice: data.last?.[i] || 0,
        bid: data.bid?.[i] || 0,
        ask: data.ask?.[i] || 0,
        volume: data.volume?.[i] || 0,
        openInterest: data.openInterest?.[i] || 0,
      });
    }

    return contracts;
  } catch (error) {
    console.error('Error fetching MarketData options:', error);
    return [];
  }
}

/**
 * Get options data from Alpha Vantage (includes Greeks)
 */
async function getAlphaVantageOptions(ticker: string): Promise<OptionsContract[]> {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  
  if (!apiKey) {
    console.warn('Alpha Vantage API key not found');
    return [];
  }

  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=REALTIME_OPTIONS&symbol=${ticker}&apikey=${apiKey}`,
      { next: { revalidate: 300 } } // Cache for 5 minutes
    );

    if (!response.ok) {
      throw new Error(`Alpha Vantage API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.data || data.data.length === 0) {
      return [];
    }

    // Parse Alpha Vantage response
    const contracts: OptionsContract[] = data.data.map((contract: any) => ({
      contractSymbol: contract.contractID || '',
      strike: parseFloat(contract.strike) || 0,
      expiration: contract.expiration || '',
      type: contract.type === 'call' ? 'call' : 'put',
      lastPrice: parseFloat(contract.last) || 0,
      bid: parseFloat(contract.bid) || 0,
      ask: parseFloat(contract.ask) || 0,
      volume: parseInt(contract.volume) || 0,
      openInterest: parseInt(contract.openInterest) || 0,
      impliedVolatility: parseFloat(contract.impliedVolatility) || undefined,
      delta: parseFloat(contract.delta) || undefined,
      gamma: parseFloat(contract.gamma) || undefined,
      theta: parseFloat(contract.theta) || undefined,
      vega: parseFloat(contract.vega) || undefined,
    }));

    return contracts;
  } catch (error) {
    console.error('Error fetching Alpha Vantage options:', error);
    return [];
  }
}

/**
 * Get complete options chain with analysis
 */
export async function getOptionsChain(ticker: string): Promise<OptionsChainData | null> {
  try {
    // Try both sources and merge
    const [marketDataContracts, alphaVantageContracts] = await Promise.all([
      getMarketDataOptions(ticker),
      getAlphaVantageOptions(ticker),
    ]);

    // Prefer Alpha Vantage (has Greeks), fallback to MarketData
    const contracts = alphaVantageContracts.length > 0 
      ? alphaVantageContracts 
      : marketDataContracts;

    if (contracts.length === 0) {
      return null;
    }

    // Separate calls and puts
    const calls = contracts.filter(c => c.type === 'call');
    const puts = contracts.filter(c => c.type === 'put');

    // Calculate Put/Call ratio
    const callVolume = calls.reduce((sum, c) => sum + c.volume, 0);
    const putVolume = puts.reduce((sum, c) => sum + c.volume, 0);
    const putCallRatio = callVolume > 0 ? putVolume / callVolume : 0;

    // Find unusual activity (volume > 2x open interest)
    const unusualActivity = contracts.filter(c => 
      c.volume > 0 && c.openInterest > 0 && c.volume > c.openInterest * 2
    ).slice(0, 5);

    return {
      symbol: ticker,
      calls,
      puts,
      putCallRatio,
      totalVolume: callVolume + putVolume,
      unusualActivity,
    };
  } catch (error) {
    console.error('Error getting options chain:', error);
    return null;
  }
}

/**
 * Analyze options data for trading insights
 */
export async function analyzeOptions(ticker: string): Promise<OptionsAnalysis | null> {
  const chain = await getOptionsChain(ticker);
  
  if (!chain) {
    return null;
  }

  // Calculate average implied volatility
  const contractsWithIV = [...chain.calls, ...chain.puts].filter(c => c.impliedVolatility);
  const avgIV = contractsWithIV.length > 0
    ? contractsWithIV.reduce((sum, c) => sum + (c.impliedVolatility || 0), 0) / contractsWithIV.length
    : 0;

  // Calculate max pain (strike with most open interest)
  const strikeOI = new Map<number, number>();
  [...chain.calls, ...chain.puts].forEach(c => {
    const current = strikeOI.get(c.strike) || 0;
    strikeOI.set(c.strike, current + c.openInterest);
  });
  
  let maxPain = 0;
  let maxOI = 0;
  strikeOI.forEach((oi, strike) => {
    if (oi > maxOI) {
      maxOI = oi;
      maxPain = strike;
    }
  });

  // Determine sentiment
  let sentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral';
  if (chain.putCallRatio < 0.7) sentiment = 'bullish';
  else if (chain.putCallRatio > 1.3) sentiment = 'bearish';

  // Format unusual activity
  const unusualActivity = chain.unusualActivity.map(c => ({
    contract: c.contractSymbol,
    type: c.type,
    volume: c.volume,
    reason: `Volume ${c.volume} vs OI ${c.openInterest} (${(c.volume / c.openInterest).toFixed(1)}x)`
  }));

  return {
    putCallRatio: Math.round(chain.putCallRatio * 100) / 100,
    impliedVolatility: Math.round(avgIV * 100),
    maxPain,
    sentiment,
    unusualActivity,
    summary: `${sentiment.toUpperCase()} - P/C Ratio: ${chain.putCallRatio.toFixed(2)}, IV: ${Math.round(avgIV * 100)}%, Max Pain: $${maxPain}`
  };
}
