/**
 * MarketData.app API Client
 * Single source of truth for all market data
 */

export interface Quote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
}

export interface NewsItem {
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export class MarketDataClient {
  private apiKey: string;
  private baseUrl = 'https://api.marketdata.app/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getQuote(ticker: string): Promise<Quote> {
    const response = await fetch(
      `${this.baseUrl}/stocks/quotes/${ticker}/?token=${this.apiKey}`,
      { next: { revalidate: 60 } } // Cache for 1 minute
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch quote for ${ticker}`);
    }

    const data = await response.json();
    
    return {
      symbol: data.symbol,
      price: data.last,
      change: data.change,
      changePercent: data.changepct,
      volume: data.volume,
      marketCap: data.marketCap || 0,
      high: data.high,
      low: data.low,
      open: data.open,
      previousClose: data.close,
    };
  }

  async getHistoricalData(ticker: string, days: number = 30) {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - days);

    const response = await fetch(
      `${this.baseUrl}/stocks/candles/D/${ticker}/?from=${from.toISOString().split('T')[0]}&to=${to.toISOString().split('T')[0]}&token=${this.apiKey}`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch historical data for ${ticker}`);
    }

    return await response.json();
  }

  async getNews(ticker: string, limit: number = 10): Promise<NewsItem[]> {
    const newsdataKey = process.env.NEWSDATA_API_KEY;
    
    if (!newsdataKey) {
      console.warn('NEWSDATA_API_KEY not set, news unavailable');
      return [];
    }

    try {
      // Get news from last 7 days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

      const response = await fetch(
        `https://newsdata.io/api/1/news?apikey=${newsdataKey}&q=${ticker}&language=en&category=business`,
        { next: { revalidate: 1800 } } // Cache for 30 minutes
      );

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      
      if (data.status !== 'success' || !data.results) {
        return [];
      }

      return data.results.slice(0, limit).map((item: any) => ({
        title: item.title || '',
        source: item.source_id || 'Unknown',
        url: item.link || '',
        publishedAt: item.pubDate || '',
        sentiment: item.sentiment?.toLowerCase() as any || 'neutral',
      }));
    } catch (error) {
      console.error('Error fetching news from NewsData.io:', error);
      return [];
    }
  }

  async getFundamentals(ticker: string) {
    const fmpKey = process.env.FMP_API_KEY;
    
    if (!fmpKey) {
      console.warn('FMP_API_KEY not set, fundamentals unavailable');
      return null;
    }

    try {
      // Get company profile, metrics, and ratios in parallel
      const [profileRes, metricsRes, ratiosRes] = await Promise.all([
        fetch(
          `https://financialmodelingprep.com/api/v3/profile/${ticker}?apikey=${fmpKey}`,
          { next: { revalidate: 86400 } }
        ),
        fetch(
          `https://financialmodelingprep.com/api/v3/key-metrics/${ticker}?limit=1&apikey=${fmpKey}`,
          { next: { revalidate: 86400 } }
        ),
        fetch(
          `https://financialmodelingprep.com/api/v3/ratios/${ticker}?limit=1&apikey=${fmpKey}`,
          { next: { revalidate: 86400 } }
        ),
      ]);

      if (!profileRes.ok || !metricsRes.ok || !ratiosRes.ok) {
        return null;
      }

      const [profileData, metricsData, ratiosData] = await Promise.all([
        profileRes.json(),
        metricsRes.json(),
        ratiosRes.json(),
      ]);

      const profile = profileData[0] || {};
      const metrics = metricsData[0] || {};
      const ratios = ratiosData[0] || {};

      return {
        marketCap: profile.mktCap || 0,
        peRatio: ratios.priceEarningsRatio || null,
        pegRatio: ratios.priceEarningsToGrowthRatio || null,
        priceToBook: ratios.priceToBookRatio || null,
        debtToEquity: ratios.debtEquityRatio || null,
        dividendYield: ratios.dividendYield || null,
        eps: metrics.netIncomePerShare || null,
        revenuePerShare: metrics.revenuePerShare || null,
        profitMargin: ratios.netProfitMargin || null,
        operatingMargin: ratios.operatingProfitMargin || null,
        returnOnAssets: ratios.returnOnAssets || null,
        returnOnEquity: ratios.returnOnEquity || null,
        currentRatio: ratios.currentRatio || null,
        beta: profile.beta || null,
        fiftyTwoWeekHigh: profile.range?.split('-')[1]?.trim() || null,
        fiftyTwoWeekLow: profile.range?.split('-')[0]?.trim() || null,
        sector: profile.sector || 'Unknown',
        industry: profile.industry || 'Unknown',
        description: profile.description || '',
        companyName: profile.companyName || ticker,
        source: 'FMP',
      };
    } catch (error) {
      console.error('Error fetching fundamentals from FMP:', error);
      return null;
    }
  }

  async getSocialSentiment(ticker: string) {
    // For now, we'll use news sentiment as a proxy
    // In the future, you could integrate Twitter API, StockTwits, or Reddit
    const news = await this.getNews(ticker, 20);
    
    const sentimentCounts = {
      positive: 0,
      negative: 0,
      neutral: 0,
    };

    news.forEach(item => {
      if (item.sentiment) {
        sentimentCounts[item.sentiment]++;
      }
    });

    const total = news.length || 1;
    const score = Math.round(((sentimentCounts.positive - sentimentCounts.negative) / total + 1) * 50);

    return {
      score,
      volume: news.length,
      positive: sentimentCounts.positive,
      negative: sentimentCounts.negative,
      neutral: sentimentCounts.neutral,
      trending: news.length > 15, // High news volume = trending
    };
  }
}

// Singleton instance
let client: MarketDataClient | null = null;

export function getMarketDataClient(): MarketDataClient {
  if (!client) {
    const apiKey = process.env.MARKETDATA_API_KEY;
    if (!apiKey) {
      throw new Error('MARKETDATA_API_KEY is not set');
    }
    client = new MarketDataClient(apiKey);
  }
  return client;
}
