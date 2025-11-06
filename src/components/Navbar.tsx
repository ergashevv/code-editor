'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { animate } from 'animejs';
import { useI18n } from '../hooks/useI18n';
import { logout, getUser } from '../lib/api';
import LanguageToggle from './LanguageToggle';
import MobileNav from './MobileNav';

interface NavbarProps {
  onClear?: () => void;
  onSettings?: () => void;
  isMobile?: boolean;
}

export default function Navbar({ 
  onClear, 
  onSettings,
  isMobile = false 
}: NavbarProps) {
  const router = useRouter();
  const { t } = useI18n();
  const [user, setUser] = useState<{ id: string; username: string; phone: string } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setMounted(true);
    setUser(getUser());
    
    // Detect mobile device
    const checkMobile = () => {
      setIsMobileDevice(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Anime.js animations for navbar
  useEffect(() => {
    if (!mounted) return;

    // Navbar slide-in animation
    if (navRef.current) {
      animate(
        navRef.current,
        {
          translateY: [-20, 0],
          opacity: [0, 1],
          duration: 600,
          easing: 'easeOutExpo',
        }
      );
    }

    // Nav buttons hover animations
    setTimeout(() => {
      const navButtons = navRef.current?.querySelectorAll('button');
      if (navButtons) {
        navButtons.forEach((button) => {
          button.addEventListener('mouseenter', () => {
            animate(
              button,
              {
                scale: [1, 1.05],
                translateY: [0, -2],
                duration: 200,
                easing: 'easeOutExpo',
              }
            );
          });
          
          button.addEventListener('mouseleave', () => {
            animate(
              button,
              {
                scale: [1.05, 1],
                translateY: [-2, 0],
                duration: 200,
                easing: 'easeOutExpo',
              }
            );
          });
        });
      }
    }, 300);
  }, [mounted]);

  return (
    <motion.nav
      ref={navRef}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 shrink-0`}
    >
      <div className={`flex items-center justify-between gap-2 sm:gap-4 max-w-7xl mx-auto`}>
        {/* Left side - Username & Navigation */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          {/* Mobile: Hamburger Menu */}
          {!onSettings && !onClear && isMobileDevice && (
            <MobileNav />
          )}
          
          {user && (
            <span className="text-xs sm:text-sm md:text-base font-medium text-gray-900 dark:text-white truncate">
              {user.username}
            </span>
          )}
          
          {/* Desktop: Normal Navigation */}
          {!onSettings && !onClear && !isMobileDevice && (
            <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-hide flex-1 md:flex-none">
              <button
                onClick={() => router.push('/home')}
                className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors whitespace-nowrap flex-shrink-0"
              >
                {t('dashboard') || 'Dashboard'}
              </button>
              <button
                onClick={() => router.push('/learn')}
                className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors whitespace-nowrap flex-shrink-0"
              >
                {t('learn') || 'Learn'}
              </button>
              <button
                onClick={() => router.push('/editor')}
                className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors whitespace-nowrap flex-shrink-0"
              >
                {t('codeEditor') || 'Editor'}
              </button>
              <button
                onClick={() => router.push('/leaderboard')}
                className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors whitespace-nowrap flex-shrink-0"
              >
                {t('leaderboard') || 'Leaderboard'}
              </button>
              <button
                onClick={() => router.push('/competitions')}
                className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors whitespace-nowrap flex-shrink-0"
              >
                🏆 {t('competitions') || 'Competitions'}
              </button>
              {user && (user as any).role === 'ADMIN' && (
                <button
                  onClick={() => router.push('/admin')}
                  className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors font-semibold whitespace-nowrap flex-shrink-0"
                >
                  🔐 {t('admin') || 'Admin'}
                </button>
              )}
            </div>
          )}
        </div>
        
        {/* Actions - Right side */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Language Toggle - Faqat desktop uchun (mobile'da hamburger menu ichida) */}
          {!isMobileDevice && (
            <LanguageToggle isMobile={false} />
          )}
          
          {/* Mobile: Logout button in navbar */}
          {isMobileDevice && (
            <button
              onClick={logout}
              className="p-2.5 text-red-500 dark:text-red-400 active:bg-red-50 dark:active:bg-red-900/20 rounded-lg transition-colors touch-manipulation"
              title="Logout"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          )}
          
          {/* Desktop: All buttons */}
          {!isMobileDevice && (
            <>
          
          {onSettings && (
            <button
              onClick={onSettings}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title={t('settings')}
            >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          )}
          
          {onClear && (
            <button
              onClick={onClear}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title={t('clear')}
            >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          )}

              <button
                onClick={logout}
                className="p-2 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Logout"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
}

