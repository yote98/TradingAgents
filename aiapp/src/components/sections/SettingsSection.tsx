'use client';

import React, { useState, useEffect } from 'react';
import { UserSettings, DEFAULT_USER_SETTINGS, validateSettings } from '@/types/settings';
import { getStorageItem, setStorageItem, STORAGE_KEYS } from '@/lib/storage';
import { CoachKey } from '@/types/notifications';

/**
 * Settings Section Component
 * Allows users to configure dashboard preferences including theme, notifications, and API settings
 */
export default function SettingsSection() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_USER_SETTINGS);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Load settings on mount
  useEffect(() => {
    const savedSettings = getStorageItem<UserSettings>(
      STORAGE_KEYS.SETTINGS,
      DEFAULT_USER_SETTINGS
    );
    setSettings(savedSettings);

    // Apply theme immediately
    applyTheme(savedSettings.theme);
  }, []);

  // Apply theme to document
  const applyTheme = (theme: 'light' | 'dark') => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(theme);
    }
  };

  // Handle theme change
  const handleThemeChange = (theme: 'light' | 'dark') => {
    const newSettings = { ...settings, theme };
    setSettings(newSettings);
    applyTheme(theme);
    saveSettings(newSettings);
  };

  // Handle notification toggle
  const handleNotificationToggle = (enabled: boolean) => {
    const newSettings = {
      ...settings,
      notifications: {
        ...settings.notifications,
        enabled,
      },
    };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  // Handle coach notification toggle
  const handleCoachNotificationToggle = (coachKey: CoachKey, enabled: boolean) => {
    const newSettings = {
      ...settings,
      notifications: {
        ...settings.notifications,
        coaches: {
          ...settings.notifications.coaches,
          [coachKey]: enabled,
        },
      },
    };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  // Handle notification sound toggle
  const handleSoundToggle = (sound: boolean) => {
    const newSettings = {
      ...settings,
      notifications: {
        ...settings.notifications,
        sound,
      },
    };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  // Handle API config change
  const handleApiConfigChange = (field: 'backendUrl' | 'timeout', value: string | number) => {
    const newSettings = {
      ...settings,
      apiConfig: {
        ...settings.apiConfig,
        [field]: value,
      },
    };
    setSettings(newSettings);
  };

  // Save API config (separate from auto-save for other settings)
  const handleSaveApiConfig = () => {
    saveSettings(settings);
  };

  // Save settings to localStorage
  const saveSettings = (settingsToSave: UserSettings) => {
    setSaveStatus('saving');
    setErrorMessage('');

    // Validate settings
    if (!validateSettings(settingsToSave)) {
      setSaveStatus('error');
      setErrorMessage('Invalid settings. Please check your inputs.');
      return;
    }

    // Save to localStorage
    const success = setStorageItem(STORAGE_KEYS.SETTINGS, settingsToSave);

    if (success) {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } else {
      setSaveStatus('error');
      setErrorMessage('Failed to save settings. Storage may be full.');
    }
  };

  const coachNames: Record<CoachKey, string> = {
    coach_d: 'Day Trading Coach',
    coach_i: 'Investment Coach',
    coach_s: 'Swing Trading Coach',
    coach_n: 'News & Events Coach',
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
      <p className="text-gray-600 mb-8">
        Configure your dashboard preferences and API settings
      </p>

      {/* Save Status */}
      {saveStatus === 'saved' && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          ✓ Settings saved successfully
        </div>
      )}

      {saveStatus === 'error' && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          ✗ {errorMessage}
        </div>
      )}

      {/* Theme Settings */}
      <section className="mb-8 bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Appearance</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Theme
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => handleThemeChange('light')}
                className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                  settings.theme === 'light'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl">☀️</span>
                  <span className="font-medium">Light</span>
                </div>
              </button>
              
              <button
                onClick={() => handleThemeChange('dark')}
                className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                  settings.theme === 'dark'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl">🌙</span>
                  <span className="font-medium">Dark</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Notification Settings */}
      <section className="mb-8 bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Notifications</h2>
        
        <div className="space-y-4">
          {/* Master toggle */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Enable Notifications
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Receive browser notifications for new coach plans
              </p>
            </div>
            <button
              onClick={() => handleNotificationToggle(!settings.notifications.enabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.notifications.enabled ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.notifications.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Per-coach toggles */}
          {settings.notifications.enabled && (
            <>
              <div className="pt-2">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Coach Notifications
                </label>
                <div className="space-y-3">
                  {(Object.keys(coachNames) as CoachKey[]).map((coachKey) => (
                    <div key={coachKey} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{coachNames[coachKey]}</span>
                      <button
                        onClick={() =>
                          handleCoachNotificationToggle(
                            coachKey,
                            !settings.notifications.coaches[coachKey]
                          )
                        }
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.notifications.coaches[coachKey]
                            ? 'bg-blue-600'
                            : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.notifications.coaches[coachKey]
                              ? 'translate-x-6'
                              : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sound toggle */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Notification Sound
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Play a sound when notifications appear
                  </p>
                </div>
                <button
                  onClick={() => handleSoundToggle(!settings.notifications.sound)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.notifications.sound ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.notifications.sound ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* API Configuration */}
      <section className="mb-8 bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">API Configuration</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Backend URL
            </label>
            <input
              type="text"
              value={settings.apiConfig.backendUrl}
              onChange={(e) => handleApiConfigChange('backendUrl', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="http://localhost:5000"
            />
            <p className="text-xs text-gray-500 mt-1">
              URL of the TradingAgents backend API
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Request Timeout (ms)
            </label>
            <input
              type="number"
              value={settings.apiConfig.timeout}
              onChange={(e) => handleApiConfigChange('timeout', parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="30000"
              min="1000"
              step="1000"
            />
            <p className="text-xs text-gray-500 mt-1">
              Maximum time to wait for API responses (minimum 1000ms)
            </p>
          </div>

          <button
            onClick={handleSaveApiConfig}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Save API Configuration
          </button>
        </div>
      </section>

      {/* Info Section */}
      <section className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">About Settings</h3>
        <p className="text-sm text-blue-800">
          Your settings are saved locally in your browser. Theme and notification preferences
          are applied immediately, while API configuration requires clicking the save button.
        </p>
      </section>
    </div>
  );
}
