'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { useI18n } from '../../hooks/useI18n';
import { isAuthenticated, getToken } from '../../lib/api';
import { showToast } from '../../components/Toast';
import Editor from '../../components/Editor';
import Preview from '../../components/Preview';
import { evaluateHTMLCheck, evaluateCSSCheck } from '../../lib/grader';
import { formatNumber } from '../../lib/formatNumber';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function CompetitionDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [competition, setCompetition] = useState<any>(null);
  const [activeChallenge, setActiveChallenge] = useState<number>(0);
  const [html, setHtml] = useState('');
  const [css, setCss] = useState('');
  const [checking, setChecking] = useState(false);
  const [checkResults, setCheckResults] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

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

        if (id) {
          fetchCompetition();
        }
      }
    };

    checkAuth();
  }, [router, id, mounted]);

  const fetchCompetition = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch(`/api/competitions/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCompetition(data.competition);
        if (data.competition.challenges && data.competition.challenges.length > 0) {
          const challenge = data.competition.challenges[0];
          setHtml(challenge.html || '');
          setCss(challenge.css || '');
        }
      } else {
        const errorData = await response.json();
        showToast(errorData.error || 'Failed to load competition', 'error');
        router.push('/competitions');
      }
    } catch (error) {
      console.error('Error fetching competition:', error);
      showToast('Error loading competition', 'error');
      router.push('/competitions');
    } finally {
      setLoading(false);
    }
  };

  const handleChallengeChange = (index: number) => {
    setActiveChallenge(index);
    const challenge = competition.challenges[index];
    setHtml(challenge.html || '');
    setCss(challenge.css || '');
    setCheckResults(null);
  };

  const handleCheck = async () => {
    if (!competition || !competition.challenges || competition.challenges.length === 0) {
      return;
    }

    const challenge = competition.challenges[activeChallenge];
    if (!challenge.checks || challenge.checks.length === 0) {
      showToast('No checks defined for this challenge', 'info');
      return;
    }

    setChecking(true);
    setCheckResults(null);

    try {
      const results: any[] = [];
      let passedCount = 0;

      for (const check of challenge.checks) {
        let passed = false;
        let message = '';

        if (check.type === 'html') {
          const result = evaluateHTMLCheck(check.rule, html, css);
          passed = result.passed;
          message = result.message || '';
        } else if (check.type === 'css') {
          const result = evaluateCSSCheck(check.rule, css);
          passed = result.passed;
          message = result.message || '';
        }

        results.push({
          id: check.id,
          rule: check.rule,
          hint: check.hint,
          passed,
          message,
        });

        if (passed) {
          passedCount++;
        }
      }

      const allPassed = passedCount === challenge.checks.length;
      const score = challenge.checks.length > 0 ? Math.round((passedCount / challenge.checks.length) * 100) : 0;

      setCheckResults({
        results,
        passedCount,
        totalCount: challenge.checks.length,
        allPassed,
        score,
        reward: allPassed ? challenge.reward || 0 : 0,
      });

      if (allPassed) {
        showToast(`All checks passed! You earned ${challenge.reward} XP!`, 'success');
        // Submit challenge completion
        await submitChallenge(challenge.id, true, challenge.reward);
      } else {
        showToast(`${passedCount}/${challenge.checks.length} checks passed`, 'info');
      }
    } catch (error) {
      console.error('Error checking challenge:', error);
      showToast('Error checking challenge', 'error');
    } finally {
      setChecking(false);
    }
  };

  const submitChallenge = async (challengeId: string, passed: boolean, reward: number) => {
    try {
      const token = getToken();
      const response = await fetch(`/api/competitions/${id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          challengeId,
          passed,
          reward,
          html,
          css,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Refresh competition data to update progress
          fetchCompetition();
        }
      }
    } catch (error) {
      console.error('Error submitting challenge:', error);
    }
  };

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/competitions');
    }
  };

  const getLocalizedTitle = (item: any) => {
    if (typeof window === 'undefined') return item.title || item.title_en;
    const lang = localStorage.getItem('language') || 'en';
    if (lang === 'uz' && item.title_uz) return item.title_uz;
    if (lang === 'ru' && item.title_ru) return item.title_ru;
    return item.title || item.title_en;
  };

  const getLocalizedDescription = (item: any) => {
    if (typeof window === 'undefined') return item.description || item.description_en;
    const lang = localStorage.getItem('language') || 'en';
    if (lang === 'uz' && item.description_uz) return item.description_uz;
    if (lang === 'ru' && item.description_ru) return item.description_ru;
    return item.description || item.description_en;
  };

  if (!mounted || loading) {
    return (
      <LoadingSpinner 
        fullScreen 
        size="lg" 
        text={t('loading') || 'Loading...'} 
      />
    );
  }

  if (!competition) {
    return null;
  }

  const isUnlocked = new Date(competition.unlockAt) <= new Date();
  const currentChallenge = competition.challenges?.[activeChallenge];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="mb-4 px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all shadow-sm font-medium flex items-center gap-2"
          >
            ← {t('back') || 'Back'}
          </button>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
              🏆 {getLocalizedTitle(competition)}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {getLocalizedDescription(competition)}
            </p>
            {!isUnlocked && (
              <div className="px-4 py-2 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg">
                <p className="text-yellow-800 dark:text-yellow-300">
                  🔒 {t('locked') || 'Locked'} - {t('unlocksAt') || 'Unlocks at'}: {new Date(competition.unlockAt).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>

        {!isUnlocked ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t('competitionLocked') || 'Competition is Locked'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t('unlocksAt') || 'Unlocks at'}: {new Date(competition.unlockAt).toLocaleString()}
            </p>
          </div>
        ) : (
          <>
            {/* Challenges Tabs */}
            {competition.challenges && competition.challenges.length > 1 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-6">
                <div className="flex gap-2 overflow-x-auto">
                  {competition.challenges.map((challenge: any, index: number) => (
                    <button
                      key={challenge.id || index}
                      onClick={() => handleChallengeChange(index)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                        activeChallenge === index
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {getLocalizedTitle(challenge)} {challenge.reward ? `(${formatNumber(challenge.reward)} XP)` : ''}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Challenge Content */}
            {currentChallenge && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Challenge Info & Editor */}
                <div className="space-y-6">
                  {/* Challenge Description */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      {getLocalizedTitle(currentChallenge)}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 whitespace-pre-line">
                      {getLocalizedDescription(currentChallenge)}
                    </p>
                    {currentChallenge.reward > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg text-sm font-bold">
                          🎁 {formatNumber(currentChallenge.reward)} XP {t('reward') || 'Reward'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Editor */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        💻 {t('codeEditor') || 'Code Editor'}
                      </h3>
                      <button
                        onClick={handleCheck}
                        disabled={checking}
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 font-medium transition-all shadow-md"
                      >
                        {checking ? 'Checking...' : '✓ Check Solution'}
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="h-64">
                        <Editor
                          language="html"
                          value={html}
                          onChange={setHtml}
                          label="HTML"
                        />
                      </div>
                      <div className="h-48">
                        <Editor
                          language="css"
                          value={css}
                          onChange={setCss}
                          label="CSS"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Preview & Results */}
                <div className="space-y-6">
                  {/* Preview */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      💡 {t('preview') || 'Preview'}
                    </h3>
                    <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <Preview html={html} css={css} js="" />
                    </div>
                  </div>

                  {/* Check Results */}
                  {checkResults && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        📊 {t('results') || 'Results'}
                      </h3>
                      
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-700 dark:text-gray-300">
                            {t('score') || 'Score'}: {checkResults.score}%
                          </span>
                          <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
                            checkResults.allPassed
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                              : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                          }`}>
                            {checkResults.passedCount}/{checkResults.totalCount} {t('passed') || 'Passed'}
                          </span>
                        </div>
                        {checkResults.allPassed && checkResults.reward > 0 && (
                          <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                            <p className="text-green-800 dark:text-green-300 font-bold">
                              🎉 {t('earned') || 'Earned'} {formatNumber(checkResults.reward)} XP!
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        {checkResults.results.map((result: any, index: number) => (
                          <div
                            key={result.id || index}
                            className={`p-3 rounded-lg border-2 ${
                              result.passed
                                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <span className="text-xl">{result.passed ? '✓' : '✗'}</span>
                              <div className="flex-1">
                                <p className={`font-medium ${result.passed ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
                                  {result.message}
                                </p>
                                {!result.passed && result.hint && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    💡 {result.hint}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

