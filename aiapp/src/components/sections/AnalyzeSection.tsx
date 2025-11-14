'use client';

import React, { useState, useEffect } from 'react';
import { AnalysisConfig, AnalystType } from '@/types/sections';
import AnalysisResults from '../AnalysisResults';
import { cleanupAnalysisCache } from '@/lib/analysis-api';

interface AnalyzeSectionProps {
  onNavigate?: (section: string) => void;
}

export default function AnalyzeSection({ onNavigate }: AnalyzeSectionProps) {
  const [ticker, setTicker] = useState('');
  const [selectedAnalysts, setSelectedAnalysts] = useState<AnalystType[]>(['market', 'fundamentals']);
  const [config, setConfig] = useState<AnalysisConfig>({
    maxDebateRounds: 1,
    deepThinkModel: 'gpt-4o-mini',
    quickThinkModel: 'gpt-4o-mini',
  });
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [tickerError, setTickerError] = useState<string | null>(null);

  // Clean up expired cache on mount
  useEffect(() => {
    cleanupAnalysisCache();
  }, []);

  const analysts: { type: AnalystType; label: string; description: string }[] = [
    { type: 'market', label: 'Market Analyst', description: 'Technical analysis and price trends' },
    { type: 'fundamentals', label: 'Fundamentals Analyst', description: 'Financial statements and metrics' },
    { type: 'news', label: 'News Analyst', description: 'Recent news and events' },
    { type: 'social', label: 'Social Analyst', description: 'Social sentiment analysis' },
  ];

  const modelOptions = [
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Fast & Cheap)' },
    { value: 'gpt-4o', label: 'GPT-4o (Balanced)' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo (Advanced)' },
  ];

  const debateRoundOptions = [1, 2, 3, 4, 5];

  const validateTicker = (value: string): boolean => {
    const tickerRegex = /^[A-Z]{1,5}$/;
    if (!value) {
      setTickerError('Ticker is required');
      return false;
    }
    if (!tickerRegex.test(value)) {
      setTickerError('Ticker must be 1-5 uppercase letters (e.g., AAPL, MSFT)');
      return false;
    }
    setTickerError(null);
    return true;
  };

  const handleTickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setTicker(value);
    if (value) {
      validateTicker(value);
    } else {
      setTickerError(null);
    }
  };

  const handleAnalystToggle = (analystType: AnalystType) => {
    setSelectedAnalysts(prev => {
      if (prev.includes(analystType)) {
        // Don't allow deselecting if it's the last one
        if (prev.length === 1) return prev;
        return prev.filter(a => a !== analystType);
      } else {
        return [...prev, analystType];
      }
    });
  };

  const handleRunAnalysis = async () => {
    if (!validateTicker(ticker)) {
      return;
    }

    if (selectedAnalysts.length === 0) {
      setError('Please select at least one analyst');
      return;
    }

    setRunning(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticker,
          analysts: selectedAnalysts,
          config,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      if (data.success && data.results) {
        setResults(data.results);
      } else {
        throw new Error(data.error || 'No results returned');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      console.error('Analysis error:', err);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Run Stock Analysis
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Analyze stocks using AI-powered analysts with real-time data
        </p>
      </div>

      {/* Configuration Form */}
      <section className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6" aria-labelledby="analysis-config-heading">
        <h2 id="analysis-config-heading" className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Analysis Configuration
        </h2>

        {/* Ticker Input */}
        <div className="mb-6">
          <label htmlFor="ticker" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Stock Ticker *
          </label>
          <input
            id="ticker"
            type="text"
            value={ticker}
            onChange={handleTickerChange}
            placeholder="e.g., AAPL, MSFT, TSLA"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white ${
              tickerError
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
            }`}
            disabled={running}
            maxLength={5}
          />
          {tickerError && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{tickerError}</p>
          )}
        </div>

        {/* Analyst Selection */}
        <fieldset className="mb-6">
          <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Select Analysts * (at least one required)
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3" role="group" aria-label="Analyst selection">
            {analysts.map((analyst) => (
              <label
                key={analyst.type}
                className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedAnalysts.includes(analyst.type)
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                } ${running ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={selectedAnalysts.includes(analyst.type)}
                  onChange={() => handleAnalystToggle(analyst.type)}
                  disabled={running}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  aria-label={`Select ${analyst.label} for analysis`}
                />
                <div className="ml-3">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {analyst.label}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {analyst.description}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Configuration Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Debate Rounds */}
          <div>
            <label htmlFor="debateRounds" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Debate Rounds
            </label>
            <select
              id="debateRounds"
              value={config.maxDebateRounds}
              onChange={(e) => setConfig({ ...config, maxDebateRounds: parseInt(e.target.value) })}
              disabled={running}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              {debateRoundOptions.map((rounds) => (
                <option key={rounds} value={rounds}>
                  {rounds} {rounds === 1 ? 'Round' : 'Rounds'} {rounds === 1 ? '(Fastest)' : ''}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              More rounds = deeper analysis but higher cost
            </p>
          </div>

          {/* Model Selection */}
          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              AI Model
            </label>
            <select
              id="model"
              value={config.deepThinkModel}
              onChange={(e) => setConfig({ 
                ...config, 
                deepThinkModel: e.target.value,
                quickThinkModel: e.target.value 
              })}
              disabled={running}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              {modelOptions.map((model) => (
                <option key={model.value} value={model.value}>
                  {model.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              GPT-4o Mini recommended for testing
            </p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Analysis Error
                </h3>
                <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                  {error}
                </p>
                <button
                  onClick={() => setError(null)}
                  className="mt-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-500"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Run Button */}
        <button
          onClick={handleRunAnalysis}
          disabled={running || !!tickerError || !ticker}
          className={`w-full px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            running || !!tickerError || !ticker
              ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500'
          }`}
          aria-label={running ? 'Analysis in progress' : 'Run stock analysis'}
          aria-busy={running}
        >
          {running ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Running Analysis...
            </span>
          ) : (
            'Run Analysis'
          )}
        </button>

        {running && (
          <p className="mt-3 text-sm text-center text-gray-600 dark:text-gray-400">
            This may take 1-2 minutes depending on the number of analysts and debate rounds...
          </p>
        )}
      </section>

      {/* Results Display */}
      {results && (
        <section className="mt-8" aria-labelledby="analysis-results-heading">
          <h2 id="analysis-results-heading" className="sr-only">Analysis Results</h2>
          <AnalysisResults results={results} />
        </section>
      )}
    </div>
  );
}
