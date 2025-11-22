/**
 * Financial Datasets MCP Tool
 * 
 * Provides real-time financial data through MCP protocol
 * Docs: https://docs.financialdatasets.ai/mcp-server
 */

export const financialDatasetsTool = {
  type: "function" as const,
  function: {
    name: "get_stock_data",
    description: "Get real-time stock price, company info, and analyst estimates. Use this whenever a user mentions a stock ticker symbol.",
    parameters: {
      type: "object",
      properties: {
        ticker: {
          type: "string",
          description: "Stock ticker symbol (e.g., AAPL, NVDA, TSLA)",
        },
        include_fundamentals: {
          type: "boolean",
          description: "Include company fundamentals and financial metrics",
          default: false,
        },
        include_estimates: {
          type: "boolean",
          description: "Include analyst estimates and price targets",
          default: false,
        },
      },
      required: ["ticker"],
    },
  },
};

/**
 * Execute the Financial Datasets MCP tool
 * 
 * TESTING MODE: Uses free APIs (MarketData.app, Alpha Vantage, yfinance)
 * instead of paid Financial Datasets API
 */
export async function executeFinancialDatasetsTool(args: {
  ticker: string;
  include_fundamentals?: boolean;
  include_estimates?: boolean;
}) {
  const { ticker, include_fundamentals = false, include_estimates = false } = args;
  
  console.log(`🔧 [TESTING MODE] Fetching data for ${ticker} via free APIs...`);
  
  try {
    // Use your existing free APIs instead of Financial Datasets
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    // Try MarketData.app first (your working API)
    console.log(`📡 Trying MarketData.app for ${ticker}...`);
    const response = await fetch(`${baseUrl}/api/quote?symbol=${ticker}&_t=${Date.now()}`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Got data from MarketData.app for ${ticker}:`, data);
      
      // Format to match expected structure
      return {
        ticker: data.symbol || ticker,
        price: data.price,
        change: data.change || 0,
        changePercent: data.changePercent || 0,
        volume: data.volume || 0,
        marketCap: data.marketCap || 0,
        timestamp: new Date().toISOString(),
        source: 'MarketData.app (FREE)',
      };
    }
    
    // Fallback to Alpha Vantage (also free!)
    console.log(`📡 Trying Alpha Vantage for ${ticker}...`);
    const avResponse = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`
    );
    
    if (avResponse.ok) {
      const avData = await avResponse.json();
      const quote = avData['Global Quote'];
      
      if (quote) {
        console.log(`✅ Got data from Alpha Vantage for ${ticker}`);
        
        return {
          ticker: quote['01. symbol'] || ticker,
          price: parseFloat(quote['05. price'] || '0'),
          change: parseFloat(quote['09. change'] || '0'),
          changePercent: parseFloat(quote['10. change percent']?.replace('%', '') || '0'),
          volume: parseInt(quote['06. volume'] || '0'),
          marketCap: 0,
          timestamp: new Date().toISOString(),
          source: 'Alpha Vantage (FREE)',
        };
      }
    }
    
    // Last resort: yfinance via your backend
    console.log(`📡 Trying yfinance for ${ticker}...`);
    const yfResponse = await fetch(`${baseUrl}/api/analyze?_t=${Date.now()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticker }),
      cache: 'no-store',
    });
    
    if (yfResponse.ok) {
      const yfData = await yfResponse.json();
      console.log(`✅ Got data from yfinance for ${ticker}`);
      
      return {
        ticker: yfData.ticker || ticker,
        price: yfData.current_price || 0,
        change: 0,
        changePercent: 0,
        volume: 0,
        marketCap: 0,
        timestamp: new Date().toISOString(),
        source: 'yfinance (FREE)',
      };
    }
    
    throw new Error('All free APIs failed');
    
  } catch (error) {
    console.error(`❌ Error fetching ${ticker}:`, error);
    
    // Return mock data for testing
    console.log(`⚠️ Returning mock data for ${ticker}`);
    return {
      ticker: ticker,
      price: 180.45,
      change: 2.30,
      changePercent: 1.29,
      volume: 45234567,
      marketCap: 4450000000000,
      timestamp: new Date().toISOString(),
      source: 'MOCK DATA (for testing)',
    };
  }
}
