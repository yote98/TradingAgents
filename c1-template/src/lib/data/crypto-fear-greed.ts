/**
 * Crypto Fear & Greed Index Client
 * Free API from Alternative.me - No key required!
 * https://api.alternative.me/fng/
 * Updates every 8 hours
 */

export interface FearGreedData {
  value: number; // 0-100 (0 = Extreme Fear, 100 = Extreme Greed)
  classification: 'Extreme Fear' | 'Fear' | 'Neutral' | 'Greed' | 'Extreme Greed';
  timestamp: string;
  timeUntilUpdate: string;
}

export interface FearGreedHistory {
  current: FearGreedData;
  yesterday: FearGreedData;
  lastWeek: FearGreedData;
  lastMonth: FearGreedData;
}

export class CryptoFearGreedClient {
  private baseUrl = 'https://api.alternative.me/fng';

  /**
   * Get current Fear & Greed Index
   */
  async getCurrentIndex(): Promise<FearGreedData> {
    try {
      const response = await fetch(`${this.baseUrl}/?limit=1`, {
        next: { revalidate: 3600 } // Cache for 1 hour
      });

      if (!response.ok) {
        throw new Error(`Fear & Greed API error: ${response.status}`);
      }

      const data = await response.json();
      const latest = data.data[0];

      return this.formatFearGreedData(latest);
    } catch (error) {
      console.error('Error fetching Fear & Greed Index:', error);
      throw error;
    }
  }

  /**
   * Get historical Fear & Greed data (current, yesterday, last week, last month)
   */
  async getHistoricalIndex(): Promise<FearGreedHistory> {
    try {
      const response = await fetch(`${this.baseUrl}/?limit=30`, {
        next: { revalidate: 3600 }
      });

      if (!response.ok) {
        throw new Error(`Fear & Greed API error: ${response.status}`);
      }

      const data = await response.json();
      const history = data.data;

      return {
        current: this.formatFearGreedData(history[0]),
        yesterday: this.formatFearGreedData(history[1]),
        lastWeek: this.formatFearGreedData(history[7]),
        lastMonth: this.formatFearGreedData(history[29]),
      };
    } catch (error) {
      console.error('Error fetching Fear & Greed history:', error);
      throw error;
    }
  }

  /**
   * Format raw API data into structured format
   */
  private formatFearGreedData(raw: any): FearGreedData {
    const value = parseInt(raw.value);
    
    return {
      value,
      classification: this.getClassification(value),
      timestamp: new Date(parseInt(raw.timestamp) * 1000).toISOString(),
      timeUntilUpdate: raw.time_until_update || 'Unknown',
    };
  }

  /**
   * Convert numeric value to classification
   */
  private getClassification(value: number): FearGreedData['classification'] {
    if (value <= 20) return 'Extreme Fear';
    if (value <= 40) return 'Fear';
    if (value <= 60) return 'Neutral';
    if (value <= 80) return 'Greed';
    return 'Extreme Greed';
  }

  /**
   * Get sentiment signal based on Fear & Greed
   * Contrarian indicator: Extreme Fear = potential buy, Extreme Greed = potential sell
   */
  getContrarianSignal(value: number): {
    signal: 'bullish' | 'bearish' | 'neutral';
    reasoning: string;
  } {
    if (value <= 20) {
      return {
        signal: 'bullish',
        reasoning: 'Extreme Fear often precedes market bounces (contrarian buy signal)',
      };
    }
    
    if (value <= 40) {
      return {
        signal: 'bullish',
        reasoning: 'Fear creates buying opportunities for patient investors',
      };
    }
    
    if (value >= 80) {
      return {
        signal: 'bearish',
        reasoning: 'Extreme Greed suggests market may be overheated (contrarian sell signal)',
      };
    }
    
    if (value >= 60) {
      return {
        signal: 'bearish',
        reasoning: 'Greed levels rising - consider taking profits',
      };
    }
    
    return {
      signal: 'neutral',
      reasoning: 'Neutral sentiment - no strong contrarian signal',
    };
  }

  /**
   * Get trend analysis from historical data
   */
  getTrend(history: FearGreedHistory): {
    direction: 'increasing' | 'decreasing' | 'stable';
    momentum: string;
  } {
    const current = history.current.value;
    const yesterday = history.yesterday.value;
    const lastWeek = history.lastWeek.value;

    const dailyChange = current - yesterday;
    const weeklyChange = current - lastWeek;

    if (weeklyChange > 10) {
      return {
        direction: 'increasing',
        momentum: `Fear decreasing (sentiment improving +${weeklyChange} over 7 days)`,
      };
    }

    if (weeklyChange < -10) {
      return {
        direction: 'decreasing',
        momentum: `Fear increasing (sentiment worsening ${weeklyChange} over 7 days)`,
      };
    }

    return {
      direction: 'stable',
      momentum: `Sentiment stable (${weeklyChange > 0 ? '+' : ''}${weeklyChange} over 7 days)`,
    };
  }
}

// Singleton instance
let client: CryptoFearGreedClient | null = null;

export function getCryptoFearGreedClient(): CryptoFearGreedClient {
  if (!client) {
    client = new CryptoFearGreedClient();
  }
  return client;
}
