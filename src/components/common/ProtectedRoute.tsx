'use client';

import { ROUTES } from '@/constants/app';
import { useAuth } from '@/contexts/AuthContext';
import { buildLoginUrl, storeIntendedDestination } from '@/utils/navigation';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  requireEmailVerification?: boolean;
  allowedRoles?: ('admin' | 'instructor' | 'student')[];
}

export default function ProtectedRoute({ 
  children, 
  redirectTo = ROUTES.LOGIN, 
  requireEmailVerification = false,
  allowedRoles 
}: ProtectedRouteProps) {
  const { isAuthenticated, user, userProfile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      // Not authenticated
      if (!isAuthenticated) {
        // Store current path for redirect after login
        storeIntendedDestination(pathname);
        router.push(buildLoginUrl(pathname));
        return;
      }

      // Email verification required but not verified
      if (requireEmailVerification && !user?.emailVerified) {
        router.push(ROUTES.VERIFY_EMAIL);
        return;
      }

      // Role-based access control
      if (allowedRoles && userProfile && !allowedRoles.includes(userProfile.role)) {
        router.push(ROUTES.UNAUTHORIZED);
        return;
      }
    }
  }, [isAuthenticated, user, userProfile, loading, router, pathname, redirectTo, requireEmailVerification, allowedRoles]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Email verification required but not verified
  if (requireEmailVerification && !user?.emailVerified) {
    return null;
  }

  // Role-based access control
  if (allowedRoles && userProfile && !allowedRoles.includes(userProfile.role)) {
    return null;
  }

  return <>{children}</>;
}
