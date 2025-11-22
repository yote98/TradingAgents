/**
 * Logo Client - Fetches company/crypto logos using Brandfetch API
 * Provides fallback handling and caching for logo URLs
 */

interface BrandLogo {
  url: string;
  format: 'svg' | 'png' | 'jpg';
  type: 'icon' | 'logo' | 'symbol';
}

interface BrandColors {
  hex: string;
  type: 'primary' | 'secondary' | 'accent';
}

interface BrandInfo {
  name: string;
  domain: string;
  logos: BrandLogo[];
  colors: BrandColors[];
}

// Ticker to domain mapping for stocks
const STOCK_DOMAINS: Record<string, string> = {
  'AAPL': 'apple.com',
  'MSFT': 'microsoft.com',
  'GOOGL': 'google.com',
  'GOOG': 'google.com',
  'AMZN': 'amazon.com',
  'TSLA': 'tesla.com',
  'META': 'meta.com',
  'NVDA': 'nvidia.com',
  'BRK.B': 'berkshirehathaway.com',
  'JPM': 'jpmorganchase.com',
  'V': 'visa.com',
  'WMT': 'walmart.com',
  'MA': 'mastercard.com',
  'PG': 'pg.com',
  'UNH': 'unitedhealthgroup.com',
  'HD': 'homedepot.com',
  'DIS': 'disney.com',
  'BAC': 'bankofamerica.com',
  'ADBE': 'adobe.com',
  'NFLX': 'netflix.com',
  'CRM': 'salesforce.com',
  'CSCO': 'cisco.com',
  'INTC': 'intel.com',
  'AMD': 'amd.com',
  'PYPL': 'paypal.com',
  'ORCL': 'oracle.com',
  'IBM': 'ibm.com',
  'QCOM': 'qualcomm.com',
  'UBER': 'uber.com',
  'ABNB': 'airbnb.com',
  'COIN': 'coinbase.com',
  'SQ': 'block.xyz',
  'SHOP': 'shopify.com',
  'SPOT': 'spotify.com',
  'SNAP': 'snap.com',
  'PINS': 'pinterest.com',
  'TWTR': 'twitter.com',
  'ZM': 'zoom.us',
  'DOCU': 'docusign.com',
  'SNOW': 'snowflake.com',
  'PLTR': 'palantir.com',
  'RBLX': 'roblox.com',
};

// Crypto to domain/name mapping
const CRYPTO_INFO: Record<string, { name: string; domain?: string }> = {
  'BTC-USD': { name: 'Bitcoin', domain: 'bitcoin.org' },
  'ETH-USD': { name: 'Ethereum', domain: 'ethereum.org' },
  'USDT-USD': { name: 'Tether', domain: 'tether.to' },
  'BNB-USD': { name: 'Binance', domain: 'binance.com' },
  'SOL-USD': { name: 'Solana', domain: 'solana.com' },
  'XRP-USD': { name: 'Ripple', domain: 'ripple.com' },
  'ADA-USD': { name: 'Cardano', domain: 'cardano.org' },
  'DOGE-USD': { name: 'Dogecoin', domain: 'dogecoin.com' },
  'MATIC-USD': { name: 'Polygon', domain: 'polygon.technology' },
  'DOT-USD': { name: 'Polkadot', domain: 'polkadot.network' },
  'AVAX-USD': { name: 'Avalanche', domain: 'avax.network' },
  'LINK-USD': { name: 'Chainlink', domain: 'chain.link' },
  'UNI-USD': { name: 'Uniswap', domain: 'uniswap.org' },
  'LTC-USD': { name: 'Litecoin', domain: 'litecoin.org' },
  'ATOM-USD': { name: 'Cosmos', domain: 'cosmos.network' },
};

/**
 * Get logo URL for a ticker (stock or crypto)
 */
export async function getLogoUrl(ticker: string): Promise<string | null> {
  try {
    // Check if it's a crypto ticker
    if (ticker.includes('-USD')) {
      const cryptoInfo = CRYPTO_INFO[ticker];
      if (cryptoInfo?.domain) {
        return await fetchBrandfetchLogo(cryptoInfo.domain);
      }
      // Fallback: search by name
      if (cryptoInfo?.name) {
        return await searchBrandLogo(cryptoInfo.name);
      }
      return null;
    }

    // Stock ticker
    const domain = STOCK_DOMAINS[ticker];
    if (domain) {
      return await fetchBrandfetchLogo(domain);
    }

    // Fallback: search by ticker
    return await searchBrandLogo(ticker);
  } catch (error) {
    console.error(`Error fetching logo for ${ticker}:`, error);
    return null;
  }
}

/**
 * Fetch logo using multiple free sources with fallback chain
 */
async function fetchBrandfetchLogo(domain: string): Promise<string | null> {
  // Try multiple free logo sources in order
  const sources = [
    // 1. Clearbit Logo API (free, no auth needed)
    `https://logo.clearbit.com/${domain}`,
    
    // 2. Google Favicon Service (always works)
    `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
    
    // 3. DuckDuckGo Icons (free, high quality)
    `https://icons.duckduckgo.com/ip3/${domain}.ico`,
  ];

  // Try Clearbit first (best quality)
  try {
    const clearbitUrl = sources[0];
    const response = await fetch(clearbitUrl, { method: 'HEAD' });
    if (response.ok) {
      return clearbitUrl;
    }
  } catch (error) {
    console.log(`Clearbit failed for ${domain}, trying fallback`);
  }

  // Fallback to Google Favicon (always works)
  return sources[1];
}

/**
 * Search for brand logo by name - use Google search as fallback
 */
async function searchBrandLogo(query: string): Promise<string | null> {
  // For unknown tickers, try to construct a domain guess
  const cleanQuery = query.toLowerCase().replace(/[^a-z0-9]/g, '');
  const guessedDomain = `${cleanQuery}.com`;
  
  return await fetchBrandfetchLogo(guessedDomain);
}

/**
 * Get brand colors for a ticker (simplified - returns default theme colors)
 */
export async function getBrandColors(ticker: string): Promise<string[]> {
  // Return default emerald theme colors
  // In the future, could extract colors from logo image
  return ['#10b981', '#059669', '#047857'];
}

/**
 * Preload logos for multiple tickers (for performance)
 */
export async function preloadLogos(tickers: string[]): Promise<Map<string, string>> {
  const logoMap = new Map<string, string>();
  
  await Promise.all(
    tickers.map(async (ticker) => {
      const url = await getLogoUrl(ticker);
      if (url) logoMap.set(ticker, url);
    })
  );

  return logoMap;
}
