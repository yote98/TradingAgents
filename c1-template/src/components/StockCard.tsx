'use client';

interface StockCardProps {
  ticker: string;
  price: number;
  change?: number;
  changePercent?: number;
  recommendation?: string;
  confidence?: number;
  target?: number;
  stopLoss?: number;
}

export function StockCard({
  ticker,
  price,
  change,
  changePercent,
  recommendation,
  confidence,
  target,
  stopLoss,
}: StockCardProps) {
  const isPositive = (change || 0) >= 0;

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 shadow-2xl max-w-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-white">{ticker}</h2>
          <p className="text-sm text-gray-400">Real-time from MarketData.app</p>
        </div>
        <div className="text-green-400">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      {/* Price */}
      <div className="mb-4">
        <div className="text-4xl font-bold text-white mb-1">
          ${price.toFixed(2)}
        </div>
        {change !== undefined && changePercent !== undefined && (
          <div className={`text-sm font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? '↑' : '↓'} ${Math.abs(change).toFixed(2)} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
          </div>
        )}
      </div>

      {/* Recommendation */}
      {recommendation && (
        <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Recommendation</span>
            <span className={`text-lg font-bold ${
              recommendation === 'BUY' ? 'text-green-400' :
              recommendation === 'SELL' ? 'text-red-400' :
              'text-yellow-400'
            }`}>
              {recommendation}
            </span>
          </div>
          {confidence && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                <span>Confidence</span>
                <span>{confidence}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${confidence}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Targets */}
      {(target || stopLoss) && (
        <div className="grid grid-cols-2 gap-3">
          {target && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="text-xs text-gray-400 mb-1">Target</div>
              <div className="text-lg font-bold text-green-400">${target.toFixed(2)}</div>
              <div className="text-xs text-gray-500">
                +{(((target - price) / price) * 100).toFixed(1)}%
              </div>
            </div>
          )}
          {stopLoss && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="text-xs text-gray-400 mb-1">Stop Loss</div>
              <div className="text-lg font-bold text-red-400">${stopLoss.toFixed(2)}</div>
              <div className="text-xs text-gray-500">
                {(((stopLoss - price) / price) * 100).toFixed(1)}%
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
