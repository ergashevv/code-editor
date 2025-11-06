'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { animate } from 'animejs';
import { useI18n } from '../hooks/useI18n';
import { isAuthenticated, ensureAuthenticated } from '../lib/api';
import { formatNumber } from '../lib/formatNumber';
import Navbar from '../components/Navbar';

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

export default function LeaderboardPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<'global' | 'weekly'>('global');
  const [globalItems, setGlobalItems] = useState<LeaderboardItem[]>([]);
  const [weeklyItems, setWeeklyItems] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const headerRef = useRef<HTMLHeadingElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
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

        fetchLeaderboards();
      }
    };

    checkAuth();
  }, [router]);

  const fetchLeaderboards = async () => {
    try {
      const [globalRes, weeklyRes] = await Promise.all([
        fetch('/api/leaderboard/global'),
        fetch('/api/leaderboard/weekly'),
      ]);

      if (globalRes.ok) {
        const data = await globalRes.json();
        setGlobalItems(data.items || []);
      }

      if (weeklyRes.ok) {
        const data = await weeklyRes.json();
        setWeeklyItems(data.items || []);
      }
    } catch (error) {
      console.error('Error fetching leaderboards:', error);
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

  // Anime.js animations for leaderboard - only run once when page loads
  useEffect(() => {
    if (loading || hasAnimatedRef.current) return;
    hasAnimatedRef.current = true;

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

    // Tabs animation
    if (tabsRef.current) {
      animate(
        tabsRef.current,
        {
          opacity: [0, 1],
          translateY: [15, 0],
          duration: 500,
          delay: 200,
          easing: 'easeOutExpo',
        }
      );
    }

    // Table rows stagger animation
    setTimeout(() => {
      const rows = document.querySelectorAll('.leaderboard-row');
      animate(
        rows,
        {
          opacity: [0, 1],
          translateX: [-30, 0],
          scale: [0.95, 1],
          duration: 500,
          delay: (el: any, i: number) => i * 50,
          easing: 'easeOutExpo',
        }
      );
    }, 400);

    // Top 3 special animations
    setTimeout(() => {
      const top3Rows = document.querySelectorAll('.top-3-row');
      top3Rows.forEach((row, index) => {
        const glow = { value: 0 };
        animate(
          row,
          {
            scale: [0.9, 1],
            rotateZ: [index === 0 ? -2 : index === 1 ? 1 : 2, 0],
            duration: 600,
            delay: index * 100,
            easing: 'easeOutElastic(1, .6)',
          }
        );
        
        setTimeout(() => {
          animate(
            glow,
            {
              value: 20,
              duration: 1000,
              easing: 'easeOutExpo',
              onRender: () => {
                (row as HTMLElement).style.boxShadow = `0 0 ${glow.value}px rgba(234, 179, 8, 0.5)`;
              }
            }
          );
        }, 300);
      });
    }, 600);

    // Row hover animations
    setTimeout(() => {
      const rows = document.querySelectorAll('.leaderboard-row');
      rows.forEach((row) => {
        row.addEventListener('mouseenter', () => {
          animate(
            row,
            {
              scale: [1, 1.02],
              translateX: [0, 5],
              duration: 300,
              easing: 'easeOutExpo',
            }
          );
        });
        
        row.addEventListener('mouseleave', () => {
          animate(
            row,
            {
              scale: [1.02, 1],
              translateX: [5, 0],
              duration: 300,
              easing: 'easeOutExpo',
            }
          );
        });
      });
    }, 800);
  }, [loading]); // Only depend on loading, animations should run once

  const items = activeTab === 'global' ? globalItems : weeklyItems;

  return (
    <>
      <Head>
        <title>Leaderboard - {t('appName')}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar isMobile={false} />

        <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 max-w-4xl">
          {/* Back Button */}
          <div className="mb-6">
            <button
              onClick={() => {
                if (window.history.length > 1) {
                  router.back();
                } else {
                  router.push('/home');
                }
              }}
              className="text-base sm:text-lg text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-4 flex items-center gap-2 font-bold"
            >
              ← {t('back') || 'Back'}
            </button>
          </div>
          <h1 ref={headerRef} className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 md:mb-8">
            Leaderboard
          </h1>

          {/* Tabs */}
          <div ref={tabsRef} className="flex gap-2 mb-4 sm:mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('global')}
              className={`flex-1 py-2 px-3 sm:px-4 rounded-md text-sm sm:text-base font-medium transition-all ${
                activeTab === 'global'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Global
            </button>
            <button
              onClick={() => setActiveTab('weekly')}
              className={`flex-1 py-2 px-3 sm:px-4 rounded-md text-sm sm:text-base font-medium transition-all ${
                activeTab === 'weekly'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Weekly
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8 sm:py-12">
              <div className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Loading leaderboard...</div>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                No data available for {activeTab === 'global' ? 'global' : 'weekly'} leaderboard.
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Username
                    </th>
                    <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Level
                    </th>
                    <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      XP
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {items.map((item) => (
                    <tr
                      key={item.userId}
                      className={`leaderboard-row hover:bg-gray-50 dark:hover:bg-gray-700 ${
                        item.rank <= 3 ? 'bg-yellow-50 dark:bg-yellow-900/20 top-3-row' : ''
                      }`}
                    >
                      <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                        {getRankSuffix(item.rank)}
                      </td>
                      <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white truncate max-w-[150px] sm:max-w-none">
                        {item.username}
                      </td>
                      <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {formatNumber(item.level)}
                      </td>
                      <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white font-medium">
                        {formatNumber(item.xp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

