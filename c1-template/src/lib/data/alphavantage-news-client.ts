/**
 * Alpha Vantage News Sentiment API Client
 * Provides news articles with sentiment scores
 */

export interface AlphaVantageNewsItem {
  title: string;
  url: string;
  time_published: string;
  authors: string[];
  summary: string;
  source: string;
  sentiment_score: number; // -1 to 1
  sentiment_label: 'Bearish' | 'Somewhat-Bearish' | 'Neutral' | 'Somewhat-Bullish' | 'Bullish';
  ticker_sentiment: Array<{
    ticker: string;
    relevance_score: number;
    ticker_sentiment_score: number;
    ticker_sentiment_label: string;
  }>;
}

export interface AlphaVantageNewsResponse {
  items: string;
  sentiment_score_definition: string;
  relevance_score_definition: string;
  feed: AlphaVantageNewsItem[];
}

export async function getAlphaVantageNews(ticker: string, limit: number = 10): Promise<AlphaVantageNewsItem[]> {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  
  if (!apiKey) {
    console.warn('Alpha Vantage API key not found');
    return [];
  }

  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${ticker}&limit=${limit}&apikey=${apiKey}`,
      { next: { revalidate: 300 } } // Cache for 5 minutes
    );

    if (!response.ok) {
      throw new Error(`Alpha Vantage API error: ${response.status}`);
    }

    const data: AlphaVantageNewsResponse = await response.json();
    
    if (!data.feed || data.feed.length === 0) {
      return [];
    }

    return data.feed;
  } catch (error) {
    console.error('Error fetching Alpha Vantage news:', error);
    return [];
  }
}

export function convertToNewsItems(alphaNews: AlphaVantageNewsItem[], ticker: string) {
  return alphaNews.map(item => {
    // Find ticker-specific sentiment
    const tickerSentiment = item.ticker_sentiment?.find(ts => ts.ticker === ticker);
    
    // Convert sentiment score (-1 to 1) to our format
    const sentimentScore = tickerSentiment?.ticker_sentiment_score || item.sentiment_score;
    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    
    if (sentimentScore > 0.15) sentiment = 'positive';
    else if (sentimentScore < -0.15) sentiment = 'negative';

    return {
      title: item.title,
      url: item.url,
      publishedAt: item.time_published,
      source: item.source,
      summary: item.summary,
      sentiment,
      sentimentScore: Math.round((sentimentScore + 1) * 50), // Convert -1..1 to 0..100
      relevance: tickerSentiment?.relevance_score || 0.5
    };
  });
}
