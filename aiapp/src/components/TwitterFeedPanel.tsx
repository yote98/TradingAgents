/**
 * TwitterFeedPanel Component
 * 
 * Main container for Twitter sentiment display. Integrates all sub-components
 * (TweetCard, SentimentGauge, AccountManager) with state management, auto-refresh,
 * and ticker filtering functionality.
 */

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { Tweet, SentimentData } from '@/types/twitter';
import { fetchTwitterSentiment } from '@/lib/twitter-api';
import TweetCard from './TweetCard';
import SentimentGauge from './SentimentGauge';
import AccountManager from './AccountManager';
import StocktwitsPanel from './StocktwitsPanel';
import { ErrorBoundary } from './ErrorBoundary';

interface TwitterFeedPanelProps {
  ticker?: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
  maxTweets?: number;
}

interface TwitterFeedState {
  tweets: Tweet[];
  sentiment: SentimentData | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  accounts: string[];
  filter: string;
  retryCount: number;
  isRetrying: boolean;
  cachedTweets: Tweet[];
  cachedSentiment: SentimentData | null;
  cachedLastUpdated: Date | null;
  showingCachedData: boolean;
}

// Default monitored accounts
const DEFAULT_ACCOUNTS = [
  'ChartChampions',
  'unusual_whales',
  'TradingView',
  'Benzinga',
];

/**
 * Formats a date into a readable timestamp
 */
function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}



