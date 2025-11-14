'use client';

import React, { useState, useEffect } from 'react';
import { BacktestConfig } from '@/types/sections';
import BacktestResults from '@/components/BacktestResults';
import { cleanupBacktestCache } from '@/lib/backtest-api';

interface BacktestSectionProps {
  onNavigate?: (section: string) => void;
}

export default function BacktestSection({ onNavigate }: BacktestSectionProps) {
  const [ticker, setTicker] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [config, setConfig] = useState<BacktestConfig>({
    initialBalance: 10000,
    commissionRate: 0.001,
    slippage: 0.001,
    riskPerTradePct: 2.0,
    maxPositionSizePct: 20.0,
  });
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [tickerError, setTickerError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);

  // Clean up expired cache on mount
  useEffect(() => {
    cleanupBacktestCache();
  }, []);

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

  const validateDates = (): boolean => {
    if (!startDate) {
      setDateError('Start date is required');
      return false;
    }
    if (!endDate) {
      setDateError('End date is required');
      return false;
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    
    if (start >= end) {
      setDateError('End date must be after start date');
      return false;
    }
    
    if (end > today) {
      setDateError('End date cannot be in the future');
      return false;
    }
    
    setDateError(null);
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

  const handleRunBacktest = async () => {
    if (!validateTicker(ticker)) {
      return;
    }

    if (!validateDates()) {
      return;
    }

    setRunning(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch('/api/backtest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticker,
          startDate,
          endDate,
          config,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Backtest failed');
      }

      if (data.success && data.results) {
        setResults(data.results);
      } else {
        throw new Error(data.error || 'No results returned');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      console.error('Backtest error:', err);
    } finally {
      setRunning(false);
    }
  };

  // Set default dates (last 6 months)
  React.useEffect(() => {
    const today = new Date();
    const sixMonthsAgo = new Date(today);
    sixMonthsAgo.setMonth(today.getMonth() - 6);
    
    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(sixMonthsAgo.toISOString().split('T')[0]);
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Run Backtest
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Test trading strategies on historical data to validate performance
        </p>
      </div>

      {/* Configuration Form */}
      <section className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6" aria-labelledby="backtest-config-heading">
        <h2 id="backtest-config-heading" className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Backtest Configuration
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

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date *
            </label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setDateError(null);
              }}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white ${
                dateError
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
              }`}
              disabled={running}
            />
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Date *
            </label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setDateError(null);
              }}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white ${
                dateError
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
              }`}
              disabled={running}
            />
          </div>
        </div>

        {dateError && (
          <p className="mb-6 text-sm text-red-600 dark:text-red-400">{dateError}</p>
        )}

        {/* Account Settings */}
        <fieldset className="mb-6">
          <legend className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Account Settings
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="initialBalance" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Initial Balance ($)
              </label>
              <input
                id="initialBalance"
                type="number"
                value={config.initialBalance}
                onChange={(e) => setConfig({ ...config, initialBalance: parseFloat(e.target.value) || 10000 })}
                min="1000"
                step="1000"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                disabled={running}
              />
            </div>

            <div>
              <label htmlFor="riskPerTrade" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Risk Per Trade (%)
              </label>
              <input
                id="riskPerTrade"
                type="number"
                value={config.riskPerTradePct}
                onChange={(e) => setConfig({ ...config, riskPerTradePct: parseFloat(e.target.value) || 2.0 })}
                min="0.1"
                max="10"
                step="0.1"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                disabled={running}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Percentage of account to risk per trade
              </p>
            </div>
          </div>
        </fieldset>

        {/* Trading Costs */}
        <fieldset className="mb-6">
          <legend className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Trading Costs
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="commission" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Commission Rate (%)
              </label>
              <input
                id="commission"
                type="number"
                value={config.commissionRate * 100}
                onChange={(e) => setConfig({ ...config, commissionRate: (parseFloat(e.target.value) || 0.1) / 100 })}
                min="0"
                max="1"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                disabled={running}
              />
            </div>

            <div>
              <label htmlFor="slippage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Slippage (%)
              </label>
              <input
                id="slippage"
                type="number"
                value={config.slippage * 100}
                onChange={(e) => setConfig({ ...config, slippage: (parseFloat(e.target.value) || 0.1) / 100 })}
                min="0"
                max="1"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                disabled={running}
              />
            </div>
          </div>
        </fieldset>

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
                  Backtest Error
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
          onClick={handleRunBacktest}
          disabled={running || !!tickerError || !!dateError || !ticker || !startDate || !endDate}
          className={`w-full px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            running || !!tickerError || !!dateError || !ticker || !startDate || !endDate
              ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500'
          }`}
          aria-label={running ? 'Backtest in progress' : 'Run backtest'}
          aria-busy={running}
        >
          {running ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Running Backtest...
            </span>
          ) : (
            'Run Backtest'
          )}
        </button>

        {running && (
          <p className="mt-3 text-sm text-center text-gray-600 dark:text-gray-400">
            This may take 2-5 minutes depending on the date range...
          </p>
        )}
      </section>

      {/* Results Display */}
      {results && (
        <section className="mt-8" aria-labelledby="backtest-results-heading">
          <h2 id="backtest-results-heading" className="sr-only">Backtest Results</h2>
          <BacktestResults results={results} />
        </section>
      )}
    </div>
  );
}
