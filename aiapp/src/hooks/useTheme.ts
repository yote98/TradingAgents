'use client';

import { useState, useEffect } from 'react';
import { loadTheme, saveTheme, applyTheme } from '@/lib/storage';

/**
 * Hook for managing theme state
 * @returns Current theme and setter function
 */
export function useTheme() {
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  // Load theme on mount
  useEffect(() => {
    const savedTheme = loadTheme();
    setThemeState(savedTheme);
    applyTheme(savedTheme);
    setMounted(true);
  }, []);

  // Update theme
  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    applyTheme(newTheme);
    saveTheme(newTheme);
  };

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  return {
    theme,
    setTheme,
    toggleTheme,
    mounted, // Use this to prevent flash of wrong theme
  };
}
