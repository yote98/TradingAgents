'use client';

import React from 'react';
import { Activity, QuickStats } from '@/types/sections';
import { getRecentActivity } from '@/lib/activity';
import { getQuickStats } from '@/lib/stats';

interface HomeSectionProps {
  onNavigate?: (section: string) => void;
}

export default function HomeSection({ onNavigate }: HomeSectionProps) {
  const [activity, setActivity] = React.useState<Activity[]>([]);
  const [stats, setStats] = React.useState<QuickStats | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [activityData, statsData] = await Promise.all([
          getRecentActivity(),
          getQuickStats()
        ]);
        setActivity(activityData);
        setStats(statsData);
      } catch (error) {
        console.error('Error loading home data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'analysis':
        return '📊';
      case 'coach_plan':
        return '🎯';
      case 'sentiment':
        return '💬';
      default:
        return '📌';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Message */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Today is {currentDate}
        </p>
      </div>

      {/* Quick Stats */}
      <section className="mb-8" aria-labelledby="quick-stats-heading">
        <h2 id="quick-stats-heading" className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Quick Stats
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {stats?.totalAnalyses || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Analyses
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
              {stats?.avgWinRate ? `${stats.avgWinRate.toFixed(1)}%` : 'N/A'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Win Rate
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <div className={`text-3xl font-bold mb-2 ${
              (stats?.recentReturn || 0) >= 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {stats?.recentReturn 
                ? `${stats.recentReturn >= 0 ? '+' : ''}${stats.recentReturn.toFixed(2)}%` 
                : 'N/A'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Recent Return
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {stats?.activeCoaches || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Active Coaches
            </div>
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="mb-8" aria-labelledby="recent-activity-heading">
        <h2 id="recent-activity-heading" className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          {activity.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No recent activity. Start by running an analysis!
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {activity.map((item) => (
                <div
                  key={item.id}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl flex-shrink-0">
                      {getActivityIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="font-medium text-gray-900 dark:text-white truncate">
                          {item.title}
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                          {formatTimestamp(item.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {item.summary}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Quick Actions */}
      <section aria-labelledby="quick-actions-heading">
        <h2 id="quick-actions-heading" className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => onNavigate?.('analyze')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Navigate to Analyze section to run stock analysis"
          >
            Run Analysis
          </button>
          <button
            onClick={() => onNavigate?.('coaches')}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            aria-label="Navigate to Coaches section to view coach plans"
          >
            View Coaches
          </button>
          <button
            onClick={() => onNavigate?.('backtest')}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            aria-label="Navigate to Backtest section to run historical backtests"
          >
            Run Backtest
          </button>
        </div>
      </section>
    </div>
  );
}
