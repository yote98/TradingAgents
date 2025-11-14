'use client';

import React, { useState, useMemo } from 'react';
import {
  calculatePositionSize,
  calculateShares,
  calculateStopLoss,
  calculateRiskReward,
  calculateKellyCriterion,
} from '@/lib/risk-calculations';
import RiskMetrics from '../RiskMetrics';

export default function RiskSection() {
  // Form inputs
  const [portfolioValue, setPortfolioValue] = useState<string>('100000');
  const [riskPerTrade, setRiskPerTrade] = useState<string>('2');
  const [entryPrice, setEntryPrice] = useState<string>('');
  const [targetPrice, setTargetPrice] = useState<string>('');
  const [stopLossPercent, setStopLossPercent] = useState<string>('5');
  
  // Kelly Criterion inputs
  const [winRate, setWinRate] = useState<string>('60');
  const [avgWin, setAvgWin] = useState<string>('500');
  const [avgLoss, setAvgLoss] = useState<string>('300');
  
  // Memoize expensive calculations
  const calculations = useMemo(() => {
    const portfolio = parseFloat(portfolioValue) || 0;
    const risk = parseFloat(riskPerTrade) || 0;
    const stopLoss = parseFloat(stopLossPercent) || 0;
    const entry = parseFloat(entryPrice) || 0;
    const target = parseFloat(targetPrice) || 0;
    const win = parseFloat(winRate) || 0;
    const avgWinAmt = parseFloat(avgWin) || 0;
    const avgLossAmt = parseFloat(avgLoss) || 0;
    
    let positionSize = 0;
    let shares = 0;
    let stopLossPrice = 0;
    let riskRewardRatio = 0;
    let kellyPercent = 0;
    
    // Position size calculation
    if (portfolio > 0 && risk > 0 && stopLoss > 0) {
      positionSize = calculatePositionSize({
        portfolioValue: portfolio,
        riskPerTrade: risk,
        stopLossPercent: stopLoss,
      });
      
      // Calculate shares if entry price is provided
      if (entry > 0) {
        shares = calculateShares(positionSize, entry);
      }
    }
    
    // Stop-loss price calculation
    if (entry > 0 && stopLoss > 0) {
      stopLossPrice = calculateStopLoss({
        entryPrice: entry,
        riskPercent: stopLoss,
      });
      
      // Risk/reward ratio calculation
      if (target > 0) {
        riskRewardRatio = calculateRiskReward({
          entryPrice: entry,
          stopLoss: stopLossPrice,
          target: target,
        });
      }
    }
    
    // Kelly Criterion calculation
    if (win > 0 && win <= 100 && avgWinAmt > 0 && avgLossAmt > 0) {
      const kelly = calculateKellyCriterion({
        winRate: win / 100,
        avgWin: avgWinAmt,
        avgLoss: avgLossAmt,
      });
      kellyPercent = kelly * 100;
    }
    
    return {
      positionSize,
      shares,
      stopLossPrice,
      riskRewardRatio,
      kellyPercent,
    };
  }, [portfolioValue, riskPerTrade, stopLossPercent, entryPrice, targetPrice, winRate, avgWin, avgLoss]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Risk Management</h1>
        <p className="mt-2 text-gray-600">
          Calculate position sizes, stop-loss levels, and risk/reward ratios for informed trading decisions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Input Forms */}
        <div className="space-y-6">
          {/* Portfolio Settings */}
          <section className="bg-white rounded-lg shadow p-6" aria-labelledby="portfolio-settings-heading">
            <h2 id="portfolio-settings-heading" className="text-xl font-semibold text-gray-900 mb-4">Portfolio Settings</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="portfolioValue" className="block text-sm font-medium text-gray-700 mb-1">
                  Portfolio Value ($)
                </label>
                <input
                  type="number"
                  id="portfolioValue"
                  value={portfolioValue}
                  onChange={(e) => setPortfolioValue(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="100000"
                  min="0"
                  step="1000"
                />
              </div>
              
              <div>
                <label htmlFor="riskPerTrade" className="block text-sm font-medium text-gray-700 mb-1">
                  Risk Per Trade (%)
                </label>
                <input
                  type="number"
                  id="riskPerTrade"
                  value={riskPerTrade}
                  onChange={(e) => setRiskPerTrade(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="2"
                  min="0"
                  max="100"
                  step="0.1"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Recommended: 1-2% for conservative, 2-5% for moderate risk
                </p>
              </div>
            </div>
          </section>

          {/* Position Calculator */}
          <section className="bg-white rounded-lg shadow p-6" aria-labelledby="position-calculator-heading">
            <h2 id="position-calculator-heading" className="text-xl font-semibold text-gray-900 mb-4">Position Calculator</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="entryPrice" className="block text-sm font-medium text-gray-700 mb-1">
                  Entry Price ($)
                </label>
                <input
                  type="number"
                  id="entryPrice"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="150.00"
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div>
                <label htmlFor="stopLossPercent" className="block text-sm font-medium text-gray-700 mb-1">
                  Stop-Loss (%)
                </label>
                <input
                  type="number"
                  id="stopLossPercent"
                  value={stopLossPercent}
                  onChange={(e) => setStopLossPercent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="5"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
              
              <div>
                <label htmlFor="targetPrice" className="block text-sm font-medium text-gray-700 mb-1">
                  Target Price ($) <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  type="number"
                  id="targetPrice"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="180.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </section>

          {/* Kelly Criterion Calculator */}
          <section className="bg-white rounded-lg shadow p-6" aria-labelledby="kelly-criterion-heading">
            <h2 id="kelly-criterion-heading" className="text-xl font-semibold text-gray-900 mb-4">Kelly Criterion</h2>
            <p className="text-sm text-gray-600 mb-4">
              Calculate optimal position size based on your historical win rate and average win/loss.
            </p>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="winRate" className="block text-sm font-medium text-gray-700 mb-1">
                  Win Rate (%)
                </label>
                <input
                  type="number"
                  id="winRate"
                  value={winRate}
                  onChange={(e) => setWinRate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="60"
                  min="0"
                  max="100"
                  step="1"
                />
              </div>
              
              <div>
                <label htmlFor="avgWin" className="block text-sm font-medium text-gray-700 mb-1">
                  Average Win ($)
                </label>
                <input
                  type="number"
                  id="avgWin"
                  value={avgWin}
                  onChange={(e) => setAvgWin(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="500"
                  min="0"
                  step="10"
                />
              </div>
              
              <div>
                <label htmlFor="avgLoss" className="block text-sm font-medium text-gray-700 mb-1">
                  Average Loss ($)
                </label>
                <input
                  type="number"
                  id="avgLoss"
                  value={avgLoss}
                  onChange={(e) => setAvgLoss(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="300"
                  min="0"
                  step="10"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Results */}
        <div role="region" aria-labelledby="risk-metrics-heading">
          <RiskMetrics
            portfolioValue={parseFloat(portfolioValue) || 0}
            riskPerTrade={parseFloat(riskPerTrade) || 0}
            positionSize={calculations.positionSize}
            shares={calculations.shares}
            entryPrice={parseFloat(entryPrice) || 0}
            stopLossPrice={calculations.stopLossPrice}
            stopLossPercent={parseFloat(stopLossPercent) || 0}
            targetPrice={parseFloat(targetPrice) || 0}
            riskRewardRatio={calculations.riskRewardRatio}
            kellyPercent={calculations.kellyPercent}
          />
        </div>
      </div>

      {/* Educational Info */}
      <aside className="bg-blue-50 border border-blue-200 rounded-lg p-6" aria-labelledby="risk-tips-heading">
        <h3 id="risk-tips-heading" className="text-lg font-semibold text-blue-900 mb-2">Risk Management Tips</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span><strong>Never risk more than 1-2%</strong> of your portfolio on a single trade</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span><strong>Always use stop-losses</strong> to limit downside risk</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span><strong>Aim for risk/reward ratios of 2:1 or higher</strong> to ensure profitable trading over time</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span><strong>Kelly Criterion is aggressive</strong> - consider using 25-50% of the suggested size</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span><strong>Diversify across multiple positions</strong> to reduce portfolio risk</span>
          </li>
        </ul>
      </aside>
    </div>
  );
}
