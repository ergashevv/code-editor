'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { animate } from 'animejs';
import { useI18n } from '../hooks/useI18n';
import { isAuthenticated, getToken } from '../lib/api';
import { showToast } from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';
import LazyLoadWrapper from '../components/LazyLoadWrapper';
import { SkeletonCard } from '../components/SkeletonLoader';

// Disable static optimization
export async function getServerSideProps() {
  return {
    props: {},
  };
}

export default function CompetitionsPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [competitions, setCompetitions] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const headerRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const checkAuth = async () => {
      if (router.isReady) {
        if (!isAuthenticated()) {
          router.push('/login');
          return;
        }

        fetchCompetitions();
      }
    };

    checkAuth();
  }, [router, mounted]);

  const fetchCompetitions = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch('/api/competitions', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCompetitions(data.competitions || []);
      } else {
        console.error('Failed to fetch competitions');
        showToast('Failed to load competitions', 'error');
      }
    } catch (error) {
      console.error('Error fetching competitions:', error);
      showToast('Error loading competitions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/home');
    }
  };

  const getLocalizedTitle = (comp: any) => {
    if (typeof window === 'undefined') return comp.title || comp.title_en;
    const lang = localStorage.getItem('language') || 'en';
    if (lang === 'uz' && comp.title_uz) return comp.title_uz;
    if (lang === 'ru' && comp.title_ru) return comp.title_ru;
    return comp.title || comp.title_en;
  };

  const getLocalizedDescription = (comp: any) => {
    if (typeof window === 'undefined') return comp.description || comp.description_en;
    const lang = localStorage.getItem('language') || 'en';
    if (lang === 'uz' && comp.description_uz) return comp.description_uz;
    if (lang === 'ru' && comp.description_ru) return comp.description_ru;
    return comp.description || comp.description_en;
  };

  // Anime.js animations for competitions page
  useEffect(() => {
    if (loading || !mounted) return;

    // Header animation
    if (headerRef.current) {
      animate(
        headerRef.current,
        {
          opacity: [0, 1],
          translateY: [20, 0],
          scale: [0.95, 1],
          duration: 600,
          easing: 'easeOutExpo',
        }
      );
    }

    // Competition cards hover animations
    setTimeout(() => {
      const compCards = document.querySelectorAll('.competition-card-animate');
      compCards.forEach((card) => {
        card.addEventListener('mouseenter', () => {
          animate(
            card,
            {
              scale: [1, 1.05],
              translateY: [0, -8],
              rotateZ: [0, 1],
              duration: 400,
              easing: 'easeOutExpo',
            }
          );
        });
        
        card.addEventListener('mouseleave', () => {
          animate(
            card,
            {
              scale: [1.05, 1],
              translateY: [-8, 0],
              rotateZ: [1, 0],
              duration: 400,
              easing: 'easeOutExpo',
            }
          );
        });
      });
    }, 500);

    // Section headers animation
    setTimeout(() => {
      const sectionHeaders = document.querySelectorAll('.section-header-animate');
      animate(
        sectionHeaders,
        {
          opacity: [0, 1],
          translateX: [-30, 0],
          scale: [0.9, 1],
          duration: 600,
          delay: (el: any, i: number) => i * 200,
          easing: 'easeOutExpo',
        }
      );
    }, 200);
  }, [loading, mounted, competitions]);

  if (!mounted || loading) {
    return (
      <LoadingSpinner 
        fullScreen 
        size="lg" 
        text={t('loading') || 'Loading...'} 
      />
    );
  }

  const unlockedCompetitions = competitions.filter((c: any) => c.isUnlocked);
  const lockedCompetitions = competitions.filter((c: any) => !c.isUnlocked);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={handleBack}
            className="mb-4 px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all shadow-sm font-medium flex items-center gap-2"
          >
            ← {t('back') || 'Back'}
          </button>
          <h1 ref={headerRef} className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-2">
            🏆 {t('competitions') || 'Competitions'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('competitionsDescription') || 'Participate in coding competitions and test your skills!'}
          </p>
        </div>

        {/* Unlocked Competitions */}
        {unlockedCompetitions.length > 0 && (
          <div className="mb-8">
            <h2 className="section-header-animate text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t('availableCompetitions') || 'Available Competitions'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {unlockedCompetitions.map((comp, index) => (
                <LazyLoadWrapper
                  key={comp._id}
                  delay={index * 0.1}
                  animationType="slideUp"
                >
                  <motion.div
                    className="competition-card-animate bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 border-green-200 dark:border-green-800 hover:shadow-xl transition-all"
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">🏆</span>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {getLocalizedTitle(comp)}
                    </h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {getLocalizedDescription(comp)}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg text-xs font-bold">
                      ✅ {t('active') || 'Active'}
                    </span>
                    <motion.button
                      onClick={() => router.push(`/competitions/${comp._id}`)}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 font-medium transition-all shadow-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {t('participate') || 'Participate'}
                    </motion.button>
                  </div>
                </motion.div>
                </LazyLoadWrapper>
              ))}
            </div>
          </div>
        )}

        {/* Locked Competitions */}
        {lockedCompetitions.length > 0 && (
          <div>
            <h2 className="section-header-animate text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t('upcomingCompetitions') || 'Upcoming Competitions'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {lockedCompetitions.map((comp, index) => {
                const unlockDate = new Date(comp.unlockAt);
                const now = new Date();
                const timeUntilUnlock = unlockDate.getTime() - now.getTime();
                const daysUntil = Math.floor(timeUntilUnlock / (1000 * 60 * 60 * 24));
                const hoursUntil = Math.floor((timeUntilUnlock % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutesUntil = Math.floor((timeUntilUnlock % (1000 * 60 * 60)) / (1000 * 60));

                return (
                  <LazyLoadWrapper
                    key={comp._id}
                    delay={index * 0.1}
                    animationType="fade"
                  >
                    <motion.div
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 border-yellow-200 dark:border-yellow-800 opacity-75"
                      whileHover={{ opacity: 1, scale: 1.02 }}
                    >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">🔒</span>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {getLocalizedTitle(comp)}
                      </h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {getLocalizedDescription(comp)}
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg text-xs font-bold">
                          🔒 {t('locked') || 'Locked'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        📅 {t('unlocksAt') || 'Unlocks at'}: {unlockDate.toLocaleString()}
                      </p>
                      {timeUntilUnlock > 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          ⏰ {daysUntil > 0 && `${daysUntil}d `}
                          {hoursUntil > 0 && `${hoursUntil}h `}
                          {minutesUntil > 0 && `${minutesUntil}m`} {t('untilUnlock') || 'until unlock'}
                        </p>
                      )}
                    </div>
                  </motion.div>
                  </LazyLoadWrapper>
                );
              })}
            </div>
          </div>
        )}

        {/* No Competitions */}
        {competitions.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t('noCompetitions') || 'No Competitions Available'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t('noCompetitionsDescription') || 'Check back later for new competitions!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

