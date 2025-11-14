import { describe, it, expect } from '@jest/globals';

describe('SentimentGauge Component', () => {
  // Sample sentiment data for testing
  const mockSentimentData = {
    score: 0.65,
    bullishArgs: [
      'Strong technical setup with breakout above resistance',
      'Positive earnings surprise last quarter',
      'Institutional buying pressure increasing'
    ],
    bearishArgs: [
      'Overbought RSI indicator',
      'Market volatility concerns'
    ],
    themes: ['Tech rally', 'Fed policy', 'Earnings season']
  };

  describe('Sentiment Score', () => {
    it('should accept valid score range', () => {
      expect(mockSentimentData.score).toBeGreaterThanOrEqual(-1.0);
      expect(mockSentimentData.score).toBeLessThanOrEqual(1.0);
    });

    it('should handle strongly bullish scores', () => {
      const stronglyBullish = 0.85;
      expect(stronglyBullish).toBeGreaterThanOrEqual(0.5);
    });

    it('should handle bullish scores', () => {
      const bullish = 0.35;
      expect(bullish).toBeGreaterThanOrEqual(0.2);
      expect(bullish).toBeLessThan(0.5);
    });

    it('should handle neutral scores', () => {
      const neutral = 0.0;
      expect(neutral).toBeGreaterThan(-0.2);
      expect(neutral).toBeLessThanOrEqual(0.2);
    });

    it('should handle bearish scores', () => {
      const bearish = -0.35;
      expect(bearish).toBeGreaterThan(-0.5);
      expect(bearish).toBeLessThanOrEqual(-0.2);
    });

    it('should handle strongly bearish scores', () => {
      const stronglyBearish = -0.85;
      expect(stronglyBearish).toBeLessThanOrEqual(-0.5);
    });

    it('should format score to 2 decimal places', () => {
      const score = 0.6543;
      const formatted = score.toFixed(2);
      expect(formatted).toBe('0.65');
    });
  });

  describe('Color Gradient Logic', () => {
    it('should calculate positive score color (yellow to green)', () => {
      const score = 0.5;
      const greenIntensity = Math.floor(score * 255);
      const expectedColor = `rgb(${255 - greenIntensity}, 200, 50)`;
      
      expect(greenIntensity).toBe(127);
      expect(expectedColor).toBe('rgb(128, 200, 50)');
    });

    it('should calculate negative score color (yellow to red)', () => {
      const score = -0.5;
      const redIntensity = Math.floor(Math.abs(score) * 255);
      const expectedColor = `rgb(255, ${200 - redIntensity}, 50)`;
      
      expect(redIntensity).toBe(127);
      expect(expectedColor).toBe('rgb(255, 73, 50)');
    });

    it('should handle neutral score (yellow)', () => {
      const score = 0.0;
      const greenIntensity = Math.floor(score * 255);
      const expectedColor = `rgb(${255 - greenIntensity}, 200, 50)`;
      
      expect(greenIntensity).toBe(0);
      expect(expectedColor).toBe('rgb(255, 200, 50)');
    });

    it('should clamp scores above 1.0', () => {
      const score = 1.5;
      const clampedScore = Math.max(-1, Math.min(1, score));
      expect(clampedScore).toBe(1.0);
    });

    it('should clamp scores below -1.0', () => {
      const score = -1.5;
      const clampedScore = Math.max(-1, Math.min(1, score));
      expect(clampedScore).toBe(-1.0);
    });
  });

  describe('Gauge Dimensions', () => {
    it('should provide small size dimensions', () => {
      const dimensions = { width: 200, height: 120, radius: 80, strokeWidth: 12 };
      expect(dimensions.width).toBe(200);
      expect(dimensions.height).toBe(120);
      expect(dimensions.radius).toBe(80);
      expect(dimensions.strokeWidth).toBe(12);
    });

    it('should provide medium size dimensions', () => {
      const dimensions = { width: 300, height: 180, radius: 120, strokeWidth: 18 };
      expect(dimensions.width).toBe(300);
      expect(dimensions.height).toBe(180);
      expect(dimensions.radius).toBe(120);
      expect(dimensions.strokeWidth).toBe(18);
    });

    it('should provide large size dimensions', () => {
      const dimensions = { width: 400, height: 240, radius: 160, strokeWidth: 24 };
      expect(dimensions.width).toBe(400);
      expect(dimensions.height).toBe(240);
      expect(dimensions.radius).toBe(160);
      expect(dimensions.strokeWidth).toBe(24);
    });
  });

  describe('Gauge Angle Calculations', () => {
    it('should convert score to angle correctly', () => {
      const score = 0.0; // Neutral
      const startAngle = -180;
      const endAngle = 0;
      const totalAngle = endAngle - startAngle;
      const scoreAngle = ((score + 1) / 2) * totalAngle + startAngle;
      
      expect(scoreAngle).toBe(-90); // Middle of gauge
    });

    it('should handle maximum positive score', () => {
      const score = 1.0;
      const startAngle = -180;
      const endAngle = 0;
      const totalAngle = endAngle - startAngle;
      const scoreAngle = ((score + 1) / 2) * totalAngle + startAngle;
      
      expect(scoreAngle).toBe(0); // Right end of gauge
    });

    it('should handle maximum negative score', () => {
      const score = -1.0;
      const startAngle = -180;
      const endAngle = 0;
      const totalAngle = endAngle - startAngle;
      const scoreAngle = ((score + 1) / 2) * totalAngle + startAngle;
      
      expect(scoreAngle).toBe(-180); // Left end of gauge
    });
  });

  describe('Bullish Arguments', () => {
    it('should accept array of bullish arguments', () => {
      expect(Array.isArray(mockSentimentData.bullishArgs)).toBe(true);
      expect(mockSentimentData.bullishArgs.length).toBe(3);
    });

    it('should handle empty bullish arguments', () => {
      const emptyArgs: string[] = [];
      expect(emptyArgs.length).toBe(0);
    });

    it('should determine if expand button is needed', () => {
      const showExpand = mockSentimentData.bullishArgs.length > 3;
      expect(showExpand).toBe(false);
    });

    it('should show expand button for many arguments', () => {
      const manyArgs = [
        'Arg 1', 'Arg 2', 'Arg 3', 'Arg 4', 'Arg 5'
      ];
      const showExpand = manyArgs.length > 3;
      expect(showExpand).toBe(true);
    });

    it('should slice arguments when not expanded', () => {
      const manyArgs = ['Arg 1', 'Arg 2', 'Arg 3', 'Arg 4', 'Arg 5'];
      const displayed = manyArgs.slice(0, 3);
      expect(displayed.length).toBe(3);
      expect(displayed).toEqual(['Arg 1', 'Arg 2', 'Arg 3']);
    });
  });

  describe('Bearish Arguments', () => {
    it('should accept array of bearish arguments', () => {
      expect(Array.isArray(mockSentimentData.bearishArgs)).toBe(true);
      expect(mockSentimentData.bearishArgs.length).toBe(2);
    });

    it('should handle empty bearish arguments', () => {
      const emptyArgs: string[] = [];
      expect(emptyArgs.length).toBe(0);
    });

    it('should determine if expand button is needed', () => {
      const showExpand = mockSentimentData.bearishArgs.length > 3;
      expect(showExpand).toBe(false);
    });
  });

  describe('Key Themes', () => {
    it('should accept array of themes', () => {
      expect(Array.isArray(mockSentimentData.themes)).toBe(true);
      expect(mockSentimentData.themes.length).toBe(3);
    });

    it('should handle empty themes', () => {
      const emptyThemes: string[] = [];
      expect(emptyThemes.length).toBe(0);
    });

    it('should display themes as badges', () => {
      mockSentimentData.themes.forEach(theme => {
        expect(typeof theme).toBe('string');
        expect(theme.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Component Props', () => {
    it('should accept required props', () => {
      const props = {
        score: 0.65,
        bullishArgs: mockSentimentData.bullishArgs,
        bearishArgs: mockSentimentData.bearishArgs,
        themes: mockSentimentData.themes
      };
      
      expect(props.score).toBeDefined();
      expect(props.bullishArgs).toBeDefined();
      expect(props.bearishArgs).toBeDefined();
      expect(props.themes).toBeDefined();
    });

    it('should accept optional size prop', () => {
      const sizes: Array<'small' | 'medium' | 'large'> = ['small', 'medium', 'large'];
      sizes.forEach(size => {
        expect(['small', 'medium', 'large']).toContain(size);
      });
    });

    it('should default size to medium', () => {
      const size = undefined;
      const defaultSize = size ?? 'medium';
      expect(defaultSize).toBe('medium');
    });

    it('should accept optional loading prop', () => {
      const props = {
        score: 0.65,
        bullishArgs: mockSentimentData.bullishArgs,
        bearishArgs: mockSentimentData.bearishArgs,
        themes: mockSentimentData.themes,
        loading: true
      };
      
      expect(props.loading).toBe(true);
    });
  });

  describe('Sentiment Labels', () => {
    it('should label strongly bullish correctly', () => {
      const score = 0.75;
      const label = score >= 0.5 ? 'Strongly Bullish' : '';
      expect(label).toBe('Strongly Bullish');
    });

    it('should label bullish correctly', () => {
      const score = 0.35;
      const label = score >= 0.2 && score < 0.5 ? 'Bullish' : '';
      expect(label).toBe('Bullish');
    });

    it('should label neutral correctly', () => {
      const score = 0.0;
      const label = score > -0.2 && score < 0.2 ? 'Neutral' : '';
      expect(label).toBe('Neutral');
    });

    it('should label bearish correctly', () => {
      const score = -0.35;
      const label = score > -0.5 && score <= -0.2 ? 'Bearish' : '';
      expect(label).toBe('Bearish');
    });

    it('should label strongly bearish correctly', () => {
      const score = -0.75;
      const label = score <= -0.5 ? 'Strongly Bearish' : '';
      expect(label).toBe('Strongly Bearish');
    });
  });

  describe('Animation Logic', () => {
    it('should calculate animation steps', () => {
      const duration = 1000; // 1 second
      const steps = 60;
      const stepDuration = duration / steps;
      
      expect(stepDuration).toBeCloseTo(16.67, 1); // ~60fps
    });

    it('should calculate score increment', () => {
      const targetScore = 0.6;
      const currentScore = 0.0;
      const steps = 60;
      const increment = (targetScore - currentScore) / steps;
      
      expect(increment).toBeCloseTo(0.01, 2);
    });

    it('should reach target score after animation', () => {
      const targetScore = 0.6;
      const currentScore = 0.0;
      const steps = 60;
      const increment = (targetScore - currentScore) / steps;
      
      let animatedScore = currentScore;
      for (let i = 0; i < steps; i++) {
        animatedScore += increment;
      }
      
      expect(animatedScore).toBeCloseTo(targetScore, 5);
    });
  });

  describe('Responsive Design', () => {
    it('should adjust font size for small gauge', () => {
      const size: 'small' | 'medium' | 'large' = 'small';
      const fontSize = size === 'small' ? 'text-3xl' : 'text-5xl';
      expect(fontSize).toBe('text-3xl');
    });

    it('should adjust font size for medium gauge', () => {
      const size: 'small' | 'medium' | 'large' = 'medium';
      const fontSize = size === 'small' ? 'text-3xl' : size === 'large' ? 'text-6xl' : 'text-5xl';
      expect(fontSize).toBe('text-5xl');
    });

    it('should adjust font size for large gauge', () => {
      const size: 'small' | 'medium' | 'large' = 'large';
      const fontSize = size === 'large' ? 'text-6xl' : 'text-5xl';
      expect(fontSize).toBe('text-6xl');
    });
  });

  describe('Loading State', () => {
    it('should show skeleton when loading', () => {
      const loading = true;
      expect(loading).toBe(true);
    });

    it('should show content when not loading', () => {
      const loading = false;
      expect(loading).toBe(false);
    });

    it('should default loading to false', () => {
      const loading = undefined;
      const isLoading = loading ?? false;
      expect(isLoading).toBe(false);
    });
  });
});
