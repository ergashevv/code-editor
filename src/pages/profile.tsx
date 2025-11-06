'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { animate } from 'animejs';
import { useI18n } from '../hooks/useI18n';
import AnimatedProgressBar from '../components/AnimatedProgressBar';
import AnimatedCounter from '../components/AnimatedCounter';
import AnimatedBadge from '../components/AnimatedBadge';
import AnimatedCard from '../components/AnimatedCard';
import AnimatedButton from '../components/AnimatedButton';
import EditProfileModal from '../components/EditProfileModal';
import { isAuthenticated, ensureAuthenticated, getToken, getUser } from '../lib/api';
import Navbar from '../components/Navbar';
import { showToast } from '../components/Toast';

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
  const [showEditModal, setShowEditModal] = useState(false);
  const headerRef = useRef<HTMLHeadingElement>(null);
  const statsCardRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

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

  // Anime.js animations for profile page
  useEffect(() => {
    if (loading || !userProgress) return;

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

    // Stats card animation
    if (statsCardRef.current) {
      animate(
        statsCardRef.current,
        {
          opacity: [0, 1],
          translateY: [30, 0],
          scale: [0.9, 1],
          duration: 700,
          delay: 200,
          easing: 'easeOutExpo',
        }
      );
    }

    // XP progress bar animation
    if (progressBarRef.current) {
      const progressBar = progressBarRef.current.querySelector('.progress-bar-fill') as HTMLElement;
      if (progressBar) {
        const currentXp = userProgress?.totalXp || 0;
        const currentLevel = userProgress?.level || 1;
        const progress = getXpProgress(currentXp, currentLevel);
        const widthObj = { width: 0 };
        animate(
          widthObj,
          {
            width: progress,
            duration: 1500,
            delay: 500,
            easing: 'easeOutExpo',
            onRender: () => {
              progressBar.style.width = `${widthObj.width}%`;
            }
          }
        );
      }
    }

    // Number counting animation for XP
    setTimeout(() => {
      const xpElement = document.querySelector('.xp-count');
      if (xpElement) {
        const currentXp = userProgress?.totalXp || 0;
        const targetXp = currentXp;
        const startXp = 0;
        const duration = 2000;
        const startTime = Date.now();
        
        const updateXp = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easeOutExpo = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
          const currentXpValue = Math.floor(startXp + (targetXp - startXp) * easeOutExpo);
          xpElement.textContent = `${currentXpValue.toLocaleString()} XP`;
          
          if (progress < 1) {
            requestAnimationFrame(updateXp);
          }
        };
        
        requestAnimationFrame(updateXp);
      }
    }, 600);

    // Lesson progress cards stagger animation
    setTimeout(() => {
      const lessonCards = document.querySelectorAll('.lesson-progress-card');
      animate(
        lessonCards,
        {
          opacity: [0, 1],
          translateX: [-30, 0],
          scale: [0.95, 1],
          duration: 500,
          delay: (el: any, i: number) => i * 100,
          easing: 'easeOutExpo',
        }
      );
    }, 800);

    // Lesson cards hover animations
    setTimeout(() => {
      const lessonCards = document.querySelectorAll('.lesson-progress-card');
      lessonCards.forEach((card) => {
        card.addEventListener('mouseenter', () => {
          animate(
            card,
            {
              scale: [1, 1.02],
              translateX: [0, 5],
              duration: 300,
              easing: 'easeOutExpo',
            }
          );
        });
        
        card.addEventListener('mouseleave', () => {
          animate(
            card,
            {
              scale: [1.02, 1],
              translateX: [5, 0],
              duration: 300,
              easing: 'easeOutExpo',
            }
          );
        });
      });
    }, 1200);
  }, [loading, userProgress]);

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
          <h1 ref={headerRef} className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            My Progress
          </h1>

          {/* User Stats */}
          <AnimatedCard className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6" delay={0}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {user?.username || 'User'}
                  </h2>
                  <AnimatedButton
                    variant="secondary"
                    onClick={() => setShowEditModal(true)}
                    className="px-3 py-1 text-sm"
                  >
                    ✏️ Edit
                  </AnimatedButton>
                </div>
                {user?.phone && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    📱 {user.phone}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Level</span>
                  <AnimatedBadge variant="primary">
                    {currentLevel}
                  </AnimatedBadge>
                </div>
              </div>
              <div className="text-right">
                <AnimatedCounter
                  value={currentXp}
                  suffix=" XP"
                  className="text-2xl font-bold text-blue-600 dark:text-blue-400"
                />
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {xpForNextLevel - currentXp} XP to next level
                </div>
              </div>
            </div>

            {/* XP Progress Bar */}
            <AnimatedProgressBar
              value={xpProgress}
              color="blue"
              showLabel={false}
              height="md"
            />
          </AnimatedCard>

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
                {userProgress.progress.map((item, index) => (
                  <AnimatedCard
                    key={item._id}
                    delay={index * 100}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    onClick={() => router.push(`/learn/${item.lessonId.slug}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                          {item.lessonId.title}
                        </h3>
                        <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
                          <div className="flex items-center gap-1">
                            Trains: <AnimatedBadge variant="info">{item.trainsCompleted.length}</AnimatedBadge>
                          </div>
                          <div className="flex items-center gap-1">
                            Homework: {item.homeworkSubmitted ? (
                              <AnimatedBadge variant="success">✓ Completed</AnimatedBadge>
                            ) : (
                              <AnimatedBadge variant="warning">✗ Not submitted</AnimatedBadge>
                            )}
                          </div>
                          {item.xpEarned > 0 && (
                            <AnimatedBadge variant="success">
                              +<AnimatedCounter value={item.xpEarned} suffix=" XP" />
                            </AnimatedBadge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {item.homeworkSubmitted && item.trainsCompleted.length > 0 && (
                          <AnimatedBadge variant="success">
                            ✓ Complete
                          </AnimatedBadge>
                        )}
                      </div>
                    </div>
                  </AnimatedCard>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        user={{
          username: user?.username || '',
          phone: user?.phone || '',
        }}
        onSave={async (data) => {
          const token = getToken();
          if (!token) {
            throw new Error('Not authenticated');
          }

          const response = await fetch('/api/me/update', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(data),
          });

          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.error || 'Failed to update profile');
          }

          // Update local user state
          const updatedUser = getUser();
          if (updatedUser) {
            setUser({
              ...updatedUser,
              username: result.user.username,
              phone: result.user.phone,
            });
          }

          showToast('Profile updated successfully!', 'success');
        }}
      />
    </>
  );
}

