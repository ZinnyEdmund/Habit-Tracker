'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SplashScreen } from '@/components/shared/SplashScreen';
import { getValidSession } from '@/data/storage';

const SPLASH_DELAY_MS = 900;

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const session = getValidSession();
      router.replace(session ? '/dashboard' : '/login');
    }, SPLASH_DELAY_MS);

    return () => window.clearTimeout(timeoutId);
  }, [router]);

  return <SplashScreen />;
}