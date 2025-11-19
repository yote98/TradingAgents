/**
 * Reddit Social Sentiment Client
 * Fetches stock mentions from r/wallstreetbets, r/stocks, r/investing
 */

export interface RedditPost {
  title: string;
  score: number;
  num_comments: number;
  created_utc: number;
  url: string;
  selftext: string;
  subreddit: string;
}

export interface RedditSentiment {
  mentions: number;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  sentimentScore: number; // 0-100
  topPosts: RedditPost[];
  trending: boolean;
}

export async function getRedditSentiment(ticker: string): Promise<RedditSentiment | null> {
  // For now, use Reddit's public JSON API (no auth needed)
  // Format: https://www.reddit.com/r/wallstreetbets/search.json?q=AAPL&restrict_sr=1&sort=hot&limit=25
  
  const subreddits = ['wallstreetbets', 'stocks', 'investing'];
  const allPosts: RedditPost[] = [];
  
  try {
    for (const subreddit of subreddits) {
      const url = `https://www.reddit.com/r/${subreddit}/search.json?q=${ticker}&restrict_sr=1&sort=hot&limit=10&t=week`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'TradingAgents/1.0'
        },
        next: { revalidate: 600 } // Cache for 10 minutes
      });

      if (response.ok) {
        const data = await response.json();
        const posts = data.data?.children?.map((child: any) => child.data) || [];
        allPosts.push(...posts);
      }
    }

    if (allPosts.length === 0) {
      return null;
    }

    // Calculate sentiment based on post scores and keywords
    let bullishCount = 0;
    let bearishCount = 0;
    
    const bullishKeywords = ['buy', 'calls', 'moon', 'bullish', 'long', 'hold', 'rocket', '🚀', 'to the moon'];
    const bearishKeywords = ['sell', 'puts', 'bearish', 'short', 'crash', 'dump', 'overvalued'];

    allPosts.forEach(post => {
      const text = (post.title + ' ' + post.selftext).toLowerCase();
      
      const hasBullish = bullishKeywords.some(keyword => text.includes(keyword));
      const hasBearish = bearishKeywords.some(keyword => text.includes(keyword));
      
      if (hasBullish && !hasBearish) bullishCount++;
      else if (hasBearish && !hasBullish) bearishCount++;
    });

    const total = allPosts.length;
    const sentimentScore = Math.round(((bullishCount - bearishCount) / total + 1) * 50);
    
    let sentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    if (sentimentScore > 60) sentiment = 'bullish';
    else if (sentimentScore < 40) sentiment = 'bearish';

    // Sort by score and get top posts
    const topPosts = allPosts
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    return {
      mentions: allPosts.length,
      sentiment,
      sentimentScore,
      topPosts,
      trending: allPosts.length > 15 // Consider trending if many mentions
    };
  } catch (error) {
    console.error('Error fetching Reddit sentiment:', error);
    return null;
  }
}
