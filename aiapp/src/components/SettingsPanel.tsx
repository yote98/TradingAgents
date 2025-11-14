'use client';

import { useState, useEffect } from 'react';
import { NotificationPreferences, CoachKey } from '@/types/notifications';
import { getNotificationManager } from '@/lib/notifications';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [permissionState, setPermissionState] = useState<NotificationPermission>('default');
  const [isSaving, setIsSaving] = useState(false);
  const [testingNotification, setTestingNotification] = useState(false);

  // Load preferences and permission state on mount
  useEffect(() => {
    if (isOpen) {
      const manager = getNotificationManager();
      setPreferences(manager.getPreferences());
      setPermissionState(manager.getPermissionState());
    }
  }, [isOpen]);

  // Don't render if not open
  if (!isOpen || !preferences) {
    return null;
  }

  const coachNames: Record<CoachKey, string> = {
    coach_d: 'Day Trading Coach',
    coach_i: 'Intraday Analysis Coach',
    coach_s: 'Sentiment Coach',
    coach_n: 'News & Events Coach',
  };

  const handleToggleGlobal = () => {
    const newPrefs = { ...preferences, enabled: !preferences.enabled };
    setPreferences(newPrefs);
    savePreferences(newPrefs);
  };

  const handleToggleCoach = (coachKey: CoachKey) => {
    const newPrefs = {
      ...preferences,
      coaches: {
        ...preferences.coaches,
        [coachKey]: !preferences.coaches[coachKey],
      },
    };
    setPreferences(newPrefs);
    savePreferences(newPrefs);
  };

  const handleIntervalChange = (value: number) => {
    const newPrefs = { ...preferences, minInterval: value };
    setPreferences(newPrefs);
    savePreferences(newPrefs);
  };

  const handleToggleSound = () => {
    const newPrefs = { ...preferences, sound: !preferences.sound };
    setPreferences(newPrefs);
    savePreferences(newPrefs);
  };

  const savePreferences = (prefs: NotificationPreferences) => {
    setIsSaving(true);
    const manager = getNotificationManager();
    manager.savePreferences(prefs);
    
    // Visual feedback
    setTimeout(() => {
      setIsSaving(false);
    }, 300);
  };

  const handleRequestPermission = async () => {
    const manager = getNotificationManager();
    const permission = await manager.requestPermission();
    setPermissionState(permission);
    
    if (permission === 'granted') {
      // Auto-enable notifications when permission is granted
      const newPrefs = { ...preferences, enabled: true };
      setPreferences(newPrefs);
      savePreferences(newPrefs);
    }
  };

  const handleTestNotification = () => {
    setTestingNotification(true);
    const manager = getNotificationManager();
    manager.testNotification();
    
    setTimeout(() => {
      setTestingNotification(false);
    }, 1000);
  };

  const getPermissionBadge = () => {
    switch (permissionState) {
      case 'granted':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Granted
          </span>
        );
      case 'denied':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            Denied
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Not Set
          </span>
        );
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-slate-800 to-slate-700 text-white p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Notification Settings</h2>
              <p className="text-slate-300 text-sm mt-1">Customize your alerts</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Close settings"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Permission Status */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900">Permission Status</h3>
              {getPermissionBadge()}
            </div>
            
            {permissionState === 'default' && (
              <div className="space-y-3">
                <p className="text-sm text-slate-600">
                  Browser notifications are not enabled. Click below to enable them.
                </p>
                <button
                  onClick={handleRequestPermission}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                >
                  Enable Notifications
                </button>
              </div>
            )}
            
            {permissionState === 'denied' && (
              <div className="space-y-2">
                <p className="text-sm text-slate-600">
                  Notifications are blocked. To enable them:
                </p>
                <ol className="text-xs text-slate-600 space-y-1 list-decimal list-inside">
                  <li>Click the lock icon in your browser's address bar</li>
                  <li>Find "Notifications" in the permissions list</li>
                  <li>Change the setting to "Allow"</li>
                  <li>Refresh this page</li>
                </ol>
              </div>
            )}
            
            {permissionState === 'granted' && (
              <p className="text-sm text-slate-600">
                Notifications are enabled and ready to use.
              </p>
            )}
          </div>

          {/* Global Toggle */}
          <div className="border-b border-slate-200 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Enable Notifications</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Receive alerts when new coach plans are posted
                </p>
              </div>
              <button
                onClick={handleToggleGlobal}
                disabled={permissionState !== 'granted'}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.enabled && permissionState === 'granted'
                    ? 'bg-blue-600'
                    : 'bg-gray-300'
                } ${permissionState !== 'granted' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.enabled && permissionState === 'granted' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Per-Coach Toggles */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-slate-900">Coach Notifications</h3>
            <p className="text-sm text-slate-600 -mt-2">
              Choose which coaches can send you notifications
            </p>
            
            <div className="space-y-3">
              {(Object.keys(coachNames) as CoachKey[]).map((coachKey) => (
                <div
                  key={coachKey}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <span className="text-sm font-medium text-slate-900">
                    {coachNames[coachKey]}
                  </span>
                  <button
                    onClick={() => handleToggleCoach(coachKey)}
                    disabled={!preferences.enabled || permissionState !== 'granted'}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      preferences.coaches[coachKey] && preferences.enabled && permissionState === 'granted'
                        ? 'bg-blue-600'
                        : 'bg-gray-300'
                    } ${
                      !preferences.enabled || permissionState !== 'granted'
                        ? 'opacity-50 cursor-not-allowed'
                        : 'cursor-pointer'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        preferences.coaches[coachKey] && preferences.enabled && permissionState === 'granted'
                          ? 'translate-x-6'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Notification Interval */}
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Notification Interval</h3>
              <p className="text-sm text-slate-600 mt-1">
                Minimum time between notifications from the same coach
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">
                  {Math.floor(preferences.minInterval / 60)} minutes
                </span>
                <span className="text-xs text-slate-500">
                  ({preferences.minInterval} seconds)
                </span>
              </div>
              
              <input
                type="range"
                min="60"
                max="1800"
                step="60"
                value={preferences.minInterval}
                onChange={(e) => handleIntervalChange(Number(e.target.value))}
                disabled={!preferences.enabled || permissionState !== 'granted'}
                className={`w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer ${
                  !preferences.enabled || permissionState !== 'granted'
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
                style={{
                  background: preferences.enabled && permissionState === 'granted'
                    ? `linear-gradient(to right, #2563eb 0%, #2563eb ${((preferences.minInterval - 60) / (1800 - 60)) * 100}%, #e2e8f0 ${((preferences.minInterval - 60) / (1800 - 60)) * 100}%, #e2e8f0 100%)`
                    : undefined
                }}
              />
              
              <div className="flex justify-between text-xs text-slate-500">
                <span>1 min</span>
                <span>30 min</span>
              </div>
            </div>
          </div>

          {/* Sound Toggle */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Notification Sound</h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Play sound with notifications
              </p>
            </div>
            <button
              onClick={handleToggleSound}
              disabled={!preferences.enabled || permissionState !== 'granted'}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.sound && preferences.enabled && permissionState === 'granted'
                  ? 'bg-blue-600'
                  : 'bg-gray-300'
              } ${
                !preferences.enabled || permissionState !== 'granted'
                  ? 'opacity-50 cursor-not-allowed'
                  : 'cursor-pointer'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.sound && preferences.enabled && permissionState === 'granted'
                    ? 'translate-x-6'
                    : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Test Notification Button */}
          <div className="pt-4">
            <button
              onClick={handleTestNotification}
              disabled={permissionState !== 'granted' || testingNotification}
              className={`w-full px-4 py-3 rounded-lg font-medium text-sm transition-colors ${
                permissionState === 'granted' && !testingNotification
                  ? 'bg-slate-800 text-white hover:bg-slate-700'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              {testingNotification ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Sending...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  Test Notification
                </span>
              )}
            </button>
            <p className="text-xs text-slate-500 text-center mt-2">
              Send a test notification to verify your setup
            </p>
          </div>

          {/* Save Indicator */}
          {isSaving && (
            <div className="fixed bottom-6 right-6 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 animate-fade-in">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">Saved</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
