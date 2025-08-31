import { DEFAULT_ROUTES, ROUTES } from '@/constants/app';
import { UserProfile } from '@/types/auth';

/**
 * Navigation utilities for intelligent routing
 */

/**
 * Get the appropriate landing page for a user based on their role and status
 */
export const getUserLandingPage = (
  userProfile: UserProfile | null,
  isEmailVerified: boolean,
  skipEmailVerification: boolean = false
): string => {
  // If no user profile, redirect to courses page
  if (!userProfile) {
    return DEFAULT_ROUTES.GUEST;
  }

  // If email is not verified and we're not skipping verification, redirect to verification page
  if (!isEmailVerified && !skipEmailVerification) {
    return DEFAULT_ROUTES.UNVERIFIED;
  }

  // If account is not active, redirect to unauthorized
  if (!userProfile.isActive) {
    return ROUTES.UNAUTHORIZED;
  }

  // Role-based redirects
  switch (userProfile.role) {
    case 'admin':
      return DEFAULT_ROUTES.ADMIN;
    case 'instructor':
      return DEFAULT_ROUTES.INSTRUCTOR;
    case 'student':
      return DEFAULT_ROUTES.STUDENT;
    default:
      return DEFAULT_ROUTES.GUEST;
  }
};

/**
 * Get the redirect URL from query parameters or localStorage
 */
export const getRedirectUrl = (): string | null => {
  if (typeof window === 'undefined') return null;

  // Check URL query parameters first
  const urlParams = new URLSearchParams(window.location.search);
  const redirectFromQuery = urlParams.get('redirect');
  
  if (redirectFromQuery) {
    return decodeURIComponent(redirectFromQuery);
  }

  // Check localStorage as fallback
  const redirectFromStorage = localStorage.getItem('redirectAfterLogin');
  
  if (redirectFromStorage) {
    localStorage.removeItem('redirectAfterLogin'); // Clear after reading
    return redirectFromStorage;
  }

  return null;
};

/**
 * Store the intended destination before redirecting to login
 */
export const storeIntendedDestination = (path: string): void => {
  if (typeof window === 'undefined') return;
  
  // Don't store auth-related pages
  const authPages = [ROUTES.LOGIN, ROUTES.REGISTER, ROUTES.VERIFY_EMAIL];
  if (authPages.some(authPage => path === authPage)) return;
  
  localStorage.setItem('redirectAfterLogin', path);
};

/**
 * Get the appropriate post-login redirect URL
 */
export const getPostLoginRedirect = (
  userProfile: UserProfile | null,
  isEmailVerified: boolean,
  skipEmailVerification: boolean = false
): string => {
  // First check if there's a stored redirect URL
  const intendedDestination = getRedirectUrl();
  
  if (intendedDestination) {
    // Validate that the user has permission to access the intended destination
    if (canAccessRoute(intendedDestination, userProfile)) {
      return intendedDestination;
    }
  }

  // Fall back to role-based default
  return getUserLandingPage(userProfile, isEmailVerified, skipEmailVerification);
};

/**
 * Check if a user can access a specific route
 */
export const canAccessRoute = (
  route: string,
  userProfile: UserProfile | null
): boolean => {
  if (!userProfile) return false;

  // Admin routes
  if (route.startsWith('/admin')) {
    return userProfile.role === 'admin';
  }

  // Protected routes that require any authenticated user
  const protectedRoutes = ['/dashboard', '/profile', '/my-courses'];
  if (protectedRoutes.some(path => route.startsWith(path))) {
    return userProfile.isActive;
  }

  // Public routes
  return true;
};

/**
 * Get user-friendly route names for navigation
 */
export const getRouteDisplayName = (route: string): string => {
  const routeNames: Record<string, string> = {
    [ROUTES.HOME]: 'Trang chủ',
    [ROUTES.DASHBOARD]: 'Bảng điều khiển',
    [ROUTES.COURSES]: 'Khóa học',
    [ROUTES.COURSE_DETAIL]: 'Khóa học',
    [ROUTES.MY_COURSES]: 'Khóa học của tôi',
    [ROUTES.PROFILE]: 'Hồ sơ',
    [ROUTES.ADMIN]: 'Quản trị',
  };

  return routeNames[route] || 'Trang không xác định';
};

/**
 * Build login URL with redirect parameter
 */
export const buildLoginUrl = (redirectTo?: string): string => {
  if (!redirectTo) return ROUTES.LOGIN;
  
  const encodedRedirect = encodeURIComponent(redirectTo);
  return `${ROUTES.LOGIN}?redirect=${encodedRedirect}`;
};
