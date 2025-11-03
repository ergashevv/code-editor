'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { isAuthenticated } from '../lib/api';

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
    setMounted(true);
    // Check authentication and redirect only after mount
    if (router.isReady) {
      if (isAuthenticated()) {
        router.push('/home');
      } else {
        router.push('/auth');
      }
    }
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

