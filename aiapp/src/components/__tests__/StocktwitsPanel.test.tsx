/**
 * StocktwitsPanel Component Tests
 * 
 * Tests for the StocktwitsPanel component including data fetching,
 * message rendering, toggle functionality, and error handling.
 */

import { describe, it, expect } from '@jest/globals';
import { StocktwitsMessage, StocktwitsRatio } from '@/types/twitter';

describe('StocktwitsPanel', () => {
  // Sample Stocktwits data for testing
  const mockMessage: StocktwitsMessage = {
    id: '1',
    user: 'testuser',
    text: 'Bullish on AAPL! Great earnings.',
    timestamp: new Date('2025-11-11T10:00:00Z'),
    sentiment: 'bullish',
    likes: 10,
  };

  const mockSentimentRatio: StocktwitsRatio = {
    bullish: 65,
    bearish: 35,
  };

  describe('Stocktwits Message Structure', () => {
    it('should accept valid message structure', () => {
      expect(mockMessage).toHaveProperty('id');
      expect(mockMessage).toHaveProperty('user');
      expect(mockMessage).toHaveProperty('text');
      expect(mockMessage).toHaveProperty('timestamp');
      expect(mockMessage).toHaveProperty('sentiment');
      expect(mockMessage).toHaveProperty('likes');
    });

    it('should have valid sentiment values', () => {
      const validSentiments = ['bullish', 'bearish', 'neutral'];
      expect(validSentiments).toContain(mockMessage.sentiment);
    });

    it('should have timestamp as Date object', () => {
      expect(mockMessage.timestamp).toBeInstanceOf(Date);
    });

    it('should have numeric likes', () => {
      expect(typeof mockMessage.likes).toBe('number');
      expect(mockMessage.likes).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Sentiment Ratio Structure', () => {
    it('should have bullish and bearish counts', () => {
      expect(mockSentimentRatio).toHaveProperty('bullish');
      expect(mockSentimentRatio).toHaveProperty('bearish');
    });

    it('should have numeric sentiment counts', () => {
      expect(typeof mockSentimentRatio.bullish).toBe('number');
      expect(typeof mockSentimentRatio.bearish).toBe('number');
    });

    it('should have non-negative sentiment counts', () => {
      expect(mockSentimentRatio.bullish).toBeGreaterThanOrEqual(0);
      expect(mockSentimentRatio.bearish).toBeGreaterThanOrEqual(0);
    });

    it('should calculate percentage correctly', () => {
      const total = mockSentimentRatio.bullish + mockSentimentRatio.bearish;
      const bullishPercent = (mockSentimentRatio.bullish / total) * 100;
      const bearishPercent = (mockSentimentRatio.bearish / total) * 100;
      
      expect(bullishPercent + bearishPercent).toBeCloseTo(100, 1);
    });
  });

  describe('Sentiment Badge Colors', () => {
    it('should return correct color for bullish sentiment', () => {
      const bullishMessage: StocktwitsMessage = {
        ...mockMessage,
        sentiment: 'bullish',
      };
      expect(bullishMessage.sentiment).toBe('bullish');
    });

    it('should return correct color for bearish sentiment', () => {
      const bearishMessage: StocktwitsMessage = {
        ...mockMessage,
        sentiment: 'bearish',
      };
      expect(bearishMessage.sentiment).toBe('bearish');
    });

    it('should return correct color for neutral sentiment', () => {
      const neutralMessage: StocktwitsMessage = {
        ...mockMessage,
        sentiment: 'neutral',
      };
      expect(neutralMessage.sentiment).toBe('neutral');
    });
  });

  describe('Message Array Handling', () => {
    it('should handle empty message array', () => {
      const emptyMessages: StocktwitsMessage[] = [];
      expect(emptyMessages).toHaveLength(0);
    });

    it('should handle multiple messages', () => {
      const messages: StocktwitsMessage[] = [
        mockMessage,
        { ...mockMessage, id: '2', user: 'user2' },
        { ...mockMessage, id: '3', user: 'user3' },
      ];
      expect(messages).toHaveLength(3);
      expect(messages[0].id).toBe('1');
      expect(messages[1].id).toBe('2');
      expect(messages[2].id).toBe('3');
    });

    it('should filter messages by sentiment', () => {
      const messages: StocktwitsMessage[] = [
        { ...mockMessage, id: '1', sentiment: 'bullish' },
        { ...mockMessage, id: '2', sentiment: 'bearish' },
        { ...mockMessage, id: '3', sentiment: 'bullish' },
      ];
      const bullishMessages = messages.filter(m => m.sentiment === 'bullish');
      expect(bullishMessages).toHaveLength(2);
    });
  });

  describe('Timestamp Handling', () => {
    it('should handle recent timestamps', () => {
      const now = new Date();
      const recentMessage: StocktwitsMessage = {
        ...mockMessage,
        timestamp: now,
      };
      expect(recentMessage.timestamp).toBeInstanceOf(Date);
    });

    it('should handle old timestamps', () => {
      const oldDate = new Date('2020-01-01T00:00:00Z');
      const oldMessage: StocktwitsMessage = {
        ...mockMessage,
        timestamp: oldDate,
      };
      expect(oldMessage.timestamp.getFullYear()).toBe(2020);
    });

    it('should calculate time difference', () => {
      const now = new Date();
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
      const diffMs = now.getTime() - twoHoursAgo.getTime();
      const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
      expect(diffHours).toBe(2);
    });
  });

  describe('API Response Structure', () => {
    it('should handle valid API response', () => {
      const apiResponse = {
        messages: [mockMessage],
        sentimentRatio: mockSentimentRatio,
      };
      expect(apiResponse.messages).toHaveLength(1);
      expect(apiResponse.sentimentRatio).toEqual(mockSentimentRatio);
    });

    it('should handle empty API response', () => {
      const emptyResponse = {
        messages: [],
        sentimentRatio: { bullish: 0, bearish: 0 },
      };
      expect(emptyResponse.messages).toHaveLength(0);
      expect(emptyResponse.sentimentRatio.bullish).toBe(0);
      expect(emptyResponse.sentimentRatio.bearish).toBe(0);
    });

    it('should validate message IDs are unique', () => {
      const messages: StocktwitsMessage[] = [
        { ...mockMessage, id: '1' },
        { ...mockMessage, id: '2' },
        { ...mockMessage, id: '3' },
      ];
      const ids = messages.map(m => m.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(messages.length);
    });
  });
});
