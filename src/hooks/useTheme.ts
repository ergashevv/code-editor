// Theme hook for dark/light mode

import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark';

// Apply theme immediately to prevent flash (only on client)
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  try {
    const stored = window.localStorage.getItem('editor-theme');
    if (stored === 'dark' || stored === 'light') {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(stored);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const systemTheme = prefersDark ? 'dark' : 'light';
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(systemTheme);
    }
  } catch (error) {
    // Default to light if error
    if (document.documentElement) {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add('light');
    }
  }
}

export function useTheme() {
  const getInitialTheme = (): Theme => {
    if (typeof window === 'undefined') return 'light';
    try {
      const stored = window.localStorage.getItem('editor-theme');
      if (stored === 'dark' || stored === 'light') {
        return stored;
      }
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? 'dark' : 'light';
    } catch (error) {
      return 'light';
    }
  };

  const [theme, setThemeState] = useState<Theme>(getInitialTheme);
  const [mounted, setMounted] = useState(false);

  const applyTheme = (newTheme: Theme) => {
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(newTheme);
    }
  };

  useEffect(() => {
    setMounted(true);
    // Ensure theme is applied on mount
    applyTheme(theme);
    
    // Also check localStorage and apply immediately
    if (typeof window !== 'undefined') {
      try {
        const stored = window.localStorage.getItem('editor-theme');
        if (stored === 'dark' || stored === 'light') {
          const storedTheme = stored as Theme;
          if (storedTheme !== theme) {
            setThemeState(storedTheme);
            applyTheme(storedTheme);
          }
        }
      } catch (error) {
        console.error('Error reading theme on mount:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      try {
        window.localStorage.setItem('editor-theme', theme);
        applyTheme(theme);
      } catch (error) {
        console.error('Error saving theme to localStorage:', error);
      }
    }
  }, [theme, mounted]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState(prev => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      applyTheme(newTheme);
      
      // Smooth refresh
      if (typeof window !== 'undefined') {
        // Mark that we're refreshing for theme change
        sessionStorage.setItem('theme-refreshing', 'true');
        
        // Smooth fade-out
        document.documentElement.style.transition = 'opacity 0.15s ease-out';
        document.documentElement.style.opacity = '0';
        
        // Reload after fade
        setTimeout(() => {
          window.location.reload();
        }, 150);
      }
      
      return newTheme;
    });
  };

  return { theme, setTheme, toggleTheme, mounted };
}

