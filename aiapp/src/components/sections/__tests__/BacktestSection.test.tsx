/**
 * BacktestSection Component Tests
 * 
 * Tests for the backtest configuration and execution interface
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import BacktestSection from '../BacktestSection';

// Mock the BacktestResults component
jest.mock('../../BacktestResults', () => {
  return function MockBacktestResults({ results }: any) {
    return <div data-testid="backtest-results">Results for {results.ticker}</div>;
  };
});

// Mock fetch
global.fetch = jest.fn();

describe('BacktestSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Form Rendering', () => {
    it('renders backtest configuration form', () => {
      render(<BacktestSection />);
      
      expect(screen.getByText('Run Backtest')).toBeInTheDocument();
      expect(screen.getByLabelText(/Stock Ticker/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Start Date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/End Date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Initial Balance/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Run Backtest/i })).toBeInTheDocument();
    });

    it('sets default date range to last 6 months', () => {
      render(<BacktestSection />);
      
      const startDateInput = screen.getByLabelText(/Start Date/i) as HTMLInputElement;
      const endDateInput = screen.getByLabelText(/End Date/i) as HTMLInputElement;
      
      expect(startDateInput.value).toBeTruthy();
      expect(endDateInput.value).toBeTruthy();
      
      // Verify end date is today
      const today = new Date().toISOString().split('T')[0];
      expect(endDateInput.value).toBe(today);
    });

    it('displays all configuration options', () => {
      render(<BacktestSection />);
      
      expect(screen.getByLabelText(/Risk Per Trade/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Commission Rate/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Slippage/i)).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('validates ticker format', async () => {
      render(<BacktestSection />);
      
      const tickerInput = screen.getByLabelText(/Stock Ticker/i);
      
      // Invalid ticker (lowercase)
      fireEvent.change(tickerInput, { target: { value: 'aapl' } });
      await waitFor(() => {
        expect(screen.getByText(/must be 1-5 uppercase letters/i)).toBeInTheDocument();
      });
      
      // Valid ticker
      fireEvent.change(tickerInput, { target: { value: 'AAPL' } });
      await waitFor(() => {
        expect(screen.queryByText(/must be 1-5 uppercase letters/i)).not.toBeInTheDocument();
      });
    });

    it('validates date range', async () => {
      render(<BacktestSection />);
      
      const startDateInput = screen.getByLabelText(/Start Date/i);
      const endDateInput = screen.getByLabelText(/End Date/i);
      const runButton = screen.getByRole('button', { name: /Run Backtest/i });
      
      // Set end date before start date
      fireEvent.change(startDateInput, { target: { value: '2023-06-01' } });
      fireEvent.change(endDateInput, { target: { value: '2023-01-01' } });
      
      fireEvent.click(runButton);
      
      await waitFor(() => {
        expect(screen.getByText(/End date must be after start date/i)).toBeInTheDocument();
      });
    });

    it('prevents future end dates', async () => {
      render(<BacktestSection />);
      
      const endDateInput = screen.getByLabelText(/End Date/i);
      const runButton = screen.getByRole('button', { name: /Run Backtest/i });
      
      // Set future date
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const futureDateStr = futureDate.toISOString().split('T')[0];
      
      fireEvent.change(endDateInput, { target: { value: futureDateStr } });
      fireEvent.click(runButton);
      
      await waitFor(() => {
        expect(screen.getByText(/cannot be in the future/i)).toBeInTheDocument();
      });
    });

    it('disables run button when form is invalid', () => {
      render(<BacktestSection />);
      
      const tickerInput = screen.getByLabelText(/Stock Ticker/i);
      const runButton = screen.getByRole('button', { name: /Run Backtest/i });
      
      // Clear ticker
      fireEvent.change(tickerInput, { target: { value: '' } });
      
      expect(runButton).toBeDisabled();
    });
  });

  describe('Backtest Execution', () => {
    it('calls API with correct parameters', async () => {
      const mockResponse = {
        success: true,
        results: {
          ticker: 'AAPL',
          period: { start: '2023-01-01', end: '2023-06-30' },
          totalReturn: 15.5,
          winRate: 65.0,
          sharpeRatio: 1.2,
          maxDrawdown: -8.5,
          trades: [],
          equityCurve: []
        }
      };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });
      
      render(<BacktestSection />);
      
      const tickerInput = screen.getByLabelText(/Stock Ticker/i);
      const startDateInput = screen.getByLabelText(/Start Date/i);
      const endDateInput = screen.getByLabelText(/End Date/i);
      const runButton = screen.getByRole('button', { name: /Run Backtest/i });
      
      fireEvent.change(tickerInput, { target: { value: 'AAPL' } });
      fireEvent.change(startDateInput, { target: { value: '2023-01-01' } });
      fireEvent.change(endDateInput, { target: { value: '2023-06-30' } });
      
      fireEvent.click(runButton);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/backtest',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: expect.stringContaining('AAPL')
          })
        );
      });
    });

    it('displays loading state during backtest', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );
      
      render(<BacktestSection />);
      
      const tickerInput = screen.getByLabelText(/Stock Ticker/i);
      const runButton = screen.getByRole('button', { name: /Run Backtest/i });
      
      fireEvent.change(tickerInput, { target: { value: 'AAPL' } });
      fireEvent.click(runButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Running Backtest/i)).toBeInTheDocument();
      });
    });

    it('displays results after successful backtest', async () => {
      const mockResponse = {
        success: true,
        results: {
          ticker: 'AAPL',
          period: { start: '2023-01-01', end: '2023-06-30' },
          totalReturn: 15.5,
          winRate: 65.0,
          sharpeRatio: 1.2,
          maxDrawdown: -8.5,
          trades: [],
          equityCurve: []
        }
      };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });
      
      render(<BacktestSection />);
      
      const tickerInput = screen.getByLabelText(/Stock Ticker/i);
      const runButton = screen.getByRole('button', { name: /Run Backtest/i });
      
      fireEvent.change(tickerInput, { target: { value: 'AAPL' } });
      fireEvent.click(runButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('backtest-results')).toBeInTheDocument();
        expect(screen.getByText(/Results for AAPL/i)).toBeInTheDocument();
      });
    });

    it('displays error message on API failure', async () => {
      const mockError = {
        success: false,
        error: 'Failed to fetch historical data'
      };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => mockError
      });
      
      render(<BacktestSection />);
      
      const tickerInput = screen.getByLabelText(/Stock Ticker/i);
      const runButton = screen.getByRole('button', { name: /Run Backtest/i });
      
      fireEvent.change(tickerInput, { target: { value: 'INVALID' } });
      fireEvent.click(runButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Failed to fetch historical data/i)).toBeInTheDocument();
      });
    });

    it('handles network errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
      
      render(<BacktestSection />);
      
      const tickerInput = screen.getByLabelText(/Stock Ticker/i);
      const runButton = screen.getByRole('button', { name: /Run Backtest/i });
      
      fireEvent.change(tickerInput, { target: { value: 'AAPL' } });
      fireEvent.click(runButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Network error/i)).toBeInTheDocument();
      });
    });
  });

  describe('Configuration Updates', () => {
    it('updates initial balance', () => {
      render(<BacktestSection />);
      
      const balanceInput = screen.getByLabelText(/Initial Balance/i) as HTMLInputElement;
      
      fireEvent.change(balanceInput, { target: { value: '50000' } });
      
      expect(balanceInput.value).toBe('50000');
    });

    it('updates risk per trade', () => {
      render(<BacktestSection />);
      
      const riskInput = screen.getByLabelText(/Risk Per Trade/i) as HTMLInputElement;
      
      fireEvent.change(riskInput, { target: { value: '5' } });
      
      expect(riskInput.value).toBe('5');
    });

    it('updates commission rate', () => {
      render(<BacktestSection />);
      
      const commissionInput = screen.getByLabelText(/Commission Rate/i) as HTMLInputElement;
      
      fireEvent.change(commissionInput, { target: { value: '0.2' } });
      
      expect(commissionInput.value).toBe('0.2');
    });
  });

  describe('Error Handling', () => {
    it('allows dismissing error messages', async () => {
      const mockError = {
        success: false,
        error: 'Test error message'
      };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => mockError
      });
      
      render(<BacktestSection />);
      
      const tickerInput = screen.getByLabelText(/Stock Ticker/i);
      const runButton = screen.getByRole('button', { name: /Run Backtest/i });
      
      fireEvent.change(tickerInput, { target: { value: 'AAPL' } });
      fireEvent.click(runButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Test error message/i)).toBeInTheDocument();
      });
      
      const dismissButton = screen.getByText(/Dismiss/i);
      fireEvent.click(dismissButton);
      
      await waitFor(() => {
        expect(screen.queryByText(/Test error message/i)).not.toBeInTheDocument();
      });
    });

    it('clears previous results when starting new backtest', async () => {
      const mockResponse1 = {
        success: true,
        results: {
          ticker: 'AAPL',
          period: { start: '2023-01-01', end: '2023-06-30' },
          totalReturn: 15.5,
          winRate: 65.0,
          sharpeRatio: 1.2,
          maxDrawdown: -8.5,
          trades: [],
          equityCurve: []
        }
      };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse1
      });
      
      render(<BacktestSection />);
      
      const tickerInput = screen.getByLabelText(/Stock Ticker/i);
      const runButton = screen.getByRole('button', { name: /Run Backtest/i });
      
      // First backtest
      fireEvent.change(tickerInput, { target: { value: 'AAPL' } });
      fireEvent.click(runButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('backtest-results')).toBeInTheDocument();
      });
      
      // Start second backtest
      (global.fetch as jest.Mock).mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );
      
      fireEvent.change(tickerInput, { target: { value: 'MSFT' } });
      fireEvent.click(runButton);
      
      // Results should be cleared during loading
      await waitFor(() => {
        expect(screen.queryByTestId('backtest-results')).not.toBeInTheDocument();
      });
    });
  });
});
