'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useI18n } from '../hooks/useI18n';
import { isAuthenticated, ensureAuthenticated, getToken, getUser } from '../lib/api';
import { getCachedLessons, setCachedLessons } from '../lib/lessonsCache';
import { getLocalizedLessonContent } from '../lib/lessonContent';
import Navbar from '../components/Navbar';

interface Lesson {
  _id: string;
  slug: string;
  title: string;
  summary: string;
  unlockAt: string;
  order: number;
  isUnlocked?: boolean;
  locked?: boolean;
  trains?: Array<{ id: string; title: string }>;
  homework?: { id: string; title: string };
}

export async function getServerSideProps() {
  return {
    props: {},
  };
}

export default function LearnPage() {
  const router = useRouter();
  const { t, language } = useI18n();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [originalLessons, setOriginalLessons] = useState<Lesson[]>([]); // Store original (non-localized) lessons
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (router.isReady) {
        if (!isAuthenticated()) {
          router.push('/auth');
          return;
        }

        const isValid = await ensureAuthenticated();
        if (!isValid) {
          router.push('/auth');
          return;
        }

        fetchLessons();
      }
    };

    checkAuth();
  }, [router]);

  // Re-localize lessons when language changes
  useEffect(() => {
    if (originalLessons.length > 0) {
      const localizedLessons = originalLessons.map((lesson: any) => 
        getLocalizedLessonContent(lesson, language || 'en')
      );
      setLessons(localizedLessons);
    }
  }, [language, originalLessons]);

  const fetchLessons = async () => {
    try {
      const user = getUser();
      const userId = user?.id;
      
      // Fetch from API
      const token = getToken();
      const response = await fetch('/api/lessons', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const lessons = data.lessons || [];
        const serverLastUpdated = data.lastUpdated;
        
        // Always check cache with serverLastUpdated for proper invalidation
        // Cache will be invalidated if serverLastUpdated is different
        const cached = getCachedLessons(userId, serverLastUpdated);
        
        // Use cached lessons only if cache is valid and serverLastUpdated matches
        // Otherwise, always use fresh lessons from server
        const sourceLessons = cached || lessons;
        
        // Store original (non-localized) lessons for re-localization
        setOriginalLessons(sourceLessons);
        
        // Localize lessons with current language
        const localizedLessons = sourceLessons.map((lesson: any) => 
          getLocalizedLessonContent(lesson, language || 'en')
        );
        setLessons(localizedLessons);
        
        // Always update cache with fresh data and latest serverLastUpdated
        // This ensures cache is always up-to-date with server's lastUpdated
        // Even if we used cached data, we update cache with latest serverLastUpdated
        setCachedLessons(lessons, userId, serverLastUpdated);
      }
    } catch (error) {
      console.error('Error fetching lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeUntilUnlock = (dateString: string) => {
    const now = new Date();
    const unlock = new Date(dateString);
    const diff = unlock.getTime() - now.getTime();

    if (diff <= 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const unlockedLessons = lessons.filter(l => l.isUnlocked && !l.locked);
  const lockedLessons = lessons.filter(l => l.locked || !l.isUnlocked);

  return (
    <>
      <Head>
        <title>{t('lessons')} - {t('appName')}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <Navbar isMobile={false} />
        
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 max-w-6xl">
          {/* Header - Katta va tushunarli */}
          <div className="mb-6 sm:mb-8">
            <button
              onClick={() => {
                if (window.history.length > 1) {
                  router.back();
                } else {
                  router.push('/home');
                }
              }}
              className="px-4 py-3 sm:py-2 text-base sm:text-lg text-blue-600 dark:text-blue-400 active:text-blue-700 dark:active:text-blue-300 mb-4 sm:mb-6 flex items-center gap-2 font-bold active:bg-blue-50 dark:active:bg-blue-900/20 rounded-lg min-h-[48px] touch-manipulation"
            >
              ← {t('back') || 'Back'}
            </button>
          </div>
          <div className="text-center mb-8 sm:mb-10">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
              📚 {t('lessons')}
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              {t('lessonsDescription')}
            </p>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📚</div>
              <div className="text-xl sm:text-2xl text-gray-600 dark:text-gray-400">{t('loading')}</div>
            </div>
          ) : lessons.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📚</div>
              <div className="text-xl sm:text-2xl text-gray-600 dark:text-gray-400 mb-6">{t('noLessonsAvailable')}</div>
            </div>
          ) : (
            <>
              {/* Available Lessons - Katta va tushunarli */}
              {unlockedLessons.length > 0 && (
                <div className="mb-10 sm:mb-12">
                  <div className="flex items-center justify-center gap-3 mb-6 sm:mb-8">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-500 rounded-full flex items-center justify-center text-2xl sm:text-3xl">
                      ✓
                    </div>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                      {t('availableLessons')}
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                    {unlockedLessons.map((lesson) => (
                      <div
                        key={lesson._id}
                        className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 sm:p-8 active:shadow-2xl transition-all cursor-pointer border-4 border-green-400 dark:border-green-500 active:border-green-500 dark:active:border-green-400 active:scale-95 touch-manipulation"
                        onClick={() => router.push(`/learn/${lesson.slug}`)}
                      >
                        <div className="mb-4">
                          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                            {lesson.title}
                          </h3>
                          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
                            {lesson.summary}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-6">
                          {lesson.trains && lesson.trains.length > 0 && (
                            <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-xl text-sm sm:text-base font-bold">
                              {lesson.trains.length} {t('practice')}
                            </span>
                          )}
                          {lesson.homework && (
                            <span className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-xl text-sm sm:text-base font-bold">
                              {t('homework')}
                            </span>
                          )}
                        </div>

                        <button className="w-full py-5 sm:py-5 bg-gradient-to-r from-green-500 to-emerald-500 active:from-green-600 active:to-emerald-600 text-white rounded-xl font-bold text-lg sm:text-xl transition-all shadow-lg active:shadow-xl active:scale-95 touch-manipulation min-h-[56px]">
                          {t('startLesson')} →
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Locked Lessons - Katta va tushunarli */}
              {lockedLessons.length > 0 && (
                <div>
                  <div className="flex items-center justify-center gap-3 mb-6 sm:mb-8">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-400 rounded-full flex items-center justify-center text-2xl sm:text-3xl">
                      🔒
                    </div>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                      {t('lockedLessons')}
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                    {lockedLessons.map((lesson) => {
                      const timeUntil = getTimeUntilUnlock(lesson.unlockAt);
                      return (
                        <div
                          key={lesson._id}
                          className="bg-gray-100 dark:bg-gray-800 rounded-3xl shadow-md p-6 sm:p-8 opacity-70 cursor-not-allowed border-4 border-gray-300 dark:border-gray-600"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-600 dark:text-gray-400 flex-1">
                              {lesson.title}
                            </h3>
                            <span className="text-3xl sm:text-4xl flex-shrink-0 ml-2">
                              🔒
                            </span>
                          </div>

                          <p className="text-base sm:text-lg text-gray-500 dark:text-gray-500 line-clamp-3 mb-4">
                            {lesson.summary}
                          </p>

                          {timeUntil && (
                            <div className="text-base sm:text-lg text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-xl text-center">
                              {t('unlockAt')}: {timeUntil}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
