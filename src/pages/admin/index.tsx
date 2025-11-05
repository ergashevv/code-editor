'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { useI18n } from '../../hooks/useI18n';
import { isAuthenticated, ensureAuthenticated, getToken, getUser } from '../../lib/api';
import { clearLessonsCache } from '../../lib/lessonsCache';
import { formatNumber } from '../../lib/formatNumber';
import { formatPhoneNumber } from '../../lib/formatPhone';
import Navbar from '../../components/Navbar';
import { ToastContainer, showToast } from '../../components/Toast';

// Dynamic import DatePicker to avoid SSR issues
const DatePicker: any = dynamic(
  () => import('react-datepicker').then((mod: any) => mod.default || mod),
  { 
    ssr: false,
    loading: () => <div className="w-full px-3 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse">Loading...</div>
  }
);

// Import CSS separately
if (typeof window !== 'undefined') {
  require('react-datepicker/dist/react-datepicker.css');
}

interface Lesson {
  _id: string;
  slug: string;
  title: string;
  order: number;
  unlockAt: string;
  active?: boolean;
  isUnlocked?: boolean;
  locked?: boolean;
}

export async function getServerSideProps() {
  return {
    props: {},
  };
}

export default function AdminPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState<string | null>(null);
  const [calendarDate, setCalendarDate] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<'lessons' | 'users' | 'competitions'>('lessons');
  
  // Users state
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersSearch, setUsersSearch] = useState('');
  const [usersRoleFilter, setUsersRoleFilter] = useState<'all' | 'USER' | 'ADMIN'>('all');
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editUserData, setEditUserData] = useState<any>(null);
  const [xpToAdd, setXpToAdd] = useState<{ [key: string]: string }>({});
  
  // Competitions state
  const [competitions, setCompetitions] = useState<any[]>([]);
  const [competitionsLoading, setCompetitionsLoading] = useState(false);
  const [editingCompetition, setEditingCompetition] = useState<string | null>(null);
  const [editCompetitionData, setEditCompetitionData] = useState<any>(null);
  const [showCompetitionCalendar, setShowCompetitionCalendar] = useState<string | null>(null);
  const [competitionCalendarDate, setCompetitionCalendarDate] = useState<Date | null>(null);

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

        fetchLessons();
        if (activeTab === 'users') {
          fetchUsers();
        }
        if (activeTab === 'competitions') {
          fetchCompetitions();
        }
      }
    };

    checkAuth();
  }, [router, activeTab]);

  const fetchLessons = async () => {
    try {
      const token = getToken();
      // Don't use cache for admin, always fetch fresh data
      const response = await fetch('/api/lessons', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLessons(data.lessons || []);
      } else {
        console.error('Failed to fetch lessons');
        setLessons([]);
      }
    } catch (error) {
      console.error('Error fetching lessons:', error);
      setLessons([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (lessonId: string, action: 'lock' | 'unlock' | 'activate' | 'deactivate') => {
    setUpdating(lessonId);
    try {
      const token = getToken();
      const response = await fetch(`/api/admin/lessons/${lessonId}/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        // Clear cache immediately to force refresh for all users
        clearLessonsCache();
        // Wait a bit for server to update database
        await new Promise(resolve => setTimeout(resolve, 200));
        // Refresh lessons from server (this will have new lastUpdated)
        await fetchLessons();
      } else {
        const data = await response.json();
        showToast(data.error || 'Failed to update lesson', 'error');
      }
    } catch (error) {
      console.error('Error toggling lesson:', error);
      showToast('Error updating lesson', 'error');
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async (lessonId: string) => {
    if (!deleteConfirm || deleteConfirm !== lessonId) {
      setDeleteConfirm(lessonId);
      return;
    }

    setUpdating(lessonId);
    try {
      const token = getToken();
      const response = await fetch(`/api/admin/lessons/${lessonId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Clear cache immediately to force refresh for all users
        clearLessonsCache();
        // Wait a bit for server to update database
        await new Promise(resolve => setTimeout(resolve, 200));
        // Refresh lessons from server (this will have new lastUpdated)
        await fetchLessons();
        setDeleteConfirm(null);
        showToast('Lesson deleted successfully', 'success');
      } else {
        const data = await response.json();
        showToast(data.error || 'Failed to delete lesson', 'error');
      }
    } catch (error) {
      console.error('Error deleting lesson:', error);
      showToast('Error deleting lesson', 'error');
    } finally {
      setUpdating(null);
      setDeleteConfirm(null);
    }
  };

  const handleSetUnlockDate = async (lessonId: string) => {
    if (!calendarDate) {
      showToast('Please select a date and time', 'info');
      return;
    }

    setUpdating(lessonId);
    try {
      const token = getToken();
      const response = await fetch(`/api/admin/lessons/${lessonId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          unlockAt: calendarDate.toISOString(),
        }),
      });

      if (response.ok) {
        // Clear cache immediately to force refresh for all users
        clearLessonsCache();
        // Wait a bit for server to update database
        await new Promise(resolve => setTimeout(resolve, 200));
        // Refresh lessons from server (this will have new lastUpdated)
        await fetchLessons();
        setShowCalendar(null);
        setCalendarDate(null);
        showToast('Unlock date set successfully', 'success');
      } else {
        const data = await response.json();
        showToast(data.error || 'Failed to set unlock date', 'error');
      }
    } catch (error) {
      console.error('Error setting unlock date:', error);
      showToast('Error setting unlock date', 'error');
    } finally {
      setUpdating(null);
    }
  };

  // DatePicker uchun helper function
  const parseDate = (dateString: string): Date => {
    return new Date(dateString);
  };

  const getUnlockStatus = (lesson: Lesson) => {
    const now = new Date();
    const unlockAt = new Date(lesson.unlockAt);
    return unlockAt <= now;
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const token = getToken();
      const params = new URLSearchParams();
      if (usersSearch) params.append('search', usersSearch);
      if (usersRoleFilter !== 'all') params.append('role', usersRoleFilter);
      
      const response = await fetch(`/api/admin/users?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        console.error('Failed to fetch users');
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
    if (activeTab === 'competitions') {
      fetchCompetitions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, usersSearch, usersRoleFilter]);

  const fetchCompetitions = async () => {
    setCompetitionsLoading(true);
    try {
      const token = getToken();
      const response = await fetch('/api/admin/competitions', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCompetitions(data.competitions || []);
      } else {
        console.error('Failed to fetch competitions');
        setCompetitions([]);
      }
    } catch (error) {
      console.error('Error fetching competitions:', error);
      setCompetitions([]);
    } finally {
      setCompetitionsLoading(false);
    }
  };

  const handleEditCompetition = async (competitionId: string) => {
    setUpdating(competitionId);
    try {
      const token = getToken();
      const response = await fetch(`/api/admin/competitions/${competitionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(editCompetitionData),
      });

      if (response.ok) {
        showToast('Competition updated successfully', 'success');
        setEditingCompetition(null);
        setEditCompetitionData(null);
        setShowCompetitionCalendar(null);
        setCompetitionCalendarDate(null);
        fetchCompetitions();
      } else {
        const data = await response.json();
        showToast(data.error || 'Failed to update competition', 'error');
      }
    } catch (error) {
      console.error('Error updating competition:', error);
      showToast('Error updating competition', 'error');
    } finally {
      setUpdating(null);
    }
  };

  const handleDeleteCompetition = async (competitionId: string) => {
    if (!deleteConfirm || deleteConfirm !== competitionId) {
      setDeleteConfirm(competitionId);
      return;
    }

    setUpdating(competitionId);
    try {
      const token = getToken();
      const response = await fetch(`/api/admin/competitions/${competitionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        showToast('Competition deleted successfully', 'success');
        setDeleteConfirm(null);
        fetchCompetitions();
      } else {
        const data = await response.json();
        showToast(data.error || 'Failed to delete competition', 'error');
      }
    } catch (error) {
      console.error('Error deleting competition:', error);
      showToast('Error deleting competition', 'error');
    } finally {
      setUpdating(null);
      setDeleteConfirm(null);
    }
  };

  const handleSetCompetitionUnlockDate = async (competitionId: string) => {
    if (!competitionCalendarDate) {
      showToast('Please select a date and time', 'info');
      return;
    }

    setUpdating(competitionId);
    try {
      const token = getToken();
      const response = await fetch(`/api/admin/competitions/${competitionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          unlockAt: competitionCalendarDate.toISOString(),
        }),
      });

      if (response.ok) {
        showToast('Unlock date set successfully', 'success');
        setShowCompetitionCalendar(null);
        setCompetitionCalendarDate(null);
        fetchCompetitions();
      } else {
        const data = await response.json();
        showToast(data.error || 'Failed to set unlock date', 'error');
      }
    } catch (error) {
      console.error('Error setting unlock date:', error);
      showToast('Error setting unlock date', 'error');
    } finally {
      setUpdating(null);
    }
  };

  const handleEditUser = async (userId: string) => {
    // Validate phone number format before submitting
    if (editUserData?.phone) {
      const phoneRegex = /^\+998-\d{2}-\d{3}-\d{2}-\d{2}$/;
      if (!phoneRegex.test(editUserData.phone)) {
        showToast('Phone number must be in format: +998-XX-XXX-XX-XX (9 digits)', 'error');
        return;
      }
    }

    setUpdating(userId);
    try {
      const token = getToken();
      
      // Prepare clean data object (only include fields that are defined)
      const updateData: any = {};
      if (editUserData?.username !== undefined) updateData.username = editUserData.username;
      if (editUserData?.phone !== undefined) updateData.phone = editUserData.phone;
      if (editUserData?.role !== undefined) updateData.role = editUserData.role;
      if (editUserData?.level !== undefined) updateData.level = editUserData.level;
      if (editUserData?.xp !== undefined) updateData.xp = editUserData.xp;
      if (editUserData?.password !== undefined && editUserData.password !== '') {
        updateData.password = editUserData.password;
      }

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        showToast('User updated successfully', 'success');
        setEditingUser(null);
        setEditUserData(null);
        setXpToAdd({});
        fetchUsers();
      } else {
        const data = await response.json();
        showToast(data.error || 'Failed to update user', 'error');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      showToast('Error updating user', 'error');
    } finally {
      setUpdating(null);
    }
  };

  const handleAddXp = async (userId: string) => {
    const xpValue = xpToAdd[userId];
    if (!xpValue || isNaN(parseInt(xpValue)) || parseInt(xpValue) <= 0) {
      showToast('Please enter a valid positive number', 'error');
      return;
    }

    setUpdating(userId);
    try {
      const token = getToken();
      const response = await fetch(`/api/admin/users/${userId}/add-xp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ xp: parseInt(xpValue) }),
      });

      if (response.ok) {
        showToast(`Added ${xpValue} XP successfully`, 'success');
        setXpToAdd({ ...xpToAdd, [userId]: '' });
        fetchUsers();
      } else {
        const data = await response.json();
        showToast(data.error || 'Failed to add XP', 'error');
      }
    } catch (error) {
      console.error('Error adding XP:', error);
      showToast('Error adding XP', 'error');
    } finally {
      setUpdating(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!deleteConfirm || deleteConfirm !== userId) {
      setDeleteConfirm(userId);
      return;
    }

    setUpdating(userId);
    try {
      const token = getToken();
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        showToast('User deleted successfully', 'success');
        setDeleteConfirm(null);
        fetchUsers();
      } else {
        const data = await response.json();
        showToast(data.error || 'Failed to delete user', 'error');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      showToast('Error deleting user', 'error');
    } finally {
      setUpdating(null);
      setDeleteConfirm(null);
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

  return (
    <>
      <ToastContainer />
      <Head>
        <title>Admin Dashboard - {t('appName')}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar isMobile={false} />

        <div className="container mx-auto px-4 py-8 max-w-7xl">
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            🔐 Admin Dashboard
          </h1>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('lessons')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'lessons'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              📚 Lessons
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'users'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              👥 Users
            </button>
            <button
              onClick={() => setActiveTab('competitions')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'competitions'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              🏆 Competitions
            </button>
          </div>

          {/* Lessons Tab */}
          {activeTab === 'lessons' && (
            <>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Lessons Management
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t('adminLessonsDescription') || 'Manage all lessons: lock/unlock, activate/deactivate, edit, and create new lessons.'}
            </p>
            <button
              onClick={() => router.push('/admin/lessons/new')}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 font-medium shadow-md transition-all"
            >
              ➕ {t('createNewLesson') || 'Create New Lesson'}
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              All Lessons ({lessons.length})
            </h2>
            {lessons.length === 0 ? (
              <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                {t('noLessonsYet') || 'No lessons yet. Create one to get started!'}
              </div>
            ) : (
              <div className="space-y-3">
                {lessons.map((lesson) => {
                  const isUnlocked = getUnlockStatus(lesson);
                  const isActive = lesson.active !== false;
                  const isUpdating = updating === lesson._id;

                  return (
                    <div
                      key={lesson._id}
                      className={`flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 border-2 rounded-lg transition-all ${
                        !isActive
                          ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 opacity-60'
                          : !isUnlocked
                          ? 'border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                            {lesson.title}
                          </h3>
                          {isActive && isUnlocked && (
                            <span className="px-2 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg text-xs font-bold">
                              ✅ {t('active') || 'Active'}
                            </span>
                          )}
                          {isActive && !isUnlocked && (
                            <span className="px-2 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg text-xs font-bold">
                              🔒 {t('locked') || 'Locked'}
                            </span>
                          )}
                          {!isActive && (
                            <span className="px-2 py-1 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-lg text-xs font-bold">
                              🔴 {t('inactive') || 'Inactive'}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                          📅 {new Date(lesson.unlockAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2 flex-shrink-0">
                        {/* Calendar Picker - Soddalashtirilgan */}
                        {showCalendar === lesson._id ? (
                          <div className="flex flex-col gap-3 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border-2 border-blue-500 shadow-lg">
                            <div className="flex flex-col sm:flex-row gap-3">
                              {/* Date Input */}
                              <div className="flex-1">
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                  📅 {t('date') || 'Date'}
                                </label>
                                <DatePicker
                                  selected={calendarDate || parseDate(lesson.unlockAt)}
                                  onChange={(date: Date | null) => setCalendarDate(date)}
                                  dateFormat="dd/MM/yyyy"
                                  minDate={new Date()}
                                  className="w-full px-3 py-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg border-2 border-gray-300 dark:border-gray-600 text-base font-medium focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
                                  wrapperClassName="w-full"
                                  calendarClassName="dark:bg-gray-800 dark:text-white shadow-xl"
                                  popperClassName="z-50"
                                />
                              </div>
                              {/* Time Input */}
                              <div className="flex-1">
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                  🕐 {t('time') || 'Time'}
                                </label>
                                <DatePicker
                                  selected={calendarDate || parseDate(lesson.unlockAt)}
                                  onChange={(date: Date | null) => {
                                    if (date && calendarDate) {
                                      // Preserve date, update time
                                      const newDate = new Date(calendarDate);
                                      newDate.setHours(date.getHours());
                                      newDate.setMinutes(date.getMinutes());
                                      setCalendarDate(newDate);
                                    } else {
                                      setCalendarDate(date);
                                    }
                                  }}
                                  showTimeSelect
                                  showTimeSelectOnly
                                  timeIntervals={15}
                                  timeCaption={t('time') || 'Time'}
                                  dateFormat="h:mm aa"
                                  className="w-full px-3 py-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg border-2 border-gray-300 dark:border-gray-600 text-base font-medium focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
                                  wrapperClassName="w-full"
                                  popperClassName="z-50"
                                />
                              </div>
                            </div>
                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleSetUnlockDate(lesson._id)}
                                disabled={isUpdating || !calendarDate}
                                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold transition-all shadow-md"
                              >
                                {isUpdating ? '...' : '✓ ' + (t('save') || 'Save')}
                              </button>
                              <button
                                onClick={() => {
                                  setShowCalendar(null);
                                  setCalendarDate(null);
                                }}
                                disabled={isUpdating}
                                className="px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold transition-all"
                              >
                                {t('cancel') || 'Cancel'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setShowCalendar(lesson._id);
                              setCalendarDate(parseDate(lesson.unlockAt));
                            }}
                            disabled={isUpdating}
                            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-all shadow-sm"
                            title={t('setUnlockDate') || 'Set Unlock Date'}
                          >
                            📅 {t('setDate') || 'Set Date'}
                          </button>
                        )}

                        {/* Action Buttons - Soddalashtirilgan */}
                        <div className="flex flex-wrap gap-2">
                          {/* Lock/Unlock */}
                          {isUnlocked ? (
                            <button
                              onClick={() => handleToggle(lesson._id, 'lock')}
                              disabled={isUpdating}
                              className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 text-sm font-medium transition-all shadow-sm"
                            >
                              🔒 {t('lock') || 'Lock'}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggle(lesson._id, 'unlock')}
                              disabled={isUpdating}
                              className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 text-sm font-medium transition-all shadow-sm"
                            >
                              🔓 {t('unlock') || 'Unlock'}
                            </button>
                          )}

                          {/* Edit */}
                          <button
                            onClick={() => router.push(`/admin/lessons/${lesson._id}`)}
                            className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 text-sm font-medium transition-all shadow-sm"
                          >
                            ✏️ {t('edit') || 'Edit'}
                          </button>

                          {/* Delete */}
                          {deleteConfirm === lesson._id ? (
                            <>
                              <button
                                onClick={() => handleDelete(lesson._id)}
                                disabled={isUpdating}
                                className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-lg hover:from-red-600 hover:to-rose-600 disabled:opacity-50 text-sm font-medium transition-all shadow-sm"
                              >
                                ✓ {t('confirm') || 'Confirm'}
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium transition-all"
                              >
                                ✕ {t('cancel') || 'Cancel'}
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(lesson._id)}
                              disabled={isUpdating}
                              className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-lg hover:from-red-600 hover:to-rose-600 disabled:opacity-50 text-sm font-medium transition-all shadow-sm"
                            >
                              🗑️ {t('delete') || 'Delete'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          </>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* Search and Filters */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Users Management
                </h2>
                <div className="flex flex-col md:flex-row gap-4">
                  <input
                    type="text"
                    placeholder="Search by username or phone..."
                    value={usersSearch}
                    onChange={(e) => setUsersSearch(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={usersRoleFilter}
                    onChange={(e) => setUsersRoleFilter(e.target.value as 'all' | 'USER' | 'ADMIN')}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Roles</option>
                    <option value="USER">Users</option>
                    <option value="ADMIN">Admins</option>
                  </select>
                </div>
              </div>

              {/* Users List */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  All Users ({users.length})
                </h2>
                {usersLoading ? (
                  <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                    {t('loading') || 'Loading...'}
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                    No users found
                  </div>
                ) : (
                  <div className="space-y-3">
                    {users.map((u) => {
                      const isEditing = editingUser === u._id;
                      const isUpdating = updating === u._id;

                      return (
                        <div
                          key={u._id}
                          className={`p-4 border-2 rounded-lg ${
                            u.role === 'ADMIN'
                              ? 'border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          {isEditing ? (
                            <div className="space-y-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Username
                                  </label>
                                  <input
                                    type="text"
                                    value={editUserData?.username || ''}
                                    onChange={(e) => setEditUserData({ ...editUserData, username: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Phone
                                  </label>
                                  <input
                                    type="tel"
                                    value={editUserData?.phone || ''}
                                    onChange={(e) => {
                                      const formatted = formatPhoneNumber(e.target.value);
                                      setEditUserData({ ...editUserData, phone: formatted });
                                    }}
                                    onBlur={(e) => {
                                      // Ensure format is correct on blur
                                      const formatted = formatPhoneNumber(e.target.value);
                                      setEditUserData({ ...editUserData, phone: formatted });
                                    }}
                                    placeholder="+998-XX-XXX-XX-XX"
                                    maxLength={18}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                  <p className={`mt-1 text-xs ${
                                    editUserData?.phone && editUserData.phone.length > 0 && !/^\+998-\d{2}-\d{3}-\d{2}-\d{2}$/.test(editUserData.phone)
                                      ? 'text-red-500 dark:text-red-400'
                                      : 'text-gray-500 dark:text-gray-400'
                                  }`}>
                                    Format: +998-XX-XXX-XX-XX {editUserData?.phone && !/^\+998-\d{2}-\d{3}-\d{2}-\d{2}$/.test(editUserData.phone) && editUserData.phone.length > 0 ? '(Incomplete)' : ''}
                                  </p>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Role
                                  </label>
                                  <select
                                    value={editUserData?.role || 'USER'}
                                    onChange={(e) => setEditUserData({ ...editUserData, role: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                  >
                                    <option value="USER">USER</option>
                                    <option value="ADMIN">ADMIN</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Level
                                  </label>
                                  <input
                                    type="number"
                                    min="1"
                                    value={editUserData?.level || 1}
                                    onChange={(e) => setEditUserData({ ...editUserData, level: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    XP (Set Total)
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={editUserData?.xp || 0}
                                    onChange={(e) => setEditUserData({ ...editUserData, xp: parseInt(e.target.value) || 0 })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Add XP (Quick Add)
                                  </label>
                                  <div className="flex gap-2">
                                    <input
                                      type="number"
                                      min="1"
                                      placeholder="Enter XP to add"
                                      value={xpToAdd[u._id] || ''}
                                      onChange={(e) => setXpToAdd({ ...xpToAdd, [u._id]: e.target.value })}
                                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                    <button
                                      onClick={() => handleAddXp(u._id)}
                                      disabled={isUpdating || !xpToAdd[u._id] || parseInt(xpToAdd[u._id] || '0') <= 0}
                                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium whitespace-nowrap transition-all shadow-sm"
                                    >
                                      + Add
                                    </button>
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    New Password (leave empty to keep current)
                                  </label>
                                  <input
                                    type="password"
                                    value={editUserData?.password || ''}
                                    onChange={(e) => setEditUserData({ ...editUserData, password: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                  />
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditUser(u._id)}
                                  disabled={isUpdating}
                                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 font-medium transition-all shadow-md"
                                >
                                  {isUpdating ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingUser(null);
                                    setEditUserData(null);
                                  }}
                                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium transition-all"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                                      {u.username}
                                    </h3>
                                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                                      u.role === 'ADMIN'
                                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                                        : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                                    }`}>
                                      {u.role}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    📱 {u.phone}
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                    ⭐ Level {formatNumber(u.level || 1)} • {formatNumber(u.xp || 0)} XP
                                  </p>
                                  {/* Quick Add XP */}
                                  <div className="flex gap-2 items-center">
                                    <input
                                      type="number"
                                      min="1"
                                      placeholder="Add XP"
                                      value={xpToAdd[u._id] || ''}
                                      onChange={(e) => setXpToAdd({ ...xpToAdd, [u._id]: e.target.value })}
                                      className="w-24 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                    <button
                                      onClick={() => handleAddXp(u._id)}
                                      disabled={isUpdating || !xpToAdd[u._id] || parseInt(xpToAdd[u._id] || '0') <= 0}
                                      className="px-2 py-1 text-xs bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all shadow-sm"
                                    >
                                      + Add XP
                                    </button>
                                  </div>
                                  <p className="text-xs text-gray-500 dark:text-gray-500">
                                    Joined: {new Date(u.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      setEditingUser(u._id);
                                      // Format phone number when entering edit mode
                                      const formattedPhone = formatPhoneNumber(u.phone || '+998');
                                      setEditUserData({
                                        username: u.username,
                                        phone: formattedPhone,
                                        role: u.role,
                                        level: u.level || 1,
                                        xp: u.xp || 0,
                                        password: '',
                                      });
                                    }}
                                    className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 text-sm font-medium transition-all shadow-sm"
                                  >
                                    ✏️ Edit
                                  </button>
                                  {deleteConfirm === u._id ? (
                                    <>
                                      <button
                                        onClick={() => handleDeleteUser(u._id)}
                                        disabled={isUpdating}
                                        className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-lg hover:from-red-600 hover:to-rose-600 disabled:opacity-50 text-sm font-medium transition-all shadow-sm"
                                      >
                                        ✓ Confirm
                                      </button>
                                      <button
                                        onClick={() => setDeleteConfirm(null)}
                                        className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium transition-all"
                                      >
                                        ✕ Cancel
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      onClick={() => setDeleteConfirm(u._id)}
                                      disabled={isUpdating}
                                      className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-lg hover:from-red-600 hover:to-rose-600 disabled:opacity-50 text-sm font-medium transition-all shadow-sm"
                                    >
                                      🗑️ Delete
                                    </button>
                                  )}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Competitions Tab */}
          {activeTab === 'competitions' && (
            <div className="space-y-6">
              {/* Create New Competition */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Competitions Management
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Create and manage competitions. Set unlock dates to control when competitions become available.
                </p>
                <button
                  onClick={() => {
                    const newCompetition = {
                      title: 'New Competition',
                      title_uz: 'Yangi Musobaqa',
                      title_ru: 'Новое Соревнование',
                      title_en: 'New Competition',
                      description: 'Competition description',
                      description_uz: 'Musobaqa tavsifi',
                      description_ru: 'Описание соревнования',
                      description_en: 'Competition description',
                      unlockAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 1 month from now
                      challenges: [],
                      order: competitions.length,
                    };
                    
                    setEditCompetitionData(newCompetition);
                    setEditingCompetition('new');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 font-medium shadow-md transition-all"
                >
                  ➕ Create New Competition
                </button>
              </div>

              {/* Competitions List */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  All Competitions ({competitions.length})
                </h2>
                {competitionsLoading ? (
                  <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                    {t('loading') || 'Loading...'}
                  </div>
                ) : competitions.length === 0 ? (
                  <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                    No competitions yet. Create one to get started!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {competitions.map((comp) => {
                      const isUnlocked = new Date(comp.unlockAt) <= new Date();
                      const isActive = comp.active !== false;
                      const isUpdating = updating === comp._id;
                      const isEditing = editingCompetition === comp._id;

                      return (
                        <div
                          key={comp._id}
                          className={`p-4 border-2 rounded-lg ${
                            !isActive
                              ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 opacity-60'
                              : !isUnlocked
                              ? 'border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          {isEditing ? (
                            <div className="space-y-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Title (EN)
                                  </label>
                                  <input
                                    type="text"
                                    value={editCompetitionData?.title || ''}
                                    onChange={(e) => setEditCompetitionData({ ...editCompetitionData, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Title (UZ)
                                  </label>
                                  <input
                                    type="text"
                                    value={editCompetitionData?.title_uz || ''}
                                    onChange={(e) => setEditCompetitionData({ ...editCompetitionData, title_uz: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Title (RU)
                                  </label>
                                  <input
                                    type="text"
                                    value={editCompetitionData?.title_ru || ''}
                                    onChange={(e) => setEditCompetitionData({ ...editCompetitionData, title_ru: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Description (EN)
                                  </label>
                                  <textarea
                                    value={editCompetitionData?.description || ''}
                                    onChange={(e) => setEditCompetitionData({ ...editCompetitionData, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Description (UZ)
                                  </label>
                                  <textarea
                                    value={editCompetitionData?.description_uz || ''}
                                    onChange={(e) => setEditCompetitionData({ ...editCompetitionData, description_uz: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Description (RU)
                                  </label>
                                  <textarea
                                    value={editCompetitionData?.description_ru || ''}
                                    onChange={(e) => setEditCompetitionData({ ...editCompetitionData, description_ru: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Active
                                  </label>
                                  <select
                                    value={editCompetitionData?.active ? 'true' : 'false'}
                                    onChange={(e) => setEditCompetitionData({ ...editCompetitionData, active: e.target.value === 'true' })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                  >
                                    <option value="true">Active</option>
                                    <option value="false">Inactive</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Order
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={editCompetitionData?.order || 0}
                                    onChange={(e) => setEditCompetitionData({ ...editCompetitionData, order: parseInt(e.target.value) || 0 })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                  />
                                </div>
                              </div>
                              
                              {/* Challenges Section */}
                              <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                                <div className="flex items-center justify-between mb-4">
                                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Challenges ({editCompetitionData?.challenges?.length || 0})
                                  </h3>
                                  <button
                                    onClick={() => {
                                      const newChallenge = {
                                        id: `challenge-${Date.now()}`,
                                        title: 'New Challenge',
                                        title_uz: 'Yangi Challenge',
                                        title_ru: 'Новый Challenge',
                                        title_en: 'New Challenge',
                                        description: 'Challenge description',
                                        description_uz: 'Challenge tavsifi',
                                        description_ru: 'Описание challenge',
                                        description_en: 'Challenge description',
                                        html: '',
                                        css: '',
                                        js: '',
                                        reward: 100,
                                        checks: [],
                                      };
                                      setEditCompetitionData({
                                        ...editCompetitionData,
                                        challenges: [...(editCompetitionData?.challenges || []), newChallenge],
                                      });
                                    }}
                                    className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 text-sm font-medium transition-all shadow-sm"
                                  >
                                    ➕ Add Challenge
                                  </button>
                                </div>
                                
                                <div className="space-y-4">
                                  {(editCompetitionData?.challenges || []).map((challenge: any, idx: number) => (
                                    <div key={challenge.id || idx} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                                      <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-semibold text-gray-900 dark:text-white">
                                          Challenge #{idx + 1}
                                        </h4>
                                        <button
                                          onClick={() => {
                                            const updatedChallenges = editCompetitionData.challenges.filter((c: any) => c.id !== challenge.id);
                                            setEditCompetitionData({ ...editCompetitionData, challenges: updatedChallenges });
                                          }}
                                          className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                                        >
                                          🗑️ Delete
                                        </button>
                                      </div>
                                      
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Title (EN)
                                          </label>
                                          <input
                                            type="text"
                                            value={challenge.title || ''}
                                            onChange={(e) => {
                                              const updated = editCompetitionData.challenges.map((c: any) => 
                                                c.id === challenge.id ? { ...c, title: e.target.value } : c
                                              );
                                              setEditCompetitionData({ ...editCompetitionData, challenges: updated });
                                            }}
                                            className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Title (UZ)
                                          </label>
                                          <input
                                            type="text"
                                            value={challenge.title_uz || ''}
                                            onChange={(e) => {
                                              const updated = editCompetitionData.challenges.map((c: any) => 
                                                c.id === challenge.id ? { ...c, title_uz: e.target.value } : c
                                              );
                                              setEditCompetitionData({ ...editCompetitionData, challenges: updated });
                                            }}
                                            className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Title (RU)
                                          </label>
                                          <input
                                            type="text"
                                            value={challenge.title_ru || ''}
                                            onChange={(e) => {
                                              const updated = editCompetitionData.challenges.map((c: any) => 
                                                c.id === challenge.id ? { ...c, title_ru: e.target.value } : c
                                              );
                                              setEditCompetitionData({ ...editCompetitionData, challenges: updated });
                                            }}
                                            className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Reward (XP)
                                          </label>
                                          <input
                                            type="number"
                                            min="0"
                                            value={challenge.reward || 0}
                                            onChange={(e) => {
                                              const updated = editCompetitionData.challenges.map((c: any) => 
                                                c.id === challenge.id ? { ...c, reward: parseInt(e.target.value) || 0 } : c
                                              );
                                              setEditCompetitionData({ ...editCompetitionData, challenges: updated });
                                            }}
                                            className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                          />
                                        </div>
                                        <div className="md:col-span-2">
                                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Description (EN)
                                          </label>
                                          <textarea
                                            value={challenge.description || ''}
                                            onChange={(e) => {
                                              const updated = editCompetitionData.challenges.map((c: any) => 
                                                c.id === challenge.id ? { ...c, description: e.target.value } : c
                                              );
                                              setEditCompetitionData({ ...editCompetitionData, challenges: updated });
                                            }}
                                            rows={2}
                                            className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                          />
                                        </div>
                                        <div className="md:col-span-2">
                                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Initial HTML
                                          </label>
                                          <textarea
                                            value={challenge.html || ''}
                                            onChange={(e) => {
                                              const updated = editCompetitionData.challenges.map((c: any) => 
                                                c.id === challenge.id ? { ...c, html: e.target.value } : c
                                              );
                                              setEditCompetitionData({ ...editCompetitionData, challenges: updated });
                                            }}
                                            rows={3}
                                            placeholder="<!DOCTYPE html>..."
                                            className="w-full px-2 py-1.5 text-sm font-mono border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                          />
                                        </div>
                                        <div className="md:col-span-2">
                                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Initial CSS
                                          </label>
                                          <textarea
                                            value={challenge.css || ''}
                                            onChange={(e) => {
                                              const updated = editCompetitionData.challenges.map((c: any) => 
                                                c.id === challenge.id ? { ...c, css: e.target.value } : c
                                              );
                                              setEditCompetitionData({ ...editCompetitionData, challenges: updated });
                                            }}
                                            rows={3}
                                            placeholder="body { ... }"
                                            className="w-full px-2 py-1.5 text-sm font-mono border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                          />
                                        </div>
                                      </div>
                                      
                                      {/* Checks Section */}
                                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                                        <div className="flex items-center justify-between mb-2">
                                          <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                            Checks ({challenge.checks?.length || 0})
                                          </label>
                                          <button
                                            onClick={() => {
                                              const newCheck = {
                                                id: `check-${Date.now()}`,
                                                type: 'html',
                                                rule: '',
                                                hint: '',
                                                hint_uz: '',
                                                hint_ru: '',
                                                hint_en: '',
                                              };
                                              const updated = editCompetitionData.challenges.map((c: any) => 
                                                c.id === challenge.id ? { ...c, checks: [...(c.checks || []), newCheck] } : c
                                              );
                                              setEditCompetitionData({ ...editCompetitionData, challenges: updated });
                                            }}
                                            className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                                          >
                                            ➕ Add Check
                                          </button>
                                        </div>
                                        
                                        <div className="space-y-2">
                                          {(challenge.checks || []).map((check: any, checkIdx: number) => (
                                            <div key={check.id || checkIdx} className="p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
                                              <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                                  Check #{checkIdx + 1}
                                                </span>
                                                <button
                                                  onClick={() => {
                                                    const updated = editCompetitionData.challenges.map((c: any) => 
                                                      c.id === challenge.id 
                                                        ? { ...c, checks: c.checks.filter((ch: any) => ch.id !== check.id) }
                                                        : c
                                                    );
                                                    setEditCompetitionData({ ...editCompetitionData, challenges: updated });
                                                  }}
                                                  className="text-xs text-red-500 hover:text-red-600"
                                                >
                                                  ✕
                                                </button>
                                              </div>
                                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                                <div>
                                                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-0.5">Type</label>
                                                  <select
                                                    value={check.type || 'html'}
                                                    onChange={(e) => {
                                                      const updated = editCompetitionData.challenges.map((c: any) => 
                                                        c.id === challenge.id 
                                                          ? { ...c, checks: c.checks.map((ch: any) => ch.id === check.id ? { ...ch, type: e.target.value } : ch) }
                                                          : c
                                                      );
                                                      setEditCompetitionData({ ...editCompetitionData, challenges: updated });
                                                    }}
                                                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                  >
                                                    <option value="html">HTML</option>
                                                    <option value="css">CSS</option>
                                                  </select>
                                                </div>
                                                <div>
                                                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-0.5">Rule</label>
                                                  <input
                                                    type="text"
                                                    value={check.rule || ''}
                                                    onChange={(e) => {
                                                      const updated = editCompetitionData.challenges.map((c: any) => 
                                                        c.id === challenge.id 
                                                          ? { ...c, checks: c.checks.map((ch: any) => ch.id === check.id ? { ...ch, rule: e.target.value } : ch) }
                                                          : c
                                                      );
                                                      setEditCompetitionData({ ...editCompetitionData, challenges: updated });
                                                    }}
                                                    placeholder="count:h1>=1"
                                                    className="w-full px-2 py-1 text-xs font-mono border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                  />
                                                </div>
                                                <div>
                                                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-0.5">Hint (EN)</label>
                                                  <input
                                                    type="text"
                                                    value={check.hint || ''}
                                                    onChange={(e) => {
                                                      const updated = editCompetitionData.challenges.map((c: any) => 
                                                        c.id === challenge.id 
                                                          ? { ...c, checks: c.checks.map((ch: any) => ch.id === check.id ? { ...ch, hint: e.target.value } : ch) }
                                                          : c
                                                      );
                                                      setEditCompetitionData({ ...editCompetitionData, challenges: updated });
                                                    }}
                                                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                  />
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={async () => {
                                    if (editingCompetition === 'new') {
                                      // Create new
                                      setUpdating('new');
                                      try {
                                        const token = getToken();
                                        const response = await fetch('/api/admin/competitions', {
                                          method: 'POST',
                                          headers: {
                                            'Content-Type': 'application/json',
                                            'Authorization': `Bearer ${token}`,
                                          },
                                          body: JSON.stringify(editCompetitionData),
                                        });

                                        if (response.ok) {
                                          showToast('Competition created successfully', 'success');
                                          setEditingCompetition(null);
                                          setEditCompetitionData(null);
                                          fetchCompetitions();
                                        } else {
                                          const data = await response.json();
                                          showToast(data.error || 'Failed to create competition', 'error');
                                        }
                                      } catch (error) {
                                        console.error('Error creating competition:', error);
                                        showToast('Error creating competition', 'error');
                                      } finally {
                                        setUpdating(null);
                                      }
                                    } else {
                                      handleEditCompetition(comp._id);
                                    }
                                  }}
                                  disabled={isUpdating}
                                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 font-medium transition-all shadow-md"
                                >
                                  {isUpdating ? 'Saving...' : editingCompetition === 'new' ? 'Create' : 'Save'}
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingCompetition(null);
                                    setEditCompetitionData(null);
                                    setShowCompetitionCalendar(null);
                                    setCompetitionCalendarDate(null);
                                  }}
                                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium transition-all"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                                      {comp.title}
                                    </h3>
                                    {isActive && isUnlocked && (
                                      <span className="px-2 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg text-xs font-bold">
                                        ✅ {t('active') || 'Active'}
                                      </span>
                                    )}
                                    {isActive && !isUnlocked && (
                                      <span className="px-2 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg text-xs font-bold">
                                        🔒 {t('locked') || 'Locked'}
                                      </span>
                                    )}
                                    {!isActive && (
                                      <span className="px-2 py-1 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-lg text-xs font-bold">
                                        🔴 {t('inactive') || 'Inactive'}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                    {comp.description}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-500">
                                    📅 Unlocks: {new Date(comp.unlockAt).toLocaleString()}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      setEditingCompetition(comp._id);
                                      setEditCompetitionData({
                                        title: comp.title,
                                        title_uz: comp.title_uz,
                                        title_ru: comp.title_ru,
                                        title_en: comp.title_en,
                                        description: comp.description,
                                        description_uz: comp.description_uz,
                                        description_ru: comp.description_ru,
                                        description_en: comp.description_en,
                                        unlockAt: comp.unlockAt,
                                        active: comp.active !== false,
                                        order: comp.order || 0,
                                        challenges: comp.challenges || [],
                                      });
                                    }}
                                    className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 text-sm font-medium transition-all shadow-sm"
                                  >
                                    ✏️ Edit
                                  </button>
                                  {deleteConfirm === comp._id ? (
                                    <>
                                      <button
                                        onClick={() => handleDeleteCompetition(comp._id)}
                                        disabled={isUpdating}
                                        className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-lg hover:from-red-600 hover:to-rose-600 disabled:opacity-50 text-sm font-medium transition-all shadow-sm"
                                      >
                                        ✓ Confirm
                                      </button>
                                      <button
                                        onClick={() => setDeleteConfirm(null)}
                                        className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium transition-all"
                                      >
                                        ✕ Cancel
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      onClick={() => setDeleteConfirm(comp._id)}
                                      disabled={isUpdating}
                                      className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-lg hover:from-red-600 hover:to-rose-600 disabled:opacity-50 text-sm font-medium transition-all shadow-sm"
                                    >
                                      🗑️ Delete
                                    </button>
                                  )}
                                </div>
                              </div>
                              {/* Set Unlock Date */}
                              {showCompetitionCalendar === comp._id ? (
                                <div className="flex flex-col gap-3 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border-2 border-blue-500 shadow-lg mt-3">
                                  <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="flex-1">
                                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                        📅 {t('date') || 'Date'}
                                      </label>
                                      <DatePicker
                                        selected={competitionCalendarDate || parseDate(comp.unlockAt)}
                                        onChange={(date: Date | null) => setCompetitionCalendarDate(date)}
                                        dateFormat="dd/MM/yyyy"
                                        className="w-full px-3 py-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg border-2 border-gray-300 dark:border-gray-600 text-base font-medium focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
                                        wrapperClassName="w-full"
                                        calendarClassName="dark:bg-gray-800 dark:text-white shadow-xl"
                                        popperClassName="z-50"
                                      />
                                    </div>
                                    <div className="flex-1">
                                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                        🕐 {t('time') || 'Time'}
                                      </label>
                                      <DatePicker
                                        selected={competitionCalendarDate || parseDate(comp.unlockAt)}
                                        onChange={(date: Date | null) => {
                                          if (date && competitionCalendarDate) {
                                            const newDate = new Date(competitionCalendarDate);
                                            newDate.setHours(date.getHours());
                                            newDate.setMinutes(date.getMinutes());
                                            setCompetitionCalendarDate(newDate);
                                          } else {
                                            setCompetitionCalendarDate(date);
                                          }
                                        }}
                                        showTimeSelect
                                        showTimeSelectOnly
                                        timeIntervals={15}
                                        timeCaption={t('time') || 'Time'}
                                        dateFormat="h:mm aa"
                                        className="w-full px-3 py-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg border-2 border-gray-300 dark:border-gray-600 text-base font-medium focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
                                        wrapperClassName="w-full"
                                        popperClassName="z-50"
                                      />
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleSetCompetitionUnlockDate(comp._id)}
                                      disabled={isUpdating || !competitionCalendarDate}
                                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold transition-all shadow-md"
                                    >
                                      {isUpdating ? '...' : '✓ ' + (t('save') || 'Save')}
                                    </button>
                                    <button
                                      onClick={() => {
                                        setShowCompetitionCalendar(null);
                                        setCompetitionCalendarDate(null);
                                      }}
                                      disabled={isUpdating}
                                      className="px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold transition-all"
                                    >
                                      {t('cancel') || 'Cancel'}
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setShowCompetitionCalendar(comp._id);
                                    setCompetitionCalendarDate(parseDate(comp.unlockAt));
                                  }}
                                  disabled={isUpdating}
                                  className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-all shadow-sm"
                                  title={t('setUnlockDate') || 'Set Unlock Date'}
                                >
                                  📅 {t('setDate') || 'Set Date'}
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
