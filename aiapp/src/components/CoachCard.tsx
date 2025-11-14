/**
 * CoachCard Component
 * 
 * Individual coach plan card with lazy-loaded chart generation
 * Uses Intersection Observer to only generate charts when visible
 */

import { useEffect, useState } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { ChartGenerator } from '../lib/chartGenerator';
import { ChartData } from '@/types/charts';
import ChartDisplay from './ChartDisplay';

interface CoachPlan {
  plan: string;
  created_at: string;
  charts?: string[];
}

interface CoachCardProps {
  coachKey: string;
  coachName: string;
  plan: CoachPlan;
  colorClass: string;
  chartGenerator: ChartGenerator;
}

export default function CoachCard({
  coachKey,
  coachName,
  plan,
  colorClass,
  chartGenerator,
}: CoachCardProps) {
  const [cardRef, isVisible] = useIntersectionObserver<HTMLDivElement>({
    threshold: 0.1,
    rootMargin: '50px',
    freezeOnceVisible: true,
  });

  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [chartLoading, setChartLoading] = useState(false);
  const [chartError, setChartError] = useState<string | null>(null);
  const [chartGenerationAttempted, setChartGenerationAttempted] = useState(false);
  const [isQueued, setIsQueued] = useState(false);

  // Generate chart when card becomes visible
  useEffect(() => {
    if (!isVisible || chartGenerationAttempted) {
      return;
    }

    const generateChart = async () => {
      // Check if we should skip generation due to recent failure
      const tickerInfo = chartGenerator.extractTickerInfo(plan.plan);
      if (!tickerInfo) {
        console.debug(`[CoachCard] No ticker info found for ${coachKey}`);
        setChartGenerationAttempted(true);
        return;
      }

      if (chartGenerator.shouldSkipGeneration(tickerInfo.ticker, tickerInfo.timeframe)) {
        console.debug(`[CoachCard] Skipping chart generation for ${coachKey} due to recent failure`);
        setChartGenerationAttempted(true);
        return;
      }

      // Set loading state
      setChartLoading(true);
      setChartError(null);
      setChartGenerationAttempted(true);

      try {
        // Check if we're approaching rate limit
        const rateLimitStatus = chartGenerator.getRateLimitStatus();
        
        if (rateLimitStatus.queueSize > 0 || rateLimitStatus.remaining === 0) {
          setIsQueued(true);
          console.log(`[CoachCard] Chart generation queued for ${coachKey} (queue: ${rateLimitStatus.queueSize})`);
        }

        const chart = await chartGenerator.generateChartFromPlan(plan.plan);

        if (chart) {
          setChartData(chart);
          console.log(`[CoachCard] Chart generated for ${coachKey}: ${chart.ticker} ${chart.timeframe}`);
        } else {
          console.debug(`[CoachCard] Could not generate chart for ${coachKey}`);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to generate chart';
        setChartError(errorMessage);
        console.error(`[CoachCard] Error generating chart for ${coachKey}:`, err);
      } finally {
        setChartLoading(false);
        setIsQueued(false);
      }
    };

    generateChart();
  }, [isVisible, chartGenerationAttempted, coachKey, plan.plan, chartGenerator]);

  return (
    <div
      ref={cardRef}
      className={`bg-white rounded-lg shadow-lg border-l-4 ${colorClass} overflow-hidden hover:shadow-xl transition-shadow`}
    >
      {/* Header */}
      <div className="p-5 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">{coachName}</h2>
          <span className="text-xs text-gray-500">
            {new Date(plan.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {new Date(plan.created_at).toLocaleDateString()}
        </p>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="bg-gray-50 rounded p-4 border border-gray-200">
          <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
            {plan.plan}
          </p>
        </div>

        {/* Generated Chart */}
        {chartData && (
          <div className="mt-4 pt-4 border-t">
            <ChartDisplay
              ticker={chartData.ticker}
              timeframe={chartData.timeframe}
              data={chartData.data}
              theme="light"
              loading={false}
              error={null}
            />
          </div>
        )}

        {/* Chart Loading State */}
        {chartLoading && !chartData && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-center h-[200px] bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                <p className="text-sm text-gray-600">
                  {isQueued ? 'Queued for chart generation...' : 'Generating chart...'}
                </p>
                {isQueued && (
                  <p className="text-xs text-gray-500 mt-1">
                    Rate limit reached, waiting for available slot
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Chart Error with Fallback */}
        {chartError && !chartData && plan.charts && plan.charts.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
              <p className="text-xs text-yellow-800">
                {chartError.includes('rate limit') 
                  ? 'Chart generation temporarily unavailable (rate limit reached). Showing original chart references.'
                  : 'Chart generation unavailable. Showing original chart references.'}
              </p>
            </div>
            <div className="space-y-1">
              {plan.charts.map((chart, i) => (
                <div key={i} className="text-xs text-blue-600 truncate hover:text-blue-800">
                  {chart}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Original Charts (when no generated chart and no error) */}
        {!chartData && !chartLoading && !chartError && plan.charts && plan.charts.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm font-semibold text-gray-700 mb-2">
              {plan.charts.length} Chart{plan.charts.length > 1 ? 's' : ''} Attached
            </p>
            <div className="space-y-1">
              {plan.charts.map((chart, i) => (
                <div key={i} className="text-xs text-blue-600 truncate hover:text-blue-800">
                  {chart}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
