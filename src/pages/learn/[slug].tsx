'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useI18n } from '../../hooks/useI18n';
import { isAuthenticated, ensureAuthenticated, getToken } from '../../lib/api';
import { markdownToHtml } from '../../lib/markdown';
import { getLocalizedLessonContent } from '../../lib/lessonContent';
import { formatNumber } from '../../lib/formatNumber';
import Navbar from '../../components/Navbar';
import Preview from '../../components/Preview';

interface Lesson {
  _id: string;
  slug: string;
  title: string;
  summary: string;
  contentMD: string;
  order?: number;
  examples: Array<{
    id: string;
    title: string;
    html: string;
    css?: string;
    js?: string;
  }>;
  trains: Array<{
    id: string;
    title: string;
  }>;
  homework?: {
    id: string;
    title: string;
  };
  unlockAt: string;
  isUnlocked?: boolean;
}

export async function getServerSideProps() {
  return {
    props: {},
  };
}

export default function LessonPage() {
  const router = useRouter();
  const { slug } = router.query;
  const { t, language } = useI18n();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [originalLesson, setOriginalLesson] = useState<Lesson | null>(null); // Store original (non-localized) lesson
  const [contentHtml, setContentHtml] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [activeExample, setActiveExample] = useState<string | null>(null);
  const [exampleHtml, setExampleHtml] = useState('');
  const [exampleCss, setExampleCss] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [unlockAt, setUnlockAt] = useState<string | null>(null);
  const [exampleJs, setExampleJs] = useState('');
  const [progress, setProgress] = useState<{
    trainsCompleted: string[];
    homeworkSubmitted: boolean;
    xpEarned: number;
  } | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (router.isReady && slug) {
        if (!isAuthenticated()) {
          router.push('/auth');
          return;
        }

        const isValid = await ensureAuthenticated();
        if (!isValid) {
          router.push('/auth');
          return;
        }

        fetchLesson();
      }
    };

    checkAuth();
  }, [router, slug]);

  // Re-localize lesson when language changes
  useEffect(() => {
    if (originalLesson) {
      const localizedLesson = getLocalizedLessonContent(originalLesson, language || 'en');
      setLesson(localizedLesson);
      
      // Re-render markdown
      if (localizedLesson.contentMD) {
        markdownToHtml(localizedLesson.contentMD).then(html => {
          setContentHtml(html);
        });
      }
    }
  }, [language, originalLesson]);

  // Refresh progress when returning to lesson page (e.g., after completing train/homework)
  useEffect(() => {
    const handleFocus = () => {
      if (lesson?._id && !loadingProgress) {
        fetchProgress(lesson._id);
      }
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [lesson?._id, loadingProgress]);

  const fetchLesson = async () => {
    if (!slug || typeof slug !== 'string') return;

    try {
      const token = getToken();
      const response = await fetch(`/api/lessons/${slug}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const lessonData = data.lesson;
        
        // Check if lesson is locked
        if (data.locked || lessonData.locked) {
          // Store original lesson but don't render content
          setOriginalLesson(lessonData);
          const localizedLesson = getLocalizedLessonContent(lessonData, language || 'en');
          setLesson({
            ...localizedLesson,
            locked: true,
            unlockAt: data.unlockAt || lessonData.unlockAt,
          });
          setIsLocked(true);
          setUnlockAt(data.unlockAt || lessonData.unlockAt);
          setContentHtml('');
          setLoading(false);
          return;
        }
        
        setIsLocked(false);
        setUnlockAt(null);
        
        // Store original (non-localized) lesson for re-localization
        setOriginalLesson(lessonData);
        
        // Get localized content
        const localizedLesson = getLocalizedLessonContent(lessonData, language || 'en');
        setLesson(localizedLesson);

        // Render markdown
        if (localizedLesson.contentMD) {
          const html = await markdownToHtml(localizedLesson.contentMD);
          setContentHtml(html);
        }

        // Fetch progress
        fetchProgress(lessonData._id);
      } else if (response.status === 403) {
        // If lesson is inactive or not found, redirect
        router.push('/learn');
        return;
      }
    } catch (error) {
      console.error('Error fetching lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = async (lessonId: string) => {
    setLoadingProgress(true);
    try {
      const token = getToken();
      const response = await fetch(`/api/progress/lesson/${lessonId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProgress(data.progress);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoadingProgress(false);
    }
  };

  const handleRunExample = (example: Lesson['examples'][0]) => {
    console.log('Running example:', example); // Debug
    if (!example) {
      console.error('Example is undefined');
      return;
    }
    setActiveExample(example.id);
    setExampleHtml(example.html || '');
    setExampleCss(example.css || '');
    setExampleJs(example.js || '');
  };

  // Refresh progress after train/homework completion
  const refreshProgress = () => {
    if (lesson?._id) {
      fetchProgress(lesson._id);
    }
  };

  // Check if all tasks are completed
  const allTasksCompleted = () => {
    if (!lesson || !progress) return false;
    const allTrainsCompleted = lesson.trains.length > 0 
      ? progress.trainsCompleted.length === lesson.trains.length
      : true;
    const homeworkCompleted = lesson.homework 
      ? progress.homeworkSubmitted 
      : true;
    return allTrainsCompleted && homeworkCompleted;
  };

  // Get next lesson
  const getNextLesson = async () => {
    if (!lesson) return null;
    try {
      const token = getToken();
      const response = await fetch('/api/lessons', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        const allLessons = data.lessons || [];
        const currentOrder = lesson.order || 0;
        const nextLesson = allLessons.find((l: any) => l.order === currentOrder + 1);
        return nextLesson;
      }
    } catch (error) {
      console.error('Error fetching next lesson:', error);
    }
    return null;
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>{t('loading')}... - {t('appName')}</title>
        </Head>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-gray-600 dark:text-gray-400">{t('loading')}</div>
        </div>
      </>
    );
  }

  if (!lesson) {
    return (
      <>
        <Head>
          <title>{t('lesson')} {t('notFound')} - {t('appName')}</title>
        </Head>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t('lesson')} {t('notFound')}
            </h1>
            <button
              onClick={() => {
                if (window.history.length > 1) {
                  router.back();
                } else {
                  router.push('/learn');
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {t('backToLessons')}
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{lesson.title} - {t('appName')}</title>
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
                      router.push('/learn');
                    }
                  }}
                  className="px-4 py-3 sm:py-2 text-base sm:text-lg text-blue-600 dark:text-blue-400 active:text-blue-700 dark:active:text-blue-300 mb-4 sm:mb-6 flex items-center gap-2 font-bold active:bg-blue-50 dark:active:bg-blue-900/20 rounded-lg min-h-[48px] touch-manipulation"
                >
                  ← {t('backToLessons')}
                </button>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              {lesson.title}
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-700 dark:text-gray-300">
              {lesson.summary}
            </p>
          </div>

          <div className={`grid grid-cols-1 gap-6 sm:gap-8 ${activeExample ? 'lg:grid-cols-3' : ''}`}>
            {/* Main Content */}
            <div className={`${activeExample ? 'lg:col-span-2' : ''} space-y-6 sm:space-y-8`}>
              {/* Locked Lesson Message */}
              {isLocked ? (
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-3xl shadow-xl p-8 sm:p-10 md:p-12 text-center text-white">
                  <div className="text-6xl sm:text-7xl mb-6">🔒</div>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                    {t('lessonLocked') || 'Lesson Locked'}
                  </h2>
                  <p className="text-xl sm:text-2xl md:text-3xl mb-6 text-yellow-100">
                    {t('lessonLockedMessage') || 'This lesson is currently locked. You can see it but cannot access its content yet.'}
                  </p>
                  {unlockAt && (
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 inline-block">
                      <p className="text-lg sm:text-xl md:text-2xl font-bold mb-2">
                        {t('unlocksAt') || 'Unlocks At'}:
                      </p>
                      <p className="text-2xl sm:text-3xl md:text-4xl font-bold">
                        {new Date(unlockAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                  <button
                    onClick={() => router.push('/learn')}
                    className="mt-8 px-8 py-4 bg-white text-orange-600 rounded-xl hover:bg-orange-50 font-bold text-lg sm:text-xl transition-all shadow-lg hover:shadow-xl"
                  >
                    ← {t('backToLessons')}
                  </button>
                </div>
              ) : (
                <>
                  {/* Lesson Content */}
                  <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 sm:p-8 md:p-10">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8 flex items-center gap-3">
                      <span className="text-4xl sm:text-5xl">📖</span>
                      <span>{t('lessonContent')}</span>
                    </h2>
                    <div
                      className="prose dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-code:text-sm prose-code:bg-gray-100 dark:prose-code:bg-gray-700 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-strong:text-gray-900 dark:prose-strong:text-white"
                      dangerouslySetInnerHTML={{ __html: contentHtml }}
                    />
                  </div>

                  {/* Examples - Yaxshilangan */}
                  {lesson.examples && lesson.examples.length > 0 && (
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl shadow-xl p-6 sm:p-8 md:p-10 text-white">
                      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 flex items-center gap-3">
                        <span className="text-4xl sm:text-5xl">💡</span>
                        <span>{t('examples') || 'Examples'}</span>
                      </h2>
                      <p className="text-blue-100 mb-6 sm:mb-8 text-lg sm:text-xl">
                        {t('examplesDescription') || 'Try these examples to see how it works!'}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                        {lesson.examples.map((example) => (
                          <div 
                            key={example.id} 
                            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border-4 border-white/30 hover:border-white/50 transition-all transform hover:scale-105"
                          >
                            <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 text-white">
                              {example.title}
                            </h3>
                            <button
                              onClick={() => handleRunExample(example)}
                              className="w-full px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 font-bold text-base sm:text-lg transition-all shadow-lg hover:shadow-xl"
                            >
                              ▶️ {t('runExample') || 'Run Example'}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

              {/* Practice Section - Katta va tushunarli */}
              {!isLocked && lesson.trains.length > 0 && (
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl shadow-xl p-6 sm:p-8 md:p-10 text-white">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 flex items-center gap-3">
                    <span className="text-4xl sm:text-5xl">🎯</span>
                    <span>{t('practiceExercises')}</span>
                    {progress && (
                      <span className="text-xl sm:text-2xl md:text-3xl font-normal opacity-90">
                        ({progress.trainsCompleted.length}/{lesson.trains.length})
                      </span>
                    )}
                  </h2>
                  <p className="text-green-100 mb-6 sm:mb-8 text-lg sm:text-xl md:text-2xl">
                    {t('practiceDescription') || 'Practice what you learned with interactive exercises. Try as many times as you want!'}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    {lesson.trains.map((train, idx) => {
                      const isCompleted = progress?.trainsCompleted.includes(train.id) || false;
                      return (
                        <button
                          key={train.id}
                          onClick={() => router.push(`/learn/${slug}/train/${train.id}`)}
                          className={`text-left p-6 sm:p-6 rounded-2xl backdrop-blur-sm transition-all border-4 active:scale-95 touch-manipulation min-h-[80px] ${
                            isCompleted
                              ? 'bg-green-600/50 active:bg-green-600/60 border-green-300 active:border-green-200'
                              : 'bg-white/20 active:bg-white/30 border-white/30 active:border-white/50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <span className="text-base sm:text-lg font-bold opacity-90">
                                {t('practice')} {idx + 1}
                              </span>
                              {isCompleted && (
                                <span className="text-2xl sm:text-3xl">✅</span>
                              )}
                            </div>
                            <span className="text-2xl sm:text-3xl">→</span>
                          </div>
                          <div className="font-bold text-lg sm:text-xl md:text-2xl">
                            {train.title}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Homework Section - Katta va tushunarli */}
              {!isLocked && lesson.homework && (
                <div className={`rounded-3xl shadow-xl p-6 sm:p-8 md:p-10 text-white ${
                  progress?.homeworkSubmitted
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500'
                }`}>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 flex items-center gap-3">
                    <span className="text-4xl sm:text-5xl">📝</span>
                    <span>{t('homeworkAssignment')}</span>
                    {progress?.homeworkSubmitted && (
                      <span className="text-3xl sm:text-4xl">✅</span>
                    )}
                  </h2>
                  <p className="text-purple-100 mb-6 sm:mb-8 text-lg sm:text-xl md:text-2xl">
                    {progress?.homeworkSubmitted
                      ? t('homeworkCompleted') || 'Homework completed! Great job!'
                      : t('homeworkDescription') || 'Complete the homework to earn XP and level up! You can only submit once, so make sure your code is correct.'}
                  </p>
                  {progress?.homeworkSubmitted && progress.xpEarned > 0 && (
                    <div className="mb-6 p-4 bg-white/20 rounded-xl backdrop-blur-sm">
                      <p className="text-lg sm:text-xl font-bold">
                        🎉 {t('earned') || 'Earned'}: {formatNumber(progress.xpEarned)} XP
                      </p>
                    </div>
                  )}
                  <button
                    onClick={() => router.push(`/learn/${slug}/homework`)}
                    className={`w-full sm:w-auto px-10 py-6 sm:py-5 rounded-2xl font-bold text-xl sm:text-xl md:text-2xl transition-all shadow-2xl active:shadow-3xl active:scale-95 touch-manipulation min-h-[60px] ${
                      progress?.homeworkSubmitted
                        ? 'bg-white text-green-600 active:bg-green-50'
                        : 'bg-white text-purple-600 active:bg-purple-50'
                    }`}
                  >
                    {progress?.homeworkSubmitted ? '✅ ' + (t('viewHomework') || 'View Homework') : '🚀 ' + (t('startHomework') || 'Start Homework')}
                  </button>
                </div>
              )}

              {/* Completion Message & Next Lesson */}
              {!isLocked && allTasksCompleted() && (
                <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-3xl shadow-xl p-6 sm:p-8 md:p-10 text-white">
                  <div className="text-center">
                    <div className="text-6xl sm:text-7xl md:text-8xl mb-6">🎉</div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                      {t('lessonCompleted') || 'Congratulations!'}
                    </h2>
                    <p className="text-xl sm:text-2xl md:text-3xl mb-8 text-yellow-100">
                      {t('allTasksCompleted') || 'You have completed all tasks in this lesson!'}
                    </p>
                    <button
                      onClick={async () => {
                        const nextLesson = await getNextLesson();
                        if (nextLesson) {
                          router.push(`/learn/${nextLesson.slug}`);
                        } else {
                          router.push('/learn');
                        }
                      }}
                      className="px-10 py-5 bg-white text-orange-600 rounded-2xl hover:bg-orange-50 font-bold text-lg sm:text-xl md:text-2xl transition-all shadow-2xl hover:shadow-3xl transform hover:scale-105"
                    >
                      {t('nextLesson') || 'Next Lesson'} →
                    </button>
                  </div>
                </div>
              )}
                </>
              )}
            </div>

            {/* Sidebar - Example Preview (Desktop) / Modal (Mobile) */}
            {activeExample && (
              <>
                {/* Desktop: Sidebar */}
                <div className="hidden lg:block lg:col-span-1">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-4 border-2 border-blue-500 dark:border-blue-400">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        💡 {t('preview')}
                      </h3>
                      <button
                        onClick={() => setActiveExample(null)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <Preview html={exampleHtml} css={exampleCss} js={exampleJs} isMobile={false} />
                    </div>
                  </div>
                </div>

                {/* Mobile: Full Screen Modal */}
                <div className="lg:hidden fixed inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 flex items-center justify-between shrink-0">
                    <h3 className="text-lg font-bold">💡 {t('preview')}</h3>
                    <button
                      onClick={() => setActiveExample(null)}
                      className="p-2 text-white hover:bg-white/20 rounded-lg touch-manipulation"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex-1 min-h-0 overflow-hidden">
                    <Preview html={exampleHtml} css={exampleCss} js={exampleJs} isMobile={true} />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
