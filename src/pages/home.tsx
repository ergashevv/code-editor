'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
// Import animate, Timeline, utils, and easings from animejs v4
import { animate, createTimeline, utils } from 'animejs';
import { useI18n } from '../hooks/useI18n';
import { isAuthenticated, ensureAuthenticated, getToken, getUser } from '../lib/api';
import { getCachedLessons, setCachedLessons } from '../lib/lessonsCache';
import { getLocalizedLessonContent } from '../lib/lessonContent';
import { getLevelColor, getRankColor } from '../lib/levelColors';
import { getXpProgress, getXpForLevel, getXpNeededForNextLevel } from '../lib/levelUtils';
import { formatNumber } from '../lib/formatNumber';
import Navbar from '../components/Navbar';
import AnimatedCard from '../components/AnimatedCard';
import AnimatedCounter from '../components/AnimatedCounter';
import AnimatedBadge from '../components/AnimatedBadge';
import AnimatedProgressBar from '../components/AnimatedProgressBar';
import AnimatedTooltip from '../components/AnimatedTooltip';
import AnimatedButton from '../components/AnimatedButton';

interface Lesson {
  _id: string;
  slug: string;
  title: string;
  summary: string;
  unlockAt: string;
  isUnlocked?: boolean;
  locked?: boolean;
  trains?: Array<{ id: string; title: string }>;
  homework?: { id: string; title: string };
}

interface LeaderboardItem {
  userId: string;
  username: string;
  level: number;
  xp: number;
  rank: number;
}

export async function getServerSideProps() {
  return {
    props: {},
  };
}

