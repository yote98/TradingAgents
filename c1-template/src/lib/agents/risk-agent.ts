/**
 * ⚖️ Risk Management Team
 * Three perspectives: Risky, Neutral, Safe
 */

import { TradingStrategy } from './strategy-agent';
import { DebateResult } from './debate-agent';

export interface RiskPerspective {
  name: 'risky' | 'neutral' | 'safe';
  recommendation: 'APPROVE' | 'REJECT' | 'MODIFY';
  reasoning: string;
  suggestedAdjustments?: {
    positionSize?: string;
    stopLoss?: number;
    target?: number;
  };
}

export interface RiskAssessment {
  perspectives: RiskPerspective[];
  finalDecision: 'APPROVE' | 'REJECT' | 'MODIFY';
  consensus: string;
  adjustedStrategy?: Partial<TradingStrategy>;
}

export function assessRisk(
  strategy: TradingStrategy,
  debate: DebateResult
): RiskAssessment {
  // Get three risk perspectives
  const riskyPerspective = getRiskyPerspective(strategy, debate);
  const neutralPerspective = getNeutralPerspective(strategy, debate);
  const safePerspective = getSafePerspective(strategy, debate);

  const perspectives = [riskyPerspective, neutralPerspective, safePerspective];

  // Determine final decision (majority vote)
  const approveCount = perspectives.filter(p => p.recommendation === 'APPROVE').length;
  const rejectCount = perspectives.filter(p => p.recommendation === 'REJECT').length;

  let finalDecision: 'APPROVE' | 'REJECT' | 'MODIFY' = 'MODIFY';
  if (approveCount >= 2) finalDecision = 'APPROVE';
  else if (rejectCount >= 2) finalDecision = 'REJECT';

  // Build consensus
  const consensus = buildRiskConsensus(perspectives, finalDecision);

  // Adjusted strategy if needed
  const adjustedStrategy = finalDecision === 'MODIFY' 
    ? buildAdjustedStrategy(strategy, perspectives)
    : undefined;

  return {
    perspectives,
    finalDecision,
    consensus,
    adjustedStrategy,
  };
}

function getRiskyPerspective(
  strategy: TradingStrategy,
  debate: DebateResult
): RiskPerspective {
  // Risky perspective: Advocates for high-reward, high-risk strategies
  
  if (strategy.recommendation === 'BUY' && debate.winner === 'bull') {
    return {
      name: 'risky',
      recommendation: 'APPROVE',
      reasoning: `Strong bull case (${debate.bullCase.confidence}%) justifies aggressive position. High risk/reward ratio of ${strategy.riskReward}:1 is attractive.`,
      suggestedAdjustments: {
        positionSize: '7-10% of portfolio (aggressive)',
        target: strategy.target * 1.1, // 10% higher target
      },
    };
  }

  if (strategy.recommendation === 'SELL' && debate.winner === 'bear') {
    return {
      name: 'risky',
      recommendation: 'APPROVE',
      reasoning: `Strong bear case (${debate.bearCase.confidence}%) supports aggressive short position.`,
    };
  }

  return {
    name: 'risky',
    recommendation: 'MODIFY',
    reasoning: 'Insufficient conviction for aggressive position. Suggest increasing position size if confidence improves.',
    suggestedAdjustments: {
      positionSize: '5-7% of portfolio',
    },
  };
}

function getNeutralPerspective(
  strategy: TradingStrategy,
  debate: DebateResult
): RiskPerspective {
  // Neutral perspective: Balanced approach
  
  if (strategy.confidence >= 70) {
    return {
      name: 'neutral',
      recommendation: 'APPROVE',
      reasoning: `Confidence level of ${strategy.confidence}% supports the recommendation. Risk/reward of ${strategy.riskReward}:1 is acceptable.`,
    };
  }

  if (strategy.confidence < 50) {
    return {
      name: 'neutral',
      recommendation: 'REJECT',
      reasoning: `Confidence level of ${strategy.confidence}% is too low. Wait for clearer signals.`,
    };
  }

  return {
    name: 'neutral',
    recommendation: 'MODIFY',
    reasoning: `Moderate confidence (${strategy.confidence}%). Recommend balanced position with tight risk management.`,
    suggestedAdjustments: {
      positionSize: '3-5% of portfolio (moderate)',
      stopLoss: strategy.entry * 0.97, // Tighter 3% stop
    },
  };
}

function getSafePerspective(
  strategy: TradingStrategy,
  debate: DebateResult
): RiskPerspective {
  // Safe perspective: Conservative, emphasizes risk mitigation
  
  if (strategy.recommendation === 'HOLD') {
    return {
      name: 'safe',
      recommendation: 'APPROVE',
      reasoning: 'HOLD recommendation aligns with conservative approach. No new risk exposure.',
    };
  }

  if (strategy.riskReward < 2) {
    return {
      name: 'safe',
      recommendation: 'REJECT',
      reasoning: `Risk/reward ratio of ${strategy.riskReward}:1 is insufficient. Require minimum 2:1 for new positions.`,
    };
  }

  if (debate.winner === 'neutral') {
    return {
      name: 'safe',
      recommendation: 'REJECT',
      reasoning: 'Bull/bear debate is inconclusive. Conservative approach suggests waiting for clearer signals.',
    };
  }

  if (strategy.confidence >= 75 && strategy.riskReward >= 2) {
    return {
      name: 'safe',
      recommendation: 'APPROVE',
      reasoning: `High confidence (${strategy.confidence}%) and favorable risk/reward (${strategy.riskReward}:1) justify conservative position.`,
      suggestedAdjustments: {
        positionSize: '1-2% of portfolio (conservative)',
        stopLoss: strategy.entry * 0.98, // Very tight 2% stop
      },
    };
  }

  return {
    name: 'safe',
    recommendation: 'MODIFY',
    reasoning: 'Recommend smaller position size and tighter stop-loss for risk mitigation.',
    suggestedAdjustments: {
      positionSize: '1-2% of portfolio',
      stopLoss: strategy.entry * 0.98,
    },
  };
}

function buildRiskConsensus(
  perspectives: RiskPerspective[],
  finalDecision: 'APPROVE' | 'REJECT' | 'MODIFY'
): string {
  const risky = perspectives.find(p => p.name === 'risky')!;
  const neutral = perspectives.find(p => p.name === 'neutral')!;
  const safe = perspectives.find(p => p.name === 'safe')!;

  if (finalDecision === 'APPROVE') {
    return `Risk team approves. ${neutral.reasoning}`;
  } else if (finalDecision === 'REJECT') {
    return `Risk team rejects. ${safe.reasoning}`;
  } else {
    return `Risk team suggests modifications. Risky: ${risky.recommendation}. Neutral: ${neutral.recommendation}. Safe: ${safe.recommendation}.`;
  }
}

function buildAdjustedStrategy(
  strategy: TradingStrategy,
  perspectives: RiskPerspective[]
): Partial<TradingStrategy> {
  // Use neutral perspective's adjustments as baseline
  const neutral = perspectives.find(p => p.name === 'neutral')!;
  
  const adjustments: Partial<TradingStrategy> = {};
  
  if (neutral.suggestedAdjustments?.stopLoss) {
    adjustments.stopLoss = neutral.suggestedAdjustments.stopLoss;
  }
  
  if (neutral.suggestedAdjustments?.target) {
    adjustments.target = neutral.suggestedAdjustments.target;
  }
  
  return adjustments;
}
