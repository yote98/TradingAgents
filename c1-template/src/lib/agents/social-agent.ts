/**
 * 📱 Social Sentiment Analyst
 * Analyzes social media sentiment from Reddit and Twitter
 */

import { getSocialSentimentClient } from '../data/social-sentiment-client';

export interface SocialAnalysis {
  signal: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  sentiment: {
    overall: number; // -100 to 100
    reddit: number;
    twitter: number;
  };
  volume: {
    mentions: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  };
  keyTopics: string[];
  summary: string;
}

export async function analyzeSocial(ticker: string): Promise<SocialAnalysis> {
  try {
    const client = getSocialSentimentClient();
    const sentiment = await client.getSentiment(ticker);

    // Calculate overall sentiment score
    const overallScore = (sentiment.reddit.score + sentiment.twitter.score) / 2;
    
    // Determine signal based on sentiment
    let signal: 'bullish' | 'bearish' | 'neutral';
    if (overallScore > 20) signal = 'bullish';
    else if (overallScore < -20) signal = 'bearish';
    else signal = 'neutral';

    // Calculate confidence based on volume and consistency
    const volumeScore = Math.min((sentiment.reddit.mentions + sentiment.twitter.mentions) / 100, 1);
    const consistencyScore = 1 - Math.abs(sentiment.reddit.score - sentiment.twitter.score) / 100;
    const confidence = Math.round((volumeScore * 0.4 + consistencyScore * 0.6) * 100);

    // Determine volume trend
    const totalMentions = sentiment.reddit.mentions + sentiment.twitter.mentions;
    let volumeTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (totalMentions > 500) volumeTrend = 'increasing';
    else if (totalMentions < 100) volumeTrend = 'decreasing';

    // Extract key topics
    const keyTopics = [
      ...sentiment.reddit.topics.slice(0, 3),
      ...sentiment.twitter.topics.slice(0, 2)
    ];

    // Generate summary
    const summary = generateSummary(signal, overallScore, totalMentions, keyTopics);

    return {
      signal,
      confidence,
      sentiment: {
        overall: Math.round(overallScore),
        reddit: Math.round(sentiment.reddit.score),
        twitter: Math.round(sentiment.twitter.score),
      },
      volume: {
        mentions: totalMentions,
        trend: volumeTrend,
      },
      keyTopics,
      summary,
    };
  } catch (error) {
    console.error('Social analysis error:', error);
    
    // Return neutral analysis on error
    return {
      signal: 'neutral',
      confidence: 0,
      sentiment: {
        overall: 0,
        reddit: 0,
        twitter: 0,
      },
      volume: {
        mentions: 0,
        trend: 'stable',
      },
      keyTopics: [],
      summary: 'Social sentiment data unavailable.',
    };
  }
}

function generateSummary(
  signal: string,
  score: number,
  mentions: number,
  topics: string[]
): string {
  const sentiment = signal.toUpperCase();
  const topicsStr = topics.length > 0 ? ` Key topics: ${topics.join(', ')}.` : '';
  
  if (mentions === 0) {
    return 'Limited social media activity detected.';
  }
  
  return `${sentiment} social sentiment (${score > 0 ? '+' : ''}${score.toFixed(0)}) with ${mentions} mentions across Reddit and Twitter.${topicsStr}`;
}
