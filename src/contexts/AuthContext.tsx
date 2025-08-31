'use client';

import { ROUTES } from '@/constants/app';
import { getCurrentUserProfile, logoutUser } from '@/lib/auth/authService';
import { auth } from '@/lib/firebase';
import { AuthContextType, RegisterData, UserProfile } from '@/types/auth';
import { onAuthStateChanged, User } from 'firebase/auth';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Clear error after a delay
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          const profile = await getCurrentUserProfile();
          setUserProfile(profile);
        } catch (error) {
          console.error('Error getting user profile:', error);
          setError('Failed to load user profile');
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { loginUser } = await import('@/lib/auth/authService');
      const result = await loginUser(email, password);
      
      if (!result.success) {
        setError(result.error || 'Login failed');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred during login');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setLoading(true);
    setError(null);
    
    try {
      const { registerUser } = await import('@/lib/auth/authService');
      const result = await registerUser(data);
      
      if (!result.success) {
        setError(result.error || 'Registration failed');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      setError('An unexpected error occurred during registration');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    
    try {
      await logoutUser();
      setUser(null);
      setUserProfile(null);
      
      // Redirect to home page after logout
      if (typeof window !== 'undefined') {
        window.location.href = ROUTES.HOME;
      }
    } catch (error) {
      console.error('Logout error:', error);
      setError('Failed to logout');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setError(null);
    
    try {
      const { resetPassword: resetPasswordService } = await import('@/lib/auth/authService');
      const result = await resetPasswordService(email);
      
      if (!result.success) {
        setError(result.error || 'Password reset failed');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Password reset error:', error);
      setError('An unexpected error occurred during password reset');
      return false;
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!userProfile?.uid) {
      setError('No user logged in');
      return false;
    }

    setLoading(true);
    setError(null);
    
    try {
      const { updateUserProfile } = await import('@/lib/auth/authService');
      const result = await updateUserProfile(userProfile.uid, updates);
      
      if (!result.success) {
        setError(result.error || 'Profile update failed');
        return false;
      }
      
      if (result.user) {
        setUserProfile(result.user);
      }
      
      return true;
    } catch (error) {
      console.error('Profile update error:', error);
      setError('An unexpected error occurred during profile update');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    error,
    login,
    register,
    logout,
    resetPassword,
    updateProfile,
    clearError,
    isAuthenticated: !!userProfile,
    isEmailVerified: user?.emailVerified || false
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
