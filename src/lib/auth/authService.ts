import { FIREBASE_COLLECTIONS } from '@/constants';
import { auth, db } from '@/lib/firebase';
import type { AuthResponse, RegisterData, UserProfile } from '@/types';
import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    sendEmailVerification,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
    User
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';

/**
 * Register a new user account
 */
export const registerUser = async (data: RegisterData): Promise<AuthResponse> => {
  try {
    const { email, password, firstName, lastName } = data;
    
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update display name
    await updateProfile(user, {
      displayName: `${firstName} ${lastName}`
    });

    // Send email verification
    await sendEmailVerification(user);

    // Create user profile in Firestore
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      displayName: `${firstName} ${lastName}`,
      role: 'student',
      createdAt: new Date(),
      lastLoginAt: new Date(),
      isActive: true,
      profile: {
        firstName,
        lastName,
      }
    };

    await setDoc(doc(db, FIREBASE_COLLECTIONS.USERS, user.uid), {
      ...userProfile,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    });
    
    return { success: true, user: userProfile };
  } catch (error) {
    console.error('Registration error:', error);
    const errorCode = (error as { code?: string })?.code || 'unknown';
    return { success: false, error: getAuthErrorMessage(errorCode) };
  }
};

/**
 * Sign in user with email and password
 */
export const loginUser = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update last login time
    await updateDoc(doc(db, FIREBASE_COLLECTIONS.USERS, user.uid), {
      lastLoginAt: serverTimestamp()
    });

    // Get user profile from Firestore
    const userDoc = await getDoc(doc(db, FIREBASE_COLLECTIONS.USERS, user.uid));
    const userProfile = userDoc.data() as UserProfile;

    return { success: true, user: userProfile };
  } catch (error) {
    console.error('Login error:', error);
    const errorCode = (error as { code?: string })?.code || 'unknown';
    return { success: false, error: getAuthErrorMessage(errorCode) };
  }
};

/**
 * Sign out current user
 */
export const logoutUser = async (): Promise<AuthResponse> => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: (error as Error).message };
  }
};

/**
 * Send password reset email
 */
export const resetPassword = async (email: string): Promise<AuthResponse> => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    console.error('Password reset error:', error);
    const errorCode = (error as { code?: string })?.code || 'unknown';
    return { success: false, error: getAuthErrorMessage(errorCode) };
  }
};

/**
 * Get current user profile from Firestore
 */
export const getCurrentUserProfile = async (): Promise<UserProfile | null> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;

    const userDoc = await getDoc(doc(db, FIREBASE_COLLECTIONS.USERS, currentUser.uid));
    if (!userDoc.exists()) return null;

    return userDoc.data() as UserProfile;
  } catch (error) {
    console.error('Error getting current user profile:', error);
    return null;
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>): Promise<AuthResponse> => {
  try {
    const userRef = doc(db, FIREBASE_COLLECTIONS.USERS, userId);
    
    // Add updatedAt timestamp
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(userRef, updateData);
    
    // Get updated user profile
    const updatedDoc = await getDoc(userRef);
    const userProfile = updatedDoc.data() as UserProfile;
    
    return { success: true, user: userProfile };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { success: false, error: (error as Error).message };
  }
};

/**
 * Auth state observer
 */
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Get user-friendly error messages
 */
const getAuthErrorMessage = (errorCode: string): string => {
  const errorMessages: Record<string, string> = {
    'auth/user-not-found': 'Không tìm thấy tài khoản với email này',
    'auth/wrong-password': 'Mật khẩu không chính xác',
    'auth/email-already-in-use': 'Email này đã được sử dụng',
    'auth/weak-password': 'Mật khẩu quá yếu',
    'auth/invalid-email': 'Email không hợp lệ',
    'auth/user-disabled': 'Tài khoản đã bị vô hiệu hóa',
    'auth/too-many-requests': 'Quá nhiều yêu cầu, vui lòng thử lại sau',
    'auth/network-request-failed': 'Lỗi kết nối mạng',
  };

  return errorMessages[errorCode] || 'Đã xảy ra lỗi, vui lòng thử lại';
};
