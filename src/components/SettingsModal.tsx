'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n, Language } from '../hooks/useI18n';
import { useTheme } from '../hooks/useTheme';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  isMobile?: boolean;
}

export default function SettingsModal({ isOpen, onClose, fontSize, onFontSizeChange, isMobile = false }: SettingsModalProps) {
  const { t, language, setLanguage } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const languages: { code: Language; label: string }[] = [
    { code: 'uz', label: 'Uzbek' },
    { code: 'ru', label: 'Русский' },
    { code: 'en', label: 'English' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`fixed ${isMobile ? 'inset-4' : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'} bg-white dark:bg-gray-800 rounded-xl shadow-xl z-50 ${isMobile ? 'w-auto' : 'w-80'} max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-700`}
          >
            <div className="p-5">
              <div className="flex items-center justify-between mb-6">
                <h2 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-gray-900 dark:text-white`}>
                  {t('settings')}
                </h2>
                <button
                  onClick={onClose}
                  className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Theme Toggle with Animated Icons */}
              <div className="mb-5">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                  {t('theme')}
                </label>
                <button
                  onClick={() => {
                    setIsRefreshing(true);
                    // Trigger theme toggle immediately
                    setTimeout(() => {
                      toggleTheme();
                    }, 0);
                  }}
                  disabled={isRefreshing}
                  className="w-full relative h-12 px-4 bg-gray-100 dark:bg-gray-700 rounded-lg transition-all duration-300 hover:bg-gray-200 dark:hover:bg-gray-600 overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="relative flex items-center justify-between h-full">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      {isRefreshing && (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-4 h-4 flex-shrink-0"
                        >
                          <svg
                            className="w-4 h-4 text-blue-500 dark:text-blue-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                        </motion.div>
                      )}
                      {isRefreshing ? t('loading') : (theme === 'light' ? t('lightMode') : t('darkMode'))}
                    </span>
                    <div className="relative w-6 h-6 flex items-center justify-center">
                      {isRefreshing ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-4 h-4"
                        >
                          <svg
                            className="w-4 h-4 text-blue-500 dark:text-blue-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                        </motion.div>
                      ) : (
                        <>
                          {/* Sun Icon */}
                          <motion.div
                            initial={false}
                            animate={{
                              opacity: theme === 'light' ? 1 : 0,
                              rotate: theme === 'light' ? 0 : 180,
                              scale: theme === 'light' ? 1 : 0,
                            }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0 flex items-center justify-center"
                          >
                            <svg
                              className="w-4 h-4 text-yellow-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                              />
                            </svg>
                          </motion.div>

                          {/* Moon Icon */}
                          <motion.div
                            initial={false}
                            animate={{
                              opacity: theme === 'dark' ? 1 : 0,
                              rotate: theme === 'dark' ? 0 : -180,
                              scale: theme === 'dark' ? 1 : 0,
                            }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0 flex items-center justify-center"
                          >
                            <svg
                              className="w-4 h-4 text-blue-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                              />
                            </svg>
                          </motion.div>
                        </>
                      )}
                    </div>
                  </div>
                </button>
              </div>

              {/* Language Toggle */}
              <div className="mb-5">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                  {t('language')}
                </label>
                <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={`flex-1 px-3 py-2 rounded-md font-medium transition-all duration-200 ${
                        language === lang.code
                          ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size Control */}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                  {t('fontSize')}
                </label>
                <div className="flex items-center justify-center gap-3 bg-gray-100 dark:bg-gray-700 rounded-lg p-2">
                  <button
                    onClick={() => onFontSizeChange(Math.max(10, fontSize - 1))}
                    className="w-9 h-9 flex items-center justify-center bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors text-lg font-medium"
                  >
                    −
                  </button>
                  <span className="text-sm text-gray-700 dark:text-gray-300 min-w-[3rem] text-center font-semibold">{fontSize}px</span>
                  <button
                    onClick={() => onFontSizeChange(Math.min(24, fontSize + 1))}
                    className="w-9 h-9 flex items-center justify-center bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors text-lg font-medium"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

