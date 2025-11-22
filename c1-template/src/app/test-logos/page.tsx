'use client';

import { TickerLogo } from '@/components/TickerLogo';

export default function TestLogosPage() {
  const stocks = [
    'AAPL', 'TSLA', 'MSFT', 'GOOGL', 'NVDA', 'META', 'AMZN',
    'JPM', 'V', 'WMT', 'MA', 'DIS', 'NFLX', 'PYPL', 'UBER'
  ];

  const cryptos = [
    'BTC-USD', 'ETH-USD', 'BNB-USD', 'SOL-USD', 'ADA-USD',
    'DOGE-USD', 'MATIC-USD', 'DOT-USD', 'AVAX-USD', 'LINK-USD'
  ];

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            🎨 Logo Integration Test
          </h1>
          <p className="text-gray-400">
            Testing Clearbit Logo API with automatic fallbacks
          </p>
        </div>

        {/* Size Examples */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-4">Size Options</h2>
          <div className="flex items-center gap-8">
            <div className="text-center">
              <TickerLogo ticker="AAPL" size="sm" />
              <p className="text-xs text-gray-400 mt-2">Small (24px)</p>
            </div>
            <div className="text-center">
              <TickerLogo ticker="AAPL" size="md" />
              <p className="text-xs text-gray-400 mt-2">Medium (32px)</p>
            </div>
            <div className="text-center">
              <TickerLogo ticker="AAPL" size="lg" />
              <p className="text-xs text-gray-400 mt-2">Large (48px)</p>
            </div>
            <div className="text-center">
              <TickerLogo ticker="AAPL" size="xl" />
              <p className="text-xs text-gray-400 mt-2">XLarge (64px)</p>
            </div>
          </div>
        </div>

        {/* Stock Logos */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-4">📈 Stock Logos</h2>
          <div className="grid grid-cols-5 gap-6">
            {stocks.map((ticker) => (
              <div key={ticker} className="text-center">
                <TickerLogo ticker={ticker} size="lg" />
                <p className="text-sm text-gray-300 mt-2 font-mono">{ticker}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Crypto Logos */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-4">🪙 Crypto Logos</h2>
          <div className="grid grid-cols-5 gap-6">
            {cryptos.map((ticker) => (
              <div key={ticker} className="text-center">
                <TickerLogo ticker={ticker} size="lg" />
                <p className="text-sm text-gray-300 mt-2 font-mono">
                  {ticker.replace('-USD', '')}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Fallback Test */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-4">🔄 Fallback Test</h2>
          <p className="text-gray-400 mb-4">
            These tickers don't exist - should show gradient fallback with initial
          </p>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <TickerLogo ticker="FAKE" size="lg" />
              <p className="text-sm text-gray-300 mt-2 font-mono">FAKE</p>
            </div>
            <div className="text-center">
              <TickerLogo ticker="TEST" size="lg" />
              <p className="text-sm text-gray-300 mt-2 font-mono">TEST</p>
            </div>
            <div className="text-center">
              <TickerLogo ticker="XXXX" size="lg" />
              <p className="text-sm text-gray-300 mt-2 font-mono">XXXX</p>
            </div>
          </div>
        </div>

        {/* Integration Examples */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-4">🎯 Integration Examples</h2>
          
          {/* Card Example */}
          <div className="bg-gray-900 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-3">
              <TickerLogo ticker="TSLA" size="lg" />
              <div>
                <h3 className="text-xl font-bold text-white">TSLA</h3>
                <p className="text-sm text-gray-400">Tesla, Inc.</p>
              </div>
              <div className="ml-auto text-right">
                <div className="text-2xl font-bold text-white">$242.84</div>
                <div className="text-sm text-green-400">+2.45%</div>
              </div>
            </div>
          </div>

          {/* Crypto Card Example */}
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <TickerLogo ticker="BTC-USD" size="lg" />
              <div>
                <h3 className="text-xl font-bold text-white">BTC-USD</h3>
                <p className="text-sm text-gray-400">Bitcoin</p>
              </div>
              <div className="ml-auto text-right">
                <div className="text-2xl font-bold text-white">$43,521.00</div>
                <div className="text-sm text-red-400">-1.23%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="text-center text-gray-400 text-sm">
          <p>✅ Using Clearbit Logo API (free, no auth)</p>
          <p>🔄 Automatic fallback to Google Favicons</p>
          <p>🎨 Gradient fallback for unknown tickers</p>
        </div>

      </div>
    </div>
  );
}
