import { useState, useEffect } from 'react';
import type { AppProps } from 'next/app';
import Script from 'next/script';
import { motion, AnimatePresence } from 'framer-motion';
import { I18nProvider, useI18n } from '../contexts/I18nContext';
import GoogleAnalytics from '../components/GoogleAnalytics';
import '../styles/globals.css';

function AppContent({ Component, pageProps }: AppProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    // Check if page is refreshing after theme change
    if (typeof window !== 'undefined') {
      const wasRefreshing = sessionStorage.getItem('theme-refreshing');
      if (wasRefreshing === 'true') {
        // Set loading state immediately
        setIsRefreshing(true);
        
        // Remove flag after a short delay to ensure state is set
        setTimeout(() => {
          sessionStorage.removeItem('theme-refreshing');
        }, 100);
        
        // Hide loading after 8 seconds
        const timer = setTimeout(() => {
          setIsRefreshing(false);
        }, 3000);
        
        // Cleanup on unmount
        return () => {
          clearTimeout(timer);
        };
      } else {
        // Ensure loading is false if no refresh flag
        setIsRefreshing(false);
      }
    }
  }, []);

  return (
    <>
      <GoogleAnalytics />
      <Script
        id="theme-init"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                const stored = localStorage.getItem('editor-theme');
                if (stored === 'dark' || stored === 'light') {
                  document.documentElement.classList.remove('light', 'dark');
                  document.documentElement.classList.add(stored);
                } else {
                  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  const systemTheme = prefersDark ? 'dark' : 'light';
                  document.documentElement.classList.remove('light', 'dark');
                  document.documentElement.classList.add(systemTheme);
                }
              } catch (e) {
                document.documentElement.classList.remove('light', 'dark');
                document.documentElement.classList.add('light');
              }
            })();
          `,
        }}
      />
      <Component {...pageProps} />
      
      {/* Global Loading Overlay */}
      {isRefreshing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 z-[9999] flex items-center justify-center"
          >
            <div className="flex flex-col items-center gap-6">
              {/* Spinner */}
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-[3px] border-gray-200 dark:border-gray-700 rounded-full"></div>
                <motion.div
                  className="absolute inset-0 border-[3px] border-transparent border-t-blue-500 dark:border-t-blue-400 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
              </div>
              
              {/* Text */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-center"
              >
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">
                  {t('loading')}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('changingTheme')}
                </p>
              </motion.div>
            </div>
          </motion.div>
      )}
    </>
  );
}

export default function App(props: AppProps) {
  return (
    <I18nProvider>
      <AppContent {...props} />
    </I18nProvider>
  );
}
