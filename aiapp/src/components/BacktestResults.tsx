'use client';

import React, { useState, useMemo } from 'react';
import { BacktestResults as BacktestResultsType } from '@/types/sections';
import { downloadBacktestResults } from '@/lib/backtest-api';

interface BacktestResultsProps {
  results: BacktestResultsType;
}

export default function BacktestResults({ results }: BacktestResultsProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['metrics']));
  const [showAllTrades, setShowAllTrades] = useState(false);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  // Memoize formatting functions
  const formatters = useMemo(() => ({
    getReturnColor: (value: number) => {
      if (value > 0) return 'text-green-600 dark:text-green-400';
      if (value < 0) return 'text-red-600 dark:text-red-400';
      return 'text-gray-600 dark:text-gray-400';
    },
    formatCurrency: (value: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    },
    formatPercent: (value: number) => {
      return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
    },
    formatDate: (date: Date) => {
      return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    },
  }), []);

  const { getReturnColor, formatCurrency, formatPercent, formatDate } = formatters;

  // Memoize displayed trades to avoid recalculating on every render
  const displayedTrades = useMemo(
    () => showAllTrades ? results.trades : results.trades.slice(0, 10),
    [showAllTrades, results.trades]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Backtest Results: {results.ticker}
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {formatDate(results.period.start)} - {formatDate(results.period.end)}
          </span>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <button
          onClick={() => toggleSection('metrics')}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">📊</span>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Performance Metrics
            </h3>
          </div>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${
              expandedSections.has('metrics') ? 'transform rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {expandedSections.has('metrics') && (
          <div className="px-6 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Return */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Total Return
                </div>
                <div className={`text-2xl font-bold ${getReturnColor(results.totalReturn)}`}>
                  {formatPercent(results.totalReturn)}
                </div>
              </div>

              {/* Win Rate */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Win Rate
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {results.winRate.toFixed(1)}%
                </div>
              </div>

              {/* Sharpe Ratio */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Sharpe Ratio
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {results.sharpeRatio.toFixed(2)}
                </div>
              </div>

              {/* Max Drawdown */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Max Drawdown
                </div>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {formatPercent(results.maxDrawdown)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Equity Curve Chart */}
      {results.equityCurve && results.equityCurve.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => toggleSection('equity')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">📈</span>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Equity Curve
              </h3>
            </div>
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform ${
                expandedSections.has('equity') ? 'transform rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expandedSections.has('equity') && (
            <div className="px-6 pb-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <svg className="w-16 h-16 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                    <p className="text-sm">
                      Chart visualization: {results.equityCurve.length} data points
                    </p>
                    <p className="text-xs mt-1">
                      Install charting library for visual display
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Trade List */}
      {results.trades && results.trades.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => toggleSection('trades')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">💼</span>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Trade History
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({results.trades.length} trades)
              </span>
            </div>
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform ${
                expandedSections.has('trades') ? 'transform rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expandedSections.has('trades') && (
            <div className="px-6 pb-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        P&L
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {displayedTrades.map((trade, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-3 whitespace-nowrap text-gray-900 dark:text-white">
                          {formatDate(trade.date)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${
                            trade.action === 'BUY'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {trade.action}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-gray-900 dark:text-white">
                          {formatCurrency(trade.price)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-gray-900 dark:text-white">
                          {trade.quantity}
                        </td>
                        <td className={`px-4 py-3 whitespace-nowrap text-right font-medium ${getReturnColor(trade.pnl)}`}>
                          {formatCurrency(trade.pnl)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {results.trades.length > 10 && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setShowAllTrades(!showAllTrades)}
                    className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    {showAllTrades ? 'Show Less' : `Show All ${results.trades.length} Trades`}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => downloadBacktestResults(results)}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Download Results
        </button>
        <button
          onClick={() => {
            const expandAll = expandedSections.size < 3;
            if (expandAll) {
              setExpandedSections(new Set(['metrics', 'equity', 'trades']));
            } else {
              setExpandedSections(new Set(['metrics']));
            }
          }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {expandedSections.size < 3 ? 'Expand All' : 'Collapse All'}
        </button>
      </div>
    </div>
  );
}
