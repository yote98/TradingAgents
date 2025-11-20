"use client";

import Link from "next/link";
import { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Send to your backend or email service
    console.log("Contact form submitted:", formData);
    setSubmitted(true);
  };

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

      <div className="container mx-auto px-6 py-16 max-w-4xl">
        {!submitted ? (
          <>
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold text-white mb-4">
                Contact Sales
              </h1>
              <p className="text-xl text-gray-300">
                Interested in our Enterprise plan? Let's talk about how AlphaFlow AI can help your team.
              </p>
            </div>

            {/* Contact Form */}
            <div className="bg-gradient-to-r from-lime-400/10 via-green-400/10 to-cyan-400/10 backdrop-blur-md rounded-2xl p-8 border border-green-400/20">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-white font-semibold mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-400 transition-colors"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-white font-semibold mb-2">
                    Work Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-400 transition-colors"
                    placeholder="john@company.com"
                  />
                </div>

                <div>
                  <label htmlFor="company" className="block text-white font-semibold mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    id="company"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-400 transition-colors"
                    placeholder="Acme Trading Corp"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-white font-semibold mb-2">
                    Tell us about your needs
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-400 transition-colors resize-none"
                    placeholder="Tell us about your team size, use case, and any specific requirements..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-lime-400 via-green-400 to-cyan-400 text-black text-lg font-bold rounded-lg hover:opacity-90 transition-opacity"
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Additional Info */}
            <div className="mt-12 grid md:grid-cols-3 gap-6">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 text-center">
                <div className="text-3xl mb-3">📧</div>
                <h3 className="text-white font-semibold mb-2">Email Us</h3>
                <a href="mailto:support@ai-trades.my" className="text-cyan-400 hover:underline">
                  support@ai-trades.my
                </a>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 text-center">
                <div className="text-3xl mb-3">⚡</div>
                <h3 className="text-white font-semibold mb-2">Quick Response</h3>
                <p className="text-gray-300 text-sm">
                  We typically respond within 24 hours
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 text-center">
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="text-white font-semibold mb-2">Custom Solutions</h3>
                <p className="text-gray-300 text-sm">
                  Tailored plans for your organization
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Thank You!
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              We've received your message and will get back to you within 24 hours.
            </p>
            <Link
              href="/pricing"
              className="inline-block px-8 py-4 bg-gradient-to-r from-lime-400 via-green-400 to-cyan-400 text-black font-bold rounded-lg hover:opacity-90 transition-opacity"
            >
              Back to Pricing
            </Link>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-20 py-8 border-t border-slate-700 text-center text-gray-400 text-sm">
        <p>AlphaFlow AI - Multi-Agent Intelligence for Trading Analysis</p>
        <p className="mt-2">For research and educational purposes only</p>
      </footer>
    </div>
  );
}
