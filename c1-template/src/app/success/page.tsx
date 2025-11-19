"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      // Optional: Verify the session on the backend
      setLoading(false);
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/20 text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Success Message */}
        <h1 className="text-4xl font-bold text-white mb-4">
          Payment Successful! 🎉
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          Welcome to AlphaFlow AI! Your subscription is now active.
        </p>

        {/* What's Next */}
        <div className="bg-white/5 rounded-xl p-6 mb-8 text-left">
          <h2 className="text-xl font-bold text-white mb-4">What's Next?</h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="text-green-400 mt-1">✓</span>
              <span>Check your email for your receipt and account details</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-400 mt-1">✓</span>
              <span>Access all 5 AI analysts for comprehensive market analysis</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-400 mt-1">✓</span>
              <span>Start analyzing stocks with institutional-grade insights</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/chat"
            className="px-8 py-4 bg-gradient-to-r from-lime-400 to-cyan-400 text-slate-900 font-bold rounded-xl hover:scale-105 transition-transform duration-300"
          >
            Start Analyzing Stocks
          </Link>
          <Link
            href="/portfolio"
            className="px-8 py-4 bg-white/10 text-white font-bold rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300"
          >
            View Dashboard
          </Link>
        </div>

        {/* Support */}
        <p className="text-gray-400 text-sm mt-8">
          Need help? Contact us at{" "}
          <a href="mailto:support@ai-trades.my" className="text-cyan-400 hover:underline">
            support@ai-trades.my
          </a>
        </p>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
