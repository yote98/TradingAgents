"use client";

import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="landing-page">
      {/* Floating Particles Network */}
      <div className="particles-container">
        <div className="particle" style={{ top: '10%', left: '15%' }}></div>
        <div className="particle" style={{ top: '25%', left: '75%' }}></div>
        <div className="particle" style={{ top: '45%', left: '30%' }}></div>
        <div className="particle" style={{ top: '60%', left: '80%' }}></div>
        <div className="particle" style={{ top: '75%', left: '20%' }}></div>
        <div className="particle" style={{ top: '35%', left: '60%' }}></div>
        <div className="particle" style={{ top: '85%', left: '50%' }}></div>
        <div className="particle" style={{ top: '20%', left: '40%' }}></div>
        <div className="particle" style={{ top: '50%', left: '10%' }}></div>
        <div className="particle" style={{ top: '70%', left: '65%' }}></div>
      </div>

      {/* Animated Orbs Background */}
      <div className="orbs-container">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      {/* Header */}
      <header className="p-6 flex justify-end items-center">
        <Link
          href="/chat"
          className="px-8 py-4 bg-gradient-to-r from-lime-400 via-green-400 to-cyan-400 hover:from-lime-500 hover:via-green-500 hover:to-cyan-500 text-black font-bold rounded-lg transition-all shadow-lg hover:shadow-cyan-500/50"
        >
          Launch AI
        </Link>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            AI-Powered Market Intelligence
            <br />
            for Smarter Decisions
          </h1>
          <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
            Multi-agent AI framework for comprehensive market analysis, risk management, and intelligent trading decisions
          </p>
          <Link
            href="/chat"
            className="inline-block px-8 py-4 bg-gradient-to-r from-lime-400 via-green-400 to-cyan-400 hover:from-lime-500 hover:via-green-500 hover:to-cyan-500 text-gray-900 text-lg font-bold rounded-lg transition-all shadow-2xl hover:shadow-cyan-500/50 hover:scale-105"
          >
            Launch AI Assistant
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-20">
          {/* Market Analysis */}
          <div className="feature-card bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center border border-white/10">
            <div className="text-6xl mb-6">📈</div>
            <h3 className="text-xl font-bold text-white mb-4">Market Analysis</h3>
            <p className="text-gray-200 text-sm">
              Real-time technical indicators, price trends, and volume analysis powered by advanced AI
            </p>
          </div>

          {/* Multi-Agent System */}
          <div className="feature-card bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center border border-white/10">
            <div className="text-6xl mb-6">🤖</div>
            <h3 className="text-xl font-bold text-white mb-4">Multi-Agent System</h3>
            <p className="text-gray-200 text-sm">
              Specialized AI analysts for market, fundamental, news, and social sentiment analysis
            </p>
          </div>

          {/* Risk Management */}
          <div className="feature-card bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center border border-white/10">
            <div className="text-6xl mb-6">🛡️</div>
            <h3 className="text-xl font-bold text-white mb-4">Risk Management</h3>
            <p className="text-gray-200 text-sm">
              Advanced position sizing, stop-loss calculation, and portfolio risk assessment
            </p>
          </div>

          {/* Backtesting */}
          <div className="feature-card bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center border border-white/10">
            <div className="text-6xl mb-6">⏱️</div>
            <h3 className="text-xl font-bold text-white mb-4">Backtesting</h3>
            <p className="text-gray-200 text-sm">
              Test strategies on historical data with comprehensive performance metrics
            </p>
          </div>
        </div>

        {/* Newsletter Subscription Section */}
        <div className="mt-32 max-w-2xl mx-auto">
          <div className="newsletter-box bg-white/5 backdrop-blur-md rounded-2xl p-8 md:p-12 border border-white/10">
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
              Unlock AI-Powered Trading Intelligence
            </h2>
            <p className="text-gray-300 text-center mb-8">
              Join elite traders getting weekly multi-agent analysis, market insights, and institutional-grade research delivered to your inbox.
            </p>
            
            <form className="flex flex-col sm:flex-row gap-4 mb-6">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-6 py-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-400 transition-colors"
              />
              <button
                type="submit"
                className="px-8 py-4 bg-gradient-to-r from-lime-400 via-green-400 to-cyan-400 hover:from-lime-500 hover:via-green-500 hover:to-cyan-500 text-black font-bold rounded-lg transition-all shadow-lg hover:shadow-cyan-500/50"
              >
                Join Elite Traders
              </button>
            </form>

            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Weekly market insights</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>AI trading strategies</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>No spam, unsubscribe anytime</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-20 text-center text-gray-400 text-sm pb-8">
          <p>TradingAgents - Multi-Agent AI Research Framework</p>
          <p className="mt-2">For research and educational purposes only</p>
        </footer>
      </main>
    </div>
  );
}