function TwitterFeedPanelInner({
  ticker,
  autoRefresh = true,
  refreshInterval = 5 * 60 * 1000, // 5 minutes default
  maxTweets = 50,
}: TwitterFeedPanelProps) {
  // State management
  const [state, setState] = useState<TwitterFeedState>({
    tweets: [],
    sentiment: null,
    loading: true,
    error: null,
    lastUpdated: null,
    accounts: DEFAULT_ACCOUNTS,
    filter: ticker || '',
    retryCount: 0,
    isRetrying: false,
    cachedTweets: [],
    cachedSentiment: null,
    cachedLastUpdated: null,
    showingCachedData: false,
  });

  const [showAccountManager, setShowAccountManager] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [manualRefreshLoading, setManualRefreshLoading] = useState(false);
  const [stocktwitsEnabled, setStocktwitsEnabled] = useState(false);
  const [pullToRefreshOffset, setPullToRefreshOffset] = useState(0);
  const [isPulling, setIsPulling] = useState(false);

  // Refs for managing intervals and scroll detection
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tweetListRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);

  /**
   * Update filter when ticker prop changes
   */
  useEffect(() => {
    setState(prev => ({ ...prev, filter: ticker || '' }));
  }, [ticker]);

  /**
   * Load accounts and settings from localStorage on mount
   */
  useEffect(() => {
    try {
      const saved = localStorage.getItem('twitter_monitored_accounts');
      if (saved) {
        const accounts = JSON.parse(saved);
        setState(prev => ({ ...prev, accounts }));
      }
      
      const stocktwitsSaved = localStorage.getItem('twitter_stocktwits_enabled');
      if (stocktwitsSaved) {
        setStocktwitsEnabled(JSON.parse(stocktwitsSaved));
      }
    } catch (error) {
      console.error('Failed to load settings from localStorage:', error);
    }
  }, []);



  /**
   * Fetch Twitter sentiment data
   */
  const fetchData = useCallback(async (showLoading = true, isRetry = false) => {
    if (showLoading) {
      setState(prev => ({ 
        ...prev, 
        loading: true, 
        error: null,
        isRetrying: isRetry,
        showingCachedData: false,
      }));
    }

    try {
      const result = await fetchTwitterSentiment({
        ticker: state.filter || undefined,
        accounts: state.accounts,
        limit: maxTweets,
      });

      setState(prev => ({
        ...prev,
        tweets: result.tweets,
        sentiment: result.sentiment,
        lastUpdated: result.lastUpdated,
        loading: false,
        error: null,
        retryCount: 0,
        isRetrying: false,
        // Save to cache for fallback
        cachedTweets: result.tweets,
        cachedSentiment: result.sentiment,
        cachedLastUpdated: result.lastUpdated,
        showingCachedData: false,
      }));

      // Show success toast on retry
      if (isRetry) {
        toast.success('Data loaded successfully', {
          duration: 2000,
        });
      }

      // Show info toast if data is from cache
      if (result.metadata?.cache_hit && !showLoading) {
        toast('Using cached data', {
          icon: 'ℹ️',
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('Error fetching Twitter data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch Twitter data';
      
      setState(prev => {
        // If we have cached data, show it with a warning
        const hasCachedData = prev.cachedTweets.length > 0;
        
        return {
          ...prev,
          loading: false,
          error: errorMessage,
          retryCount: isRetry ? prev.retryCount + 1 : 0,
          isRetrying: false,
          // Show cached data if available
          tweets: hasCachedData ? prev.cachedTweets : prev.tweets,
          sentiment: hasCachedData ? prev.cachedSentiment : prev.sentiment,
          lastUpdated: hasCachedData ? prev.cachedLastUpdated : prev.lastUpdated,
          showingCachedData: hasCachedData,
        };
      });

      // Show error toast
      toast.error(errorMessage, {
        duration: 4000,
      });

      // Show info toast if showing cached data
      setState(prev => {
        if (prev.showingCachedData) {
          toast('Showing cached data', {
            icon: '⚠️',
            duration: 3000,
          });
        }
        return prev;
      });
    }
  }, [state.filter, state.accounts, maxTweets]);

  /**
   * Initial data fetch on mount and when dependencies change
   */
  useEffect(() => {
    fetchData();
  }, [state.accounts, state.filter]);

  /**
   * Set up auto-refresh interval
   */
  useEffect(() => {
    if (!autoRefresh || isScrolling) {
      return;
    }

    // Clear existing interval
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    // Set up new interval
    refreshIntervalRef.current = setInterval(() => {
      fetchData(false); // Don't show loading spinner for auto-refresh
    }, refreshInterval);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, isScrolling, fetchData]);

  /**
   * Handle scroll detection to pause auto-refresh
   */
  useEffect(() => {
    const tweetList = tweetListRef.current;
    if (!tweetList) return;

    const handleScroll = () => {
      setIsScrolling(true);

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Resume auto-refresh 30 seconds after scroll stops
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 30000);
    };

    tweetList.addEventListener('scroll', handleScroll);

    return () => {
      tweetList.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Handle pull-to-refresh gesture
   */
  useEffect(() => {
    const tweetList = tweetListRef.current;
    if (!tweetList) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (tweetList.scrollTop === 0) {
        touchStartY.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartY.current === null || tweetList.scrollTop > 0) return;

      const touchY = e.touches[0].clientY;
      const pullDistance = touchY - touchStartY.current;

      if (pullDistance > 0) {
        setIsPulling(true);
        // Apply resistance to pull distance
        const offset = Math.min(pullDistance * 0.5, 80);
        setPullToRefreshOffset(offset);
      }
    };

    const handleTouchEnd = async () => {
      if (pullToRefreshOffset > 60) {
        // Trigger refresh
        await fetchData();
      }
      
      // Reset pull state
      setIsPulling(false);
      setPullToRefreshOffset(0);
      touchStartY.current = null;
    };

    tweetList.addEventListener('touchstart', handleTouchStart, { passive: true });
    tweetList.addEventListener('touchmove', handleTouchMove, { passive: true });
    tweetList.addEventListener('touchend', handleTouchEnd);

    return () => {
      tweetList.removeEventListener('touchstart', handleTouchStart);
      tweetList.removeEventListener('touchmove', handleTouchMove);
      tweetList.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullToRefreshOffset, fetchData]);

  /**
   * Handle manual refresh button click
   */
  const handleManualRefresh = async () => {
    setManualRefreshLoading(true);
    await fetchData();
    setManualRefreshLoading(false);
  };

  /**
   * Handle retry button click
   */
  const handleRetry = async () => {
    if (state.retryCount >= 3) {
      toast.error('Maximum retry attempts reached. Please try again later.', {
        duration: 4000,
      });
      return;
    }
    await fetchData(true, true);
  };

  /**
   * Handle ticker filter change
   */
  const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({ ...prev, filter: e.target.value }));
  }, []);

  /**
   * Handle clear filter button
   */
  const handleClearFilter = useCallback(() => {
    setState(prev => ({ ...prev, filter: '' }));
  }, []);

  /**
   * Handle ticker click from TweetCard
   */
  const handleTickerClick = useCallback((ticker: string) => {
    setState(prev => ({ ...prev, filter: ticker }));
  }, []);

  /**
   * Handle account save from AccountManager
   */
  const handleAccountSave = useCallback((accounts: string[]) => {
    setState(prev => ({ ...prev, accounts }));
    toast.success('Accounts updated successfully', {
      duration: 3000,
    });
  }, []);

  /**
   * Handle Stocktwits toggle from AccountManager
   */
  const handleStocktwitsToggle = useCallback((enabled: boolean) => {
    setStocktwitsEnabled(enabled);
  }, []);

  /**
   * Filter tweets by ticker (memoized)
   */
  const filteredTweets = React.useMemo(() => {
    if (!state.filter) return state.tweets;
    
    return state.tweets.filter(tweet =>
      tweet.tickers.some(t =>
        t.toLowerCase().includes(state.filter.toLowerCase())
      )
    );
  }, [state.tweets, state.filter]);

  // Split filter by commas for multiple tickers
  const filterTickers = state.filter
    .split(',')
    .map(t => t.trim())
    .filter(t => t.length > 0);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Toast Container */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Social Sentiment Feed
          </h1>
          
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Last Updated */}
            {state.lastUpdated && (
              <div className="text-xs sm:text-sm text-gray-600 hidden md:block">
                Updated: {formatTimestamp(state.lastUpdated)}
              </div>
            )}

            {/* Auto-refresh indicator */}
            {autoRefresh && !isScrolling && (
              <div className="flex items-center space-x-1 text-xs sm:text-sm text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="hidden sm:inline">Auto-refresh</span>
              </div>
            )}

            {/* Scroll pause indicator */}
            {isScrolling && (
              <div className="flex items-center space-x-1 text-xs sm:text-sm text-orange-600">
                <div className="w-2 h-2 bg-orange-500 rounded-full" />
                <span className="hidden sm:inline">Paused</span>
              </div>
            )}

            {/* Manual Refresh Button */}
            <button
              onClick={handleManualRefresh}
              disabled={manualRefreshLoading}
              className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors disabled:opacity-50 touch-manipulation"
              title="Refresh"
              aria-label="Refresh feed"
            >
              <svg
                className={`w-5 h-5 sm:w-6 sm:h-6 text-gray-600 ${manualRefreshLoading ? 'animate-spin' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>

            {/* Settings Button */}
            <button
              onClick={() => setShowAccountManager(true)}
              className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation"
              title="Manage Accounts"
              aria-label="Manage accounts"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Filter Input */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={state.filter}
              onChange={handleFilterChange}
              placeholder="Filter by ticker (e.g., AAPL)"
              className="w-full px-3 sm:px-4 py-2 pl-9 sm:pl-10 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
          </div>
          
          <div className="flex items-center justify-between sm:justify-start space-x-2">
            {state.filter && (
              <button
                onClick={handleClearFilter}
                className="px-3 sm:px-4 py-2 text-sm text-gray-600 hover:text-gray-800 active:text-gray-900 transition-colors touch-manipulation"
              >
                Clear
              </button>
            )}
            
            {/* Tweet Count */}
            <div className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
              {filteredTweets.length} / {state.tweets.length}
            </div>
          </div>
        </div>
      </div>

      {/* Cached Data Warning Banner */}
      {state.showingCachedData && (
        <div className="bg-orange-50 border-b border-orange-200 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg
              className="w-5 h-5 text-orange-600"
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
            <span className="text-sm text-orange-800 font-medium">
              Data may be outdated - Showing cached data
            </span>
          </div>
          <button
            onClick={handleManualRefresh}
            className="text-sm text-orange-600 hover:text-orange-800 font-medium underline"
          >
            Refresh Now
          </button>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {state.loading ? (
          /* Loading Skeleton */
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <SentimentGauge
              score={0}
              bullishArgs={[]}
              bearishArgs={[]}
              themes={[]}
              loading={true}
            />
            <div className="space-y-3 sm:space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-lg shadow-md p-3 sm:p-4 animate-pulse">
                  <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="w-24 sm:w-32 h-3 sm:h-4 bg-gray-200 rounded mb-1.5 sm:mb-2" />
                      <div className="w-16 sm:w-20 h-2 sm:h-3 bg-gray-200 rounded" />
                    </div>
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <div className="w-full h-3 sm:h-4 bg-gray-200 rounded" />
                    <div className="w-5/6 h-3 sm:h-4 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : state.error ? (
          /* Error State */
          <div className="flex items-center justify-center h-full p-6">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Failed to Load Twitter Data
              </h3>
              <p className="text-gray-600 mb-4">{state.error}</p>
              
              {/* Retry count indicator */}
              {state.retryCount > 0 && state.retryCount < 3 && (
                <p className="text-sm text-gray-500 mb-3">
                  Retry attempt {state.retryCount} of 3
                </p>
              )}
              
              {state.retryCount >= 3 && (
                <p className="text-sm text-orange-600 mb-3">
                  Maximum retry attempts reached
                </p>
              )}
              
              <div className="flex justify-center space-x-3">
                <button
                  onClick={handleRetry}
                  disabled={state.isRetrying || state.retryCount >= 3}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {state.isRetrying ? 'Retrying...' : 'Retry'}
                </button>
                
                {state.retryCount >= 3 && (
                  <button
                    onClick={() => setState(prev => ({ ...prev, retryCount: 0, error: null }))}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Main Content */
          <div
            ref={tweetListRef}
            className="h-full overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 relative mobile-scroll-optimize"
            style={{
              transform: `translateY(${pullToRefreshOffset}px)`,
              transition: isPulling ? 'none' : 'transform 0.3s ease-out',
            }}
          >
            {/* Pull to Refresh Indicator */}
            {isPulling && (
              <div
                className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full flex items-center justify-center"
                style={{ marginTop: `${pullToRefreshOffset - 40}px` }}
              >
                <div className="bg-white rounded-full p-2 shadow-lg">
                  <svg
                    className={`w-6 h-6 text-blue-600 ${pullToRefreshOffset > 60 ? 'animate-spin' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </div>
              </div>
            )}

            {/* Sentiment Gauge */}
            {state.sentiment && (
              <SentimentGauge
                score={state.sentiment.overall_score}
                bullishArgs={state.sentiment.bullish_args}
                bearishArgs={state.sentiment.bearish_args}
                themes={state.sentiment.themes}
                size="medium"
              />
            )}

            {/* Stocktwits Panel */}
            {stocktwitsEnabled && state.filter && (
              <StocktwitsPanel
                ticker={state.filter}
                enabled={stocktwitsEnabled}
              />
            )}

            {/* Tweet List */}
            {filteredTweets.length === 0 ? (
              <div className="text-center py-8 sm:py-12 text-gray-500 px-4">
                <svg
                  className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-gray-300"
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
                <p className="text-base sm:text-lg font-medium">No tweets found</p>
                <p className="text-xs sm:text-sm mt-1">
                  {state.filter
                    ? `No tweets mentioning ${filterTickers.join(', ')}`
                    : 'Try adjusting your monitored accounts'}
                </p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {/* Limit to 100 tweets for performance */}
                {filteredTweets.slice(0, 100).map(tweet => (
                  <TweetCard
                    key={tweet.id}
                    tweet={tweet}
                    onTickerClick={handleTickerClick}
                  />
                ))}
                {filteredTweets.length > 100 && (
                  <div className="text-center py-3 sm:py-4 text-gray-500 text-xs sm:text-sm">
                    Showing first 100 of {filteredTweets.length} tweets
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Account Manager Modal */}
      {showAccountManager && (
        <AccountManager
          accounts={state.accounts}
          onSave={handleAccountSave}
          onClose={() => setShowAccountManager(false)}
          stocktwitsEnabled={stocktwitsEnabled}
          onStocktwitsToggle={handleStocktwitsToggle}
        />
      )}
    </div>
  );
}

/**
 * TwitterFeedPanel wrapped with ErrorBoundary
 */
export default function TwitterFeedPanel(props: TwitterFeedPanelProps) {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('TwitterFeedPanel error:', error, errorInfo);
      }}
    >
      <TwitterFeedPanelInner {...props} />
    </ErrorBoundary>
  );
}
