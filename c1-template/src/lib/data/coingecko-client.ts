/**
 * CoinGecko API Client for Cryptocurrency Data
 * Free tier: 10-50 calls/minute (no API key needed!)
 * Docs: https://www.coingecko.com/en/api/documentation
 */

export interface CryptoQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  high: number;
  low: number;
  circulatingSupply: number;
  totalSupply: number;
  maxSupply: number | null;
  ath: number; // All-time high
  athChangePercent: number;
}

export interface CryptoMarketData {
  priceChange24h: number;
  priceChangePercentage24h: number;
  priceChangePercentage7d: number;
  priceChangePercentage30d: number;
  marketCapRank: number;
  fullyDilutedValuation: number;
}

export class CoinGeckoClient {
  private baseUrl = 'https://api.coingecko.com/api/v3';

  // Map common symbols to CoinGecko IDs
  private symbolToId: { [key: string]: string } = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'USDT': 'tether',
    'BNB': 'binancecoin',
    'SOL': 'solana',
    'XRP': 'ripple',
    'USDC': 'usd-coin',
    'ADA': 'cardano',
    'DOGE': 'dogecoin',
    'TRX': 'tron',
    'AVAX': 'avalanche-2',
    'SHIB': 'shiba-inu',
    'DOT': 'polkadot',
    'MATIC': 'matic-network',
    'LTC': 'litecoin',
  };

  private getCoinId(symbol: string): string {
    let upperSymbol = symbol.toUpperCase();
    
    // Remove -USD suffix if present (e.g., BTC-USD -> BTC)
    if (upperSymbol.endsWith('-USD')) {
      upperSymbol = upperSymbol.replace('-USD', '');
    }
    
    return this.symbolToId[upperSymbol] || symbol.toLowerCase().replace('-usd', '');
  }

  async getCryptoQuote(symbol: string): Promise<CryptoQuote | null> {
    try {
      const coinId = this.getCoinId(symbol);
      
      const response = await fetch(
        `${this.baseUrl}/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false`,
        { next: { revalidate: 60 } } // Cache for 1 minute
      );

      if (!response.ok) {
        console.warn(`CoinGecko API error for ${symbol}:`, response.status);
        return null;
      }

      const data = await response.json();
      const marketData = data.market_data;

      if (!marketData) {
        return null;
      }

      return {
        symbol: data.symbol.toUpperCase(),
        name: data.name,
        price: marketData.current_price?.usd || 0,
        change: marketData.price_change_24h || 0,
        changePercent: marketData.price_change_percentage_24h || 0,
        volume: marketData.total_volume?.usd || 0,
        marketCap: marketData.market_cap?.usd || 0,
        high: marketData.high_24h?.usd || 0,
        low: marketData.low_24h?.usd || 0,
        circulatingSupply: marketData.circulating_supply || 0,
        totalSupply: marketData.total_supply || 0,
        maxSupply: marketData.max_supply || null,
        ath: marketData.ath?.usd || 0,
        athChangePercent: marketData.ath_change_percentage?.usd || 0,
      };
    } catch (error) {
      console.error('Error fetching crypto quote from CoinGecko:', error);
      return null;
    }
  }

  async getCryptoMarketData(symbol: string): Promise<CryptoMarketData | null> {
    try {
      const coinId = this.getCoinId(symbol);
      
      const response = await fetch(
        `${this.baseUrl}/coins/${coinId}/market_chart?vs_currency=usd&days=30`,
        { next: { revalidate: 3600 } } // Cache for 1 hour
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      
      // Get simple price data for additional metrics
      const simpleResponse = await fetch(
        `${this.baseUrl}/simple/price?ids=${coinId}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true`,
        { next: { revalidate: 60 } }
      );

      const simpleData = await simpleResponse.json();
      const coinData = simpleData[coinId];

      return {
        priceChange24h: coinData?.usd_24h_change || 0,
        priceChangePercentage24h: coinData?.usd_24h_change || 0,
        priceChangePercentage7d: 0, // Calculate from chart data if needed
        priceChangePercentage30d: 0, // Calculate from chart data if needed
        marketCapRank: 0,
        fullyDilutedValuation: 0,
      };
    } catch (error) {
      console.error('Error fetching crypto market data:', error);
      return null;
    }
  }

  async searchCrypto(query: string): Promise<Array<{ id: string; symbol: string; name: string }>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/search?query=${encodeURIComponent(query)}`,
        { next: { revalidate: 86400 } } // Cache for 24 hours
      );

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      
      return (data.coins || []).slice(0, 10).map((coin: any) => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
      }));
    } catch (error) {
      console.error('Error searching crypto:', error);
      return [];
    }
  }

  isCryptoSymbol(symbol: string): boolean {
    const upperSymbol = symbol.toUpperCase();
    // Check if it's a known crypto symbol or ends with common crypto suffixes
    return (
      upperSymbol in this.symbolToId ||
      upperSymbol.endsWith('-USD') ||
      upperSymbol.endsWith('USD') && upperSymbol.length > 4 || // BTC-USD, ETH-USD
      upperSymbol.endsWith('USDT')
    );
  }
}

// Singleton instance
let client: CoinGeckoClient | null = null;

export function getCoinGeckoClient(): CoinGeckoClient {
  if (!client) {
    client = new CoinGeckoClient();
  }
  return client;
}
