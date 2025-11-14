'use client';

import { useEffect, useState } from 'react';
import { fetchCoachPlans, type CoachPlans } from '../lib/tradingagents-api';

export default function CoachDashboard() {
  const [plans, setPlans] = useState<CoachPlans | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCoach, setSelectedCoach] = useState<string | null>(null);

  useEffect(() => {
    async function loadPlans() {
      try {
        setLoading(true);
        const data = await fetchCoachPlans();
        setPlans(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load coach plans');
      } finally {
        setLoading(false);
      }
    }

    loadPlans();
    const interval = setInterval(loadPlans, 30000);
    return () => clearInterval(interval);
  }, []);

  const coachConfig: { [key: string]: { name: string; color: string; bgColor: string; borderColor: string } } = {
    coach_d: {
      name: 'Day Trading Coach',
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    coach_i: {
      name: 'Intraday Analysis Coach',
      color: 'text-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    coach_s: {
      name: 'Sentiment Coach',
      color: 'text-purple-700',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    coach_n: {
      name: 'News & Events Coach',
      color: 'text-orange-700',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const stripEmojis = (text: string) => {
    // Remove all emojis and emoji-like characters
    return text.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F018}-\u{1F270}]|[\u{238C}-\u{2454}]|[\u{20D0}-\u{20FF}]/gu, '');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading coach plans...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-semibold text-lg">Error Loading Coach Plans</h3>
        <p className="text-red-600 mt-2">{error}</p>
        <p className="text-red-500 text-sm mt-3">
          Make sure your TradingAgents backend is running at http://localhost:5000
        </p>
      </div>
    );
  }

  if (!plans || Object.keys(plans).length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-yellow-800 font-semibold text-lg">No Coach Plans Available</h3>
        <p className="text-yellow-700 mt-2">
          No trading plans have been posted by coaches yet. Check back soon!
        </p>
      </div>
    );
  }

  const filteredPlans = selectedCoach 
    ? { [selectedCoach]: plans![selectedCoach] }
    : plans;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Trading Coach Dashboard</h1>
        <p className="text-slate-200">Real-time insights from your AI trading coaches</p>
        <div className="flex items-center space-x-4 mt-4">
          <div className="flex items-center space-x-2 bg-white/10 rounded-full px-3 py-1">
            <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm">Live</span>
          </div>
          <div className="bg-white/10 rounded-full px-3 py-1">
            <span className="text-sm">{Object.keys(plans).length} Active Coaches</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-sm border p-2">
        <div className="flex items-center space-x-2 overflow-x-auto">
          <button
            onClick={() => setSelectedCoach(null)}
            className={`px-4 py-2 rounded-md font-medium transition-colors whitespace-nowrap ${
              selectedCoach === null
                ? 'bg-slate-800 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Coaches
          </button>
          {Object.entries(coachConfig).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setSelectedCoach(key)}
              className={`px-4 py-2 rounded-md font-medium transition-colors whitespace-nowrap ${
                selectedCoach === key
                  ? 'bg-slate-800 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {config.name}
            </button>
          ))}
        </div>
      </div>

      {/* Coach Plans Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(filteredPlans || {}).map(([coachKey, plan]) => {
          const config = coachConfig[coachKey] || {
            name: coachKey,
            color: 'text-gray-700',
            bgColor: 'bg-gray-50',
            borderColor: 'border-gray-200'
          };
          
          return (
            <div
              key={coachKey}
              className={`bg-white rounded-lg shadow-md border-2 ${config.borderColor} hover:shadow-lg transition-shadow`}
            >
              {/* Card Header */}
              <div className={`${config.bgColor} p-4 rounded-t-lg border-b ${config.borderColor}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-xl font-bold ${config.color}`}>
                      {config.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {getTimeAgo(plan.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Updated</p>
                    <p className={`text-sm font-semibold ${config.color}`}>
                      {new Date(plan.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Card Body */}
              <div className="p-6">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap text-sm">
                    {stripEmojis(plan.plan)}
                  </p>
                </div>
                
                {/* Charts Section */}
                {plan.charts && plan.charts.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="font-semibold text-gray-700 mb-2">
                      {plan.charts.length} Chart{plan.charts.length > 1 ? 's' : ''} Attached
                    </p>
                    <div className="space-y-2">
                      {plan.charts.map((chart, index) => (
                        <div 
                          key={index}
                          className="flex items-center p-2 bg-blue-50 rounded border border-blue-200 hover:bg-blue-100 transition-colors"
                        >
                          <span className="text-blue-600 text-sm truncate flex-1">{chart}</span>
                          <a
                            href={chart}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Card Footer */}
              <div className="bg-gray-50 px-6 py-3 rounded-b-lg border-t border-gray-200">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{new Date(plan.created_at).toLocaleDateString()}</span>
                  <span className="font-medium">ID: {coachKey}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats Footer */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-slate-800">{Object.keys(plans).length}</div>
            <div className="text-sm text-gray-600">Active Coaches</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {Object.values(plans).reduce((sum, plan) => sum + (plan.charts?.length || 0), 0)}
            </div>
            <div className="text-sm text-gray-600">Total Charts</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">30s</div>
            <div className="text-sm text-gray-600">Auto-Refresh</div>
          </div>
          <div>
            <div className="flex items-center justify-center space-x-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-green-600">Connected</span>
            </div>
            <div className="text-sm text-gray-600">API Status</div>
          </div>
        </div>
      </div>
    </div>
  );
}
