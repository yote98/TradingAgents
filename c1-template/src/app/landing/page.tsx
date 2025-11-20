"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const [typedText, setTypedText] = useState("");
  const [analysisCount, setAnalysisCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  
  const fullText = "AI-Powered Market Intelligence";
  
  // Typing animation
  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index <= fullText.length) {
        setTypedText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 50);
    return () => clearInterval(timer);
  }, []);
  
  // Stats counter animation
  useEffect(() => {
    const analysisTimer = setInterval(() => {
      setAnalysisCount(prev => {
        if (prev < 10000) return prev + 100;
        return 10000;
      });
    }, 20);
    
    const userTimer = setInterval(() => {
      setUserCount(prev => {
        if (prev < 500) return prev + 5;
        return 500;
      });
    }, 30);
    
    return () => {
      clearInterval(analysisTimer);
      clearInterval(userTimer);
    };
  }, []);

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
      <header className="p-6 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-white">
          AlphaFlow AI
        </Link>
        <div className="flex gap-6 items-center">
          <Link
            href="/pricing"
            className="text-white hover:text-green-400 transition-colors font-semibold"
          >
            Pricing
          </Link>
          <Link
            href="/chat"
            className="px-8 py-4 bg-gradient-to-r from-lime-400 via-green-400 to-cyan-400 hover:from-lime-500 hover:via-green-500 hover:to-cyan-500 text-black font-bold rounded-lg transition-all shadow-lg hover:shadow-cyan-500/50"
          >
            Launch AI
          </Link>
        </div>
      </header>
      {/* Hero Section */}
      <main className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          {/* Launch Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-400/10 border border-green-400/30 rounded-full mb-6 animate-pulse">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
            </span>
            <span className="text-green-400 text-sm font-semibold">Now Live - Early Access Pricing</span>
          </div>

          {/* Animated Headline */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 min-h-[180px]">
            <span className="bg-gradient-to-r from-lime-400 via-green-400 to-cyan-400 bg-clip-text text-transparent">
              {typedText}
            </span>
            {typedText.length < fullText.length && <span className="animate-pulse">|</span>}
            <br />
            <span className="text-4xl md:text-5xl">for Smarter Decisions</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            5 AI analysts working in parallel to deliver{" "}
            <span className="text-green-400 font-semibold">institutional-grade analysis</span>
            {" "}in seconds
          </p>

          {/* Stats Bar */}
          <div className="flex justify-center gap-8 mb-10">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{analysisCount.toLocaleString()}+</div>
              <div className="text-sm text-gray-400">Analyses Completed</div>
            </div>
            <div className="h-12 w-px bg-gray-700"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{userCount}+</div>
              <div className="text-sm text-gray-400">Active Traders</div>
            </div>
            <div className="h-12 w-px bg-gray-700"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">$19</div>
              <div className="text-sm text-gray-400">Per Month</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/chat"
              className="group relative inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-lime-400 via-green-400 to-cyan-400 hover:from-lime-500 hover:via-green-500 hover:to-cyan-500 text-gray-900 text-lg font-bold rounded-lg transition-all shadow-2xl hover:shadow-cyan-500/50 hover:scale-105"
            >
              <span>Start Free Trial</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 text-white text-lg font-semibold rounded-lg transition-all border border-white/10 hover:border-green-400/50"
            >
              <span>View Pricing</span>
              <span className="text-xs bg-green-400/20 text-green-400 px-2 py-1 rounded">Save 34%</span>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="mt-8 flex flex-wrap justify-center items-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>7-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-20 mb-32">
          {/* Market Analysis */}
          <div className="feature-card bg-slate-950/90 backdrop-blur-md rounded-xl p-8 text-center border border-cyan-500/20">
            <div className="flex justify-center mb-6">
              <Image 
                src="/icons/trading-chart-3d.jpg" 
                alt="Market Analysis" 
                width={120} 
                height={120} 
                className="rounded-lg border-2 border-cyan-400/30 shadow-lg shadow-cyan-500/20"
              />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Market Analysis</h3>
            <p className="text-gray-200 text-sm">
              Real-time technical indicators, price trends, and volume analysis powered by advanced AI
            </p>
          </div>

          {/* Multi-Agent System */}
          <div className="feature-card bg-slate-950/90 backdrop-blur-md rounded-xl p-8 text-center border border-cyan-500/20">
            <div className="flex justify-center mb-6">
              <Image 
                src="/icons/multi-agent-3d.jpg" 
                alt="Multi-Agent System" 
                width={120} 
                height={120} 
                className="rounded-lg border-2 border-cyan-400/30 shadow-lg shadow-cyan-500/20"
              />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Multi-Agent System</h3>
            <p className="text-gray-200 text-sm">
              Specialized AI analysts for market, fundamental, news, and social sentiment analysis
            </p>
          </div>

          {/* Risk Management */}
          <div className="feature-card bg-slate-950/90 backdrop-blur-md rounded-xl p-8 text-center border border-cyan-500/20">
            <div className="flex justify-center mb-6">
              <Image 
                src="/icons/risk-management-3d.jpg" 
                alt="Risk Management" 
                width={120} 
                height={120} 
                className="rounded-lg border-2 border-cyan-400/30 shadow-lg shadow-cyan-500/20"
              />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Risk Management</h3>
            <p className="text-gray-200 text-sm">
              Advanced position sizing, stop-loss calculation, and portfolio risk assessment
            </p>
          </div>

          {/* Backtesting */}
          <div className="feature-card bg-slate-950/90 backdrop-blur-md rounded-xl p-8 text-center border border-cyan-500/20">
            <div className="flex justify-center mb-6">
              <Image 
                src="/icons/backtesting-3d.jpg" 
                alt="Backtesting" 
                width={120} 
                height={120} 
                className="rounded-lg border-2 border-cyan-400/30 shadow-lg shadow-cyan-500/20"
              />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Backtesting</h3>
            <p className="text-gray-200 text-sm">
              Test strategies on historical data with comprehensive performance metrics
            </p>
          </div>
        </div>

        {/* 5 AI Analysts Showcase */}
        <section className="mb-32">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Meet Your <span className="bg-gradient-to-r from-lime-400 to-cyan-400 bg-clip-text text-transparent">5 AI Analysts</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Each specialist works in parallel to deliver comprehensive market intelligence in seconds
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            {/* Market Analyst - WITH CUSTOM ICON */}
            <div className="group relative bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-green-400/50 transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/5 to-cyan-400/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Image 
                    src="/icons/market-analyst.jpg" 
                    alt="Market Analyst" 
                    width={80} 
                    height={80}
                    className="rounded-xl border-2 border-green-400/30 shadow-lg shadow-green-500/20"
                  />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 text-center">Market Analyst</h3>
                <p className="text-sm text-gray-400 mb-3 text-center">Technical indicators, price action, support & resistance</p>
                <div className="flex items-center justify-center gap-2 text-xs text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Active</span>
                </div>
              </div>
            </div>

            {/* Fundamental Analyst */}
            <div className="group relative bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-blue-400/50 transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-cyan-400/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Image 
                    src="/icons/fundamental-analyst.jpg" 
                    alt="Fundamental Analyst" 
                    width={80} 
                    height={80}
                    className="rounded-xl border-2 border-blue-400/30 shadow-lg shadow-blue-500/20"
                  />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 text-center">Fundamental Analyst</h3>
                <p className="text-sm text-gray-400 mb-3 text-center">Financial metrics, valuations, earnings analysis</p>
                <div className="flex items-center justify-center gap-2 text-xs text-blue-400">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span>Active</span>
                </div>
              </div>
            </div>

            {/* News Analyst */}
            <div className="group relative bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-purple-400/50 transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/5 to-pink-400/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Image 
                    src="/icons/news-analyst.jpg" 
                    alt="News Analyst" 
                    width={80} 
                    height={80}
                    className="rounded-xl border-2 border-purple-400/30 shadow-lg shadow-purple-500/20"
                  />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 text-center">News Analyst</h3>
                <p className="text-sm text-gray-400 mb-3 text-center">Sentiment from 3 premium news sources</p>
                <div className="flex items-center justify-center gap-2 text-xs text-purple-400">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  <span>Active</span>
                </div>
              </div>
            </div>

            {/* Social Analyst */}
            <div className="group relative bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-orange-400/50 transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400/5 to-red-400/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Image 
                    src="/icons/social-analyst.jpg" 
                    alt="Social Analyst" 
                    width={80} 
                    height={80}
                    className="rounded-xl border-2 border-orange-400/30 shadow-lg shadow-orange-500/20"
                  />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 text-center">Social Analyst</h3>
                <p className="text-sm text-gray-400 mb-3 text-center">Reddit & Twitter sentiment, community buzz</p>
                <div className="flex items-center justify-center gap-2 text-xs text-orange-400">
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                  <span>Active</span>
                </div>
              </div>
            </div>

            {/* Options Analyst */}
            <div className="group relative bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-cyan-400/50 transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 to-teal-400/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Image 
                    src="/icons/options-analyst.jpg" 
                    alt="Options Analyst" 
                    width={80} 
                    height={80}
                    className="rounded-xl border-2 border-cyan-400/30 shadow-lg shadow-cyan-500/20"
                  />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 text-center">Options Analyst</h3>
                <p className="text-sm text-gray-400 mb-3 text-center">Put/Call ratio, IV, Greeks, unusual activity</p>
                <div className="flex items-center justify-center gap-2 text-xs text-cyan-400">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                  <span>Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Process Flow */}
          <div className="text-center mt-8">
            <div className="inline-flex items-center gap-4 px-6 py-3 bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
              <span className="text-sm text-gray-300">All analysts work</span>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" style={{animationDelay: '0.6s'}}></div>
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{animationDelay: '0.8s'}}></div>
              </div>
              <span className="text-sm font-semibold text-green-400">in parallel</span>
            </div>
          </div>
        </section>

        {/* Social Proof & Testimonials */}


        {/* Newsletter Subscription Section */}
        <div className="mt-32 max-w-2xl mx-auto">
          <div className="newsletter-box relative bg-gradient-to-r from-lime-400/10 via-green-400/10 to-cyan-400/10 backdrop-blur-md rounded-2xl p-8 md:p-12 border border-green-400/30 animate-pulse-border">
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
        <footer className="mt-32 border-t border-white/10 pt-12 pb-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">AlphaFlow AI</h3>
              <p className="text-gray-400 text-sm mb-4">
                Multi-agent AI intelligence for institutional-grade trading analysis
              </p>
              <div className="flex gap-4">
                <a href="https://twitter.com/alphaflowai" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-green-400 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path>
                  </svg>
                </a>
                <a href="https://linkedin.com/company/alphaflowai" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-green-400 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"></path>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/chat" className="text-gray-400 hover:text-green-400 transition-colors">AI Analysis</Link></li>
                <li><Link href="/pricing" className="text-gray-400 hover:text-green-400 transition-colors">Pricing</Link></li>
                <li><a href="#analysts" className="text-gray-400 hover:text-green-400 transition-colors">5 AI Analysts</a></li>
                <li><a href="#features" className="text-gray-400 hover:text-green-400 transition-colors">Features</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/disclaimer" className="text-gray-400 hover:text-green-400 transition-colors">Disclaimer</Link></li>
                <li><Link href="/privacy" className="text-gray-400 hover:text-green-400 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-gray-400 hover:text-green-400 transition-colors">Terms of Service</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="mailto:support@ai-trades.my" className="text-gray-400 hover:text-green-400 transition-colors flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    support@ai-trades.my
                  </a>
                </li>
                <li className="text-gray-400">Response within 24 hours</li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/10 pt-8 text-center">
            <p className="text-gray-400 text-sm mb-2">
              © 2024 AlphaFlow AI. All rights reserved.
            </p>
            <p className="text-gray-500 text-xs">
              For research and educational purposes only. Not financial advice. See our{" "}
              <Link href="/disclaimer" className="text-green-400 hover:underline">disclaimer</Link> for details.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
