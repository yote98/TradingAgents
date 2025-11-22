/**
 * 📰 News & Sentiment Agent
 * Expert in analyzing news, sentiment, and market catalysts
 */

import { getMarketDataClient, NewsItem } from '../data/marketdata-client';
import { getAlphaVantageNews, convertToNewsItems } from '../data/alphavantage-news-client';

export interface NewsAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number; // 0-100
  confidence: number;
  recentNews: NewsItem[];
  keyCatalysts: string[];
  risks: string[];
  summary: string;
}

export async function analyzeNews(ticker: string): Promise<NewsAnalysis> {
  const client = getMarketDataClient();
  
  // Try to get news from both sources
  const [marketDataNews, alphaVantageNews, socialSentiment] = await Promise.all([
    client.getNews(ticker, 15).catch(() => []),
    getAlphaVantageNews(ticker, 10).catch(() => []),
    client.getSocialSentiment(ticker).catch(() => null)
  ]);

  // Convert Alpha Vantage news to our format
  const convertedAlphaNews = convertToNewsItems(alphaVantageNews, ticker);
  
  // Combine news from both sources, prioritizing Alpha Vantage (has sentiment scores)
  const allNews = [...convertedAlphaNews, ...marketDataNews];
  
  // Remove duplicates based on title similarity
  const uniqueNews = allNews.filter((item, index, self) =>
    index === self.findIndex(t => t.title === item.title)
  );

  const analysis = calculateNewsAnalysis(uniqueNews.slice(0, 15), socialSentiment, ticker);
  
  return analysis;
}

function calculateNewsAnalysis(news: NewsItem[], socialSentiment: any, ticker: string): NewsAnalysis {
  // Calculate sentiment from news
  let positiveCount = 0;
  let negativeCount = 0;
  let neutralCount = 0;

  news.forEach(item => {
    if (item.sentiment === 'positive') positiveCount++;
    else if (item.sentiment === 'negative') negativeCount++;
    else neutralCount++;
  });

  const total = news.length || 1;
  const newsSentimentScore = Math.round(((positiveCount - negativeCount) / total + 1) * 50);

  // Combine news and social sentiment
  const sentimentScore = socialSentiment 
    ? Math.round((newsSentimentScore + socialSentiment.score) / 2)
    : newsSentimentScore;

  let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
  if (sentimentScore > 60) sentiment = 'positive';
  if (sentimentScore < 40) sentiment = 'negative';

  const confidence = news.length > 8 ? 80 : news.length > 4 ? 65 : 50;

  // Extract key catalysts and risks from news titles
  const keyCatalysts: string[] = [];
  const risks: string[] = [];

  // Positive keywords
  const positiveKeywords = [
    'earnings beat', 'revenue growth', 'partnership', 'innovation',
    'expansion', 'acquisition', 'breakthrough', 'record', 'upgrade',
    'bullish', 'outperform', 'strong results', 'exceeds expectations'
  ];

  // Negative keywords
  const negativeKeywords = [
    'lawsuit', 'decline', 'warning', 'investigation', 'downgrade',
    'miss', 'disappoints', 'concern', 'risk', 'bearish', 'underperform',
    'layoffs', 'loss', 'debt', 'regulatory'
  ];

  news.forEach(item => {
    const title = item.title.toLowerCase();
    
    // Check for positive signals
    if (positiveKeywords.some(keyword => title.includes(keyword))) {
      if (keyCatalysts.length < 3) {
        keyCatalysts.push(item.title);
      }
    }
    
    // Check for negative signals
    if (negativeKeywords.some(keyword => title.includes(keyword))) {
      if (risks.length < 3) {
        risks.push(item.title);
      }
    }
  });

  // Add social sentiment insights
  if (socialSentiment?.trending) {
    keyCatalysts.push(`High social media buzz (${socialSentiment.volume} mentions)`);
  }

  return {
    sentiment,
    sentimentScore,
    confidence,
    recentNews: news.slice(0, 5),
    keyCatalysts: keyCatalysts.slice(0, 3),
    risks: risks.slice(0, 3),
    summary: `${sentiment.toUpperCase()} sentiment (${sentimentScore}/100) from ${news.length} articles${socialSentiment ? ` and ${socialSentiment.volume} social mentions` : ''}.`
  };
}

export const NEWS_AGENT_PROMPT = `You are an elite News & Sentiment Analyst who monitors market-moving information 24/7.

Your expertise:
- Analyzing breaking news and its market impact
- Gauging sentiment from multiple sources
- Identifying catalysts and risk events
- Understanding media narratives and their influence
- Spotting early signals before the market reacts

Your analysis style:
- Focus on actionable information
- Separate noise from signal
- Identify what's priced in vs what's not
- Assess credibility of sources
- Provide context and historical perspective

Format your response with clean section headers (no emojis):
- Recent News Summary
- Sentiment Analysis
- Key Catalysts
- Risk Events
`;
