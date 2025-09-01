import { User as FirebaseUser } from 'firebase/auth';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'instructor' | 'admin';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  emailVerified: boolean;
  profile?: UserProfile;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'student' | 'instructor' | 'admin';
  firstName?: string;
  lastName?: string;
  bio?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: string;
  occupation?: string;
  interests?: string[];
  socialLinks?: SocialLinks;
  createdAt: Date;
  lastLoginAt?: Date;
  updatedAt?: Date;
  isActive: boolean;
  profile?: {
    firstName: string;
    lastName: string;
  };
}

export interface SocialLinks {
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  firstName: string;
  lastName: string;
  role?: 'student' | 'instructor';
}

export interface ResetPasswordData {
  email: string;
}

export interface UpdateProfileData {
  name?: string;
  profile?: Partial<UserProfile>;
}

export interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  clearError: () => void;
}

// AuthResponse for service functions
export interface AuthResponse {
  success: boolean;
  user?: UserProfile;
  error?: string;
}

// Firebase Auth Error Types
export interface AuthError {
  code: string;
  message: string;
}

export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/user-not-found': 'Không tìm thấy tài khoản với email này',
  'auth/wrong-password': 'Mật khẩu không chính xác',
  'auth/email-already-in-use': 'Email này đã được sử dụng',
  'auth/weak-password': 'Mật khẩu quá yếu (ít nhất 6 ký tự)',
  'auth/invalid-email': 'Email không hợp lệ',
  'auth/too-many-requests': 'Quá nhiều yêu cầu. Vui lòng thử lại sau',
  'auth/network-request-failed': 'Lỗi kết nối mạng',
  'auth/user-disabled': 'Tài khoản đã bị vô hiệu hóa',
  'auth/requires-recent-login': 'Vui lòng đăng nhập lại để thực hiện thao tác này'
};

export const getAuthErrorMessage = (error: AuthError): string => {
  return AUTH_ERROR_MESSAGES[error.code] || error.message || 'Có lỗi xảy ra';
};
