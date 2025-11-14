/**
 * TradingAgents API Client
 * Connects the C1 frontend to the TradingAgents Python backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_TRADINGAGENTS_API_URL || 'http://localhost:5000';
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

export interface CoachPlan {
  plan: string;
  created_at: string;
  charts?: string[];
}

export interface CoachPlans {
  [key: string]: CoachPlan;
}

export interface AnalysisRequest {
  ticker: string;
  config?: {
    deep_think_llm?: string;
    quick_think_llm?: string;
    max_debate_rounds?: number;
  };
}

export interface AnalysisResult {
  ticker: string;
  decision: string;
  confidence: number;
  reports: {
    market?: string;
    fundamentals?: string;
    news?: string;
    social?: string;
  };
  timestamp: string;
}

// Mock data for development/testing
const MOCK_COACH_PLANS: CoachPlans = {
  coach_d: {
    plan: "📊 Day Trading Analysis - AAPL\n\nKey Levels:\n• Support: $175.50\n• Resistance: $182.30\n\nStrategy: Looking for breakout above $180 with volume confirmation. Stop loss at $177.80.\n\nRisk/Reward: 1:2.5 ratio\nPosition Size: 2% of portfolio",
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
    charts: ["chart1.png"]
  },
  coach_i: {
    plan: "📈 Intraday Technical Setup - TSLA\n\nPattern: Bull flag forming on 15min chart\nEntry: $242.50 on flag breakout\nTarget 1: $248.00\nTarget 2: $252.50\n\nIndicators:\n• RSI: 58 (neutral)\n• MACD: Bullish crossover\n• Volume: Above average\n\nTime horizon: 2-4 hours",
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    charts: []
  },
  coach_s: {
    plan: "💭 Market Sentiment Update\n\nOverall Market: Cautiously Bullish\n\nSocial Media Trends:\n• Tech sector gaining momentum\n• AI stocks seeing increased chatter\n• Retail sentiment improving\n\nFear & Greed Index: 62 (Greed)\n\nRecommendation: Stay selective, focus on quality names with strong fundamentals.",
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
    charts: []
  },
  coach_n: {
    plan: "📰 News & Events Watch\n\nUpcoming Catalysts:\n• Fed Minutes Release: Wednesday 2PM EST\n• NVDA Earnings: After market close Thursday\n• Jobs Report: Friday 8:30AM EST\n\nMarket Moving News:\n• Tech sector showing strength on AI developments\n• Energy sector under pressure from inventory data\n\nAction Items:\n• Reduce exposure before Fed minutes\n• Watch NVDA closely for sector direction\n• Prepare for volatility Friday morning",
    created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
    charts: ["news_chart.png"]
  }
};

/**
 * Fetch all coach plans from Discord Enhancement API
 */
export async function fetchCoachPlans(): Promise<CoachPlans> {
  // Return mock data if enabled
  if (USE_MOCK_DATA) {
    console.log('Using mock coach plans data');
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_COACH_PLANS;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/coach-plans/all`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch coach plans: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching coach plans:', error);
    throw error;
  }
}

/**
 * Fetch a specific coach's plan
 */
export async function fetchCoachPlan(coach: string): Promise<CoachPlan> {
  // Return mock data if enabled
  if (USE_MOCK_DATA) {
    console.log(`Using mock data for coach: ${coach}`);
    await new Promise(resolve => setTimeout(resolve, 300));
    const plan = MOCK_COACH_PLANS[coach];
    if (!plan) {
      throw new Error(`Coach ${coach} not found`);
    }
    return plan;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/coach-plans/${coach}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch coach plan: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching coach ${coach} plan:`, error);
    throw error;
  }
}

/**
 * Run trading analysis on a ticker
 * This would call your main TradingAgents analysis
 */
export async function runAnalysis(request: AnalysisRequest): Promise<AnalysisResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      throw new Error(`Analysis failed: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error running analysis:', error);
    throw error;
  }
}

/**
 * Check API health
 */
export async function checkHealth(): Promise<{ status: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    
    if (!response.ok) {
      throw new Error('API is not healthy');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
}

/**
 * Get API metrics
 */
export async function getMetrics(): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/metrics`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch metrics');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching metrics:', error);
    throw error;
  }
}
