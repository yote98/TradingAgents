'use client';

import { useState } from 'react';

interface Shortcut {
  keys: string;
  description: string;
}

const shortcuts: Shortcut[] = [
  { keys: 'Alt + 1', description: 'Navigate to Home' },
  { keys: 'Alt + 2', description: 'Navigate to Coaches' },
  { keys: 'Alt + 3', description: 'Navigate to Social' },
  { keys: 'Alt + 4', description: 'Navigate to Analyze' },
  { keys: 'Alt + 5', description: 'Navigate to Backtest' },
  { keys: 'Alt + 6', description: 'Navigate to Risk' },
  { keys: 'Alt + 7', description: 'Navigate to Settings' },
  { keys: 'Tab', description: 'Navigate through sidebar items' },
  { keys: 'Enter', description: 'Activate focused item' },
  { keys: 'Escape', description: 'Close mobile sidebar' },
];

/**
 * Keyboard shortcuts help tooltip component
 * Displays available keyboard shortcuts on hover/focus
 */
export default function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Help button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        className="p-2 rounded-lg hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-label="Show keyboard shortcuts"
        aria-expanded={isOpen}
        type="button"
      >
        <span className="text-xl" aria-hidden="true">⌨️</span>
      </button>

      {/* Tooltip */}
      {isOpen && (
        <div
          className="absolute bottom-full left-0 mb-2 w-72 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 p-4"
          role="tooltip"
          aria-live="polite"
        >
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center">
            <span className="mr-2" aria-hidden="true">⌨️</span>
            Keyboard Shortcuts
          </h3>
          <div className="space-y-2">
            {shortcuts.map((shortcut, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-xs"
              >
                <span className="text-gray-300">{shortcut.description}</span>
                <kbd className="px-2 py-1 bg-slate-700 text-white rounded border border-slate-600 font-mono text-xs">
                  {shortcut.keys}
                </kbd>
              </div>
            ))}
          </div>
          {/* Arrow pointer */}
          <div
            className="absolute top-full left-4 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-slate-800"
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  );
}
