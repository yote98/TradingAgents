"use client";

import { useState, useEffect } from 'react';
import SectorPerformanceChart from './charts/SectorPerformanceChart';

interface TopMover {
  ticker: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  changePercent: number;
}

interface MarketPulseProps {
  topMovers?: TopMover[];
  sectorData?: Array<{ sector: string; return: number }>;
  macroHighlights?: string[];
}

export default function MarketPulse({ 
  topMovers = [],
  sectorData = [],
  macroHighlights = []
}: MarketPulseProps) {
  const [topGainer, setTopGainer] = useState<TopMover | null>(null);
  const [topLoser, setTopLoser] = useState<TopMover | null>(null);
  const [outperformer, setOutperformer] = useState<TopMover | null>(null);

  useEffect(() => {
    if (topMovers.length > 0) {
      const sorted = [...topMovers].sort((a, b) => b.changePercent - a.changePercent);
      setTopGainer(sorted[0]);
      setTopLoser(sorted[sorted.length - 1]);
      setOutperformer(sorted[1] || sorted[0]);
    }
  }, [topMovers]);

  return (
    <div className="w-full bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-600/20 to-yellow-500/10 border-b border-yellow-600/30 px-6 py-3">
        <p className="text-yellow-500 text-sm font-medium">
          Market briefing: top movers, sector trends, and macro highlights.
        </p>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-100 mb-2">
          Market Pulse: Top Movers, Sector Trends, Macro Highlights
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          Snapshot for today — indicative only. This is not financial advice.
        </p>

        {/* Highlights */}
        {macroHighlights.length > 0 && (
          <ul className="space-y-2 mb-6">
            {macroHighlights.map((highlight, index) => (
              <li key={index} className="text-gray-300 text-sm flex items-start">
                <span className="text-gray-500 mr-2">•</span>
                {highlight}
              </li>
            ))}
          </ul>
        )}

        {/* Top Movers Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Top Gainer */}
          {topGainer && (
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-gray-400 text-xs">📈 Top gainer</span>
              </div>
              <div className="text-2xl font-bold text-green-500 mb-1">
                +{topGainer.changePercent.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-300">{topGainer.name}</div>
              <div className="text-xs text-gray-500">
                {topGainer.ticker} • {topGainer.sector}
              </div>
            </div>
          )}

          {/* Top Loser */}
          {topLoser && (
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-gray-400 text-xs">📉 Pullback</span>
              </div>
              <div className="text-2xl font-bold text-red-500 mb-1">
                {topLoser.changePercent.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-300">{topLoser.name}</div>
              <div className="text-xs text-gray-500">
                {topLoser.ticker} • {topLoser.sector}
              </div>
            </div>
          )}

          {/* Outperformer */}
          {outperformer && (
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-gray-400 text-xs">⭐ Outperform</span>
              </div>
              <div className="text-2xl font-bold text-green-500 mb-1">
                +{outperformer.changePercent.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-300">{outperformer.name}</div>
              <div className="text-xs text-gray-500">
                {outperformer.ticker} • {outperformer.sector}
              </div>
            </div>
          )}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sector Heat */}
          <div>
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Sector Heat</h3>
            {sectorData.length > 0 ? (
              <SectorPerformanceChart data={sectorData} />
            ) : (
              <div className="bg-gray-800/30 rounded-lg p-8 text-center text-gray-500">
                No sector data available
              </div>
            )}
          </div>

          {/* Top Movers Table */}
          <div>
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Top Movers</h3>
            {topMovers.length > 0 ? (
              <div className="bg-gray-800/30 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-800/50">
                    <tr className="text-left text-xs text-gray-400">
                      <th className="px-4 py-3">Ticker</th>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Sector</th>
                      <th className="px-4 py-3 text-right">Price</th>
                      <th className="px-4 py-3 text-right">Change</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {topMovers.slice(0, 10).map((mover, index) => (
                      <tr key={index} className="border-t border-gray-700/50 hover:bg-gray-800/30">
                        <td className="px-4 py-3 font-mono font-semibold text-gray-200">
                          {mover.ticker}
                        </td>
                        <td className="px-4 py-3 text-gray-300">{mover.name}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{mover.sector}</td>
                        <td className="px-4 py-3 text-right text-gray-300">
                          ${mover.price.toFixed(2)}
                        </td>
                        <td className={`px-4 py-3 text-right font-semibold ${
                          mover.changePercent >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {mover.changePercent >= 0 ? '+' : ''}{mover.changePercent.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-gray-800/30 rounded-lg p-8 text-center text-gray-500">
                No market data available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
