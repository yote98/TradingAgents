"use client";

import { useState } from "react";

export default function WelcomeMessage() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const examplePrompts = [
    {
      category: "📊 Stock Analysis",
      prompts: [
        "Analyze TSLA stock",
        "What's your take on NVDA?",
        "Give me a full analysis of AAPL with entry and exit points"
      ]
    },
    {
      category: "📈 Technical Analysis",
      prompts: [
        "Show me a technical chart for MSFT with RSI and MACD",
        "What are the key support and resistance levels for SPY?",
        "Is GOOGL overbought or oversold right now?"
      ]
    },
    {
      category: "💭 Market Sentiment",
      prompts: [
        "What's the Twitter sentiment on TSLA?",
        "Show me social media buzz around NVDA",
        "What are traders saying about the market today?"
      ]
    },
    {
      category: "⚖️ Risk Management",
      prompts: [
        "Calculate position size for AAPL with $10,000 account",
        "What's the risk-reward ratio for buying MSFT at current price?",
        "Help me set a stop-loss for my NVDA position"
      ]
    },
    {
      category: "🔄 Backtesting",
      prompts: [
        "Backtest a momentum strategy on SPY",
        "Test a mean reversion strategy on AAPL over the last year",
        "Show me historical performance of buying TSLA dips"
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Welcome to TradingAgents Beta 🚀
              </h2>
              <p className="text-blue-100">
                AI-powered multi-agent trading analysis system
              </p>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="text-white hover:text-gray-200 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Beta Notice */}
          <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="font-bold text-yellow-400 mb-1">Beta Testing Notice</h3>
                <p className="text-sm text-yellow-200">
                  This is a beta version. Data may be delayed by 15 minutes. Not financial advice. 
                  For testing and educational purposes only. Always do your own research.
                </p>
              </div>
            </div>
          </div>

          {/* What You Can Do */}
          <div>
            <h3 className="text-xl font-bold text-white mb-3">What You Can Do:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="text-2xl mb-2">🤖</div>
                <h4 className="font-semibold text-white mb-1">Multi-Agent Analysis</h4>
                <p className="text-sm text-gray-300">
                  4 AI analysts work together: Market, Fundamentals, News, and Social
                </p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="text-2xl mb-2">⚔️</div>
                <h4 className="font-semibold text-white mb-1">Bull vs Bear Debate</h4>
                <p className="text-sm text-gray-300">
                  Structured debates eliminate bias and provide balanced views
                </p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="text-2xl mb-2">📊</div>
                <h4 className="font-semibold text-white mb-1">Interactive Charts</h4>
                <p className="text-sm text-gray-300">
                  Visualize price action, indicators, and sentiment over time
                </p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="text-2xl mb-2">🎯</div>
                <h4 className="font-semibold text-white mb-1">Risk Management</h4>
                <p className="text-sm text-gray-300">
                  Calculate position sizes, stop-losses, and risk-reward ratios
                </p>
              </div>
            </div>
          </div>

          {/* Example Prompts */}
          <div>
            <h3 className="text-xl font-bold text-white mb-3">Try These Prompts:</h3>
            <div className="space-y-4">
              {examplePrompts.map((section, idx) => (
                <div key={idx} className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
                  <h4 className="font-semibold text-blue-400 mb-2">{section.category}</h4>
                  <div className="space-y-2">
                    {section.prompts.map((prompt, pIdx) => (
                      <button
                        key={pIdx}
                        onClick={() => {
                          setIsVisible(false);
                          // Copy to clipboard
                          navigator.clipboard.writeText(prompt);
                        }}
                        className="block w-full text-left px-3 py-2 bg-gray-700/50 hover:bg-gray-700 rounded text-sm text-gray-200 transition-colors"
                      >
                        "{prompt}"
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
            <h3 className="font-bold text-blue-400 mb-2">💡 Pro Tips:</h3>
            <ul className="text-sm text-blue-200 space-y-1">
              <li>• Be specific with ticker symbols (e.g., "AAPL" not "Apple")</li>
              <li>• Ask for charts and visualizations to see data better</li>
              <li>• Request specific timeframes for more relevant analysis</li>
              <li>• Use risk management features before entering trades</li>
              <li>• Compare multiple stocks to find the best opportunities</li>
            </ul>
          </div>

          {/* Footer */}
          <div className="text-center pt-4 border-t border-gray-700">
            <button
              onClick={() => setIsVisible(false)}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105"
            >
              Start Trading Analysis
            </button>
            <p className="text-xs text-gray-400 mt-3">
              Click any prompt above to copy it, or close this to start chatting
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
