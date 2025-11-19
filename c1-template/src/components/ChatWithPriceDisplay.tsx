'use client';

import { useState, useEffect } from 'react';
import { StockPriceDisplay } from './StockPriceDisplay';

interface ChatWithPriceDisplayProps {
  children: React.ReactNode;
}

export function ChatWithPriceDisplay({ children }: ChatWithPriceDisplayProps) {
  const [detectedTicker, setDetectedTicker] = useState<string | null>(null);

  useEffect(() => {
    // Listen for messages in the chat to detect stock tickers
    const observer = new MutationObserver(() => {
      // Cast to any to avoid TypeScript issues
      const allElements = document.querySelectorAll('*') as any;
      let allText = '';
      
      // Get all text content from the page
      allElements.forEach((el: any) => {
        if (el.textContent) {
          allText += el.textContent + ' ';
        }
      });
      
      // Common stock tickers pattern - check for ticker symbols or company names
      const tickerMatch = allText.match(/\b(AAPL|Apple|TSLA|Tesla|MSFT|Microsoft|GOOGL|Google|AMZN|Amazon|NVDA|Nvidia|META|SPY|QQQ|BTC-USD|Bitcoin)\b/i);
      
      if (tickerMatch) {
        const matched = tickerMatch[1].toUpperCase();
        
        // Map company names to tickers
        const nameToTicker: Record<string, string> = {
          'APPLE': 'AAPL',
          'TESLA': 'TSLA',
          'MICROSOFT': 'MSFT',
          'GOOGLE': 'GOOGL',
          'AMAZON': 'AMZN',
          'NVIDIA': 'NVDA',
          'BITCOIN': 'BTC-USD',
        };
        
        const ticker = nameToTicker[matched] || matched;
        setDetectedTicker(ticker);
      }
    });

    // Observe the entire document body
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative w-full h-full">
      {/* Price Display Overlay - Top Center */}
      {detectedTicker && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-30 w-96">
          <StockPriceDisplay ticker={detectedTicker} />
        </div>
      )}
      
      {children}
    </div>
  );
}
