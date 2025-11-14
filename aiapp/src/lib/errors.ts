/**
 * Error Handling Utilities
 * 
 * Types and utilities for consistent error handling across the dashboard
 */

/**
 * Error types for categorizing errors
 */
export enum ErrorType {
  /** Network connectivity error */
  NETWORK_ERROR = 'NETWORK_ERROR',
  
  /** API returned an error response */
  API_ERROR = 'API_ERROR',
  
  /** Input validation failed */
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  
  /** Request timed out */
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  
  /** Unknown or unexpected error */
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Application error with type and details
 */
export interface AppError {
  /** Type of error */
  type: ErrorType;
  
  /** Human-readable error message */
  message: string;
  
  /** Additional error details */
  details?: any;
  
  /** Whether this error can be retried */
  retryable: boolean;
}

/**
 * Create a network error
 */
export function createNetworkError(message: string, details?: any): AppError {
  return {
    type: ErrorType.NETWORK_ERROR,
    message: message || 'Network connection failed. Please check your internet connection.',
    details,
    retryable: true,
  };
}

/**
 * Create an API error
 */
export function createAPIError(message: string, details?: any): AppError {
  return {
    type: ErrorType.API_ERROR,
    message: message || 'The server returned an error. Please try again.',
    details,
    retryable: true,
  };
}

/**
 * Create a validation error
 */
export function createValidationError(message: string, details?: any): AppError {
  return {
    type: ErrorType.VALIDATION_ERROR,
    message: message || 'Invalid input. Please check your data and try again.',
    details,
    retryable: false,
  };
}

/**
 * Create a timeout error
 */
export function createTimeoutError(message: string, details?: any): AppError {
  return {
    type: ErrorType.TIMEOUT_ERROR,
    message: message || 'Request timed out. Please try again.',
    details,
    retryable: true,
  };
}

/**
 * Create an unknown error
 */
export function createUnknownError(message: string, details?: any): AppError {
  return {
    type: ErrorType.UNKNOWN_ERROR,
    message: message || 'An unexpected error occurred. Please try again.',
    details,
    retryable: true,
  };
}

/**
 * Convert a caught error to an AppError
 */
export function toAppError(error: unknown): AppError {
  // Already an AppError
  if (isAppError(error)) {
    return error;
  }
  
  // Standard Error object
  if (error instanceof Error) {
    // Check for network errors
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return createNetworkError(error.message, error);
    }
    
    // Check for timeout errors
    if (error.message.includes('timeout') || error.message.includes('timed out')) {
      return createTimeoutError(error.message, error);
    }
    
    // Default to unknown error
    return createUnknownError(error.message, error);
  }
  
  // String error
  if (typeof error === 'string') {
    return createUnknownError(error);
  }
  
  // Unknown error type
  return createUnknownError('An unexpected error occurred', error);
}

/**
 * Type guard to check if an object is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    'message' in error &&
    'retryable' in error
  );
}

/**
 * Get a user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (isAppError(error)) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred';
}

/**
 * Check if an error is retryable
 */
export function isRetryable(error: unknown): boolean {
  if (isAppError(error)) {
    return error.retryable;
  }
  
  // Default to retryable for unknown errors
  return true;
}

/**
 * Log an error to the console with context
 */
export function logError(error: unknown, context?: string): void {
  const appError = toAppError(error);
  
  console.error(
    `[Error${context ? ` - ${context}` : ''}]`,
    appError.type,
    appError.message,
    appError.details
  );
}
