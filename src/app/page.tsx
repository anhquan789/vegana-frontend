'use client';

import { useAuth } from '@/contexts/AuthContext';
import { getUserLandingPage } from '@/utils/navigation';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, userProfile, isEmailVerified, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated && userProfile) {
        // User is authenticated, redirect to appropriate landing page
        const landingPage = getUserLandingPage(userProfile, isEmailVerified);
        router.push(landingPage);
      } else {
        // User is not authenticated, redirect to courses page (public)
        router.push('/course');
      }
    }
  }, [isAuthenticated, userProfile, isEmailVerified, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Đang tải...</p>
      </div>
    </div>
  );
}
