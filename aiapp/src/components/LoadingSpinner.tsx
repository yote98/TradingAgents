/**
 * LoadingSpinner Component
 * 
 * Reusable loading indicators with multiple variants
 */

'use client';

import React from 'react';

export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerVariant = 'spinner' | 'dots' | 'pulse' | 'skeleton';

interface LoadingSpinnerProps {
  /** Size of the spinner */
  size?: SpinnerSize;
  
  /** Variant of the loading indicator */
  variant?: SpinnerVariant;
  
  /** Optional text to display below spinner */
  text?: string;
  
  /** Whether to center the spinner */
  centered?: boolean;
  
  /** Additional CSS classes */
  className?: string;
}

/**
 * Get size classes for spinner
 */
function getSizeClasses(size: SpinnerSize): string {
  switch (size) {
    case 'sm':
      return 'w-4 h-4';
    case 'md':
      return 'w-8 h-8';
    case 'lg':
      return 'w-12 h-12';
    case 'xl':
      return 'w-16 h-16';
    default:
      return 'w-8 h-8';
  }
}

/**
 * Get text size classes
 */
function getTextSizeClasses(size: SpinnerSize): string {
  switch (size) {
    case 'sm':
      return 'text-xs';
    case 'md':
      return 'text-sm';
    case 'lg':
      return 'text-base';
    case 'xl':
      return 'text-lg';
    default:
      return 'text-sm';
  }
}

/**
 * Spinner variant - rotating circle
 */
function SpinnerVariant({ size }: { size: SpinnerSize }) {
  const sizeClasses = getSizeClasses(size);
  
  return (
    <svg
      className={`animate-spin ${sizeClasses}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

/**
 * Dots variant - three bouncing dots
 */
function DotsVariant({ size }: { size: SpinnerSize }) {
  const dotSize = size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-5 h-5';
  
  return (
    <div className="flex space-x-2" aria-hidden="true">
      <div className={`${dotSize} bg-current rounded-full animate-bounce`} style={{ animationDelay: '0ms' }} />
      <div className={`${dotSize} bg-current rounded-full animate-bounce`} style={{ animationDelay: '150ms' }} />
      <div className={`${dotSize} bg-current rounded-full animate-bounce`} style={{ animationDelay: '300ms' }} />
    </div>
  );
}

/**
 * Pulse variant - pulsing circle
 */
function PulseVariant({ size }: { size: SpinnerSize }) {
  const sizeClasses = getSizeClasses(size);
  
  return (
    <div className={`${sizeClasses} bg-current rounded-full animate-pulse`} aria-hidden="true" />
  );
}

/**
 * Skeleton variant - loading skeleton for content
 */
export function SkeletonLoader({ 
  lines = 3, 
  className = '' 
}: { 
  lines?: number; 
  className?: string;
}) {
  return (
    <div className={`animate-pulse space-y-3 ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-gray-200 dark:bg-gray-700 rounded"
          style={{ width: `${100 - (i * 10)}%` }}
        />
      ))}
    </div>
  );
}

/**
 * Card skeleton variant
 */
export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse space-y-4 ${className}`} aria-hidden="true">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>
  );
}

/**
 * Main LoadingSpinner component
 */
export default function LoadingSpinner({
  size = 'md',
  variant = 'spinner',
  text,
  centered = false,
  className = '',
}: LoadingSpinnerProps) {
  const containerClasses = centered
    ? 'flex flex-col items-center justify-center'
    : 'flex flex-col items-start';
  
  const textClasses = getTextSizeClasses(size);
  
  // Render skeleton variant separately
  if (variant === 'skeleton') {
    return <SkeletonLoader className={className} />;
  }
  
  return (
    <div className={`${containerClasses} ${className}`} role="status" aria-live="polite">
      <div className="text-blue-600 dark:text-blue-400">
        {variant === 'spinner' && <SpinnerVariant size={size} />}
        {variant === 'dots' && <DotsVariant size={size} />}
        {variant === 'pulse' && <PulseVariant size={size} />}
      </div>
      
      {text && (
        <p className={`mt-2 text-gray-600 dark:text-gray-400 ${textClasses}`}>
          {text}
        </p>
      )}
      
      <span className="sr-only">Loading...</span>
    </div>
  );
}

/**
 * Inline loading spinner for buttons
 */
export function InlineSpinner({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`animate-spin w-4 h-4 ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

/**
 * Full page loading overlay
 */
export function LoadingOverlay({ text = 'Loading...' }: { text?: string }) {
  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      role="status"
      aria-live="polite"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-xl">
        <LoadingSpinner size="lg" text={text} centered />
      </div>
    </div>
  );
}
