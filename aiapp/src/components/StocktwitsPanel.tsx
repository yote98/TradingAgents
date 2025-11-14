/**
 * StocktwitsPanel Component
 * 
 * Displays Stocktwits messages for a ticker with bullish/bearish sentiment ratio.
 * Fetches data from the API and renders messages with user information and sentiment labels.
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { StocktwitsMessage, StocktwitsRatio } from '@/types/twitter';
import { fetchStocktwits } from '@/lib/twitter-api';

interface StocktwitsPanelProps {
  ticker: string;
  enabled?: boolean;
}

interface StocktwitsPanelState {
  messages: StocktwitsMessage[];
  sentimentRatio: StocktwitsRatio | null;
  loading: boolean;
  error: string | null;
}

/**
 * Format timestamp to relative time (e.g., "2h ago")
 */
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

/**
 * Get sentiment badge color
 */
function getSentimentColor(sentiment: 'bullish' | 'bearish' | 'neutral'): string {
  switch (sentiment) {
    case 'bullish':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'bearish':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'neutral':
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

/**
 * Get sentiment icon
 */
function getSentimentIcon(sentiment: 'bullish' | 'bearish' | 'neutral'): string {
  switch (sentiment) {
    case 'bullish':
      return '↑';
    case 'bearish':
      return '↓';
    case 'neutral':
      return '→';
  }
}

export default function StocktwitsPanel({ ticker, enabled = true }: StocktwitsPanelProps) {
  const [state, setState] = useState<StocktwitsPanelState>({
    messages: [],
    sentimentRatio: null,
    loading: true,
    error: null,
  });

  /**
   * Fetch Stocktwits data
   */
  const fetchData = useCallback(async () => {
    if (!enabled || !ticker) {
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await fetchStocktwits(ticker, 30);
      setState({
        messages: result.messages,
        sentimentRatio: result.sentimentRatio,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error fetching Stocktwits:', error);
      setState({
        messages: [],
        sentimentRatio: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch Stocktwits data',
      });
    }
  }, [ticker, enabled]);

  /**
   * Fetch data on mount and when ticker changes
   */
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Don't render if not enabled
  if (!enabled) {
    return null;
  }

  // Loading state
  if (state.loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4" />
          <div className="h-24 bg-gray-200 rounded mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state with graceful degradation
  if (state.error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-2 mb-4">
          <svg
            className="w-5 h-5 text-orange-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900">Stocktwits Unavailable</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Unable to load Stocktwits data. The service may be temporarily unavailable.
        </p>
        <button
          onClick={fetchData}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // Calculate total for percentage
  const total = state.sentimentRatio
    ? state.sentimentRatio.bullish + state.sentimentRatio.bearish
    : 0;
  const bullishPercent = total > 0 ? (state.sentimentRatio!.bullish / total) * 100 : 50;
  const bearishPercent = total > 0 ? (state.sentimentRatio!.bearish / total) * 100 : 50;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 space-y-1 sm:space-y-0">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
          Stocktwits: ${ticker}
        </h3>
        <div className="flex items-center space-x-1.5 sm:space-x-2 text-xs sm:text-sm text-gray-600">
          <svg
            className="w-3.5 h-3.5 sm:w-4 sm:h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
            />
          </svg>
          <span>{state.messages.length} messages</span>
        </div>
      </div>

      {/* Sentiment Ratio Bar Chart */}
      {state.sentimentRatio && (
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center justify-between text-xs sm:text-sm font-medium mb-2">
            <span className="text-green-600">
              Bullish {state.sentimentRatio.bullish} ({bullishPercent.toFixed(0)}%)
            </span>
            <span className="text-red-600">
              Bearish {state.sentimentRatio.bearish} ({bearishPercent.toFixed(0)}%)
            </span>
          </div>
          <div className="h-6 sm:h-8 flex rounded-lg overflow-hidden border border-gray-200">
            <div
              className="bg-gradient-to-r from-green-400 to-green-500 flex items-center justify-center text-white text-xs font-semibold transition-all duration-500"
              style={{ width: `${bullishPercent}%` }}
            >
              {bullishPercent > 20 && `${bullishPercent.toFixed(0)}%`}
            </div>
            <div
              className="bg-gradient-to-r from-red-400 to-red-500 flex items-center justify-center text-white text-xs font-semibold transition-all duration-500"
              style={{ width: `${bearishPercent}%` }}
            >
              {bearishPercent > 20 && `${bearishPercent.toFixed(0)}%`}
            </div>
          </div>
        </div>
      )}

      {/* Messages List */}
      <div className="space-y-2 sm:space-y-3 max-h-64 sm:max-h-96 overflow-y-auto">
        {state.messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg
              className="w-12 h-12 mx-auto mb-3 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p className="text-sm">No Stocktwits messages found for ${ticker}</p>
          </div>
        ) : (
          state.messages.map(message => (
            <div
              key={message.id}
              className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:border-blue-300 active:border-blue-400 hover:shadow-sm transition-all"
            >
              {/* User Info and Sentiment */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0 flex-1">
                  {/* User Avatar */}
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {message.user.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-gray-900 text-xs sm:text-sm truncate">
                      {message.user}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatRelativeTime(message.timestamp)}
                    </div>
                  </div>
                </div>

                {/* Sentiment Badge */}
                <span
                  className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-semibold border flex-shrink-0 ml-2 ${getSentimentColor(
                    message.sentiment
                  )}`}
                >
                  {getSentimentIcon(message.sentiment)} <span className="hidden sm:inline">{message.sentiment}</span>
                </span>
              </div>

              {/* Message Text */}
              <p className="text-gray-700 text-xs sm:text-sm mb-2 leading-relaxed">
                {message.text}
              </p>

              {/* Like Count */}
              {message.likes > 0 && (
                <div className="flex items-center space-x-1 text-gray-500 text-xs">
                  <svg
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                  </svg>
                  <span>{message.likes}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
