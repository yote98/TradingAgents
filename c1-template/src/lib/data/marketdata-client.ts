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
    const alphaVantageKey = process.env.ALPHA_VANTAGE_API_KEY;
    
    if (!alphaVantageKey) {
      return [];
    }

    try {
      const response = await fetch(
        `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${ticker}&limit=${limit}&apikey=${alphaVantageKey}`,
        { next: { revalidate: 1800 } } // Cache for 30 minutes
      );

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      
      if (!data.feed) {
        return [];
      }

      return data.feed.map((item: any) => ({
        title: item.title,
        source: item.source,
        url: item.url,
        publishedAt: item.time_published,
        sentiment: item.overall_sentiment_label?.toLowerCase() as any,
      }));
    } catch (error) {
      console.error('Error fetching news:', error);
      return [];
    }
  }

  async getFundamentals(ticker: string) {
    const alphaVantageKey = process.env.ALPHA_VANTAGE_API_KEY;
    
    if (!alphaVantageKey) {
      return null;
    }

    try {
      const response = await fetch(
        `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${ticker}&apikey=${alphaVantageKey}`,
        { next: { revalidate: 86400 } } // Cache for 24 hours
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      
      return {
        marketCap: parseFloat(data.MarketCapitalization) || 0,
        peRatio: parseFloat(data.PERatio) || null,
        pegRatio: parseFloat(data.PEGRatio) || null,
        bookValue: parseFloat(data.BookValue) || null,
        dividendYield: parseFloat(data.DividendYield) || null,
        eps: parseFloat(data.EPS) || null,
        revenuePerShare: parseFloat(data.RevenuePerShareTTM) || null,
        profitMargin: parseFloat(data.ProfitMargin) || null,
        operatingMargin: parseFloat(data.OperatingMarginTTM) || null,
        returnOnAssets: parseFloat(data.ReturnOnAssetsTTM) || null,
        returnOnEquity: parseFloat(data.ReturnOnEquityTTM) || null,
        revenue: parseFloat(data.RevenueTTM) || null,
        grossProfit: parseFloat(data.GrossProfitTTM) || null,
        quarterlyEarningsGrowth: parseFloat(data.QuarterlyEarningsGrowthYOY) || null,
        quarterlyRevenueGrowth: parseFloat(data.QuarterlyRevenueGrowthYOY) || null,
        analystTargetPrice: parseFloat(data.AnalystTargetPrice) || null,
        fiftyTwoWeekHigh: parseFloat(data['52WeekHigh']) || null,
        fiftyTwoWeekLow: parseFloat(data['52WeekLow']) || null,
        fiftyDayMA: parseFloat(data['50DayMovingAverage']) || null,
        twoHundredDayMA: parseFloat(data['200DayMovingAverage']) || null,
        sector: data.Sector || 'Unknown',
        industry: data.Industry || 'Unknown',
        description: data.Description || '',
      };
    } catch (error) {
      console.error('Error fetching fundamentals:', error);
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
