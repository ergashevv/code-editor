'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { animate } from 'animejs';
import { useI18n } from '../hooks/useI18n';
import { register, login, isAuthenticated } from '../lib/api';
import AnimatedTabs from '../components/AnimatedTabs';
import AnimatedInput from '../components/AnimatedInput';
import AnimatedButton from '../components/AnimatedButton';

type AuthTab = 'login' | 'register';

// Disable static optimization
export async function getServerSideProps() {
  return {
    props: {},
  };
}

export default function AuthPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Form states
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('+998');
  const [password, setPassword] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const hasAnimatedRef = useRef(false);

  // Clear form function
  const clearForm = () => {
    setUsername('');
    setPhone('+998');
    setPassword('');
    setError('');
    setSuccess('');
  };

  // Phone number formatting function
  const formatPhoneNumber = (value: string): string => {
    // Remove all non-digit characters except +
    let cleaned = value.replace(/[^\d+]/g, '');
    
    // Ensure it starts with +998
    if (!cleaned.startsWith('+998')) {
      if (cleaned.startsWith('998')) {
        cleaned = '+' + cleaned;
      } else if (cleaned.startsWith('+')) {
        cleaned = '+998' + cleaned.substring(1).replace(/[^\d]/g, '');
      } else {
        cleaned = '+998' + cleaned.replace(/[^\d]/g, '');
      }
    }
    
    // Remove everything after +998 and keep only digits
    const digits = cleaned.substring(4).replace(/[^\d]/g, '');
    
    // Limit to 9 digits (Uzbek phone format: +998-XX-XXX-XX-XX)
    const limitedDigits = digits.substring(0, 9);
    
    // Format: +998-XX-XXX-XX-XX
    if (limitedDigits.length === 0) {
      return '+998';
    } else if (limitedDigits.length <= 2) {
      return `+998-${limitedDigits}`;
    } else if (limitedDigits.length <= 5) {
      return `+998-${limitedDigits.substring(0, 2)}-${limitedDigits.substring(2)}`;
    } else if (limitedDigits.length <= 7) {
      return `+998-${limitedDigits.substring(0, 2)}-${limitedDigits.substring(2, 5)}-${limitedDigits.substring(5)}`;
    } else {
      return `+998-${limitedDigits.substring(0, 2)}-${limitedDigits.substring(2, 5)}-${limitedDigits.substring(5, 7)}-${limitedDigits.substring(7)}`;
    }
  };

  // Check if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/home');
    }
  }, [router]);

  // Clear form when switching tabs
  useEffect(() => {
    clearForm();
  }, [activeTab]);

  // Anime.js animations for auth page - removed as AnimatedTabs and AnimatedInput handle their own animations

  // Get phone digits only (for validation)
  const getPhoneDigits = (phoneValue: string): string => {
    return phoneValue.replace(/[^\d]/g, '').substring(3); // Remove +998 prefix
  };

  // Frontend validation
  const validateForm = (): string | null => {
    if (!username.trim()) {
      return 'Username is required';
    }
    if (username.trim().length < 3) {
      return 'Username must be at least 3 characters';
    }
    if (activeTab === 'register') {
      const phoneDigits = getPhoneDigits(phone);
      if (!phoneDigits || phoneDigits.length === 0) {
        return 'Phone number is required';
      }
      if (phoneDigits.length !== 9) {
        return 'Phone number must be in format: +998-XX-XXX-XX-XX (9 digits)';
      }
    }
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 4) {
      return 'Password must be at least 4 characters';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Frontend validation
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      if (activeTab === 'register') {
        // Get clean phone number (formatted)
        const cleanPhone = phone.trim();
        const result = await register({ 
          username: username.trim(), 
          phone: cleanPhone, 
          password 
        });
        if (result.success) {
          setSuccess('Registration successful! Please login.');
          clearForm();
          setTimeout(() => {
            setActiveTab('login');
          }, 1500);
        } else {
          setError(result.error || 'Registration failed. Please try again.');
        }
      } else {
        const result = await login({ 
          username: username.trim(), 
          password 
        });
        if (result.success && result.token) {
          setSuccess('Login successful! Redirecting...');
          setTimeout(() => {
            router.push('/home');
          }, 500);
        } else {
          setError(result.error || 'Invalid username or password. Please try again.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>{t('appName')} - {activeTab === 'login' ? 'Login' : 'Register'}</title>
        <meta name="description" content={`${t('appName')} - ${activeTab === 'login' ? 'Login' : 'Register'} to start coding online with live preview.`} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="keywords" content="kod editor login, kod editor register, online code editor authentication" />
        <link rel="canonical" href={`https://texnikum.xyz/auth`} />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t('appName')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {activeTab === 'login' ? 'Sign in to continue' : 'Create your account'}
            </p>
          </div>

          {/* Tabs */}
          <AnimatedTabs
            tabs={[
              { id: 'login', label: 'Login', content: null },
              { id: 'register', label: 'Register', content: null },
            ]}
            activeTab={activeTab}
            onTabChange={(tabId) => setActiveTab(tabId as AuthTab)}
            className="mb-6"
          />

          {/* Error/Success Messages */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg text-green-700 dark:text-green-400 text-sm"
            >
              {success}
            </motion.div>
          )}

          {/* Form */}
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            <AnimatedInput
              label="Username"
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
              }}
              required
              minLength={3}
              placeholder="Enter username (min 3 characters)"
              disabled={loading}
              error={error && error.includes('username') ? error : undefined}
            />

            {activeTab === 'register' && (
              <div>
                <AnimatedInput
                  label="Phone Number"
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    const formatted = formatPhoneNumber(e.target.value);
                    setPhone(formatted);
                    setError('');
                  }}
                  onBlur={(e) => {
                    const formatted = formatPhoneNumber(e.target.value);
                    setPhone(formatted);
                  }}
                  required
                  placeholder="+998-93-078-80-47"
                  disabled={loading}
                  maxLength={18}
                  error={error && error.includes('phone') ? error : undefined}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Format: +998-XX-XXX-XX-XX
                </p>
              </div>
            )}

            <AnimatedInput
              label="Password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              required
              minLength={4}
              placeholder="Enter password (min 4 characters)"
              disabled={loading}
              error={error && error.includes('password') ? error : undefined}
            />

            <AnimatedButton
              type="submit"
              disabled={loading || !username.trim() || !password || (activeTab === 'register' && getPhoneDigits(phone).length !== 9)}
              variant="primary"
              className="w-full py-3"
            >
              {loading ? 'Please wait...' : activeTab === 'login' ? 'Login' : 'Register'}
            </AnimatedButton>
          </form>
        </motion.div>
      </div>
    </>
  );
}

