'use client';

import { CoachPlans } from '../lib/tradingagents-api';
import { ChartGenerator } from '../lib/chartGenerator';
import CoachCard from './CoachCard';

/**
 * CoachPlansGrid Component
 * 
 * Reusable grid component for displaying coach plans.
 * Extracted from CoachDashboard_Simple for use in multiple contexts.
 */

interface CoachPlansGridProps {
  /** Coach plans data */
  plans: CoachPlans;
  
  /** Chart generator instance */
  chartGenerator: ChartGenerator;
  
  /** Optional custom coach colors */
  coachColors?: { [key: string]: string };
  
  /** Optional custom coach names */
  coachNames?: { [key: string]: string };
}

// Default coach colors
const DEFAULT_COACH_COLORS: { [key: string]: string } = {
  coach_d: 'border-blue-400 bg-blue-50',
  coach_i: 'border-green-400 bg-green-50',
  coach_s: 'border-purple-400 bg-purple-50',
  coach_n: 'border-orange-400 bg-orange-50',
};

// Default coach names
const DEFAULT_COACH_NAMES: { [key: string]: string } = {
  coach_d: 'Day Trading Coach',
  coach_i: 'Intraday Analysis Coach',
  coach_s: 'Sentiment Coach',
  coach_n: 'News & Events Coach',
};

export default function CoachPlansGrid({
  plans,
  chartGenerator,
  coachColors = DEFAULT_COACH_COLORS,
  coachNames = DEFAULT_COACH_NAMES,
}: CoachPlansGridProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {Object.entries(plans).map(([coachKey, plan]) => {
        const colorClass = coachColors[coachKey] || 'border-gray-400 bg-gray-50';
        const coachName = coachNames[coachKey] || coachKey;
        
        return (
          <CoachCard
            key={coachKey}
            coachKey={coachKey}
            coachName={coachName}
            plan={plan}
            colorClass={colorClass}
            chartGenerator={chartGenerator}
          />
        );
      })}
    </div>
  );
}
