import { describe, it, expect } from '@jest/globals';
import { OHLCVData } from '../ChartDisplay';

describe('ChartDisplay Component', () => {
  it('should accept valid OHLCV data structure', () => {
    const sampleData: OHLCVData[] = [
      {
        time: 1609459200,
        open: 100,
        high: 105,
        low: 99,
        close: 103,
        volume: 1000000
      },
      {
        time: 1609545600,
        open: 103,
        high: 108,
        low: 102,
        close: 107,
        volume: 1200000
      }
    ];

    expect(sampleData).toHaveLength(2);
    expect(sampleData[0]).toHaveProperty('time');
    expect(sampleData[0]).toHaveProperty('open');
    expect(sampleData[0]).toHaveProperty('high');
    expect(sampleData[0]).toHaveProperty('low');
    expect(sampleData[0]).toHaveProperty('close');
    expect(sampleData[0]).toHaveProperty('volume');
  });

  it('should validate OHLCV data constraints', () => {
    const validData: OHLCVData = {
      time: 1609459200,
      open: 100,
      high: 105,
      low: 99,
      close: 103,
      volume: 1000000
    };

    // High should be >= open, close, low
    expect(validData.high).toBeGreaterThanOrEqual(validData.open);
    expect(validData.high).toBeGreaterThanOrEqual(validData.close);
    expect(validData.high).toBeGreaterThanOrEqual(validData.low);

    // Low should be <= open, close, high
    expect(validData.low).toBeLessThanOrEqual(validData.open);
    expect(validData.low).toBeLessThanOrEqual(validData.close);
    expect(validData.low).toBeLessThanOrEqual(validData.high);
  });
});