export default function HomePage() {
  const router = useRouter();
  const { t, language } = useI18n();
  const [userLevel, setUserLevel] = useState(1);
  const [userXp, setUserXp] = useState(0);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [originalLessons, setOriginalLessons] = useState<Lesson[]>([]); // Store original (non-localized) lessons
  const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const welcomeCardRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const hasAnimatedRef = useRef(false);

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
        fetchDashboardData();
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

  const fetchDashboardData = async () => {
    try {
      const token = getToken();
      
      // Fetch user progress
      const progressRes = await fetch('/api/me/progress', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (progressRes.ok) {
        const progressData = await progressRes.json();
        setUserLevel(progressData.level || 1);
        setUserXp(progressData.totalXp || 0);
      }

      // Fetch lessons (with cache)
      const user = getUser();
      const userId = user?.id;
      
      const lessonsRes = await fetch('/api/lessons', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (lessonsRes.ok) {
        const lessonsData = await lessonsRes.json();
        const lessons = lessonsData.lessons || [];
        const serverLastUpdated = lessonsData.lastUpdated;
        
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

      // Fetch leaderboard
      const leaderboardRes = await fetch('/api/leaderboard/global');
      if (leaderboardRes.ok) {
        const leaderboardData = await leaderboardRes.json();
        const items = leaderboardData.items || [];
        setGlobalLeaderboard(items.slice(0, 5));
        
        const user = getUser();
        if (user) {
          const userItem = items.find((item: LeaderboardItem) => item.userId === user.id);
          if (userItem) {
            setUserRank(userItem.rank);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };


  const getRankSuffix = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const unlockedLessons = lessons.filter(l => l.isUnlocked && !l.locked);
  const lockedLessons = lessons.filter(l => l.locked || !l.isUnlocked);
  const xpProgress = getXpProgress(userXp, userLevel);
  const xpForCurrentLevel = getXpForLevel(userLevel);
  const xpForNextLevel = getXpForLevel(userLevel + 1);
  const xpNeededForNextLevel = getXpNeededForNextLevel(userLevel);
  const levelColor = getLevelColor(userLevel);

  // Anime.js animations - only run once when page loads
  useEffect(() => {
    if (loading || hasAnimatedRef.current) return;
    hasAnimatedRef.current = true;

    // Welcome card animation with glow effect using JavaScript Object properties
    if (welcomeCardRef.current) {
      const welcomeCard = welcomeCardRef.current;
      const cardGlow = { value: 0 };
      
      // Main animation
      animate(
        welcomeCard,
        {
          opacity: [0, 1],
          translateY: [30, 0],
          scale: [0.95, 1],
          rotateZ: [-2, 0], // Slight rotation
          duration: 800,
          easing: 'easeOutExpo',
        }
      );
      
      // Glow effect using JavaScript object properties
      setTimeout(() => {
        animate(
          cardGlow,
          {
            value: 30,
            duration: 1000,
            easing: 'easeOutExpo',
            onRender: () => {
              (welcomeCard as HTMLElement).style.boxShadow = `0 0 ${cardGlow.value}px rgba(99, 102, 241, 0.2)`;
            }
          }
        );
      }, 400);
    }

    // Stats cards stagger animation with rotation and glow effects
    if (statsRef.current) {
      const statCards = statsRef.current.querySelectorAll('.stat-card');
      animate(
        statCards,
        {
          opacity: [0, 1],
          scale: [0.8, 1],
          translateY: [50, 0],
          rotateZ: [-10, 0], // Add rotation effect
          duration: 600,
          delay: (el: any, i: number) => i * 150,
          easing: 'easeOutExpo',
        }
      );
      
      // Add glow effect using JavaScript object properties
      statCards.forEach((card, i) => {
        const cardElement = card as HTMLElement;
        const glowIntensity = { value: 0 };
        
        setTimeout(() => {
          animate(
            glowIntensity,
            {
              value: 20,
              duration: 800,
              delay: i * 150,
              easing: 'easeOutExpo',
              onRender: () => {
                cardElement.style.boxShadow = `0 0 ${glowIntensity.value}px rgba(59, 130, 246, 0.3)`;
              }
            }
          );
        }, 400);
      });
    }

    // Progress bar animation - using JavaScript Object properties
    if (progressBarRef.current) {
      const progressBar = progressBarRef.current.querySelector('.progress-fill') as HTMLElement;
      const progressPercent = progressBarRef.current.querySelector('.progress-percent') as HTMLElement;
      
      if (progressBar) {
        // Create objects to animate width and percentage
        const progressWidth = { value: 0 };
        const progressText = { value: 0 };
        
        // Animate width
        animate(
          progressWidth,
          {
            value: xpProgress,
            duration: 1500,
            easing: 'easeOutExpo',
            modifier: utils.round(2), // Round to 2 decimal places
            onRender: () => {
              progressBar.style.width = `${progressWidth.value}%`;
            }
          }
        );
        
        // Animate percentage text
        if (progressPercent) {
          animate(
            progressText,
            {
              value: xpProgress,
              duration: 1500,
              easing: 'easeOutExpo',
              modifier: utils.round(0), // Round to whole numbers
              onRender: () => {
                progressPercent.textContent = `${Math.round(progressText.value)}%`;
              }
            }
          );
        }
      }
    }

    // Buttons animation with scale and rotation
    if (buttonsRef.current) {
      const buttons = buttonsRef.current.querySelectorAll('button');
      animate(
        buttons,
        {
          opacity: [0, 1],
          translateY: [20, 0],
          scale: [0.9, 1],
          rotateZ: [-5, 0], // Slight rotation
          duration: 600,
          delay: (el: any, i: number) => i * 100,
          easing: 'easeOutExpo',
        }
      );
    }

    // Lesson cards stagger animation with 3D transforms
    setTimeout(() => {
      const lessonCards = document.querySelectorAll('.lesson-card');
      if (lessonCards.length > 0) {
        animate(
          lessonCards,
          {
            opacity: [0, 1],
            translateY: [50, 0],
            translateZ: [0, 0], // 3D depth
            scale: [0.9, 1],
            rotateX: [15, 0], // 3D rotation
            rotateY: [-10, 0],
            duration: 600,
            delay: (el: any, i: number) => i * 100,
            easing: 'easeOutExpo',
          }
        );
      }
    }, 300);

    // Leaderboard items animation
    setTimeout(() => {
      const leaderboardItems = document.querySelectorAll('.leaderboard-item');
      if (leaderboardItems.length > 0) {
        animate(
          leaderboardItems,
          {
            opacity: [0, 1],
            translateX: [-30, 0],
            duration: 500,
            delay: (el: any, i: number) => i * 50,
            easing: 'easeOutExpo',
          }
        );
      }
    }, 500);

    // Number counting animations for stats - using JavaScript Object properties (animejs v4 way)
    setTimeout(() => {
      const levelElement = statsRef.current?.querySelector('.stat-card .text-4xl, .stat-card .text-5xl') as HTMLElement;
      const xpElements = statsRef.current?.querySelectorAll('.stat-card .text-3xl, .stat-card .text-4xl');
      const xpElement = xpElements?.[1] as HTMLElement;
      
      if (levelElement) {
        // Create a JavaScript object to animate
        const levelCounter = { value: 0 };
        
        animate(
          levelCounter,
          {
            value: userLevel,
            duration: 2000,
            easing: 'easeOutExpo',
            modifier: utils.round(0), // Round to whole numbers
            onRender: () => {
              levelElement.textContent = formatNumber(levelCounter.value);
            }
          }
        );
      }

      if (xpElement) {
        // Create a JavaScript object to animate
        const xpCounter = { value: 0 };
        
        animate(
          xpCounter,
          {
            value: userXp,
            duration: 2000,
            easing: 'easeOutExpo',
            modifier: utils.round(0), // Round to whole numbers
            onRender: () => {
              xpElement.textContent = formatNumber(xpCounter.value);
            }
          }
        );
      }
    }, 400);

    // Add hover animations to buttons
    const buttons = document.querySelectorAll('button');
    const buttonHandlers: Array<{ button: Element; enter: () => void; leave: () => void }> = [];
    
    buttons.forEach((button) => {
      const buttonElement = button as HTMLElement;
      const buttonGlow = { value: 0 };
      const buttonRotation = { value: 0 };
      
      const enterHandler = () => {
        // Scale and rotation animation
        animate(
          button,
          {
            scale: [1, 1.05],
            rotateZ: [0, 2], // Slight rotation on hover
            duration: 300,
            easing: 'easeOutQuad',
          }
        );
        
        // Glow effect using JavaScript object properties
        animate(
          buttonGlow,
          {
            value: 15,
            duration: 300,
            easing: 'easeOutQuad',
            onRender: () => {
              buttonElement.style.filter = `drop-shadow(0 0 ${buttonGlow.value}px rgba(59, 130, 246, 0.5))`;
            }
          }
        );
      };

      const leaveHandler = () => {
        // Scale and rotation animation
        animate(
          button,
          {
            scale: [1.05, 1],
            rotateZ: [2, 0],
            duration: 300,
            easing: 'easeOutQuad',
          }
        );
        
        // Remove glow effect
        animate(
          buttonGlow,
          {
            value: 0,
            duration: 300,
            easing: 'easeOutQuad',
            onRender: () => {
              buttonElement.style.filter = `drop-shadow(0 0 ${buttonGlow.value}px rgba(59, 130, 246, 0.5))`;
            }
          }
        );
      };

      button.addEventListener('mouseenter', enterHandler);
      button.addEventListener('mouseleave', leaveHandler);
      buttonHandlers.push({ button, enter: enterHandler, leave: leaveHandler });
    });

    // Add hover animations to lesson cards
    const lessonCards = document.querySelectorAll('.lesson-card');
    const cardHandlers: Array<{ card: Element; enter: () => void; leave: () => void }> = [];
    
    lessonCards.forEach((card) => {
      const cardElement = card as HTMLElement;
      const cardGlow = { value: 0 };
      const cardElevation = { value: 0 };
      
      const enterHandler = () => {
        // 3D transform animation
        animate(
          card,
          {
            scale: [1, 1.02],
            translateY: [0, -5],
            translateZ: [0, 20], // 3D elevation
            rotateX: [0, -5], // 3D rotation
            rotateY: [0, 2],
            duration: 400,
            easing: 'easeOutExpo',
          }
        );
        
        // Glow effect using JavaScript object properties
        animate(
          cardGlow,
          {
            value: 25,
            duration: 400,
            easing: 'easeOutExpo',
            onRender: () => {
              cardElement.style.boxShadow = `0 ${cardElevation.value}px ${cardGlow.value}px rgba(34, 197, 94, 0.4)`;
            }
          }
        );
        
        // Elevation animation
        animate(
          cardElevation,
          {
            value: 10,
            duration: 400,
            easing: 'easeOutExpo',
            onRender: () => {
              cardElement.style.boxShadow = `0 ${cardElevation.value}px ${cardGlow.value}px rgba(34, 197, 94, 0.4)`;
            }
          }
        );
      };

      const leaveHandler = () => {
        // 3D transform animation
        animate(
          card,
          {
            scale: [1.02, 1],
            translateY: [-5, 0],
            translateZ: [20, 0],
            rotateX: [-5, 0],
            rotateY: [2, 0],
            duration: 400,
            easing: 'easeOutExpo',
          }
        );
        
        // Remove glow effect
        animate(
          cardGlow,
          {
            value: 0,
            duration: 400,
            easing: 'easeOutExpo',
            onRender: () => {
              cardElement.style.boxShadow = `0 ${cardElevation.value}px ${cardGlow.value}px rgba(34, 197, 94, 0.4)`;
            }
          }
        );
        
        // Remove elevation
        animate(
          cardElevation,
          {
            value: 0,
            duration: 400,
            easing: 'easeOutExpo',
            onRender: () => {
              cardElement.style.boxShadow = `0 ${cardElevation.value}px ${cardGlow.value}px rgba(34, 197, 94, 0.4)`;
            }
          }
        );
      };

      card.addEventListener('mouseenter', enterHandler);
      card.addEventListener('mouseleave', leaveHandler);
      cardHandlers.push({ card, enter: enterHandler, leave: leaveHandler });
    });

    // Add pulse animation to stat cards on hover
    const statCards = document.querySelectorAll('.stat-card');
    const statCardHandlers: Array<{ card: Element; enter: () => void; leave: () => void }> = [];
    
    statCards.forEach((card, index) => {
      const cardElement = card as HTMLElement;
      const cardGlow = { value: 0 };
      const cardPulse = { value: 1 };
      
      // Different colors for different stat cards
      const glowColors = [
        'rgba(59, 130, 246, 0.5)', // Blue for Level
        'rgba(34, 197, 94, 0.5)',  // Green for XP
        'rgba(234, 179, 8, 0.5)',  // Yellow for Rank
      ];
      const glowColor = glowColors[index] || 'rgba(59, 130, 246, 0.5)';
      
      const enterHandler = () => {
        // Scale and rotation animation
        animate(
          card,
          {
            scale: [1, 1.05],
            rotateZ: [0, 3], // Slight rotation
            duration: 300,
            easing: 'easeOutQuad',
          }
        );
        
        // Glow effect using JavaScript object properties
        animate(
          cardGlow,
          {
            value: 20,
            duration: 300,
            easing: 'easeOutQuad',
            onRender: () => {
              cardElement.style.boxShadow = `0 0 ${cardGlow.value}px ${glowColor}`;
            }
          }
        );
        
        // Pulse animation using JavaScript object
        animate(
          cardPulse,
          {
            value: [1, 1.1, 1.05],
            duration: 600,
            easing: 'easeInOutQuad',
            onRender: () => {
              cardElement.style.transform = `scale(${cardPulse.value})`;
            }
          }
        );
      };

      const leaveHandler = () => {
        // Scale and rotation animation
        animate(
          card,
          {
            scale: [1.05, 1],
            rotateZ: [3, 0],
            duration: 300,
            easing: 'easeOutQuad',
          }
        );
        
        // Remove glow effect
        animate(
          cardGlow,
          {
            value: 0,
            duration: 300,
            easing: 'easeOutQuad',
            onRender: () => {
              cardElement.style.boxShadow = `0 0 ${cardGlow.value}px ${glowColor}`;
            }
          }
        );
        
        // Reset pulse
        animate(
          cardPulse,
          {
            value: 1,
            duration: 300,
            easing: 'easeOutQuad',
            onRender: () => {
              cardElement.style.transform = `scale(${cardPulse.value})`;
            }
          }
        );
      };

      card.addEventListener('mouseenter', enterHandler);
      card.addEventListener('mouseleave', leaveHandler);
      statCardHandlers.push({ card, enter: enterHandler, leave: leaveHandler });
    });

    // Scroll-triggered animations for sections
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(
            entry.target,
            {
              opacity: [0, 1],
              translateY: [30, 0],
              duration: 800,
              easing: 'easeOutExpo',
            }
          );
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe sections for scroll animations
    const sections = document.querySelectorAll('.scroll-animate');
    sections.forEach((section) => observer.observe(section));

    // Cleanup function
    return () => {
      buttonHandlers.forEach(({ button, enter, leave }) => {
        button.removeEventListener('mouseenter', enter);
        button.removeEventListener('mouseleave', leave);
      });
      cardHandlers.forEach(({ card, enter, leave }) => {
        card.removeEventListener('mouseenter', enter);
        card.removeEventListener('mouseleave', leave);
      });
      statCardHandlers.forEach(({ card, enter, leave }) => {
        card.removeEventListener('mouseenter', enter);
        card.removeEventListener('mouseleave', leave);
      });
      observer.disconnect();
    };
  }, [loading]); // Only depend on loading, animations should run once

  if (loading) {
    return (
      <>
        <Head>
          <title>{t('dashboard')} - {t('appName')}</title>
        </Head>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-gray-600 dark:text-gray-400">{t('loading')}</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{t('dashboard')} - {t('appName')}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <Navbar isMobile={false} />

        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 max-w-6xl">
          {/* Welcome Card - Soddalashtirilgan va minimalist */}
          <div ref={welcomeCardRef} className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 sm:p-8 mb-6 border border-gray-200 dark:border-gray-700">
            <div className="text-center mb-6">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {t('welcomeBack')}! 👋
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                {t('dashboardDescription')}
              </p>
            </div>
        
            {/* Stats - Minimalist va sodda */}
            <div ref={statsRef} className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
              {/* Level */}
              <div className="stat-card bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl px-3 sm:px-4 py-4 sm:py-5 text-center border border-blue-200 dark:border-blue-800">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">Level</div>
                <div className="text-4xl sm:text-5xl font-black text-blue-600 dark:text-blue-400 leading-none">{formatNumber(userLevel)}</div>
              </div>
        
              {/* XP */}
              <div className="stat-card bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl px-3 sm:px-4 py-4 sm:py-5 text-center border border-green-200 dark:border-green-800">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">XP</div>
                <div className="text-3xl sm:text-4xl font-black text-green-600 dark:text-green-400 leading-none">{formatNumber(userXp)}</div>
              </div>
        
              {/* Rank */}
              {userRank && (
                <div className={`stat-card bg-gradient-to-br ${userRank === 1 ? 'from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20' : userRank === 2 ? 'from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20' : userRank === 3 ? 'from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20' : 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20'} rounded-2xl px-3 sm:px-4 py-4 sm:py-5 text-center border ${userRank === 1 ? 'border-yellow-200 dark:border-yellow-800' : userRank === 2 ? 'border-gray-200 dark:border-gray-800' : userRank === 3 ? 'border-orange-200 dark:border-orange-800' : 'border-blue-200 dark:border-blue-800'}`}>
                  <div className={`text-xs mb-2 ${userRank === 1 ? 'text-yellow-700 dark:text-yellow-400' : userRank === 2 ? 'text-gray-600 dark:text-gray-400' : userRank === 3 ? 'text-orange-700 dark:text-orange-400' : 'text-blue-600 dark:text-blue-400'}`}>Rank</div>
                  <div className={`text-4xl sm:text-5xl font-black leading-none ${userRank === 1 ? 'text-yellow-600 dark:text-yellow-400' : userRank === 2 ? 'text-gray-600 dark:text-gray-400' : userRank === 3 ? 'text-orange-600 dark:text-orange-400' : 'text-blue-600 dark:text-blue-400'}`}>{getRankSuffix(userRank)}</div>
                </div>
              )}
            </div>
      
            {/* XP Progress Bar - Sodda */}
            <div ref={progressBarRef} className="mb-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-700 dark:text-gray-300">
                  <span className="font-bold text-blue-600 dark:text-blue-400">{formatNumber(Math.max(0, xpForNextLevel - userXp))}</span> XP → <span className="font-bold">Level {formatNumber(userLevel + 1)}</span>
                </span>
                <span className="text-gray-900 dark:text-white font-bold">{Math.round(xpProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 sm:h-4 overflow-hidden">
                <div
                  className="progress-fill bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full"
                  style={{ width: '0%' }}
                />
              </div>
            </div>

            {/* Buttonlar - Sodda va chiroyli */}
            <div ref={buttonsRef} className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <button
                onClick={() => router.push('/learn')}
                className="px-6 sm:px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-lg sm:text-xl transition-all shadow-lg hover:shadow-xl active:scale-95 touch-manipulation"
              >
                📚 {t('startLearning')}
          </button>
          <button
                onClick={() => router.push('/editor')}
                className="px-6 sm:px-8 py-4 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-bold text-lg sm:text-xl transition-all shadow-lg hover:shadow-xl active:scale-95 touch-manipulation border border-gray-200 dark:border-gray-600"
              >
                💻 {t('codeEditor')}
          </button>
            </div>
        </div>
      
          {/* Lessons Section - Katta va tushunarli */}
          <div className="scroll-animate bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    📚 {t('lessons')}
                  </h2>
                  <p className="text-green-100 text-base sm:text-lg">
                    {t('lessonsDescription')}
                  </p>
                </div>
                <button
                  onClick={() => router.push('/learn')}
                  className="px-6 py-3 bg-white text-green-600 hover:bg-green-50 rounded-xl font-bold text-base sm:text-lg transition-all shadow-lg hover:shadow-xl"
                >
                  {t('viewAll')} →
                </button>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              {unlockedLessons.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📚</div>
                  <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-6">{t('noLessonsAvailable')}</p>
                  <button
                    onClick={() => router.push('/learn')}
                    className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-lg transition-all shadow-lg"
                  >
                    {t('startLearning')}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  {unlockedLessons.slice(0, 4).map((lesson) => (
                    <div
                      key={lesson._id}
                      className="lesson-card p-5 sm:p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 rounded-2xl hover:shadow-xl transition-all cursor-pointer border-2 border-gray-200 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500"
                      onClick={() => router.push(`/learn/${lesson.slug}`)}
                    >
                      <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-lg sm:text-xl">
                        {lesson.title}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {lesson.summary}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {lesson.trains && lesson.trains.length > 0 && (
                          <span className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium">
                            {lesson.trains.length} {t('practiceExercises')}
                          </span>
                        )}
                        {lesson.homework && (
                          <span className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-sm font-medium">
                            {t('homework')}
                          </span>
                )}
              </div>
                      <button className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-base sm:text-lg transition-all shadow-md hover:shadow-lg">
                        {t('startLesson')} →
                      </button>
                    </div>
                  ))}
            </div>
              )}
            </div>
          </div>

          {/* Leaderboard & Quick Actions - 2 ta qator */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Leaderboard */}
            <div className="scroll-animate bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white">
                    🏆 {t('leaderboard')}
                  </h2>
                    <button
                    onClick={() => router.push('/leaderboard')}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-white text-sm font-bold backdrop-blur-sm transition-colors"
                  >
                    {t('viewAll')} →
                    </button>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                {globalLeaderboard.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-5xl mb-3">🏆</div>
                    <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">{t('noDataYet')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {globalLeaderboard.slice(0, 5).map((item, index) => {
                      const isCurrentUser = user && item.userId === user.id;
                      return (
                        <AnimatedCard
                          key={item.userId}
                          delay={index * 100}
                          className={`leaderboard-item flex items-center justify-between p-4 rounded-xl ${
                            isCurrentUser
                              ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500 dark:border-blue-400'
                              : item.rank <= 3
                              ? 'bg-yellow-50 dark:bg-yellow-900/20'
                              : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <AnimatedTooltip content={`Rank #${item.rank}`}>
                              <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex-shrink-0">
                                {getRankSuffix(item.rank)}
                              </span>
                            </AnimatedTooltip>
                            <span className={`text-base sm:text-lg truncate ${
                              isCurrentUser
                                ? 'font-bold text-blue-700 dark:text-blue-300'
                                : 'text-gray-900 dark:text-white'
                            }`}>
                              {item.username}
                            </span>
                            <AnimatedBadge variant={item.rank <= 3 ? 'warning' : 'info'}>
                              Lv.<AnimatedCounter value={item.level} />
                            </AnimatedBadge>
                          </div>
                          <AnimatedCounter
                            value={item.xp}
                            suffix=" XP"
                            className={`text-base sm:text-lg font-bold flex-shrink-0 ${getLevelColor(item.level).text}`}
                          />
                        </AnimatedCard>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="scroll-animate bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-5 sm:p-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-white">
                  ⚡ {t('quickActions')}
                </h2>
        </div>

              <div className="p-5 sm:p-6 space-y-3">
                <button
                  onClick={() => router.push('/learn')}
                  className="w-full text-left px-5 py-4 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 hover:from-green-200 hover:to-emerald-200 dark:hover:from-green-900/40 dark:hover:to-emerald-900/40 rounded-xl transition-all text-base sm:text-lg font-bold text-gray-900 dark:text-white shadow-md hover:shadow-lg"
                >
                  📚 {t('browseLessons')}
                </button>
                <button
                  onClick={() => router.push('/profile')}
                  className="w-full text-left px-5 py-4 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 hover:from-blue-200 hover:to-indigo-200 dark:hover:from-blue-900/40 dark:hover:to-indigo-900/40 rounded-xl transition-all text-base sm:text-lg font-bold text-gray-900 dark:text-white shadow-md hover:shadow-lg"
                >
                  📊 {t('viewProgress')}
                </button>
                <button
                  onClick={() => router.push('/editor')}
                  className="w-full text-left px-5 py-4 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 hover:from-purple-200 hover:to-pink-200 dark:hover:from-purple-900/40 dark:hover:to-pink-900/40 rounded-xl transition-all text-base sm:text-lg font-bold text-gray-900 dark:text-white shadow-md hover:shadow-lg"
                >
                  💻 {t('codeEditor')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
