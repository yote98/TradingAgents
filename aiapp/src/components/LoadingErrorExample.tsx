/**
 * Loading and Error States Example
 * 
 * Demonstrates usage of LoadingSpinner and ErrorMessage components
 */

'use client';

import React, { useState } from 'react';
import LoadingSpinner, { 
  SkeletonLoader, 
  CardSkeleton, 
  InlineSpinner, 
  LoadingOverlay 
} from './LoadingSpinner';
import ErrorMessage, { ErrorText } from './ErrorMessage';
import { 
  createNetworkError, 
  createAPIError, 
  createValidationError, 
  createTimeoutError 
} from '@/lib/errors';

export default function LoadingErrorExample() {
  const [showOverlay, setShowOverlay] = useState(false);

  return (
    <div className="space-y-8 p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        Loading & Error States Examples
      </h1>

      {/* Loading Spinners */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Loading Spinners
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium mb-4 text-gray-700 dark:text-gray-300">
              Default Spinner
            </h3>
            <LoadingSpinner />
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium mb-4 text-gray-700 dark:text-gray-300">
              Dots Variant
            </h3>
            <LoadingSpinner variant="dots" />
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium mb-4 text-gray-700 dark:text-gray-300">
              Pulse Variant
            </h3>
            <LoadingSpinner variant="pulse" />
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium mb-4 text-gray-700 dark:text-gray-300">
              With Text
            </h3>
            <LoadingSpinner text="Loading..." centered />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium mb-4 text-gray-700 dark:text-gray-300">
              Skeleton Loader
            </h3>
            <SkeletonLoader lines={4} />
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium mb-4 text-gray-700 dark:text-gray-300">
              Card Skeleton
            </h3>
            <CardSkeleton />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium mb-4 text-gray-700 dark:text-gray-300">
            Inline Spinner (for buttons)
          </h3>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg">
            <InlineSpinner />
            <span>Processing...</span>
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium mb-4 text-gray-700 dark:text-gray-300">
            Loading Overlay
          </h3>
          <button
            onClick={() => setShowOverlay(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            Show Loading Overlay
          </button>
          {showOverlay && (
            <LoadingOverlay text="Processing request..." />
          )}
        </div>
      </section>

      {/* Error Messages */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Error Messages
        </h2>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Network Error (Default Variant)
            </h3>
            <ErrorMessage
              error={createNetworkError('Failed to connect to server')}
              onRetry={() => console.log('Retry clicked')}
            />
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              API Error (Compact Variant)
            </h3>
            <ErrorMessage
              error={createAPIError('Server returned 500 error')}
              variant="compact"
              onRetry={() => console.log('Retry clicked')}
            />
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Validation Error (No Retry)
            </h3>
            <ErrorMessage
              error={createValidationError('Invalid email address')}
              variant="compact"
            />
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Timeout Error (Banner Variant)
            </h3>
            <ErrorMessage
              error={createTimeoutError('Request timed out after 30 seconds')}
              variant="banner"
              onRetry={() => console.log('Retry clicked')}
            />
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Inline Error
            </h3>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Email Address
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-red-300 rounded-lg mb-2"
                placeholder="email@example.com"
              />
              <ErrorMessage
                error="Please enter a valid email address"
                variant="inline"
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Error with Details
            </h3>
            <ErrorMessage
              error={createAPIError('Failed to fetch data', {
                statusCode: 500,
                endpoint: '/api/data',
                timestamp: new Date().toISOString(),
              })}
              showDetails={true}
            />
          </div>
        </div>
      </section>

      {/* Size Variants */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Size Variants
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium mb-4 text-gray-700 dark:text-gray-300">
              Small
            </h3>
            <LoadingSpinner size="sm" text="Loading..." centered />
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium mb-4 text-gray-700 dark:text-gray-300">
              Medium
            </h3>
            <LoadingSpinner size="md" text="Loading..." centered />
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium mb-4 text-gray-700 dark:text-gray-300">
              Large
            </h3>
            <LoadingSpinner size="lg" text="Loading..." centered />
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium mb-4 text-gray-700 dark:text-gray-300">
              Extra Large
            </h3>
            <LoadingSpinner size="xl" text="Loading..." centered />
          </div>
        </div>
      </section>

      {/* Real-world Example */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Real-world Example
        </h2>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">
            Data Fetching Component
          </h3>
          <DataFetchingExample />
        </div>
      </section>
    </div>
  );
}

/**
 * Example component showing loading and error states
 */
function DataFetchingExample() {
  const [state, setState] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');

  const fetchData = () => {
    setState('loading');
    
    // Simulate API call
    setTimeout(() => {
      // Randomly succeed or fail
      if (Math.random() > 0.5) {
        setState('success');
      } else {
        setState('error');
      }
    }, 2000);
  };

  const handleRetry = () => {
    fetchData();
  };

  if (state === 'idle') {
    return (
      <button
        onClick={fetchData}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
      >
        Fetch Data
      </button>
    );
  }

  if (state === 'loading') {
    return <LoadingSpinner text="Fetching data..." centered />;
  }

  if (state === 'error') {
    return (
      <ErrorMessage
        error={createNetworkError('Failed to fetch data from server')}
        onRetry={handleRetry}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-green-600 dark:text-green-400 flex items-center space-x-2">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <span className="font-medium">Data loaded successfully!</span>
      </div>
      <button
        onClick={() => setState('idle')}
        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
      >
        Reset
      </button>
    </div>
  );
}
