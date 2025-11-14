/**
 * SocialSection Component
 * 
 * Wrapper for the TwitterFeedPanel component that integrates it into the
 * sidebar navigation system. Provides a ticker input at the section level
 * and maintains all existing Twitter feed functionality.
 */

'use client';

import React, { useState } from 'react';
import TwitterFeedPanel from '../TwitterFeedPanel';

interface SocialSectionProps {
  initialTicker?: string;
}

export default function SocialSection({ initialTicker = '' }: SocialSectionProps) {
  const [ticker, setTicker] = useState(initialTicker);
  const [inputValue, setInputValue] = useState(initialTicker);

  /**
   * Handle ticker input change
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value.toUpperCase());
  };

  /**
   * Handle form submission
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTicker(inputValue.trim());
  };

  /**
   * Handle clear ticker
   */
  const handleClear = () => {
    setInputValue('');
    setTicker('');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Section Header with Ticker Input */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0">
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
              Social Sentiment
            </h1>
          </div>
          
          {/* Ticker Input Form */}
          <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Enter ticker (e.g., AAPL)"
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                maxLength={10}
              />
            </div>
            
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base whitespace-nowrap"
            >
              Apply
            </button>
            
            {ticker && (
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-2 text-gray-600 hover:text-gray-800 active:text-gray-900 transition-colors text-sm sm:text-base"
                title="Clear ticker"
              >
                Clear
              </button>
            )}
          </form>
          
          {/* Current Filter Display */}
          {ticker && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Filtering by:</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded font-medium">
                {ticker}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Twitter Feed Panel */}
      <div className="flex-1 overflow-hidden">
        <TwitterFeedPanel
          ticker={ticker}
          autoRefresh={true}
          refreshInterval={5 * 60 * 1000} // 5 minutes
          maxTweets={50}
        />
      </div>
    </div>
  );
}
