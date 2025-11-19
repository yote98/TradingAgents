"use client";

import Link from "next/link";
import { useState } from "react";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  const plans = [
    {
      name: "Free",
      price: { monthly: 0, annual: 0 },
      description: "Perfect for trying out AlphaFlow AI",
      features: [
        "5 stock analyses per day",
        "Basic market data",
        "Community support",
        "Real-time prices",
        "4 AI analysts",
      ],
      limitations: [
        "Limited to 5 analyses/day",
        "No options data",
        "No crypto analysis",
      ],
      cta: "Start Free",
      popular: false,
      badge: null,
    },
    {
      name: "Pro",
      price: { monthly: 19, annual: 190 },
      description: "For serious traders and investors",
      badge: "🎉 Launch Price - Save 34%",
      features: [
        "Unlimited stock analyses",
        "5 AI analysts (Market, Fundamental, News, Social, Options)",
        "Options flow analysis (Put/Call, IV, Greeks)",
        "Crypto analysis (BTC, ETH, SOL, etc.)",
        "Real-time data from 6 sources",
        "News from 3 premium sources",
        "Social sentiment (Reddit + Twitter)",
        "Advanced charts & visualizations",
        "Risk management tools",
        "Priority support",
        "API access",
      ],
      limitations: [],
      cta: "Start Pro Trial",
      popular: true,
    },
    {
      name: "Enterprise",
      price: { monthly: 49, annual: 490 },
      description: "For teams and institutions",
      badge: "🚀 50% Off Launch Price",
      features: [
        "Everything in Pro",
        "Unlimited team members",
        "Custom AI training",
        "White-label options",
        "Dedicated account manager",
        "Custom integrations",
        "SLA guarantee",
        "Advanced analytics",
        "Portfolio management",
        "Backtesting tools",
        "Custom reports",
      ],
      limitations: [],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="p-6 flex justify-between items-center border-b border-slate-700">
        <Link href="/" className="text-2xl font-bold text-white">
          AlphaFlow AI
        </Link>
        <Link
          href="/chat"
          className="px-6 py-2 bg-gradient-to-r from-lime-400 via-green-400 to-cyan-400 text-black font-bold rounded-lg hover:opacity-90 transition-opacity"
        >
          Launch AI
        </Link>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16 text-center">
        <div className="inline-block px-4 py-2 bg-green-400/20 border border-green-400 rounded-full text-green-400 text-sm font-semibold mb-4">
          🎉 Launch Special - Limited Time Offer
        </div>
        <h1 className="text-5xl font-bold text-white mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-gray-300 mb-2 max-w-2xl mx-auto">
          Choose the plan that fits your trading style. All plans include real-time data and AI-powered analysis.
        </p>
        <p className="text-lg text-green-400 mb-8">
          Early adopter pricing - Lock in these rates forever! 🔒
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className={`text-lg ${billingCycle === "monthly" ? "text-white font-semibold" : "text-gray-400"}`}>
            Monthly
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === "monthly" ? "annual" : "monthly")}
            className="relative w-16 h-8 bg-slate-700 rounded-full transition-colors hover:bg-slate-600"
          >
            <div
              className={`absolute top-1 left-1 w-6 h-6 bg-gradient-to-r from-lime-400 to-cyan-400 rounded-full transition-transform ${
                billingCycle === "annual" ? "translate-x-8" : ""
              }`}
            />
          </button>
          <span className={`text-lg ${billingCycle === "annual" ? "text-white font-semibold" : "text-gray-400"}`}>
            Annual
            <span className="ml-2 text-sm text-green-400">(Save 17%)</span>
          </span>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border ${
                plan.popular
                  ? "border-green-400 shadow-2xl shadow-green-400/20 scale-105"
                  : "border-white/10"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-lime-400 to-green-400 text-black text-sm font-bold rounded-full">
                  Most Popular
                </div>
              )}

              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              {plan.badge && (
                <div className="text-xs text-green-400 font-semibold mb-2">
                  {plan.badge}
                </div>
              )}
              <p className="text-gray-400 text-sm mb-6">{plan.description}</p>

              <div className="mb-6">
                <span className="text-5xl font-bold text-white">
                  ${billingCycle === "monthly" ? plan.price.monthly : Math.floor(plan.price.annual / 12)}
                </span>
                <span className="text-gray-400 text-lg">/month</span>
                {billingCycle === "annual" && plan.price.annual > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    ${plan.price.annual} billed annually
                  </p>
                )}
              </div>

              <Link
                href={plan.name === "Enterprise" ? "/contact" : "/chat"}
                className={`block w-full py-3 rounded-lg font-semibold text-center transition-all mb-6 ${
                  plan.popular
                    ? "bg-gradient-to-r from-lime-400 via-green-400 to-cyan-400 text-black hover:opacity-90"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                {plan.cta}
              </Link>

              <div className="space-y-3 text-left">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </div>
                ))}
                {plan.limitations.map((limitation, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-gray-600 mt-1">×</span>
                    <span className="text-gray-500 text-sm">{limitation}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-24 max-w-3xl mx-auto text-left">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-2">
                What data sources do you use?
              </h3>
              <p className="text-gray-300">
                We aggregate data from 6 premium sources including MarketData.app, Alpha Vantage, NewsData.io, NewsAPI.org, Reddit, and CoinGecko. All data is real-time and updated continuously.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-2">
                How many AI analysts do I get?
              </h3>
              <p className="text-gray-300">
                Pro and Enterprise plans include all 5 AI analysts: Market Analyst (technical), Fundamental Analyst (valuation), News Analyst (sentiment), Social Analyst (Reddit/Twitter), and Options Analyst (derivatives). Free plan includes 4 analysts (no options).
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-2">
                Can I cancel anytime?
              </h3>
              <p className="text-gray-300">
                Yes! All plans are month-to-month with no long-term commitment. Cancel anytime from your account settings.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-2">
                Do you offer a free trial?
              </h3>
              <p className="text-gray-300">
                Yes! Pro plan includes a 7-day free trial. No credit card required to start.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-2">
                Is this financial advice?
              </h3>
              <p className="text-gray-300">
                No. AlphaFlow AI is a research tool for educational purposes only. All analysis is AI-generated and should not be considered financial advice. Always do your own research and consult with a licensed financial advisor.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 bg-gradient-to-r from-lime-400/10 via-green-400/10 to-cyan-400/10 rounded-2xl p-12 border border-green-400/20">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to elevate your trading?
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of traders using AI-powered analysis to make smarter decisions.
          </p>
          <Link
            href="/chat"
            className="inline-block px-8 py-4 bg-gradient-to-r from-lime-400 via-green-400 to-cyan-400 text-black text-lg font-bold rounded-lg hover:opacity-90 transition-opacity"
          >
            Start Free Trial
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-20 py-8 border-t border-slate-700 text-center text-gray-400 text-sm">
        <p>AlphaFlow AI - Multi-Agent Intelligence for Trading Analysis</p>
        <p className="mt-2">For research and educational purposes only</p>
      </footer>
    </div>
  );
}
