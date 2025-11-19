/**
 * TwitterAPI.io Client
 * Real-time Twitter/X data without official API
 * Cost: $0.15 per 1,000 tweets
 */

export interface Tweet {
  id: string;
  text: string;
  author: string;
  authorUsername: string;
  createdAt: string;
  likes: number;
  retweets: number;
  replies: number;
  url: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export interface TwitterSentiment {
  score: number; // 0-100
  volume: number;
  positive: number;
  negative: number;
  neutral: number;
  trending: boolean;
  tweets: Tweet[];
}

/**
 * Get tweets about a stock ticker from financial Twitter accounts
 */
export async function getTwitterSentiment(ticker: string): Promise<TwitterSentiment | null> {
  const apiKey = process.env.TWITTER_API_KEY;
  
  if (!apiKey) {
    console.warn('Twitter API key not found');
    return null;
  }

  // Curated financial Twitter accounts
  const financialAccounts = [
    'unusual_whales',
    'deitaone',
    'zerohedge',
    'financialjuice',
    'stocktalkweekly',
    'chartchampions',
  ];

  try {
    const allTweets: Tweet[] = [];

    // Search tweets mentioning the ticker
    const searchUrl = `https://api.twitterapi.io/v1/search?query=${ticker}&count=20`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 600 } // Cache for 10 minutes
    });

    if (!response.ok) {
      console.error(`TwitterAPI.io error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    if (!data.data || data.data.length === 0) {
      return null;
    }

    // Parse tweets
    for (const tweet of data.data) {
      const text = tweet.text || '';
      
      allTweets.push({
        id: tweet.id,
        text,
        author: tweet.author?.name || 'Unknown',
        authorUsername: tweet.author?.username || 'unknown',
        createdAt: tweet.created_at,
        likes: tweet.public_metrics?.like_count || 0,
        retweets: tweet.public_metrics?.retweet_count || 0,
        replies: tweet.public_metrics?.reply_count || 0,
        url: `https://twitter.com/${tweet.author?.username}/status/${tweet.id}`,
        sentiment: analyzeSentiment(text),
      });
    }

    if (allTweets.length === 0) {
      return null;
    }

    // Calculate sentiment
    let positive = 0;
    let negative = 0;
    let neutral = 0;

    allTweets.forEach(tweet => {
      if (tweet.sentiment === 'positive') positive++;
      else if (tweet.sentiment === 'negative') negative++;
      else neutral++;
    });

    const total = allTweets.length || 1;
    const score = Math.round(((positive - negative) / total + 1) * 50);

    return {
      score,
      volume: allTweets.length,
      positive,
      negative,
      neutral,
      trending: allTweets.length > 10,
      tweets: allTweets.slice(0, 5), // Return top 5
    };
  } catch (error) {
    console.error('Error fetching Twitter sentiment:', error);
    return null;
  }
}

/**
 * Analyze sentiment of tweet text
 */
function analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
  const lowerText = text.toLowerCase();
  
  // Positive keywords
  const positiveKeywords = [
    'bullish', 'buy', 'long', 'calls', 'moon', 'rocket', 'breakout',
    'strong', 'upgrade', 'beat', 'growth', 'rally', 'surge', 'gain',
    'bullish af', 'to the moon', '🚀', '📈', '💎', '🔥'
  ];
  
  // Negative keywords
  const negativeKeywords = [
    'bearish', 'sell', 'short', 'puts', 'crash', 'dump', 'breakdown',
    'weak', 'downgrade', 'miss', 'decline', 'drop', 'fall', 'loss',
    'overvalued', 'bubble', '📉', '💩'
  ];

  let positiveCount = 0;
  let negativeCount = 0;

  positiveKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) positiveCount++;
  });

  negativeKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) negativeCount++;
  });

  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

/**
 * Get tweets from specific financial Twitter account
 */
export async function getTweetsFromAccount(username: string, count: number = 10): Promise<Tweet[]> {
  const apiKey = process.env.TWITTER_API_KEY;
  
  if (!apiKey) {
    return [];
  }

  try {
    const url = `https://api.twitterapi.io/v1/user/timeline?username=${username}&count=${count}`;
    
    const response = await fetch(url, {
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 600 }
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    
    if (!data.data) {
      return [];
    }

    return data.data.map((tweet: any) => ({
      id: tweet.id,
      text: tweet.text,
      author: tweet.author?.name || username,
      authorUsername: username,
      createdAt: tweet.created_at,
      likes: tweet.public_metrics?.like_count || 0,
      retweets: tweet.public_metrics?.retweet_count || 0,
      replies: tweet.public_metrics?.reply_count || 0,
      url: `https://twitter.com/${username}/status/${tweet.id}`,
      sentiment: analyzeSentiment(tweet.text),
    }));
  } catch (error) {
    console.error(`Error fetching tweets from @${username}:`, error);
    return [];
  }
}
