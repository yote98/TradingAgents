/**
 * AccountManager Component
 * 
 * Modal for managing monitored Twitter accounts.
 * Allows users to add/remove accounts and validates Twitter usernames.
 */

'use client';

import React, { useState, useEffect } from 'react';

interface AccountManagerProps {
  accounts: string[];
  onSave: (accounts: string[]) => void;
  onClose: () => void;
  stocktwitsEnabled?: boolean;
  onStocktwitsToggle?: (enabled: boolean) => void;
}

// Default suggested accounts for financial content
const DEFAULT_SUGGESTIONS = [
  'ChartChampions',
  'unusual_whales',
  'TradingView',
  'Benzinga',
  'MarketWatch',
  'WSJmarkets',
  'CNBCnow',
  'SquawkCNBC',
];

/**
 * Validates Twitter username format
 * Must be 1-15 characters, alphanumeric and underscores only
 */
function isValidTwitterUsername(username: string): boolean {
  const trimmed = username.trim();
  if (trimmed.length === 0 || trimmed.length > 15) {
    return false;
  }
  // Twitter usernames: alphanumeric and underscores only
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  return usernameRegex.test(trimmed);
}

export default function AccountManager({ 
  accounts, 
  onSave, 
  onClose,
  stocktwitsEnabled = false,
  onStocktwitsToggle,
}: AccountManagerProps) {
  const [localAccounts, setLocalAccounts] = useState<string[]>(accounts);
  const [newAccount, setNewAccount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [localStocktwitsEnabled, setLocalStocktwitsEnabled] = useState(stocktwitsEnabled);

  // Track changes
  useEffect(() => {
    const accountsChanged = 
      localAccounts.length !== accounts.length ||
      localAccounts.some((acc, idx) => acc !== accounts[idx]);
    const stocktwitsChanged = localStocktwitsEnabled !== stocktwitsEnabled;
    setHasChanges(accountsChanged || stocktwitsChanged);
  }, [localAccounts, accounts, localStocktwitsEnabled, stocktwitsEnabled]);

  /**
   * Adds a new account to the list
   */
  const handleAddAccount = () => {
    setError(null);
    
    // Remove @ symbol if user included it
    const cleanUsername = newAccount.trim().replace(/^@/, '');
    
    // Validate username format
    if (!isValidTwitterUsername(cleanUsername)) {
      setError('Invalid username. Must be 1-15 characters (letters, numbers, underscores only).');
      return;
    }
    
    // Check for duplicates (case-insensitive)
    if (localAccounts.some(acc => acc.toLowerCase() === cleanUsername.toLowerCase())) {
      setError('This account is already in your list.');
      return;
    }
    
    // Add account
    setLocalAccounts([...localAccounts, cleanUsername]);
    setNewAccount('');
  };

  /**
   * Removes an account from the list
   */
  const handleRemoveAccount = (accountToRemove: string) => {
    setLocalAccounts(localAccounts.filter(acc => acc !== accountToRemove));
    setError(null);
  };

  /**
   * Adds a suggested account
   */
  const handleAddSuggestion = (suggestion: string) => {
    if (!localAccounts.some(acc => acc.toLowerCase() === suggestion.toLowerCase())) {
      setLocalAccounts([...localAccounts, suggestion]);
    }
  };

  /**
   * Handles save with confirmation
   */
  const handleSave = () => {
    if (hasChanges) {
      setShowConfirmation(true);
    } else {
      onClose();
    }
  };

  /**
   * Confirms and saves changes
   */
  const handleConfirmSave = () => {
    // Save to localStorage
    try {
      localStorage.setItem('twitter_monitored_accounts', JSON.stringify(localAccounts));
      localStorage.setItem('twitter_stocktwits_enabled', JSON.stringify(localStocktwitsEnabled));
    } catch (err) {
      console.error('Failed to save to localStorage:', err);
    }
    
    onSave(localAccounts);
    if (onStocktwitsToggle) {
      onStocktwitsToggle(localStocktwitsEnabled);
    }
    setShowConfirmation(false);
    onClose();
  };

  /**
   * Cancels without saving
   */
  const handleCancel = () => {
    if (hasChanges) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to close?');
      if (confirmed) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  /**
   * Handles Enter key in input field
   */
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddAccount();
    }
  };

  // Get suggestions that aren't already added
  const availableSuggestions = DEFAULT_SUGGESTIONS.filter(
    suggestion => !localAccounts.some(acc => acc.toLowerCase() === suggestion.toLowerCase())
  );

  return (
    <>
      {/* Modal Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-3 sm:p-4"
        onClick={handleCancel}
      >
        {/* Modal Container */}
        <div
          className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
            <h2 className="text-lg sm:text-2xl font-bold text-white">Manage Accounts</h2>
            <button
              onClick={handleCancel}
              className="text-white hover:text-gray-200 active:text-gray-300 transition-colors touch-manipulation p-1"
              aria-label="Close"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {/* Add Account Section */}
            <div className="mb-4 sm:mb-6">
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                Add Twitter Account
              </label>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <div className="flex-1">
                  <input
                    type="text"
                    value={newAccount}
                    onChange={(e) => {
                      setNewAccount(e.target.value);
                      setError(null);
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter username"
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  {error && (
                    <p className="text-red-600 text-xs sm:text-sm mt-1">{error}</p>
                  )}
                </div>
                <button
                  onClick={handleAddAccount}
                  className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors font-semibold flex items-center justify-center space-x-2 touch-manipulation"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span className="text-sm sm:text-base">Add</span>
                </button>
              </div>
            </div>

            {/* Current Accounts List */}
            <div className="mb-4 sm:mb-6">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                Monitored Accounts ({localAccounts.length})
              </h3>
              {localAccounts.length === 0 ? (
                <div className="text-center py-6 sm:py-8 text-gray-500">
                  <svg
                    className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <p className="text-sm sm:text-base">No accounts added yet</p>
                  <p className="text-xs sm:text-sm mt-1">Add accounts to start monitoring</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 sm:max-h-64 overflow-y-auto">
                  {localAccounts.map((account) => (
                    <div
                      key={account}
                      className="flex items-center justify-between bg-gray-50 rounded-lg px-3 sm:px-4 py-2 sm:py-3 hover:bg-gray-100 active:bg-gray-150 transition-colors"
                    >
                      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-semibold text-xs sm:text-sm">
                            {account.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-sm sm:text-base text-gray-800 truncate">@{account}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveAccount(account)}
                        className="text-red-600 hover:text-red-800 active:text-red-900 transition-colors p-1.5 sm:p-2 touch-manipulation flex-shrink-0"
                        aria-label={`Remove ${account}`}
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Stocktwits Toggle */}
            {onStocktwitsToggle && (
              <div className="mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-gray-200">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-0.5 sm:mb-1">
                      Stocktwits Integration
                    </h3>
                    <p className="text-xs text-gray-500">
                      Show retail investor sentiment
                    </p>
                  </div>
                  <button
                    onClick={() => setLocalStocktwitsEnabled(!localStocktwitsEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors touch-manipulation flex-shrink-0 ${
                      localStocktwitsEnabled ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                    role="switch"
                    aria-checked={localStocktwitsEnabled}
                    aria-label="Toggle Stocktwits"
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        localStocktwitsEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* Suggested Accounts */}
            {availableSuggestions.length > 0 && (
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                  Suggested Accounts
                </h3>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {availableSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleAddSuggestion(suggestion)}
                      className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs sm:text-sm font-medium hover:bg-blue-100 active:bg-blue-200 transition-colors flex items-center space-x-1 touch-manipulation"
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      <span>@{suggestion}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-t border-gray-200 space-y-2 sm:space-y-0">
            <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
              {hasChanges && (
                <span className="text-orange-600 font-medium">● Unsaved changes</span>
              )}
            </div>
            <div className="flex space-x-2 sm:space-x-3">
              <button
                onClick={handleCancel}
                className="flex-1 sm:flex-none px-4 sm:px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors font-semibold text-sm sm:text-base touch-manipulation"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 sm:flex-none px-4 sm:px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 active:from-blue-800 active:to-purple-800 transition-all font-semibold shadow-md text-sm sm:text-base touch-manipulation"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Confirm Changes</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to save these changes? Your monitored accounts will be updated.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSave}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
