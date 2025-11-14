'use client';

import React, { useMemo } from 'react';
import { formatCurrency, formatPercent, formatRatio } from '@/lib/risk-calculations';

interface RiskMetricsProps {
  portfolioValue: number;
  riskPerTrade: number;
  positionSize: number;
  shares: number;
  entryPrice: number;
  stopLossPrice: number;
  stopLossPercent: number;
  targetPrice: number;
  riskRewardRatio: number;
  kellyPercent: number;
}

export default function RiskMetrics({
  portfolioValue,
  riskPerTrade,
  positionSize,
  shares,
  entryPrice,
  stopLossPrice,
  stopLossPercent,
  targetPrice,
  riskRewardRatio,
  kellyPercent,
}: RiskMetricsProps) {
  // Memoize derived calculations
  const derivedMetrics = useMemo(() => {
    const riskAmount = portfolioValue * (riskPerTrade / 100);
    const potentialLoss = shares * (entryPrice - stopLossPrice);
    const potentialGain = shares * (targetPrice - entryPrice);
    
    // Risk level indicator
    const getRiskLevel = (percent: number): { label: string; color: string } => {
      if (percent <= 1) return { label: 'Conservative', color: 'text-green-600 bg-green-100' };
      if (percent <= 2) return { label: 'Moderate', color: 'text-blue-600 bg-blue-100' };
      if (percent <= 5) return { label: 'Aggressive', color: 'text-orange-600 bg-orange-100' };
      return { label: 'Very High Risk', color: 'text-red-600 bg-red-100' };
    };
    
    const riskLevel = getRiskLevel(riskPerTrade);
    
    // Risk/Reward quality indicator
    const getRRQuality = (ratio: number): { label: string; color: string } => {
      if (ratio >= 3) return { label: 'Excellent', color: 'text-green-600' };
      if (ratio >= 2) return { label: 'Good', color: 'text-blue-600' };
      if (ratio >= 1) return { label: 'Fair', color: 'text-orange-600' };
      return { label: 'Poor', color: 'text-red-600' };
    };
    
    const rrQuality = getRRQuality(riskRewardRatio);
    
    return {
      riskAmount,
      potentialLoss,
      potentialGain,
      riskLevel,
      rrQuality,
    };
  }, [portfolioValue, riskPerTrade, shares, entryPrice, stopLossPrice, targetPrice, riskRewardRatio]);
  
  const { riskAmount, potentialLoss, potentialGain, riskLevel, rrQuality } = derivedMetrics;

  return (
    <div className="space-y-6">
      {/* Position Size Recommendation */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Position Size</h2>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Recommended Position Size</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(positionSize)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Risk Amount</p>
              <p className="text-lg font-semibold text-gray-900">{formatCurrency(riskAmount)}</p>
            </div>
          </div>
          
          {entryPrice > 0 && shares > 0 && (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-xs text-gray-600">Shares to Buy</p>
                <p className="text-xl font-bold text-gray-900">{shares.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-xs text-gray-600">Total Cost</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(shares * entryPrice)}</p>
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-sm text-gray-600">Risk Level</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${riskLevel.color}`}>
              {riskLevel.label}
            </span>
          </div>
        </div>
      </div>

      {/* Stop-Loss Levels */}
      {stopLossPrice > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Stop-Loss Levels</h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium text-gray-700">Stop-Loss Price</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(stopLossPrice)}</p>
              </div>
              <p className="text-xs text-gray-600">
                Exit if price drops {formatPercent(stopLossPercent)} below entry
              </p>
            </div>
            
            {shares > 0 && (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-xs text-gray-600">Max Loss per Share</p>
                  <p className="text-lg font-semibold text-red-600">
                    {formatCurrency(entryPrice - stopLossPrice)}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-xs text-gray-600">Total Max Loss</p>
                  <p className="text-lg font-semibold text-red-600">
                    {formatCurrency(potentialLoss)}
                  </p>
                </div>
              </div>
            )}
            
            {/* Visual indicator */}
            <div className="relative pt-4">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Stop-Loss</span>
                <span>Entry</span>
                {targetPrice > 0 && <span>Target</span>}
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"></div>
              </div>
              <div className="flex justify-between text-xs font-medium mt-1">
                <span className="text-red-600">{formatCurrency(stopLossPrice)}</span>
                <span className="text-gray-900">{formatCurrency(entryPrice)}</span>
                {targetPrice > 0 && <span className="text-green-600">{formatCurrency(targetPrice)}</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Risk/Reward Ratio */}
      {riskRewardRatio > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Risk/Reward Analysis</h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium text-gray-700">Risk/Reward Ratio</p>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{formatRatio(riskRewardRatio)}</p>
                  <p className={`text-sm font-medium ${rrQuality.color}`}>{rrQuality.label}</p>
                </div>
              </div>
              <p className="text-xs text-gray-600">
                For every $1 risked, potential to gain ${riskRewardRatio.toFixed(2)}
              </p>
            </div>
            
            {shares > 0 && (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-red-50 rounded border border-red-200">
                  <p className="text-xs text-gray-600 mb-1">Potential Loss</p>
                  <p className="text-lg font-semibold text-red-600">{formatCurrency(potentialLoss)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatPercent(stopLossPercent)} downside
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded border border-green-200">
                  <p className="text-xs text-gray-600 mb-1">Potential Gain</p>
                  <p className="text-lg font-semibold text-green-600">{formatCurrency(potentialGain)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatPercent(((targetPrice - entryPrice) / entryPrice) * 100)} upside
                  </p>
                </div>
              </div>
            )}
            
            {riskRewardRatio < 2 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800">
                  ⚠️ Consider targeting a risk/reward ratio of at least 2:1 for better long-term profitability
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Kelly Criterion */}
      {kellyPercent > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Kelly Criterion</h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium text-gray-700">Optimal Position Size</p>
                <p className="text-2xl font-bold text-purple-600">{formatPercent(kellyPercent)}</p>
              </div>
              <p className="text-xs text-gray-600">
                Based on your historical win rate and average win/loss
              </p>
            </div>
            
            <div className="p-3 bg-gray-50 rounded">
              <p className="text-xs text-gray-600 mb-1">Recommended Position</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(portfolioValue * (kellyPercent / 100))}
              </p>
            </div>
            
            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-800">
                💡 <strong>Tip:</strong> Kelly Criterion can be aggressive. Many traders use 25-50% of the Kelly size for more conservative risk management.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Portfolio Summary */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Portfolio Summary</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-white rounded shadow-sm">
            <p className="text-xs text-gray-600">Portfolio Value</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(portfolioValue)}</p>
          </div>
          <div className="p-3 bg-white rounded shadow-sm">
            <p className="text-xs text-gray-600">Risk Per Trade</p>
            <p className="text-lg font-bold text-gray-900">{formatPercent(riskPerTrade)}</p>
          </div>
          {shares > 0 && entryPrice > 0 && (
            <>
              <div className="p-3 bg-white rounded shadow-sm">
                <p className="text-xs text-gray-600">Position Exposure</p>
                <p className="text-lg font-bold text-gray-900">
                  {formatPercent((shares * entryPrice / portfolioValue) * 100)}
                </p>
              </div>
              <div className="p-3 bg-white rounded shadow-sm">
                <p className="text-xs text-gray-600">Remaining Capital</p>
                <p className="text-lg font-bold text-gray-900">
                  {formatCurrency(portfolioValue - (shares * entryPrice))}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
