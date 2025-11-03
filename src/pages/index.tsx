'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { isAuthenticated } from '../lib/api';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // Check authentication and redirect
    if (isAuthenticated()) {
      router.push('/home');
    } else {
      router.push('/auth');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-gray-600">Loading...</div>
    </div>
  );
}

