'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // TODO: Add authentication check here
    // For now, redirect to login page
    // Later this can check if user is authenticated and redirect accordingly
    router.push('/login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Đang tải...</p>
      </div>
    </div>
  );
}
