'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useI18n } from '../../../hooks/useI18n';
import { isAuthenticated, ensureAuthenticated, getToken } from '../../../lib/api';
import { getLocalizedLessonContent } from '../../../lib/lessonContent';
import { formatNumber } from '../../../lib/formatNumber';
import Editor from '../../../components/Editor';
import Preview from '../../../components/Preview';
import Navbar from '../../../components/Navbar';
import { ToastContainer, showToast } from '../../../components/Toast';
import ConfirmModal from '../../../components/ConfirmModal';

interface Lesson {
  _id: string;
  slug: string;
  title: string;
  homework: {
    id: string;
    title: string;
    brief: string;
    rubric: Array<{
      id: string;
      description: string;
      points: number;
    }>;
  };
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

export default function HomeworkPage() {
  const router = useRouter();
  const { slug } = router.query;
  const { t, language } = useI18n();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [originalLesson, setOriginalLesson] = useState<Lesson | null>(null); // Store original (non-localized) lesson
  const [html, setHtml] = useState('');
  const [css, setCss] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [checkResults, setCheckResults] = useState<CheckResult[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [xpAwarded, setXpAwarded] = useState(0);
  const [locked, setLocked] = useState(false);
  const [activeTab, setActiveTab] = useState<'html' | 'css'>('html');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showTaskDescription, setShowTaskDescription] = useState(false); // Mobile: collapsible task description

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
    }
  }, [language, originalLesson]);

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

        if (localizedLesson.homework) {
          // Check if already submitted
          const submitResponse = await fetch('/api/homework/submit', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              lessonId: lessonData._id,
              html: '',
              css: '',
            }),
          });

          if (submitResponse.ok) {
            const submitData = await submitResponse.json();
            if (submitData.locked) {
              setLocked(true);
              setSubmitted(true);
              if (submitData.score !== undefined) {
                setScore(submitData.score);
              }
            }
          }

          // Use initialHtml/initialCss from original homework (they don't need translation)
          setHtml(lessonData.homework?.initialHtml || '');
          setCss(lessonData.homework?.initialCss || '');
        }
      }
    } catch (error) {
      console.error('Error fetching lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitClick = () => {
    if (!lesson || locked) return;
    setShowConfirmModal(true);
  };

  const handleSubmit = async () => {
    if (!lesson || locked) return;

    setSubmitting(true);
    try {
      const token = getToken();
      const response = await fetch('/api/homework/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          lessonId: lesson._id,
          html,
          css,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCheckResults(data.checksResult || []);
        setSubmitted(true);
        setScore(data.score || 0);
        setXpAwarded(data.xpAwarded || 0);
        setLocked(data.locked || false);

        if (data.accepted) {
          showToast(`${t('homeworkAccepted') || 'Homework accepted!'} ${data.xpAwarded > 0 ? `+${formatNumber(data.xpAwarded)} XP` : ''}`, 'success');
          setTimeout(() => {
            router.push(`/learn/${slug}`);
          }, 3000);
        } else {
          // Show partial XP if any was awarded
          const failedCount = (data.checksResult || []).filter((r: any) => !r.passed).length;
          const xpMessage = data.xpAwarded > 0 ? ` ${t('earned') || 'Earned'}: +${formatNumber(data.xpAwarded)} XP` : '';
          showToast(`${failedCount} ${t('checkFailed') || 'check(s) failed'}.${xpMessage} ${t('homeworkNotAccepted') || 'Homework not accepted.'}`, data.xpAwarded > 0 ? 'info' : 'error');
        }
      } else {
        const errorData = await response.json();
        showToast(errorData.error || t('errorSubmitting') || 'Error submitting homework', 'error');
      }
    } catch (error) {
      console.error('Error submitting homework:', error);
    } finally {
      setSubmitting(false);
    }
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

  if (!lesson || !lesson.homework) {
    return (
      <>
        <Head>
          <title>{t('homework')} - {t('appName')}</title>
        </Head>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t('homework')} {t('notFound')}
            </h1>
            <button
              onClick={() => router.push(`/learn/${slug}`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {t('backToLesson')}
            </button>
          </div>
        </div>
      </>
    );
  }

  const allPassed = checkResults.length > 0 && checkResults.every(r => r.passed);

  return (
    <>
      <ToastContainer />
      <Head>
        <title>{lesson.homework.title} - {t('appName')}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col" style={{ height: '100vh', overflow: 'hidden' }}>
        <Navbar isMobile={false} />

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden" style={{ height: 'calc(100vh - 64px)', minHeight: 0, flex: '1 1 auto', overflowY: 'hidden' }}>
          {/* Left Side - Editor (60% width) */}
          <div className="flex-1 lg:flex-[2] flex flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            {/* Header - Mobile'da juda kompakt */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-2 sm:px-4 py-1 sm:py-2 shrink-0">
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    if (window.history.length > 1) {
                      router.back();
                    } else {
                      router.push(`/learn/${slug}`);
                    }
                  }}
                  className="px-1.5 py-0.5 text-[10px] sm:text-xs text-purple-100 active:text-white flex items-center gap-0.5 font-medium active:bg-white/20 rounded touch-manipulation"
                >
                  ←
                </button>
                <h1 className="text-xs sm:text-base md:text-lg font-bold leading-tight truncate flex-1 text-center">
                  📝 {lesson.homework.title}
                </h1>
                {!locked && (
                  <button
                    onClick={handleSubmitClick}
                    disabled={submitting || submitted}
                    className={`px-2 sm:px-4 py-1 sm:py-2 rounded-lg font-semibold text-[10px] sm:text-sm transition-all shadow-md active:scale-95 touch-manipulation shrink-0 whitespace-nowrap ${
                      submitted
                        ? 'bg-green-500 text-white active:bg-green-600'
                        : 'bg-white text-purple-600 active:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                  >
                    {submitting ? t('loading') : submitted ? '✓' : t('submitFinal')}
                  </button>
                )}
              </div>
            </div>

            {/* Task Description - Kompakt va kichik */}
            <div className={`bg-purple-50 dark:bg-purple-900/20 border-b border-gray-200 dark:border-gray-700 shrink-0 ${
              showTaskDescription ? 'max-h-[40vh]' : 'max-h-0'
            } md:max-h-48 overflow-y-auto transition-all duration-300`}>
              <div className="px-3 sm:px-4 py-2 sm:py-2.5">
              <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                  📋
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1.5 text-xs sm:text-sm">
                    {t('task')}:
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {lesson.homework.brief}
                  </p>
                </div>
              </div>

              {/* Rubric - Compact */}
              {lesson.homework.rubric && lesson.homework.rubric.length > 0 && (
                <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-purple-200 dark:border-purple-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1.5 text-xs">
                    📊 {t('requirements')} ({lesson.homework.rubric.reduce((sum, r) => sum + r.points, 0)} {t('score')}):
                  </h3>
                  <div className="space-y-1">
                    {lesson.homework.rubric.map((item) => (
                      <div key={item.id} className="flex items-start gap-1.5 p-1 bg-white dark:bg-gray-800 rounded text-xs">
                        <span className="text-purple-600 dark:text-purple-400 font-bold flex-shrink-0">
                          {item.points}pt
                        </span>
                        <span className="text-gray-700 dark:text-gray-300 flex-1 leading-tight">
                          {item.description}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {locked && (
                <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border-2 border-amber-400 dark:border-amber-500 shadow-lg">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 text-2xl">⚠️</div>
                    <div>
                      <p className="text-sm md:text-base text-amber-800 dark:text-amber-200 font-semibold mb-1">
                        {t('alreadySubmitted') || 'You have already submitted this homework. This is your final submission.'}
                      </p>
                      {score > 0 && (
                        <p className="text-xs md:text-sm text-amber-700 dark:text-amber-300">
                          {t('score')}: {score} / {lesson.homework.rubric.reduce((sum, r) => sum + r.points, 0)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              </div>
            </div>

            {/* Mobile: Task Description Toggle Button */}
            <button
              onClick={() => setShowTaskDescription(!showTaskDescription)}
              className="md:hidden bg-purple-100 dark:bg-purple-900/30 border-b border-gray-200 dark:border-gray-700 px-2 py-1 text-left text-[10px] font-semibold text-purple-700 dark:text-purple-300 flex items-center justify-between touch-manipulation"
            >
              <span>📋 {t('task')} {showTaskDescription ? '↑' : '↓'}</span>
              <span className="text-[10px] text-purple-600 dark:text-purple-400">
                {showTaskDescription ? t('hide') || 'Hide' : t('show') || 'Show'}
              </span>
            </button>

            {/* Tabs - Mobile'da juda kompakt */}
            <div className="flex bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shrink-0">
              <button
                onClick={() => setActiveTab('html')}
                className={`flex-1 px-2 sm:px-4 py-1 sm:py-2 font-semibold text-[10px] sm:text-sm transition-all touch-manipulation ${
                  activeTab === 'html'
                    ? 'bg-white dark:bg-gray-900 text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                    : 'text-gray-600 dark:text-gray-400 active:text-gray-900 dark:active:text-white'
                }`}
              >
                HTML
              </button>
              <button
                onClick={() => setActiveTab('css')}
                className={`flex-1 px-2 sm:px-4 py-1 sm:py-2 font-semibold text-[10px] sm:text-sm transition-all touch-manipulation ${
                  activeTab === 'css'
                    ? 'bg-white dark:bg-gray-900 text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                    : 'text-gray-600 dark:text-gray-400 active:text-gray-900 dark:active:text-white'
                }`}
              >
                CSS
              </button>
            </div>

            {/* Editor - Mobile uchun to'liq balandlik */}
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden" style={{ height: '100%', flex: '1 1 auto', display: 'flex', flexDirection: 'column' }}>
              <div className="flex-1 min-h-0 w-full overflow-hidden" style={{ flex: '1 1 auto', minHeight: '300px', height: submitted ? 'calc(100% - 200px)' : '100%', display: 'flex', flexDirection: 'column' }}>
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
              
              {/* Submission Results - Mobile: shown below editor */}
              {submitted && (
                <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 max-h-64 overflow-y-auto shrink-0">
                  <div className={`mb-3 p-3 rounded-lg ${
                    allPassed
                      ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500 dark:border-green-400'
                      : 'bg-red-50 dark:bg-red-900/20 border-2 border-red-500 dark:border-red-400'
                  }`}>
                    <h3 className={`font-bold text-sm mb-2 ${
                      allPassed
                        ? 'text-green-700 dark:text-green-300'
                        : 'text-red-700 dark:text-red-300'
                    }`}>
                      {allPassed ? '✅ ' + t('allChecksPassed') : '❌ ' + t('someChecksFailed')}
                    </h3>
                    
                    {score > 0 && (
                      <div className="space-y-1 mb-2">
                        <div className="text-xs font-semibold text-green-700 dark:text-green-300">
                          {t('score')}: {score} / {lesson.homework.rubric.reduce((sum, r) => sum + r.points, 0)}
                        </div>
                        {xpAwarded > 0 && (
                          <div className="text-xs text-green-600 dark:text-green-400">
                            ⭐ {t('xpAwarded')}: +{formatNumber(xpAwarded)} XP
                          </div>
                        )}
                      </div>
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
          <div className="hidden lg:flex flex-1 lg:flex-[1] flex-col border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 md:px-6 py-3 shrink-0">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('preview')}
              </h2>
            </div>

            <div className="flex-1 min-h-0 p-4">
              <Preview html={html} css={css} js="" isMobile={false} />
            </div>

            {/* Submission Results - Desktop */}
            {submitted && (
              <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 md:p-6 max-h-96 overflow-y-auto">
                <div className={`mb-4 p-4 rounded-lg ${
                  allPassed
                    ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500 dark:border-green-400'
                    : 'bg-red-50 dark:bg-red-900/20 border-2 border-red-500 dark:border-red-400'
                }`}>
                  <h3 className={`font-bold text-base md:text-lg mb-2 ${
                    allPassed
                      ? 'text-green-700 dark:text-green-300'
                      : 'text-red-700 dark:text-red-300'
                  }`}>
                    {allPassed ? '✅ ' + t('allChecksPassed') : '❌ ' + t('someChecksFailed')}
                  </h3>
                  
                  {score > 0 && (
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-green-700 dark:text-green-300">
                        {t('score')}: {score} / {lesson.homework.rubric.reduce((sum, r) => sum + r.points, 0)}
                      </div>
                      {xpAwarded > 0 && (
                        <div className="text-sm text-green-600 dark:text-green-400">
                          ⭐ {t('xpAwarded')}: +{formatNumber(xpAwarded)} XP
                        </div>
                      )}
                    </div>
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
                        <span>{result.message}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleSubmit}
        title={t('confirmSubmit')?.split('.')[0] || 'Confirm Submission'}
        message={t('confirmSubmit') || 'Are you sure you want to submit? This is your final submission and cannot be changed.'}
        confirmText={t('submitFinal') || 'Submit'}
        cancelText={t('cancel') || 'Cancel'}
        confirmColor="purple"
      />
    </>
  );
}
