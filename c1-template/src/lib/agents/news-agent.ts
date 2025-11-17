/**
 * 📰 News & Sentiment Agent
 * Expert in analyzing news, sentiment, and market catalysts
 */

import { getMarketDataClient, NewsItem } from '../data/marketdata-client';

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
  const news = await client.getNews(ticker, 10);

  const analysis = calculateNewsAnalysis(news, ticker);
  
  return analysis;
}

function calculateNewsAnalysis(news: NewsItem[], ticker: string): NewsAnalysis {
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
  const sentimentScore = Math.round(((positiveCount - negativeCount) / total + 1) * 50);

  let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
  if (sentimentScore > 60) sentiment = 'positive';
  if (sentimentScore < 40) sentiment = 'negative';

  const confidence = news.length > 5 ? 75 : 50;

  // Extract key catalysts and risks from news titles
  const keyCatalysts: string[] = [];
  const risks: string[] = [];

  news.forEach(item => {
    const title = item.title.toLowerCase();
    
    // Positive keywords
    if (title.includes('earnings beat') || title.includes('revenue growth') || 
        title.includes('partnership') || title.includes('innovation')) {
      keyCatalysts.push(item.title);
    }
    
    // Negative keywords
    if (title.includes('lawsuit') || title.includes('decline') || 
        title.includes('warning') || title.includes('investigation')) {
      risks.push(item.title);
    }
  });

  return {
    sentiment,
    sentimentScore,
    confidence,
    recentNews: news.slice(0, 5),
    keyCatalysts: keyCatalysts.slice(0, 3),
    risks: risks.slice(0, 3),
    summary: `${sentiment.toUpperCase()} sentiment (${sentimentScore}/100) based on ${news.length} recent articles.`
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

Format your response with:
📰 Recent News Summary
📊 Sentiment Analysis
🎯 Key Catalysts
⚠️ Risk Events
`;
