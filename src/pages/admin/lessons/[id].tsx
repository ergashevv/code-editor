'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useI18n } from '../../../hooks/useI18n';
import { isAuthenticated, ensureAuthenticated, getToken, getUser } from '../../../lib/api';
import { clearLessonsCache } from '../../../lib/lessonsCache';
import Navbar from '../../../components/Navbar';

interface Lesson {
  _id: string;
  slug: string;
  title: string;
  summary: string;
  contentMD: string;
  order: number;
  unlockAt: string;
}

export async function getServerSideProps() {
  return {
    props: {},
  };
}

export default function AdminLessonEditPage() {
  const router = useRouter();
  const { id } = router.query;
  const { t } = useI18n();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (router.isReady && id) {
        if (!isAuthenticated()) {
          router.push('/auth');
          return;
        }

        const isValid = await ensureAuthenticated();
        if (!isValid) {
          router.push('/auth');
          setLoading(false);
          return;
        }

        const userData = getUser();
        setUser(userData);

        // Check if admin
        if (!userData || (userData as any).role !== 'ADMIN') {
          router.push('/home');
          setLoading(false);
          return;
        }

        // Fetch lesson
        try {
          const token = getToken();
          const response = await fetch(`/api/admin/lessons/${id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            setLesson(data.lesson);
          } else {
            console.error('Failed to fetch lesson');
            router.push('/admin');
          }
        } catch (error) {
          console.error('Error fetching lesson:', error);
          router.push('/admin');
        } finally {
          setLoading(false);
        }
      }
    };

    checkAuth();
  }, [router, id]);

  const handleSave = async () => {
    if (!lesson) return;

    setSaving(true);
    try {
      const token = getToken();
      const response = await fetch(`/api/admin/lessons/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(lesson),
      });

      if (response.ok) {
        // Clear cache when lesson is updated
        clearLessonsCache();
        alert('Lesson updated successfully!');
        router.push('/admin');
      } else {
        const data = await response.json();
        alert(`Error: ${data.error || 'Failed to update lesson'}`);
      }
    } catch (error) {
      console.error('Error saving lesson:', error);
      alert('Error saving lesson');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>Loading... - {t('appName')}</title>
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
          <title>Lesson Not Found - {t('appName')}</title>
        </Head>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Lesson Not Found
            </h1>
            <button
              onClick={() => router.push('/admin')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Admin
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Edit Lesson - {t('appName')}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar isMobile={false} />

        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-6">
            <button
              onClick={() => router.push('/admin')}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-4 flex items-center gap-2"
            >
              ← Back to Admin Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Edit Lesson: {lesson.title}
            </h1>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title
              </label>
              <input
                type="text"
                value={lesson.title}
                onChange={(e) => setLesson({ ...lesson, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Slug
              </label>
              <input
                type="text"
                value={lesson.slug}
                onChange={(e) => setLesson({ ...lesson, slug: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Summary
              </label>
              <textarea
                value={lesson.summary}
                onChange={(e) => setLesson({ ...lesson, summary: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Content (Markdown)
              </label>
              <textarea
                value={lesson.contentMD}
                onChange={(e) => setLesson({ ...lesson, contentMD: e.target.value })}
                rows={15}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Order
                </label>
                <input
                  type="number"
                  value={lesson.order}
                  onChange={(e) => setLesson({ ...lesson, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => router.push('/admin')}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

