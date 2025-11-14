/**
 * Error Handling Tests
 * 
 * Tests for LoadingSpinner, ErrorMessage, and error boundary integration
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LoadingSpinner, { 
  SkeletonLoader, 
  CardSkeleton, 
  InlineSpinner, 
  LoadingOverlay 
} from '../LoadingSpinner';
import ErrorMessage, { ErrorText } from '../ErrorMessage';
import { ErrorBoundary } from '../ErrorBoundary';
import { 
  createNetworkError, 
  createAPIError, 
  createValidationError, 
  createTimeoutError,
  ErrorType 
} from '@/lib/errors';

describe('LoadingSpinner', () => {
  describe('Component Rendering', () => {
    it('should render spinner variant by default', () => {
      render(<LoadingSpinner />);
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should render with custom text', () => {
      render(<LoadingSpinner text="Loading data..." />);
      expect(screen.getByText('Loading data...')).toBeInTheDocument();
    });

    it('should render dots variant', () => {
      const { container } = render(<LoadingSpinner variant="dots" />);
      const dots = container.querySelectorAll('.animate-bounce');
      expect(dots.length).toBe(3);
    });

    it('should render pulse variant', () => {
      const { container } = render(<LoadingSpinner variant="pulse" />);
      const pulse = container.querySelector('.animate-pulse');
      expect(pulse).toBeInTheDocument();
    });

    it('should render skeleton variant', () => {
      render(<LoadingSpinner variant="skeleton" />);
      const skeleton = document.querySelector('.animate-pulse');
      expect(skeleton).toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    it('should render small size', () => {
      const { container } = render(<LoadingSpinner size="sm" />);
      const spinner = container.querySelector('.w-4');
      expect(spinner).toBeInTheDocument();
    });

    it('should render medium size', () => {
      const { container } = render(<LoadingSpinner size="md" />);
      const spinner = container.querySelector('.w-8');
      expect(spinner).toBeInTheDocument();
    });

    it('should render large size', () => {
      const { container } = render(<LoadingSpinner size="lg" />);
      const spinner = container.querySelector('.w-12');
      expect(spinner).toBeInTheDocument();
    });

    it('should render extra large size', () => {
      const { container } = render(<LoadingSpinner size="xl" />);
      const spinner = container.querySelector('.w-16');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Centered Layout', () => {
    it('should center spinner when centered prop is true', () => {
      const { container } = render(<LoadingSpinner centered />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('justify-center');
    });

    it('should not center spinner by default', () => {
      const { container } = render(<LoadingSpinner />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('items-start');
    });
  });

  describe('Skeleton Components', () => {
    it('should render SkeletonLoader with default lines', () => {
      const { container } = render(<SkeletonLoader />);
      const lines = container.querySelectorAll('.h-4');
      expect(lines.length).toBe(3);
    });

    it('should render SkeletonLoader with custom lines', () => {
      const { container } = render(<SkeletonLoader lines={5} />);
      const lines = container.querySelectorAll('.h-4');
      expect(lines.length).toBe(5);
    });

    it('should render CardSkeleton', () => {
      const { container } = render(<CardSkeleton />);
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    });
  });

  describe('Utility Components', () => {
    it('should render InlineSpinner', () => {
      const { container } = render(<InlineSpinner />);
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should render LoadingOverlay', () => {
      render(<LoadingOverlay text="Processing..." />);
      expect(screen.getByText('Processing...')).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });
});

describe('ErrorMessage', () => {
  describe('Error Display', () => {
    it('should display error message from string', () => {
      render(<ErrorMessage error="Something went wrong" />);
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('should display error message from Error object', () => {
      const error = new Error('Test error');
      render(<ErrorMessage error={error} />);
      expect(screen.getByText('Test error')).toBeInTheDocument();
    });

    it('should display error message from AppError', () => {
      const error = createNetworkError('Network connection failed');
      render(<ErrorMessage error={error} />);
      expect(screen.getByText('Network connection failed')).toBeInTheDocument();
    });

    it('should not render when error is null', () => {
      const { container } = render(<ErrorMessage error={null} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Error Types', () => {
    it('should display network error with correct icon', () => {
      const error = createNetworkError('Connection failed');
      render(<ErrorMessage error={error} />);
      expect(screen.getByText('Connection Error')).toBeInTheDocument();
    });

    it('should display API error with correct title', () => {
      const error = createAPIError('Server error');
      render(<ErrorMessage error={error} />);
      expect(screen.getByText('Server Error')).toBeInTheDocument();
    });

    it('should display validation error', () => {
      const error = createValidationError('Invalid input');
      render(<ErrorMessage error={error} />);
      expect(screen.getByText('Validation Error')).toBeInTheDocument();
    });

    it('should display timeout error', () => {
      const error = createTimeoutError('Request timed out');
      render(<ErrorMessage error={error} />);
      expect(screen.getByText('Request Timeout')).toBeInTheDocument();
    });
  });

  describe('Retry Functionality', () => {
    it('should show retry button for retryable errors', () => {
      const error = createNetworkError('Connection failed');
      const onRetry = jest.fn();
      render(<ErrorMessage error={error} onRetry={onRetry} />);
      
      const retryButton = screen.getByText('Try Again');
      expect(retryButton).toBeInTheDocument();
    });

    it('should call onRetry when retry button is clicked', () => {
      const error = createNetworkError('Connection failed');
      const onRetry = jest.fn();
      render(<ErrorMessage error={error} onRetry={onRetry} />);
      
      const retryButton = screen.getByText('Try Again');
      fireEvent.click(retryButton);
      
      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('should not show retry button for non-retryable errors', () => {
      const error = createValidationError('Invalid input');
      const onRetry = jest.fn();
      render(<ErrorMessage error={error} onRetry={onRetry} />);
      
      expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
    });

    it('should not show retry button when showRetry is false', () => {
      const error = createNetworkError('Connection failed');
      const onRetry = jest.fn();
      render(<ErrorMessage error={error} onRetry={onRetry} showRetry={false} />);
      
      expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('should render default variant', () => {
      const error = createAPIError('Server error');
      render(<ErrorMessage error={error} variant="default" />);
      expect(screen.getByText('Server Error')).toBeInTheDocument();
    });

    it('should render compact variant', () => {
      const error = createAPIError('Server error');
      render(<ErrorMessage error={error} variant="compact" />);
      expect(screen.getByText('Server error')).toBeInTheDocument();
    });

    it('should render banner variant', () => {
      const error = createAPIError('Server error');
      const { container } = render(<ErrorMessage error={error} variant="banner" />);
      expect(container.querySelector('.bg-red-600')).toBeInTheDocument();
    });

    it('should render inline variant', () => {
      const error = createAPIError('Server error');
      render(<ErrorMessage error={error} variant="inline" />);
      expect(screen.getByText('Server error')).toBeInTheDocument();
    });
  });

  describe('Custom Title', () => {
    it('should display custom title when provided', () => {
      const error = createAPIError('Server error');
      render(<ErrorMessage error={error} title="Custom Error Title" />);
      expect(screen.getByText('Custom Error Title')).toBeInTheDocument();
    });
  });

  describe('Error Details', () => {
    it('should show details when showDetails is true', () => {
      const error = createAPIError('Server error', { statusCode: 500 });
      render(<ErrorMessage error={error} showDetails={true} />);
      expect(screen.getByText('Show technical details')).toBeInTheDocument();
    });

    it('should not show details by default', () => {
      const error = createAPIError('Server error', { statusCode: 500 });
      render(<ErrorMessage error={error} />);
      expect(screen.queryByText('Show technical details')).not.toBeInTheDocument();
    });
  });

  describe('ErrorText Component', () => {
    it('should render error text', () => {
      render(<ErrorText>Error message</ErrorText>);
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });
  });
});

describe('Error Boundary Integration', () => {
  // Suppress console.error for these tests
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  afterAll(() => {
    console.error = originalError;
  });

  const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
    if (shouldThrow) {
      throw new Error('Test error');
    }
    return <div>No error</div>;
  };

  describe('Error Boundary with Custom Fallback', () => {
    it('should render custom error fallback', () => {
      const customFallback = (
        <ErrorMessage
          error="Custom error message"
          variant="compact"
        />
      );

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Custom error message')).toBeInTheDocument();
    });

    it('should render default fallback when no custom fallback provided', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });

  describe('Error Boundary Retry', () => {
    it('should reset error state when retry is clicked', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      const retryButton = screen.getByText('Try Again');
      fireEvent.click(retryButton);

      // After retry, error boundary resets but component still throws
      // In real scenario, the error condition would be resolved
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByText('No error')).toBeInTheDocument();
    });
  });

  describe('Error Boundary Callback', () => {
    it('should call onError callback when error occurs', () => {
      const onError = jest.fn();

      render(
        <ErrorBoundary onError={onError}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(onError).toHaveBeenCalled();
    });
  });
});

describe('Loading and Error State Integration', () => {
  it('should transition from loading to error state', () => {
    const { rerender } = render(<LoadingSpinner text="Loading..." />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    rerender(<ErrorMessage error="Failed to load" />);
    expect(screen.getByText('Failed to load')).toBeInTheDocument();
  });

  it('should transition from loading to success state', () => {
    const { rerender } = render(<LoadingSpinner text="Loading..." />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    rerender(<div>Success content</div>);
    expect(screen.getByText('Success content')).toBeInTheDocument();
  });

  it('should show loading overlay during async operation', () => {
    render(<LoadingOverlay text="Processing request..." />);
    expect(screen.getByText('Processing request...')).toBeInTheDocument();
    
    const overlay = document.querySelector('.fixed.inset-0');
    expect(overlay).toBeInTheDocument();
  });
});
