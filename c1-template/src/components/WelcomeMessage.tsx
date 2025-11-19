"use client";

import { useState } from "react";

interface WelcomeMessageProps {
  onPromptSelect?: (prompt: string) => void;
}

export default function WelcomeMessage({ onPromptSelect }: WelcomeMessageProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);

  if (!isVisible) return null;

  // Add CSS animation for grid
  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes grid-move {
        0% { transform: translateY(0); }
        100% { transform: translateY(50px); }
      }
    `;
    if (!document.head.querySelector('style[data-grid-animation]')) {
      style.setAttribute('data-grid-animation', 'true');
      document.head.appendChild(style);
    }
  }
  
  const handlePromptClick = (prompt: string) => {
    // Copy to clipboard
    navigator.clipboard.writeText(prompt);
    
    // Show copied notification
    setCopiedPrompt(prompt);
    setTimeout(() => setCopiedPrompt(null), 2000);
    
    // Close modal after a brief delay so user sees the notification
    setTimeout(() => setIsVisible(false), 1500);
    
    // Call the callback if provided
    if (onPromptSelect) {
      onPromptSelect(prompt);
    }
  };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(34, 197, 94, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 197, 94, 0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          animation: 'grid-move 20s linear infinite'
        }}></div>
      </div>

      {/* Copied notification toast */}
      {copiedPrompt && (
        <div className="fixed top-4 right-4 z-[60] bg-gradient-to-r from-green-600 to-cyan-600 text-white px-6 py-3 rounded-lg shadow-lg shadow-green-500/50 animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="text-xl">✅</span>
            <div>
              <div className="font-semibold">Copied to clipboard!</div>
              <div className="text-sm opacity-90">Paste it in the chat below</div>
            </div>
          </div>
        </div>
      )}
      
      <div className="relative bg-black/90 backdrop-blur-xl rounded-2xl shadow-2xl shadow-green-500/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-green-500/30">
        {/* Glowing border effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/20 via-cyan-500/20 to-green-500/20 blur-xl -z-10"></div>
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-600/90 via-cyan-600/90 to-green-600/90 backdrop-blur-md p-6 rounded-t-2xl border-b border-green-500/30">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <span className="text-4xl">🤖</span>
                Welcome to AlphaFlow AI
              </h2>
              <p className="text-green-100 text-lg">
                AI-powered multi-agent trading analysis system
              </p>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="text-white hover:text-green-200 text-3xl font-bold transition-colors hover:rotate-90 transform duration-300"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 bg-gradient-to-b from-black/50 to-slate-900/50">
          {/* Beta Notice */}
          <div className="bg-yellow-900/20 border border-yellow-600/40 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="font-bold text-yellow-400 mb-1">Beta Testing Notice</h3>
                <p className="text-sm text-yellow-100/90">
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
              <div className="bg-slate-800/60 rounded-lg p-4 border border-slate-700/50 hover:border-green-500/30 transition-colors">
                <div className="text-2xl mb-2">🤖</div>
                <h4 className="font-semibold text-white mb-1">Multi-Agent Analysis</h4>
                <p className="text-sm text-gray-300">
                  5 AI analysts work together: Market, Fundamentals, News, Social, and Options
                </p>
              </div>
              <div className="bg-slate-800/60 rounded-lg p-4 border border-slate-700/50 hover:border-green-500/30 transition-colors">
                <div className="text-2xl mb-2">⚔️</div>
                <h4 className="font-semibold text-white mb-1">Bull vs Bear Debate</h4>
                <p className="text-sm text-gray-300">
                  Structured debates eliminate bias and provide balanced views
                </p>
              </div>
              <div className="bg-slate-800/60 rounded-lg p-4 border border-slate-700/50 hover:border-green-500/30 transition-colors">
                <div className="text-2xl mb-2">📊</div>
                <h4 className="font-semibold text-white mb-1">Interactive Charts</h4>
                <p className="text-sm text-gray-300">
                  Visualize price action, indicators, and sentiment over time
                </p>
              </div>
              <div className="bg-slate-800/60 rounded-lg p-4 border border-slate-700/50 hover:border-green-500/30 transition-colors">
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
                <div key={idx} className="bg-slate-800/40 rounded-lg p-4 border border-slate-700/50">
                  <h4 className="font-semibold text-green-400 mb-2">{section.category}</h4>
                  <div className="space-y-2">
                    {section.prompts.map((prompt, pIdx) => (
                      <button
                        key={pIdx}
                        onClick={() => handlePromptClick(prompt)}
                        className="block w-full text-left px-3 py-2 bg-slate-700/50 hover:bg-slate-700 hover:border-green-500/30 border border-transparent rounded text-sm text-gray-200 transition-all hover:scale-[1.02] transform"
                        title="Click to use this prompt"
                      >
                        <span className="flex items-center justify-between">
                          <span>"{prompt}"</span>
                          <span className="text-xs text-green-400 ml-2">📋 Click to copy</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4">
            <h3 className="font-bold text-green-400 mb-2">💡 Pro Tips:</h3>
            <ul className="text-sm text-green-100/90 space-y-1">
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
              className="px-8 py-3 bg-gradient-to-r from-lime-400 via-green-400 to-cyan-400 hover:from-lime-500 hover:via-green-500 hover:to-cyan-500 text-gray-900 font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-green-500/50"
            >
              Start Trading Analysis
            </button>
            <p className="text-xs text-gray-400 mt-3">
              💡 Click any prompt above to copy it to your clipboard, then paste in the chat
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
