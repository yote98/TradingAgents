/**
 * ErrorMessage Component
 * 
 * Display error messages with retry functionality
 */

'use client';

import React from 'react';
import { AppError, ErrorType, getErrorMessage, isRetryable } from '@/lib/errors';

export type ErrorVariant = 'default' | 'compact' | 'banner' | 'inline';

interface ErrorMessageProps {
  /** Error object or error message string */
  error: AppError | Error | string | unknown;
  
  /** Callback when retry button is clicked */
  onRetry?: () => void;
  
  /** Whether to show the retry button */
  showRetry?: boolean;
  
  /** Visual variant of the error message */
  variant?: ErrorVariant;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Optional title override */
  title?: string;
  
  /** Whether to show error details */
  showDetails?: boolean;
}

/**
 * Get icon for error type
 */
function getErrorIcon(error: unknown): React.ReactNode {
  if (typeof error === 'object' && error !== null && 'type' in error) {
    const appError = error as AppError;
    
    switch (appError.type) {
      case ErrorType.NETWORK_ERROR:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
          </svg>
        );
      
      case ErrorType.TIMEOUT_ERROR:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      
      case ErrorType.VALIDATION_ERROR:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      
      default:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  }
  
  // Default error icon
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

/**
 * Get default title for error type
 */
function getErrorTitle(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'type' in error) {
    const appError = error as AppError;
    
    switch (appError.type) {
      case ErrorType.NETWORK_ERROR:
        return 'Connection Error';
      case ErrorType.API_ERROR:
        return 'Server Error';
      case ErrorType.VALIDATION_ERROR:
        return 'Validation Error';
      case ErrorType.TIMEOUT_ERROR:
        return 'Request Timeout';
      default:
        return 'Error';
    }
  }
  
  return 'Error';
}

/**
 * Default variant - full error display with icon
 */
function DefaultVariant({
  error,
  title,
  showDetails,
  onRetry,
  showRetry,
}: {
  error: unknown;
  title?: string;
  showDetails?: boolean;
  onRetry?: () => void;
  showRetry?: boolean;
}) {
  const errorMessage = getErrorMessage(error);
  const errorTitle = title || getErrorTitle(error);
  const canRetry = showRetry !== false && isRetryable(error);
  const details = typeof error === 'object' && error !== null && 'details' in error 
    ? (error as AppError).details 
    : null;
  
  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 text-red-600 dark:text-red-400">
          {getErrorIcon(error)}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-1">
            {errorTitle}
          </h3>
          
          <p className="text-red-800 dark:text-red-200 mb-4">
            {errorMessage}
          </p>
          
          {showDetails && details && (
            <details className="mb-4">
              <summary className="text-sm text-red-700 dark:text-red-300 cursor-pointer hover:underline">
                Show technical details
              </summary>
              <pre className="mt-2 text-xs text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/40 p-3 rounded overflow-x-auto">
                {JSON.stringify(details, null, 2)}
              </pre>
            </details>
          )}
          
          {canRetry && onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Compact variant - smaller error display
 */
function CompactVariant({
  error,
  onRetry,
  showRetry,
}: {
  error: unknown;
  onRetry?: () => void;
  showRetry?: boolean;
}) {
  const errorMessage = getErrorMessage(error);
  const canRetry = showRetry !== false && isRetryable(error);
  
  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 text-red-600 dark:text-red-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm text-red-800 dark:text-red-200">
            {errorMessage}
          </p>
        </div>
        
        {canRetry && onRetry && (
          <button
            onClick={onRetry}
            className="ml-4 text-sm text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100 font-medium focus:outline-none focus:underline"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Banner variant - full-width banner at top
 */
function BannerVariant({
  error,
  onRetry,
  showRetry,
}: {
  error: unknown;
  onRetry?: () => void;
  showRetry?: boolean;
}) {
  const errorMessage = getErrorMessage(error);
  const canRetry = showRetry !== false && isRetryable(error);
  
  return (
    <div className="bg-red-600 dark:bg-red-700 text-white p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm font-medium">
            {errorMessage}
          </p>
        </div>
        
        {canRetry && onRetry && (
          <button
            onClick={onRetry}
            className="ml-4 px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Inline variant - minimal inline error
 */
function InlineVariant({ error }: { error: unknown }) {
  const errorMessage = getErrorMessage(error);
  
  return (
    <p className="text-sm text-red-600 dark:text-red-400 flex items-center space-x-2">
      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{errorMessage}</span>
    </p>
  );
}

/**
 * Main ErrorMessage component
 */
export default function ErrorMessage({
  error,
  onRetry,
  showRetry = true,
  variant = 'default',
  className = '',
  title,
  showDetails = false,
}: ErrorMessageProps) {
  if (!error) {
    return null;
  }
  
  const containerClasses = `${className}`;
  
  return (
    <div className={containerClasses} role="alert" aria-live="assertive">
      {variant === 'default' && (
        <DefaultVariant
          error={error}
          title={title}
          showDetails={showDetails}
          onRetry={onRetry}
          showRetry={showRetry}
        />
      )}
      
      {variant === 'compact' && (
        <CompactVariant
          error={error}
          onRetry={onRetry}
          showRetry={showRetry}
        />
      )}
      
      {variant === 'banner' && (
        <BannerVariant
          error={error}
          onRetry={onRetry}
          showRetry={showRetry}
        />
      )}
      
      {variant === 'inline' && (
        <InlineVariant error={error} />
      )}
    </div>
  );
}

/**
 * Simple error text component
 */
export function ErrorText({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`text-sm text-red-600 dark:text-red-400 ${className}`}>
      {children}
    </p>
  );
}
