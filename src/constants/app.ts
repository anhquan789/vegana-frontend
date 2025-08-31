export const APP_CONFIG = {
  NAME: 'Vegana',
  DESCRIPTION: 'Nền tảng học tập trực tuyến',
  VERSION: '1.0.0',
  AUTHOR: 'Vegana Team',
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  ADMIN: '/admin',
  DASHBOARD: '/dashboard',
  COURSES: '/courses',
  COURSE_DETAIL: '/course',
  MY_COURSES: '/my-courses',
  UNAUTHORIZED: '/unauthorized',
  VERIFY_EMAIL: '/verify-email',
  FORGOT_PASSWORD: '/forgot-password'
} as const;

// Smart navigation routes based on user roles
export const DEFAULT_ROUTES = {
  ADMIN: '/admin',
  INSTRUCTOR: '/dashboard',
  STUDENT: '/dashboard',
  UNVERIFIED: '/verify-email',
  GUEST: '/course'
} as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  INSTRUCTOR: 'instructor',
  STUDENT: 'student',
} as const;

export const COURSE_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
} as const;
