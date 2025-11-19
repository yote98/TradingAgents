'use client';

import { useState } from 'react';
import { StockPriceDisplay } from './StockPriceDisplay';

export function ManualPriceDisplay() {
  const [ticker, setTicker] = useState('');
  const [showPrice, setShowPrice] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticker.trim()) {
      setShowPrice(true);
    }
  };

  const handleClear = () => {
    setTicker('');
    setShowPrice(false);
  };

  return (
    <div className="fixed top-20 right-4 z-30 w-96">
      <form onSubmit={handleSubmit} className="mb-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            placeholder="Enter ticker (e.g., TSLA)"
            className="flex-1 px-4 py-2 bg-gray-800/80 backdrop-blur-sm border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-semibold transition-colors"
          >
            Show Price
          </button>
          {showPrice && (
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white font-semibold transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </form>
      
      {showPrice && ticker && (
        <StockPriceDisplay ticker={ticker} />
      )}
    </div>
  );
}
