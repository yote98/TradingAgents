'use client';

import { useEffect, useState, useRef } from 'react';
import { fetchCoachPlans, type CoachPlans } from '../../lib/tradingagents-api';
import { getNotificationManager } from '../../lib/notifications';
import { CoachKey } from '@/types/notifications';
import { ChartGenerator } from '../../lib/chartGenerator';
import SettingsPanel from '../SettingsPanel';
import CoachPlansGrid from '../CoachPlansGrid';

/**
 * CoachesSection Component
 * 
 * Displays coach plans in the sidebar navigation context.
 * Wraps existing CoachDashboard_Simple functionality without tab navigation.
 * Maintains all existing features: auto-refresh, notifications, settings.
 */
export default function CoachesSection() {
  const [plans, setPlans] = useState<CoachPlans | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notificationPermissionRequested, setNotificationPermissionRequested] = useState(false);
  const [settingsPanelOpen, setSettingsPanelOpen] = useState(false);
  
  // Store previous plans to detect new ones
  const previousPlansRef = useRef<CoachPlans | null>(null);
  const notificationManagerRef = useRef(getNotificationManager());
  const chartGeneratorRef = useRef(new ChartGenerator());

  // Coach display configuration
  const coachColors: { [key: string]: string } = {
    coach_d: 'border-blue-400 bg-blue-50',
    coach_i: 'border-green-400 bg-green-50',
    coach_s: 'border-purple-400 bg-purple-50',
    coach_n: 'border-orange-400 bg-orange-50',
  };

  const coachNames: { [key: string]: string } = {
    coach_d: 'Day Trading Coach',
    coach_i: 'Intraday Analysis Coach',
    coach_s: 'Sentiment Coach',
    coach_n: 'News & Events Coach',
  };

  // Request notification permission on first visit
  useEffect(() => {
    const requestPermission = async () => {
      const manager = notificationManagerRef.current;
      const permission = manager.getPermissionState();
      
      // Only request if not already decided
      if (permission === 'default' && !notificationPermissionRequested) {
        setNotificationPermissionRequested(true);
        await manager.requestPermission();
      }
    };
    
    requestPermission();
  }, [notificationPermissionRequested]);

  // Detect new plans and trigger notifications
  const detectNewPlans = (currentPlans: CoachPlans) => {
    const previousPlans = previousPlansRef.current;
    
    // Skip on first load
    if (!previousPlans) {
      previousPlansRef.current = currentPlans;
      return;
    }
    
    const manager = notificationManagerRef.current;
    
    // Check each coach for new plans
    Object.entries(currentPlans).forEach(([coachKey, currentPlan]) => {
      const previousPlan = previousPlans[coachKey];
      
      // Detect new plan: either coach didn't exist before or plan content changed
      const isNewPlan = !previousPlan || 
                        previousPlan.created_at !== currentPlan.created_at ||
                        previousPlan.plan !== currentPlan.plan;
      
      if (isNewPlan) {
        // Get coach display name
        const coachName = coachNames[coachKey] || coachKey;
        
        // Create preview (first 100 chars)
        const planPreview = currentPlan.plan.substring(0, 100) + 
                           (currentPlan.plan.length > 100 ? '...' : '');
        
        // Show notification
        manager.showPlanNotification(
          coachKey as CoachKey,
          coachName,
          planPreview
        );
        
        console.log(`[CoachesSection] New plan detected from ${coachName}`);
      }
    });
    
    // Update previous plans reference
    previousPlansRef.current = currentPlans;
  };

  // Load coach plans with auto-refresh
  useEffect(() => {
    async function loadPlans() {
      try {
        setLoading(true);
        const data = await fetchCoachPlans();
        
        // Detect new plans and trigger notifications
        detectNewPlans(data);
        
        setPlans(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load coach plans');
      } finally {
        setLoading(false);
      }
    }

    loadPlans();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadPlans, 30000);
    return () => clearInterval(interval);
  }, []);

  // Monitor storage health periodically
  useEffect(() => {
    const monitorInterval = setInterval(() => {
      chartGeneratorRef.current.monitorStorage();
    }, 5 * 60 * 1000); // Every 5 minutes

    // Initial monitoring
    chartGeneratorRef.current.monitorStorage();

    return () => clearInterval(monitorInterval);
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading coach plans...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="m-6 p-6 bg-red-50 border-l-4 border-red-500 rounded">
        <h3 className="text-lg font-bold text-red-900 mb-2">Error Loading Plans</h3>
        <p className="text-red-700">{error}</p>
        <p className="text-sm text-red-600 mt-2">Make sure the backend is running at http://localhost:5000</p>
      </div>
    );
  }

  // Empty state
  if (!plans || Object.keys(plans).length === 0) {
    return (
      <div className="m-6 p-6 bg-yellow-50 border-l-4 border-yellow-500 rounded">
        <h3 className="text-lg font-bold text-yellow-900 mb-2">No Plans Available</h3>
        <p className="text-yellow-700">No trading plans have been posted yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Disclaimer */}
      <aside className="bg-amber-50 border-l-4 border-amber-500 rounded-lg p-4 shadow-sm" aria-labelledby="disclaimer-heading">
        <div className="flex items-start space-x-3">
          <svg className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h2 id="disclaimer-heading" className="text-sm font-bold text-amber-900 mb-1">Educational & Research Purposes Only</h2>
            <p className="text-xs text-amber-800 leading-relaxed">
              This dashboard displays AI-generated trading insights for demonstration and paper trading only. 
              Not financial advice. Always conduct your own research and consult with licensed financial advisors before making investment decisions.
            </p>
          </div>
        </div>
      </aside>

      {/* Header with Settings */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coach Plans</h1>
          <p className="text-gray-600 mt-1">Real-time insights from your AI trading coaches</p>
          <div className="mt-3 flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2 bg-green-50 text-green-700 rounded-full px-3 py-1">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live</span>
            </div>
            <div className="bg-gray-100 text-gray-700 rounded-full px-3 py-1">
              {Object.keys(plans).length} Active Coaches
            </div>
          </div>
        </div>
        
        {/* Settings Button */}
        <button
          onClick={() => setSettingsPanelOpen(true)}
          className="p-3 hover:bg-gray-100 rounded-lg transition-colors group"
          aria-label="Open settings"
          title="Notification Settings"
        >
          <svg 
            className="w-6 h-6 text-gray-600 group-hover:rotate-45 transition-transform duration-300" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
            />
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
            />
          </svg>
        </button>
      </div>
      
      {/* Settings Panel */}
      <SettingsPanel 
        isOpen={settingsPanelOpen} 
        onClose={() => setSettingsPanelOpen(false)} 
      />
      
      {/* Coach Plans Grid */}
      <CoachPlansGrid
        plans={plans}
        chartGenerator={chartGeneratorRef.current}
        coachColors={coachColors}
        coachNames={coachNames}
      />
    </div>
  );
}
