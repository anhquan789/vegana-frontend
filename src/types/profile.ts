export interface UserProfile {
  id: string;
  uid: string; // Firebase Auth UID
  email: string;
  displayName: string;
  firstName: string;
  lastName: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  role: 'student' | 'instructor' | 'admin';
  position?: string; // Chức vụ
  company?: string;
  website?: string;
  location?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
  preferences?: {
    language: 'vi' | 'en';
    timezone: string;
    notifications: {
      email: boolean;
      push: boolean;
      marketing: boolean;
    };
  };
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}
