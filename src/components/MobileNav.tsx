'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '../hooks/useI18n';
import { getUser, logout } from '../lib/api';
import LanguageToggle from './LanguageToggle';

export default function MobileNav() {
  const router = useRouter();
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  const navItems = [
    { path: '/home', labelKey: 'dashboard', icon: '🏠' },
    { path: '/learn', labelKey: 'learn', icon: '📚' },
    { path: '/editor', labelKey: 'editor', icon: '💻' },
    { path: '/leaderboard', labelKey: 'leaderboard', icon: '🏆' },
    { path: '/competitions', labelKey: 'competitions', icon: '🏆' },
    ...(user?.role === 'ADMIN' ? [{ path: '/admin', labelKey: 'admin', icon: '🔐' }] : []),
  ];

  const handleNavClick = (path: string) => {
    router.push(path);
    setIsOpen(false);
  };

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors touch-manipulation"
        aria-label="Toggle menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />
            
            {/* Menu Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white dark:bg-gray-900 z-50 shadow-2xl overflow-y-auto"
            >
              <div className="p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {t('menu') || 'Menu'}
                  </h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Navigation Items */}
                <nav className="space-y-2 mb-6">
                  {navItems.map((item) => {
                    const isActive = router.pathname === item.path;
                    return (
                      <button
                        key={item.path}
                        onClick={() => handleNavClick(item.path)}
                        className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl text-left transition-all touch-manipulation ${
                          isActive
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700'
                        }`}
                      >
                        <span className="text-2xl">{item.icon}</span>
                        <span className="text-lg font-semibold">{t(item.labelKey) || item.labelKey}</span>
                      </button>
                    );
                  })}
                </nav>

                {/* Language Toggle */}
                <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <LanguageToggle isMobile={true} />
                </div>

                {/* Logout Button */}
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-4 px-4 py-4 rounded-xl text-left transition-all touch-manipulation bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 active:bg-red-200 dark:active:bg-red-900/40"
                >
                  <span className="text-2xl">🚪</span>
                  <span className="text-lg font-semibold">{t('logout') || 'Logout'}</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

