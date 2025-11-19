/**
 * Social Sentiment Client
 * Uses Nitter RSS feeds to get Twitter sentiment without API costs
 * Also integrates StockTwits for additional social data
 */

export interface SocialPost {
  text: string;
  author: string;
  timestamp: Date;
  url: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export interface SocialSentiment {
  score: number; // 0-100
  volume: number;
  positive: number;
  negative: number;
  neutral: number;
  trending: boolean;
  posts: SocialPost[];
}

export class SocialSentimentClient {
  // Curated financial Twitter accounts (from your old system)
  private curatedAccounts = [
    'chartchampions',
    'unusual_whales',
    'deitaone',
    'zerohedge',
    'financialjuice',
    'stocktalkweekly',
  ];

  // Nitter instances (public RSS feed providers)
  private nitterInstances = [
    'https://nitter.net',
    'https://nitter.poast.org',
    'https://nitter.privacydev.net',
  ];

  async getSocialSentiment(ticker: string): Promise<SocialSentiment> {
    try {
      // Try Reddit first (most reliable)
      const redditPosts = await this.fetchFromReddit(ticker);
      
      // Fallback to Nitter if Reddit fails
      const nitterPosts = redditPosts.length === 0 ? await this.fetchFromNitter(ticker) : [];
      
      const allPosts = [...redditPosts, ...nitterPosts];
      
      if (allPosts.length === 0) {
        // Fallback to basic sentiment
        return {
          score: 50,
          volume: 0,
          positive: 0,
          negative: 0,
          neutral: 0,
          trending: false,
          posts: [],
        };
      }

      // Calculate sentiment from posts
      return this.calculateSentiment(allPosts);
    } catch (error) {
      console.error('Error fetching social sentiment:', error);
      return {
        score: 50,
        volume: 0,
        positive: 0,
        negative: 0,
        neutral: 0,
        trending: false,
        posts: [],
      };
    }
  }

  private async fetchFromReddit(ticker: string): Promise<SocialPost[]> {
    const posts: SocialPost[] = [];
    const subreddits = ['wallstreetbets', 'stocks', 'investing'];
    
    try {
      for (const subreddit of subreddits) {
        const url = `https://www.reddit.com/r/${subreddit}/search.json?q=${ticker}&restrict_sr=1&sort=hot&limit=10&t=week`;
        
        const response = await fetch(url, {
          headers: { 'User-Agent': 'TradingAgents/1.0' },
          next: { revalidate: 600 }, // Cache for 10 minutes
          signal: AbortSignal.timeout(5000)
        });

        if (!response.ok) continue;

        const data = await response.json();
        const redditPosts = data.data?.children || [];

        for (const child of redditPosts) {
          const post = child.data;
          const text = post.title + ' ' + (post.selftext || '');
          
          posts.push({
            text: post.title,
            author: `r/${subreddit}`,
            timestamp: new Date(post.created_utc * 1000),
            url: `https://reddit.com${post.permalink}`,
            sentiment: this.analyzeSentiment(text)
          });
        }
      }
    } catch (error) {
      console.warn('Reddit fetch failed:', error);
    }

    return posts;
  }

  private async fetchFromNitter(ticker: string): Promise<SocialPost[]> {
    const posts: SocialPost[] = [];
    const searchTerm = `$${ticker}`;

    // Try each Nitter instance
    for (const instance of this.nitterInstances) {
      try {
        // Fetch RSS feeds from curated accounts
        for (const account of this.curatedAccounts.slice(0, 3)) { // Limit to 3 accounts to avoid rate limits
          const rssUrl = `${instance}/${account}/rss`;
          
          const response = await fetch(rssUrl, {
            next: { revalidate: 1800 }, // Cache for 30 minutes
            signal: AbortSignal.timeout(5000), // 5 second timeout
          });

          if (!response.ok) continue;

          const rssText = await response.text();
          const parsedPosts = this.parseRSS(rssText, searchTerm, account);
          posts.push(...parsedPosts);

          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // If we got posts, break (don't try other instances)
        if (posts.length > 0) break;
      } catch (error) {
        console.warn(`Nitter instance ${instance} failed:`, error);
        continue;
      }
    }

    return posts;
  }

  private parseRSS(rssText: string, searchTerm: string, author: string): SocialPost[] {
    const posts: SocialPost[] = [];
    
    try {
      // Simple RSS parsing (looking for items)
      const itemRegex = /<item>(.*?)<\/item>/gs;
      const items = rssText.match(itemRegex) || [];

      for (const item of items.slice(0, 10)) { // Limit to 10 posts per account
        const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/);
        const linkMatch = item.match(/<link>(.*?)<\/link>/);
        const pubDateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/);

        if (!titleMatch) continue;

        const text = titleMatch[1];
        
        // Check if post mentions the ticker
        if (!text.toUpperCase().includes(searchTerm.toUpperCase())) continue;

        posts.push({
          text,
          author,
          timestamp: pubDateMatch ? new Date(pubDateMatch[1]) : new Date(),
          url: linkMatch ? linkMatch[1] : '',
          sentiment: this.analyzeSentiment(text),
        });
      }
    } catch (error) {
      console.error('Error parsing RSS:', error);
    }

    return posts;
  }

  private analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    const lowerText = text.toLowerCase();
    
    // Positive keywords
    const positiveKeywords = [
      'bullish', 'buy', 'long', 'calls', 'moon', 'rocket', 'breakout',
      'strong', 'upgrade', 'beat', 'growth', 'rally', 'surge', 'gain'
    ];
    
    // Negative keywords
    const negativeKeywords = [
      'bearish', 'sell', 'short', 'puts', 'crash', 'dump', 'breakdown',
      'weak', 'downgrade', 'miss', 'decline', 'drop', 'fall', 'loss'
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

  private calculateSentiment(posts: SocialPost[]): SocialSentiment {
    let positive = 0;
    let negative = 0;
    let neutral = 0;

    posts.forEach(post => {
      if (post.sentiment === 'positive') positive++;
      else if (post.sentiment === 'negative') negative++;
      else neutral++;
    });

    const total = posts.length || 1;
    const score = Math.round(((positive - negative) / total + 1) * 50);

    return {
      score,
      volume: posts.length,
      positive,
      negative,
      neutral,
      trending: posts.length > 5,
      posts: posts.slice(0, 5), // Return top 5 posts
    };
  }
}

// Singleton instance
let client: SocialSentimentClient | null = null;

export function getSocialSentimentClient(): SocialSentimentClient {
  if (!client) {
    client = new SocialSentimentClient();
  }
  return client;
}
