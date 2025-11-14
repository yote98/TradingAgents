/**
 * SentimentGauge Component
 * 
 * Displays an animated gauge visualization for sentiment scores,
 * along with bullish/bearish arguments and key themes.
 */

'use client';

import React, { useState, useEffect } from 'react';

interface SentimentGaugeProps {
  score: number; // -1.0 to 1.0
  bullishArgs: string[];
  bearishArgs: string[];
  themes: string[];
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
}

/**
 * Loading skeleton component
 */
function SentimentGaugeSkeleton({ size = 'medium' }: { size?: 'small' | 'medium' | 'large' }) {
  const dimensions = getGaugeDimensions(size);
  const { width, height } = dimensions;
  
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 animate-pulse">
      {/* Gauge skeleton */}
      <div className="flex flex-col items-center mb-6">
        <div
          style={{ width, height }}
          className="bg-gray-200 rounded-t-full mb-4"
        />
        <div className="w-24 h-12 bg-gray-200 rounded mt-4" />
        <div className="w-32 h-4 bg-gray-200 rounded mt-2" />
      </div>

      {/* Arguments skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <div className="w-40 h-6 bg-gray-200 rounded mb-3" />
          <div className="space-y-2">
            <div className="w-full h-4 bg-gray-200 rounded" />
            <div className="w-5/6 h-4 bg-gray-200 rounded" />
            <div className="w-4/6 h-4 bg-gray-200 rounded" />
          </div>
        </div>
        <div>
          <div className="w-40 h-6 bg-gray-200 rounded mb-3" />
          <div className="space-y-2">
            <div className="w-full h-4 bg-gray-200 rounded" />
            <div className="w-5/6 h-4 bg-gray-200 rounded" />
            <div className="w-4/6 h-4 bg-gray-200 rounded" />
          </div>
        </div>
      </div>

      {/* Themes skeleton */}
      <div>
        <div className="w-32 h-6 bg-gray-200 rounded mb-3" />
        <div className="flex flex-wrap gap-2">
          <div className="w-20 h-8 bg-gray-200 rounded-full" />
          <div className="w-24 h-8 bg-gray-200 rounded-full" />
          <div className="w-28 h-8 bg-gray-200 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/**
 * Gets color based on sentiment score
 * -1.0 (red) → 0 (yellow) → 1.0 (green)
 */
function getSentimentColor(score: number): string {
  // Clamp score between -1 and 1
  const clampedScore = Math.max(-1, Math.min(1, score));
  
  if (clampedScore >= 0) {
    // Positive: yellow to green
    const greenIntensity = Math.floor(clampedScore * 255);
    return `rgb(${255 - greenIntensity}, 200, 50)`;
  } else {
    // Negative: yellow to red
    const redIntensity = Math.floor(Math.abs(clampedScore) * 255);
    return `rgb(255, ${200 - redIntensity}, 50)`;
  }
}

/**
 * Gets gauge dimensions based on size prop
 */
function getGaugeDimensions(size: 'small' | 'medium' | 'large') {
  switch (size) {
    case 'small':
      return { width: 200, height: 120, radius: 80, strokeWidth: 12 };
    case 'large':
      return { width: 400, height: 240, radius: 160, strokeWidth: 24 };
    case 'medium':
    default:
      return { width: 300, height: 180, radius: 120, strokeWidth: 18 };
  }
}

export default function SentimentGauge({
  score,
  bullishArgs,
  bearishArgs,
  themes,
  size = 'medium',
  loading = false,
}: SentimentGaugeProps) {
  // Show loading skeleton
  if (loading) {
    return <SentimentGaugeSkeleton size={size} />;
  }
  const [animatedScore, setAnimatedScore] = useState(0);
  const [bullishExpanded, setBullishExpanded] = useState(false);
  const [bearishExpanded, setBearishExpanded] = useState(false);

  // Animate score on mount or change
  useEffect(() => {
    const duration = 1000; // 1 second animation
    const steps = 60;
    const stepDuration = duration / steps;
    const increment = (score - animatedScore) / steps;
    
    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setAnimatedScore(score);
        clearInterval(timer);
      } else {
        setAnimatedScore((prev) => prev + increment);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [score]);

  const dimensions = getGaugeDimensions(size);
  const { width, height, radius, strokeWidth } = dimensions;
  
  // Calculate gauge arc parameters
  const centerX = width / 2;
  const centerY = height - 20;
  const startAngle = -180;
  const endAngle = 0;
  const totalAngle = endAngle - startAngle;
  
  // Convert score (-1 to 1) to angle (0 to 180 degrees)
  const scoreAngle = ((animatedScore + 1) / 2) * totalAngle + startAngle;
  
  // Calculate needle position
  const needleLength = radius - strokeWidth / 2;
  const needleAngleRad = (scoreAngle * Math.PI) / 180;
  const needleX = centerX + needleLength * Math.cos(needleAngleRad);
  const needleY = centerY + needleLength * Math.sin(needleAngleRad);

  // Create gradient arc path
  const createArcPath = (startAngle: number, endAngle: number) => {
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const startX = centerX + radius * Math.cos(startRad);
    const startY = centerY + radius * Math.sin(startRad);
    const endX = centerX + radius * Math.cos(endRad);
    const endY = centerY + radius * Math.sin(endRad);
    
    return `M ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${endX} ${endY}`;
  };

  const gaugeColor = getSentimentColor(animatedScore);
  
  // Determine if we should show "Show more" buttons
  const showBullishExpand = bullishArgs.length > 3;
  const showBearishExpand = bearishArgs.length > 3;
  const displayedBullishArgs = bullishExpanded ? bullishArgs : bullishArgs.slice(0, 3);
  const displayedBearishArgs = bearishExpanded ? bearishArgs : bearishArgs.slice(0, 3);

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-6">
      {/* Gauge Visualization */}
      <div className="flex flex-col items-center mb-4 sm:mb-6">
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="overflow-visible"
        >
          {/* Background arc (gray) */}
          <path
            d={createArcPath(startAngle, endAngle)}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          
          {/* Colored arc based on score */}
          <path
            d={createArcPath(startAngle, scoreAngle)}
            fill="none"
            stroke={gaugeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            style={{
              transition: 'stroke 0.3s ease',
            }}
          />
          
          {/* Needle */}
          <line
            x1={centerX}
            y1={centerY}
            x2={needleX}
            y2={needleY}
            stroke="#374151"
            strokeWidth={3}
            strokeLinecap="round"
            style={{
              transition: 'all 0.3s ease',
            }}
          />
          
          {/* Center dot */}
          <circle cx={centerX} cy={centerY} r={6} fill="#374151" />
          
          {/* Score labels */}
          <text
            x={centerX - radius + 10}
            y={centerY + 20}
            fontSize={size === 'small' ? 10 : size === 'large' ? 16 : 12}
            fill="#9ca3af"
            fontWeight="600"
          >
            -1.0
          </text>
          <text
            x={centerX - 10}
            y={centerY - radius + 20}
            fontSize={size === 'small' ? 10 : size === 'large' ? 16 : 12}
            fill="#9ca3af"
            fontWeight="600"
          >
            0
          </text>
          <text
            x={centerX + radius - 30}
            y={centerY + 20}
            fontSize={size === 'small' ? 10 : size === 'large' ? 16 : 12}
            fill="#9ca3af"
            fontWeight="600"
          >
            1.0
          </text>
        </svg>
        
        {/* Numeric Score Display */}
        <div className="mt-3 sm:mt-4 text-center">
          <div
            className={`font-bold ${
              size === 'small' ? 'text-2xl sm:text-3xl' : size === 'large' ? 'text-4xl sm:text-6xl' : 'text-3xl sm:text-5xl'
            }`}
            style={{ color: gaugeColor }}
          >
            {animatedScore.toFixed(2)}
          </div>
          <div className="text-xs sm:text-sm text-gray-600 mt-1">
            {animatedScore >= 0.5
              ? 'Strongly Bullish'
              : animatedScore >= 0.2
              ? 'Bullish'
              : animatedScore > -0.2
              ? 'Neutral'
              : animatedScore > -0.5
              ? 'Bearish'
              : 'Strongly Bearish'}
          </div>
        </div>
      </div>

      {/* Arguments Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        {/* Bullish Arguments */}
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-green-700 mb-2 sm:mb-3 flex items-center">
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                clipRule="evenodd"
              />
            </svg>
            Bullish
          </h3>
          <ul className="space-y-1.5 sm:space-y-2">
            {displayedBullishArgs.map((arg, index) => (
              <li key={index} className="flex items-start">
                <span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full mt-1.5 sm:mt-2 mr-1.5 sm:mr-2 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-gray-700 leading-snug">{arg}</span>
              </li>
            ))}
          </ul>
          {showBullishExpand && (
            <button
              onClick={() => setBullishExpanded(!bullishExpanded)}
              className="mt-2 py-2 text-xs sm:text-sm text-green-600 hover:text-green-800 active:text-green-900 font-medium touch-manipulation min-h-[44px] sm:min-h-0"
            >
              {bullishExpanded ? 'Show less' : `Show ${bullishArgs.length - 3} more`}
            </button>
          )}
        </div>

        {/* Bearish Arguments */}
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-red-700 mb-2 sm:mb-3 flex items-center">
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
                clipRule="evenodd"
              />
            </svg>
            Bearish
          </h3>
          <ul className="space-y-1.5 sm:space-y-2">
            {displayedBearishArgs.map((arg, index) => (
              <li key={index} className="flex items-start">
                <span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full mt-1.5 sm:mt-2 mr-1.5 sm:mr-2 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-gray-700 leading-snug">{arg}</span>
              </li>
            ))}
          </ul>
          {showBearishExpand && (
            <button
              onClick={() => setBearishExpanded(!bearishExpanded)}
              className="mt-2 py-2 text-xs sm:text-sm text-red-600 hover:text-red-800 active:text-red-900 font-medium touch-manipulation min-h-[44px] sm:min-h-0"
            >
              {bearishExpanded ? 'Show less' : `Show ${bearishArgs.length - 3} more`}
            </button>
          )}
        </div>
      </div>

      {/* Key Themes */}
      {themes.length > 0 && (
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">Key Themes</h3>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {themes.map((theme, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-100 text-blue-800"
              >
                {theme}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
