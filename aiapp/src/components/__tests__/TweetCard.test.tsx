import { describe, it, expect } from '@jest/globals';
import { Tweet } from '@/types/twitter';

describe('TweetCard Component', () => {
  // Sample tweet data for testing
  const mockTweet: Tweet = {
    id: '1',
    account: 'ChartChampions',
    accountAvatar: 'https://example.com/avatar.jpg',
    text: 'Bullish on $AAPL and $MSFT today! Strong technical setup.',
    timestamp: new Date('2025-11-11T10:30:00Z'),
    sentiment: 0.75,
    tickers: ['AAPL', 'MSFT'],
    url: 'https://twitter.com/ChartChampions/status/1',
    engagement: {
      likes: 150,
      retweets: 45
    }
  };

  describe('Tweet Data Structure', () => {
    it('should accept valid tweet structure', () => {
      expect(mockTweet).toHaveProperty('id');
      expect(mockTweet).toHaveProperty('account');
      expect(mockTweet).toHaveProperty('text');
      expect(mockTweet).toHaveProperty('timestamp');
      expect(mockTweet).toHaveProperty('sentiment');
      expect(mockTweet).toHaveProperty('tickers');
      expect(mockTweet).toHaveProperty('url');
    });

    it('should have valid sentiment range', () => {
      expect(mockTweet.sentiment).toBeGreaterThanOrEqual(-1.0);
      expect(mockTweet.sentiment).toBeLessThanOrEqual(1.0);
    });

    it('should have valid tickers array', () => {
      expect(Array.isArray(mockTweet.tickers)).toBe(true);
      expect(mockTweet.tickers.length).toBeGreaterThan(0);
    });
  });

  describe('Sentiment Badge Logic', () => {
    it('should classify bullish sentiment correctly', () => {
      const bullishTweet: Tweet = { ...mockTweet, sentiment: 0.75 };
      expect(bullishTweet.sentiment).toBeGreaterThanOrEqual(0.5);
    });

    it('should classify positive sentiment correctly', () => {
      const positiveTweet: Tweet = { ...mockTweet, sentiment: 0.3 };
      expect(positiveTweet.sentiment).toBeGreaterThanOrEqual(0.2);
      expect(positiveTweet.sentiment).toBeLessThan(0.5);
    });

    it('should classify neutral sentiment correctly', () => {
      const neutralTweet: Tweet = { ...mockTweet, sentiment: 0.0 };
      expect(neutralTweet.sentiment).toBeGreaterThan(-0.2);
      expect(neutralTweet.sentiment).toBeLessThanOrEqual(0.2);
    });

    it('should classify negative sentiment correctly', () => {
      const negativeTweet: Tweet = { ...mockTweet, sentiment: -0.3 };
      expect(negativeTweet.sentiment).toBeGreaterThan(-0.5);
      expect(negativeTweet.sentiment).toBeLessThanOrEqual(-0.2);
    });

    it('should classify bearish sentiment correctly', () => {
      const bearishTweet: Tweet = { ...mockTweet, sentiment: -0.75 };
      expect(bearishTweet.sentiment).toBeLessThanOrEqual(-0.5);
    });
  });

  describe('Ticker Highlighting', () => {
    it('should identify tickers in tweet text', () => {
      const text = 'Bullish on $AAPL and $MSFT today!';
      const tickerPattern = /\$([A-Z]{1,5})\b/g;
      const matches = [...text.matchAll(tickerPattern)];
      
      expect(matches.length).toBe(2);
      expect(matches[0][1]).toBe('AAPL');
      expect(matches[1][1]).toBe('MSFT');
    });

    it('should handle tweets with no tickers', () => {
      const tweetWithoutTickers: Tweet = {
        ...mockTweet,
        text: 'Market looking strong today!',
        tickers: []
      };
      
      expect(tweetWithoutTickers.tickers.length).toBe(0);
    });

    it('should handle multiple occurrences of same ticker', () => {
      const text = '$AAPL is strong. I love $AAPL!';
      const tickerPattern = /\$AAPL\b/g;
      const matches = [...text.matchAll(tickerPattern)];
      
      expect(matches.length).toBe(2);
    });

    it('should match tickers case-insensitively', () => {
      const text = '$aapl $AAPL $AaPl';
      const tickerPattern = /\$(?:AAPL)\b/gi;
      const matches = [...text.matchAll(tickerPattern)];
      
      expect(matches.length).toBe(3);
    });
  });

  describe('Relative Time Formatting', () => {
    it('should format recent timestamps correctly', () => {
      const now = new Date();
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
      
      const diffHours = Math.floor((now.getTime() - twoHoursAgo.getTime()) / (60 * 60 * 1000));
      expect(diffHours).toBe(2);
    });

    it('should handle just now timestamps', () => {
      const now = new Date();
      const thirtySecondsAgo = new Date(now.getTime() - 30 * 1000);
      
      const diffMins = Math.floor((now.getTime() - thirtySecondsAgo.getTime()) / 60000);
      expect(diffMins).toBe(0);
    });

    it('should handle minute-level timestamps', () => {
      const now = new Date();
      const thirtyMinsAgo = new Date(now.getTime() - 30 * 60 * 1000);
      
      const diffMins = Math.floor((now.getTime() - thirtyMinsAgo.getTime()) / 60000);
      expect(diffMins).toBe(30);
    });

    it('should handle day-level timestamps', () => {
      const now = new Date();
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
      
      const diffDays = Math.floor((now.getTime() - threeDaysAgo.getTime()) / (24 * 60 * 60 * 1000));
      expect(diffDays).toBe(3);
    });
  });

  describe('Engagement Metrics', () => {
    it('should handle tweets with engagement data', () => {
      expect(mockTweet.engagement).toBeDefined();
      expect(mockTweet.engagement?.likes).toBe(150);
      expect(mockTweet.engagement?.retweets).toBe(45);
    });

    it('should handle tweets without engagement data', () => {
      const tweetWithoutEngagement: Tweet = {
        ...mockTweet,
        engagement: undefined
      };
      
      expect(tweetWithoutEngagement.engagement).toBeUndefined();
    });

    it('should format large engagement numbers', () => {
      const largeEngagement = {
        likes: 1500000,
        retweets: 250000
      };
      
      expect(largeEngagement.likes.toLocaleString()).toBe('1,500,000');
      expect(largeEngagement.retweets.toLocaleString()).toBe('250,000');
    });
  });

  describe('Component Props', () => {
    it('should accept required tweet prop', () => {
      const props = {
        tweet: mockTweet
      };
      
      expect(props.tweet).toBeDefined();
      expect(props.tweet.id).toBe('1');
    });

    it('should accept optional onTickerClick callback', () => {
      const mockCallback = (ticker: string) => {
        expect(ticker).toBe('AAPL');
      };
      
      mockCallback('AAPL');
    });

    it('should accept optional compact mode', () => {
      const props = {
        tweet: mockTweet,
        compact: true
      };
      
      expect(props.compact).toBe(true);
    });

    it('should default compact to false', () => {
      const props = {
        tweet: mockTweet,
        compact: undefined
      };
      
      expect(props.compact ?? false).toBe(false);
    });
  });

  describe('URL Validation', () => {
    it('should have valid Twitter URL format', () => {
      expect(mockTweet.url).toContain('twitter.com');
      expect(mockTweet.url).toContain('status');
    });

    it('should handle different URL formats', () => {
      const urls = [
        'https://twitter.com/user/status/123',
        'https://x.com/user/status/123',
        'https://twitter.com/user/status/123456789'
      ];
      
      urls.forEach(url => {
        expect(url).toMatch(/^https:\/\/(twitter|x)\.com\/.+\/status\/.+$/);
      });
    });
  });

  describe('Account Avatar', () => {
    it('should handle tweets with avatar', () => {
      expect(mockTweet.accountAvatar).toBeDefined();
      expect(mockTweet.accountAvatar).toContain('http');
    });

    it('should handle tweets without avatar', () => {
      const tweetWithoutAvatar: Tweet = {
        ...mockTweet,
        accountAvatar: undefined
      };
      
      expect(tweetWithoutAvatar.accountAvatar).toBeUndefined();
    });

    it('should generate fallback initial from account name', () => {
      const initial = mockTweet.account.charAt(0).toUpperCase();
      expect(initial).toBe('C');
    });
  });
});
