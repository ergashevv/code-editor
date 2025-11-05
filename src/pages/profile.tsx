'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useI18n } from '../hooks/useI18n';
import { isAuthenticated, ensureAuthenticated, getToken, getUser } from '../lib/api';
import Navbar from '../components/Navbar';

interface Progress {
  _id: string;
  lessonId: {
    _id: string;
    slug: string;
    title: string;
  };
  trainsCompleted: string[];
  homeworkSubmitted: boolean;
  xpEarned: number;
}

interface UserProgress {
  progress: Progress[];
  totalXp: number;
  level: number;
}

export async function getServerSideProps() {
  return {
    props: {},
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const { t } = useI18n();
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

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

        const userData = getUser();
        setUser(userData);

        fetchProgress();
      }
    };

    checkAuth();
  }, [router]);

  const fetchProgress = async () => {
    try {
      const token = getToken();
      const response = await fetch('/api/me/progress', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserProgress(data);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const getXpForNextLevel = (currentLevel: number) => {
    return currentLevel * 100;
  };

  const getXpProgress = (currentXp: number, currentLevel: number) => {
    const xpForCurrentLevel = (currentLevel - 1) * 100;
    const xpForNextLevel = currentLevel * 100;
    const xpInCurrentLevel = currentXp - xpForCurrentLevel;
    const xpNeeded = xpForNextLevel - xpForCurrentLevel;
    return Math.min((xpInCurrentLevel / xpNeeded) * 100, 100);
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>Loading... - {t('appName')}</title>
        </Head>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-gray-600 dark:text-gray-400">Loading profile...</div>
        </div>
      </>
    );
  }

  const currentXp = userProgress?.totalXp || 0;
  const currentLevel = userProgress?.level || 1;
  const xpProgress = getXpProgress(currentXp, currentLevel);
  const xpForNextLevel = getXpForNextLevel(currentLevel);

  return (
    <>
      <Head>
        <title>Profile - {t('appName')}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar isMobile={false} />

        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            My Progress
          </h1>

          {/* User Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {user?.username || 'User'}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Level {currentLevel}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {currentXp.toLocaleString()} XP
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {xpForNextLevel - currentXp} XP to next level
                </div>
              </div>
            </div>

            {/* XP Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
              <div
                className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
          </div>

          {/* Lesson Progress */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Lesson Progress
            </h2>

            {!userProgress || userProgress.progress.length === 0 ? (
              <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                No progress yet. Start learning from the{' '}
                <button
                  onClick={() => router.push('/learn')}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  lessons page
                </button>
                .
              </div>
            ) : (
              <div className="space-y-4">
                {userProgress.progress.map((item) => (
                  <div
                    key={item._id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    onClick={() => router.push(`/learn/${item.lessonId.slug}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                          {item.lessonId.title}
                        </h3>
                        <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div>
                            Trains: {item.trainsCompleted.length}
                          </div>
                          <div>
                            Homework: {item.homeworkSubmitted ? '✓ Completed' : '✗ Not submitted'}
                          </div>
                          {item.xpEarned > 0 && (
                            <div className="text-green-600 dark:text-green-400">
                              +{item.xpEarned} XP
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {item.homeworkSubmitted && item.trainsCompleted.length > 0 && (
                          <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded">
                            ✓ Complete
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

