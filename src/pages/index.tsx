'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { isAuthenticated, ensureAuthenticated } from '../lib/api';

// Disable static optimization
export async function getServerSideProps() {
  return {
    props: {},
  };
}

export default function Index() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      setMounted(true);
      // Check authentication and redirect only after mount
      if (router.isReady) {
        if (!isAuthenticated()) {
          router.push('/auth');
          return;
        }

        // Verify and refresh token if needed
        const isValid = await ensureAuthenticated();
        if (isValid) {
          router.push('/home'); // Dashboard page
        } else {
          router.push('/auth');
        }
      }
    };

    checkAuth();
  }, [router]);

  if (!mounted || !router.isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-gray-600">Loading...</div>
    </div>
  );
}

