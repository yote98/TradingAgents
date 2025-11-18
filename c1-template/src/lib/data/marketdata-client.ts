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
      console.warn('ALPHA_VANTAGE_API_KEY not set, news unavailable');
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
      
      if (!data.feed || data.feed.length === 0) {
        console.warn('No news data returned from Alpha Vantage');
        return [];
      }

      return data.feed.map((item: any) => ({
        title: item.title || '',
        source: item.source || 'Unknown',
        url: item.url || '',
        publishedAt: item.time_published || '',
        sentiment: item.overall_sentiment_label?.toLowerCase() as any || 'neutral',
      }));
    } catch (error) {
      console.error('Error fetching news from Alpha Vantage:', error);
      return [];
    }
  }

  async getFundamentals(ticker: string) {
    // Try FMP first (better data), fallback to Alpha Vantage
    const fmpKey = process.env.FMP_API_KEY;
    const alphaVantageKey = process.env.ALPHA_VANTAGE_API_KEY;
    
    // Try FMP v3 API (non-legacy endpoints)
    if (fmpKey) {
      try {
        // Use multiple v3 endpoints that are NOT legacy
        const [quoteRes, ratiosRes, metricsRes] = await Promise.all([
          fetch(`https://financialmodelingprep.com/api/v3/quote/${ticker}?apikey=${fmpKey}`, 
            { next: { revalidate: 3600 } }),
          fetch(`https://financialmodelingprep.com/api/v3/ratios-ttm/${ticker}?apikey=${fmpKey}`, 
            { next: { revalidate: 86400 } }),
          fetch(`https://financialmodelingprep.com/api/v3/key-metrics-ttm/${ticker}?apikey=${fmpKey}`, 
            { next: { revalidate: 86400 } }),
        ]);

        if (quoteRes.ok && ratiosRes.ok && metricsRes.ok) {
          const [quoteData, ratiosData, metricsData] = await Promise.all([
            quoteRes.json(),
            ratiosRes.json(),
            metricsRes.json(),
          ]);

          const quote = quoteData[0];
          const ratios = ratiosData[0];
          const metrics = metricsData[0];

          if (quote && quote.symbol) {
            return {
              marketCap: quote.marketCap || 0,
              peRatio: quote.pe || ratios?.peRatioTTM || null,
              pegRatio: ratios?.pegRatioTTM || null,
              priceToBook: ratios?.priceToBookRatioTTM || null,
              debtToEquity: ratios?.debtToEquityTTM || null,
              dividendYield: metrics?.dividendYieldTTM || null,
              eps: quote.eps || metrics?.netIncomePerShareTTM || null,
              revenuePerShare: metrics?.revenuePerShareTTM || null,
              profitMargin: ratios?.netProfitMarginTTM || null,
              operatingMargin: ratios?.operatingProfitMarginTTM || null,
              returnOnAssets: ratios?.returnOnAssetsTTM || null,
              returnOnEquity: ratios?.returnOnEquityTTM || null,
              currentRatio: ratios?.currentRatioTTM || null,
              beta: metrics?.betaTTM || null,
              fiftyTwoWeekHigh: quote.yearHigh || null,
              fiftyTwoWeekLow: quote.yearLow || null,
              sector: quote.sector || 'Unknown',
              industry: quote.industry || 'Unknown',
              description: quote.exchange || '',
              companyName: quote.name || ticker,
              source: 'FMP',
            };
          }
        }
      } catch (error) {
        console.warn('FMP failed, trying Alpha Vantage fallback:', error);
      }
    }

    // Fallback to Alpha Vantage
    if (!alphaVantageKey) {
      console.warn('No API keys available for fundamentals');
      return null;
    }

    try {
      const response = await fetch(
        `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${ticker}&apikey=${alphaVantageKey}`,
        { next: { revalidate: 86400 } }
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      
      if (!data.Symbol) {
        return null;
      }

      return {
        marketCap: parseFloat(data.MarketCapitalization) || 0,
        peRatio: parseFloat(data.PERatio) || null,
        pegRatio: parseFloat(data.PEGRatio) || null,
        priceToBook: parseFloat(data.PriceToBookRatio) || null,
        debtToEquity: parseFloat(data.DebtToEquity) || null,
        dividendYield: parseFloat(data.DividendYield) || null,
        eps: parseFloat(data.EPS) || null,
        revenuePerShare: parseFloat(data.RevenuePerShareTTM) || null,
        profitMargin: parseFloat(data.ProfitMargin) || null,
        operatingMargin: parseFloat(data.OperatingMarginTTM) || null,
        returnOnAssets: parseFloat(data.ReturnOnAssetsTTM) || null,
        returnOnEquity: parseFloat(data.ReturnOnEquityTTM) || null,
        currentRatio: null,
        beta: parseFloat(data.Beta) || null,
        fiftyTwoWeekHigh: parseFloat(data['52WeekHigh']) || null,
        fiftyTwoWeekLow: parseFloat(data['52WeekLow']) || null,
        sector: data.Sector || 'Unknown',
        industry: data.Industry || 'Unknown',
        description: data.Description || '',
        companyName: data.Name || ticker,
        source: 'Alpha Vantage',
      };
    } catch (error) {
      console.error('Error fetching fundamentals:', error);
      return null;
    }
  }

  async getSocialSentiment(ticker: string) {
    // Use Nitter RSS feeds for Twitter sentiment (free!)
    const { getSocialSentimentClient } = await import('./social-sentiment-client');
    const socialClient = getSocialSentimentClient();
    
    try {
      const sentiment = await socialClient.getSocialSentiment(ticker);
      return sentiment;
    } catch (error) {
      console.error('Social sentiment failed, using news fallback:', error);
      
      // Fallback to news sentiment
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
        trending: news.length > 15,
      };
    }
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
