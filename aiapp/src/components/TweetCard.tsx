/**
 * TweetCard Component
 * 
 * Displays individual tweets with sentiment indicators, ticker highlighting,
 * and account information. Matches C1 Dashboard design system.
 */

'use client';

import React from 'react';
import { Tweet } from '@/types/twitter';
import LazyImage from './LazyImage';

interface TweetCardProps {
  tweet: Tweet;
  onTickerClick?: (ticker: string) => void;
  compact?: boolean;
}

/**
 * Formats a timestamp into a relative time string (e.g., "2h ago")
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
 * Gets sentiment badge color and label based on sentiment score
 */
function getSentimentBadge(sentiment: number): { color: string; label: string; bgColor: string } {
  if (sentiment >= 0.5) {
    return { color: 'text-green-700', label: 'Bullish', bgColor: 'bg-green-100' };
  } else if (sentiment >= 0.2) {
    return { color: 'text-green-600', label: 'Positive', bgColor: 'bg-green-50' };
  } else if (sentiment > -0.2) {
    return { color: 'text-gray-600', label: 'Neutral', bgColor: 'bg-gray-100' };
  } else if (sentiment > -0.5) {
    return { color: 'text-red-600', label: 'Negative', bgColor: 'bg-red-50' };
  } else {
    return { color: 'text-red-700', label: 'Bearish', bgColor: 'bg-red-100' };
  }
}

/**
 * Highlights ticker symbols in tweet text with clickable badges
 */
function highlightTickers(
  text: string,
  tickers: string[],
  onTickerClick?: (ticker: string) => void
): React.ReactNode {
  if (tickers.length === 0) {
    return text;
  }

  // Create regex pattern for all tickers (e.g., $AAPL, $MSFT)
  const tickerPattern = new RegExp(`\\$(?:${tickers.join('|')})\\b`, 'gi');
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = tickerPattern.exec(text)) !== null) {
    // Add text before the ticker
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    // Add ticker badge
    const ticker = match[0].substring(1).toUpperCase(); // Remove $ and uppercase
    parts.push(
      <button
        key={`${ticker}-${match.index}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onTickerClick?.(ticker);
        }}
        className="inline-flex items-center px-2 py-0.5 mx-0.5 rounded-md text-xs font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors cursor-pointer"
      >
        ${ticker}
      </button>
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts;
}

const TweetCard = React.memo(function TweetCard({ tweet, onTickerClick, compact = false }: TweetCardProps) {
  const sentimentBadge = getSentimentBadge(tweet.sentiment);
  const relativeTime = formatRelativeTime(tweet.timestamp);
  const [touchStart, setTouchStart] = React.useState<number | null>(null);
  const [touchEnd, setTouchEnd] = React.useState<number | null>(null);
  const [swipeOffset, setSwipeOffset] = React.useState(0);

  // Minimum swipe distance (in px) to trigger dismiss
  const minSwipeDistance = 100;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
    if (touchStart !== null) {
      const distance = e.targetTouches[0].clientX - touchStart;
      // Only allow swipe right (positive distance)
      if (distance > 0) {
        setSwipeOffset(Math.min(distance, 150)); // Cap at 150px
      }
    }
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setSwipeOffset(0);
      return;
    }
    
    const distance = touchEnd - touchStart;
    const isRightSwipe = distance > minSwipeDistance;
    
    if (isRightSwipe) {
      // Animate out and reset
      setSwipeOffset(300);
      setTimeout(() => {
        setSwipeOffset(0);
        setTouchStart(null);
        setTouchEnd(null);
      }, 300);
    } else {
      // Reset position
      setSwipeOffset(0);
    }
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg active:shadow-xl transition-all duration-300 swipeable list-item-optimize ${
        compact ? 'p-2 sm:p-3' : 'p-3 sm:p-4'
      }`}
      style={{
        transform: `translateX(${swipeOffset}px)`,
        opacity: swipeOffset > minSwipeDistance ? 1 - (swipeOffset / 300) : 1,
        transition: touchEnd ? 'transform 0.3s ease-out, opacity 0.3s ease-out' : 'none',
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header: Account info and timestamp */}
      <div className="flex items-start justify-between mb-2 sm:mb-3">
        <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
          {/* Account Avatar */}
          {tweet.accountAvatar ? (
            <LazyImage
              src={tweet.accountAvatar}
              alt={tweet.account}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0 object-cover"
              placeholderClassName="w-8 h-8 sm:w-10 sm:h-10 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-xs sm:text-sm">
                {tweet.account.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          {/* Account name and timestamp */}
          <div className="flex-1 min-w-0">
            <a
              href={tweet.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-sm sm:text-base text-gray-900 hover:text-blue-600 active:text-blue-700 transition-colors truncate block touch-manipulation"
            >
              @{tweet.account}
            </a>
            <p className="text-xs text-gray-500">{relativeTime}</p>
          </div>
        </div>

        {/* Sentiment Badge */}
        <div
          className={`flex-shrink-0 ml-1.5 sm:ml-2 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-xs font-semibold ${sentimentBadge.bgColor} ${sentimentBadge.color}`}
        >
          {sentimentBadge.label}
        </div>
      </div>

      {/* Tweet Text with Ticker Highlighting */}
      <div className={`text-gray-800 leading-relaxed ${compact ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'} mb-2 sm:mb-3`}>
        {highlightTickers(tweet.text, tweet.tickers, onTickerClick)}
      </div>

      {/* Footer: Engagement metrics and link */}
      <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-gray-100">
        {/* Engagement metrics */}
        {tweet.engagement && (
          <div className="flex items-center space-x-3 sm:space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
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
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span className="text-xs">{tweet.engagement.likes.toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-1">
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
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
              <span className="text-xs">{tweet.engagement.retweets.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* View on Twitter link */}
        <a
          href={tweet.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:text-blue-800 active:text-blue-900 font-medium transition-colors flex items-center space-x-1 touch-manipulation"
        >
          <span className="hidden sm:inline">View Tweet</span>
          <span className="sm:hidden">View</span>
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      </div>
    </div>
  );
});

export default TweetCard;
