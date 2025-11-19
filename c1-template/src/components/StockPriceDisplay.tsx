'use client';

import { useEffect, useState } from 'react';

interface StockPriceDisplayProps {
  ticker: string;
  apiUrl?: string;
}

interface PriceData {
  price: number;
  symbol: string;
  source: string;
  updated_datetime?: string;
}

export function StockPriceDisplay({ ticker, apiUrl = 'http://localhost:5000' }: StockPriceDisplayProps) {
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchPrice() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${apiUrl}/quote/${ticker}`);
        if (!response.ok) throw new Error('Failed to fetch price');
        
        const data = await response.json();
        
        if (mounted) {
          setPriceData(data);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Unknown error');
          setLoading(false);
        }
      }
    }

    fetchPrice();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchPrice, 30000);
    
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [ticker, apiUrl]);

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-4 mb-4 animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-24 mb-2"></div>
        <div className="h-8 bg-gray-700 rounded w-32"></div>
      </div>
    );
  }

  if (error || !priceData) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
        <div className="text-sm text-red-400">
          {error || 'Unable to fetch real-time price'}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-400 mb-1">Real-Time Price</div>
          <div className="text-3xl font-bold text-white">
            ${priceData.price?.toFixed(2) || 'N/A'}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {priceData.source || 'MarketData.app'}
            {priceData.updated_datetime && (
              <span className="ml-2">
                • Updated: {new Date(priceData.updated_datetime).toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
        <div className="text-green-400">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
