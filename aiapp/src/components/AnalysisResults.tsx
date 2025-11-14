'use client';

import React, { useState } from 'react';
import { AnalysisResults as AnalysisResultsType, AnalystType } from '@/types/sections';

interface AnalysisResultsProps {
  results: AnalysisResultsType;
}

export default function AnalysisResults({ results }: AnalysisResultsProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['decision']));

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

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case 'BUY':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'SELL':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'HOLD':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 dark:text-green-400';
    if (confidence >= 0.6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const analystLabels: Record<AnalystType, string> = {
    market: 'Market Analyst',
    fundamentals: 'Fundamentals Analyst',
    news: 'News Analyst',
    social: 'Social Analyst',
  };

  const analystIcons: Record<AnalystType, string> = {
    market: '📈',
    fundamentals: '💰',
    news: '📰',
    social: '💬',
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Analysis Results: {results.ticker}
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {formatTimestamp(results.timestamp)}
          </span>
        </div>
      </div>

      {/* Final Decision */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <button
          onClick={() => toggleSection('decision')}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Final Decision
            </h3>
          </div>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${
              expandedSections.has('decision') ? 'transform rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {expandedSections.has('decision') && (
          <div className="px-6 pb-6 space-y-4">
            <div className={`inline-flex items-center px-4 py-2 rounded-lg border font-bold text-lg ${getDecisionColor(results.finalDecision)}`}>
              {results.finalDecision}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Confidence:
              </span>
              <span className={`text-lg font-bold ${getConfidenceColor(results.confidence)}`}>
                {(results.confidence * 100).toFixed(0)}%
              </span>
            </div>

            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reasoning:
              </h4>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                {results.reasoning}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bull Arguments */}
      {results.bullArguments && results.bullArguments.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => toggleSection('bull')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🐂</span>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Bull Arguments
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({results.bullArguments.length})
              </span>
            </div>
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform ${
                expandedSections.has('bull') ? 'transform rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expandedSections.has('bull') && (
            <div className="px-6 pb-6">
              <ul className="space-y-3">
                {results.bullArguments.map((argument, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {argument}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Bear Arguments */}
      {results.bearArguments && results.bearArguments.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => toggleSection('bear')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🐻</span>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Bear Arguments
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({results.bearArguments.length})
              </span>
            </div>
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform ${
                expandedSections.has('bear') ? 'transform rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expandedSections.has('bear') && (
            <div className="px-6 pb-6">
              <ul className="space-y-3">
                {results.bearArguments.map((argument, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {argument}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Analyst Reports */}
      {results.analystReports && Object.keys(results.analystReports).length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Analyst Reports
          </h3>
          {(Object.entries(results.analystReports) as [AnalystType, string][]).map(([analyst, report]) => (
            <div
              key={analyst}
              className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700"
            >
              <button
                onClick={() => toggleSection(`analyst-${analyst}`)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{analystIcons[analyst]}</span>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {analystLabels[analyst]}
                  </h4>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform ${
                    expandedSections.has(`analyst-${analyst}`) ? 'transform rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {expandedSections.has(`analyst-${analyst}`) && (
                <div className="px-6 pb-6">
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {report}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => {
            const resultsText = JSON.stringify(results, null, 2);
            const blob = new Blob([resultsText], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `analysis-${results.ticker}-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Download Results
        </button>
        <button
          onClick={() => {
            const expandAll = expandedSections.size < Object.keys(results.analystReports || {}).length + 3;
            if (expandAll) {
              const allSections = new Set([
                'decision',
                'bull',
                'bear',
                ...Object.keys(results.analystReports || {}).map(a => `analyst-${a}`)
              ]);
              setExpandedSections(allSections);
            } else {
              setExpandedSections(new Set(['decision']));
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
