'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useI18n } from '../../../../hooks/useI18n';
import { isAuthenticated, ensureAuthenticated, getToken } from '../../../../lib/api';
import { getLocalizedLessonContent } from '../../../../lib/lessonContent';
import Editor from '../../../../components/Editor';
import Preview from '../../../../components/Preview';
import Navbar from '../../../../components/Navbar';
import { ToastContainer, showToast } from '../../../../components/Toast';

interface Lesson {
  _id: string;
  slug: string;
  title: string;
  trains: Array<{
    id: string;
    title: string;
    task: string;
    initialHtml: string;
    initialCss?: string;
  }>;
}

interface CheckResult {
  checkId: string;
  passed: boolean;
  message: string;
}

export async function getServerSideProps() {
  return {
    props: {},
  };
}

export default function TrainPage() {
  const router = useRouter();
  const { slug, id } = router.query;
  const { t, language } = useI18n();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [originalLesson, setOriginalLesson] = useState<Lesson | null>(null); // Store original (non-localized) lesson
  const [train, setTrain] = useState<Lesson['trains'][0] | null>(null);
  const [html, setHtml] = useState('');
  const [css, setCss] = useState('');
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [checkResults, setCheckResults] = useState<CheckResult[]>([]);
  const [passedAll, setPassedAll] = useState(false);
  const [activeTab, setActiveTab] = useState<'html' | 'css'>('html');
  const [showTaskDescription, setShowTaskDescription] = useState(false); // Mobile: collapsible task description

  useEffect(() => {
    const checkAuth = async () => {
      if (router.isReady && slug && id) {
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
  }, [router, slug, id]);

  // Re-localize lesson when language changes
  useEffect(() => {
    if (originalLesson && id && typeof id === 'string') {
      const localizedLesson = getLocalizedLessonContent(originalLesson, language || 'en');
      setLesson(localizedLesson);
      
      // Update train if it exists
      const foundTrain = localizedLesson.trains.find((t: any) => t.id === id);
      if (foundTrain) {
        setTrain(foundTrain);
      }
    }
  }, [language, originalLesson, id]);

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
        
        // Store original (non-localized) lesson for re-localization
        setOriginalLesson(lessonData);
        
        // Get localized content
        const localizedLesson = getLocalizedLessonContent(lessonData, language || 'en');
        setLesson(localizedLesson);

        const trainId = id as string;
        const foundTrain = localizedLesson.trains.find((t: any) => t.id === trainId);
        if (foundTrain) {
          setTrain(foundTrain);
          setHtml(foundTrain.initialHtml || '');
          setCss(foundTrain.initialCss || '');
        }
      }
    } catch (error) {
      console.error('Error fetching lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheck = async () => {
    if (!lesson || !train) return;

    setChecking(true);
    try {
      const token = getToken();
      const response = await fetch('/api/train/grade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          lessonId: lesson._id,
          trainId: train.id,
          html,
          css,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCheckResults(data.checksResult || []);
        setPassedAll(data.passedAll || false);
        
        // Show toast notification
        if (data.passedAll) {
          showToast(t('allChecksPassed') || 'All checks passed! ✅', 'success');
          // Refresh progress on lesson page (if we're coming from there)
          // The parent page will refresh when user navigates back
        } else {
          const failedCount = (data.checksResult || []).filter((r: any) => !r.passed).length;
          showToast(`${failedCount} ${t('checkFailed') || 'check(s) failed'}. ${t('tryAgain') || 'Please try again.'}`, 'error');
        }
      } else {
        const errorData = await response.json();
        showToast(errorData.error || t('errorChecking') || 'Error checking solution', 'error');
      }
    } catch (error) {
      console.error('Error checking solution:', error);
    } finally {
      setChecking(false);
    }
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>{t('loading')}... - {t('appName')}</title>
        </Head>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🎯</div>
            <div className="text-xl sm:text-2xl text-gray-600 dark:text-gray-400">{t('loading')}</div>
          </div>
        </div>
      </>
    );
  }

  if (!train || !lesson) {
    return (
      <>
        <Head>
          <title>{t('practice')} - {t('appName')}</title>
        </Head>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">
              {t('practice')} {t('notFound')}
            </h1>
            <button
              onClick={() => {
                if (window.history.length > 1) {
                  router.back();
                } else {
                  router.push(`/learn/${slug}`);
                }
              }}
              className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold text-lg sm:text-xl transition-all shadow-lg"
            >
              ← {t('backToLesson')}
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ToastContainer />
      <Head>
        <title>{train.title} - {t('appName')}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex flex-col" style={{ height: '100vh', overflow: 'hidden' }}>
        <Navbar isMobile={false} />

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden" style={{ height: 'calc(100vh - 64px)', minHeight: 0, flex: '1 1 auto', overflowY: 'hidden' }}>
          {/* Left Side - Editor */}
          <div className="flex-1 flex flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            {/* Header - Mobile'da juda kompakt */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-2 sm:px-4 py-1 sm:py-2 shrink-0">
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    if (window.history.length > 1) {
                      router.back();
                    } else {
                      router.push(`/learn/${slug}`);
                    }
                  }}
                  className="px-1.5 py-0.5 text-[10px] sm:text-xs text-blue-100 active:text-white flex items-center gap-0.5 font-medium active:bg-white/20 rounded touch-manipulation"
                >
                  ←
                </button>
                <h1 className="text-xs sm:text-base md:text-lg font-bold leading-tight truncate flex-1 text-center">
                  {train.title}
                </h1>
                <button
                  onClick={handleCheck}
                  disabled={checking}
                  className={`px-2 sm:px-4 py-1 sm:py-2 bg-white text-blue-600 rounded-lg active:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-[10px] sm:text-sm transition-all shadow-md active:scale-95 touch-manipulation shrink-0 whitespace-nowrap ${
                    passedAll ? 'bg-green-100 text-green-700 active:bg-green-200' : ''
                  }`}
                >
                  {checking ? t('loading') : passedAll ? '✓' : t('checkSolution')}
                </button>
              </div>
            </div>

            {/* Task Description - Kompakt va kichik */}
            <div className={`bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-700 shrink-0 ${
              showTaskDescription ? 'max-h-[40vh]' : 'max-h-0'
            } md:max-h-none overflow-y-auto transition-all duration-300`}>
              <div className="px-3 sm:px-4 py-2 sm:py-2.5">
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-base sm:text-lg">
                  📝
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1.5 text-sm sm:text-base">
                    {t('task')}:
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {train.task}
                  </p>
                </div>
              </div>
              </div>
            </div>

            {/* Mobile: Task Description Toggle Button */}
            <button
              onClick={() => setShowTaskDescription(!showTaskDescription)}
              className="md:hidden bg-blue-100 dark:bg-blue-900/30 border-b border-gray-200 dark:border-gray-700 px-2 py-1 text-left text-[10px] font-semibold text-blue-700 dark:text-blue-300 flex items-center justify-between touch-manipulation"
            >
              <span>📝 {t('task')} {showTaskDescription ? '↑' : '↓'}</span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400">
                {showTaskDescription ? t('hide') || 'Hide' : t('show') || 'Show'}
              </span>
            </button>

            {/* Tabs - Mobile'da juda kompakt */}
            <div className="flex bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shrink-0">
              <button
                onClick={() => setActiveTab('html')}
                className={`flex-1 px-2 sm:px-4 py-1 sm:py-2 font-semibold text-[10px] sm:text-sm transition-all touch-manipulation ${
                  activeTab === 'html'
                    ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-600 dark:text-gray-400 active:text-gray-900 dark:active:text-white'
                }`}
              >
                HTML
              </button>
              <button
                onClick={() => setActiveTab('css')}
                className={`flex-1 px-2 sm:px-4 py-1 sm:py-2 font-semibold text-[10px] sm:text-sm transition-all touch-manipulation ${
                  activeTab === 'css'
                    ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-600 dark:text-gray-400 active:text-gray-900 dark:active:text-white'
                }`}
              >
                CSS
              </button>
            </div>

            {/* Editor - Mobile uchun to'liq balandlik */}
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden" style={{ height: '100%', flex: '1 1 auto', display: 'flex', flexDirection: 'column' }}>
              <div className="flex-1 min-h-0 w-full overflow-hidden" style={{ flex: '1 1 auto', minHeight: '300px', height: checkResults.length > 0 ? 'calc(100% - 200px)' : '100%', display: 'flex', flexDirection: 'column' }}>
                {activeTab === 'html' ? (
                  <div className="w-full h-full overflow-hidden flex-1" style={{ minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
                    <Editor
                      language="html"
                      value={html}
                      onChange={setHtml}
                      label="HTML"
                      isMobile={true}
                    />
                  </div>
                ) : (
                  <div className="w-full h-full overflow-hidden flex-1" style={{ minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
                    <Editor
                      language="css"
                      value={css}
                      onChange={setCss}
                      label="CSS"
                      isMobile={true}
                    />
                  </div>
                )}
              </div>
              
              {/* Check Results - Mobile: shown below editor */}
              {checkResults.length > 0 && (
                <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 max-h-64 overflow-y-auto shrink-0">
                  <div className={`mb-3 p-3 rounded-lg ${
                    passedAll
                      ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500 dark:border-green-400'
                      : 'bg-red-50 dark:bg-red-900/20 border-2 border-red-500 dark:border-red-400'
                  }`}>
                    <h3 className={`font-bold text-sm mb-2 ${
                      passedAll
                        ? 'text-green-700 dark:text-green-300'
                        : 'text-red-700 dark:text-red-300'
                    }`}>
                      {passedAll ? '✅ ' + t('allChecksPassed') : '❌ ' + t('someChecksFailed')}
                    </h3>
                    {passedAll && (
                      <p className="text-xs text-green-600 dark:text-green-400 mb-2">
                        {t('congratulations')}! {t('continue')} {t('nextExercise')}!
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    {checkResults.map((result, index) => (
                      <div
                        key={index}
                        className={`p-2 rounded-lg text-xs ${
                          result.passed
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-300 dark:border-green-700'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-700'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-base flex-shrink-0">{result.passed ? '✓' : '✗'}</span>
                          <span className="flex-1 leading-tight">{result.message}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Preview & Results (Desktop only) */}
          <div className="hidden lg:flex flex-1 flex-col border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 md:px-6 py-3 shrink-0">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('preview')}
              </h2>
            </div>

            <div className="flex-1 min-h-0 p-4">
              <Preview html={html} css={css} js="" isMobile={false} />
            </div>

            {/* Check Results - Desktop */}
            {checkResults.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 md:p-6 max-h-96 overflow-y-auto shrink-0">
                <div className={`mb-4 p-4 rounded-lg ${
                  passedAll
                    ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500 dark:border-green-400'
                    : 'bg-red-50 dark:bg-red-900/20 border-2 border-red-500 dark:border-red-400'
                }`}>
                  <h3 className={`font-bold text-base md:text-lg mb-2 ${
                    passedAll
                      ? 'text-green-700 dark:text-green-300'
                      : 'text-red-700 dark:text-red-300'
                  }`}>
                    {passedAll ? '✅ ' + t('allChecksPassed') : '❌ ' + t('someChecksFailed')}
                  </h3>
                  {passedAll && (
                    <p className="text-sm text-green-600 dark:text-green-400">
                      {t('congratulations')}! {t('continue')} {t('nextExercise')}!
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  {checkResults.map((result, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg text-sm border ${
                        result.passed
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-lg flex-shrink-0">{result.passed ? '✓' : '✗'}</span>
                        <span className="flex-1">{result.message}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
