'use client';

import { useState } from 'react';

interface Stock {
  ticker: string;
  shares: number;
  avgPrice: number;
}

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<Stock[]>([
    { ticker: 'AAPL', shares: 10, avgPrice: 180 },
    { ticker: 'MSFT', shares: 5, avgPrice: 380 },
  ]);

  const [newTicker, setNewTicker] = useState('');
  const [newShares, setNewShares] = useState('');
  const [newPrice, setNewPrice] = useState('');

  const addStock = () => {
    if (newTicker && newShares && newPrice) {
      setPortfolio([
        ...portfolio,
        {
          ticker: newTicker.toUpperCase(),
          shares: parseFloat(newShares),
          avgPrice: parseFloat(newPrice),
        },
      ]);
      setNewTicker('');
      setNewShares('');
      setNewPrice('');
    }
  };

  const totalValue = portfolio.reduce(
    (sum, stock) => sum + stock.shares * stock.avgPrice,
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">
          📊 Portfolio Tracker
        </h1>

        {/* Portfolio Summary */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 mb-8 border border-slate-700">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Total Value: ${totalValue.toLocaleString()}
          </h2>
          <div className="grid grid-cols-3 gap-4 text-slate-300">
            <div>
              <p className="text-sm text-slate-400">Positions</p>
              <p className="text-xl font-bold">{portfolio.length}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Avg Position Size</p>
              <p className="text-xl font-bold">
                ${(totalValue / portfolio.length).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Risk Score</p>
              <p className="text-xl font-bold text-yellow-400">Medium</p>
            </div>
          </div>
        </div>

        {/* Add Stock Form */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 mb-8 border border-slate-700">
          <h3 className="text-xl font-semibold text-white mb-4">Add Position</h3>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Ticker (e.g., AAPL)"
              value={newTicker}
              onChange={(e) => setNewTicker(e.target.value)}
              className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
            />
            <input
              type="number"
              placeholder="Shares"
              value={newShares}
              onChange={(e) => setNewShares(e.target.value)}
              className="w-32 px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
            />
            <input
              type="number"
              placeholder="Avg Price"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              className="w-32 px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
            />
            <button
              onClick={addStock}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        {/* Portfolio Table */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-slate-700">
          <table className="w-full">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                  Ticker
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">
                  Shares
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">
                  Avg Price
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">
                  Total Value
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">
                  % of Portfolio
                </th>
              </tr>
            </thead>
            <tbody>
              {portfolio.map((stock, index) => {
                const stockValue = stock.shares * stock.avgPrice;
                const percentage = (stockValue / totalValue) * 100;

                return (
                  <tr
                    key={index}
                    className="border-t border-slate-700 hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-6 py-4 text-white font-semibold">
                      {stock.ticker}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-300">
                      {stock.shares}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-300">
                      ${stock.avgPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right text-white font-semibold">
                      ${stockValue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-300">
                      {percentage.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex gap-4">
          <button className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors">
            🔍 Analyze All Positions
          </button>
          <button className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors">
            ⚖️ Get Rebalancing Suggestions
          </button>
          <button className="flex-1 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition-colors">
            📊 Export Report
          </button>
        </div>
      </div>
    </div>
  );
}
