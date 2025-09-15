import { auth, db } from '@/lib/firebase';
import { UserProfile } from '@/types/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

// Firebase Functions instance
const functions = getFunctions();

/**
 * Set custom claims for user roles
 * This would be used by admin to assign roles
 */
export const setUserRole = httpsCallable(functions, 'setUserRole');

/**
 * Get user's custom claims
 */
export const getUserClaims = async (): Promise<Record<string, unknown>> => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No authenticated user');
    
    const tokenResult = await user.getIdTokenResult(true);
    return tokenResult.claims;
  } catch (error) {
    console.error('Error getting user claims:', error);
    return {};
  }
};

/**
 * Check if user has specific role
 */
export const hasRole = async (role: 'student' | 'instructor' | 'admin'): Promise<boolean> => {
  try {
    const claims = await getUserClaims();
    return claims.role === role;
  } catch {
    return false;
  }
};

/**
 * Check if user has any of the specified roles
 */
export const hasAnyRole = async (roles: string[]): Promise<boolean> => {
  try {
    const claims = await getUserClaims();
    return roles.includes(claims.role as string);
  } catch {
    return false;
  }
};

/**
 * Update user role (admin only)
 */
export const updateUserRole = async (
  targetUserId: string, 
  newRole: 'student' | 'instructor' | 'admin'
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Check if current user is admin
    const isAdmin = await hasRole('admin');
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized: Admin role required' };
    }

    // Update custom claims via Firebase Function
    await setUserRole({ 
      uid: targetUserId, 
      role: newRole 
    });

    // Update user profile in Firestore
    const userRef = doc(db, 'users', targetUserId);
    await updateDoc(userRef, {
      role: newRole,
      updatedAt: new Date()
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating user role:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

/**
 * Get all users with their roles (admin only)
 */
export const getAllUsersWithRoles = async (): Promise<UserProfile[]> => {
  try {
    const isAdmin = await hasRole('admin');
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin role required');
    }

    // This would typically call a Firebase Function
    const getAllUsers = httpsCallable(functions, 'getAllUsers');
    const result = await getAllUsers();
    
    return (result.data as { users: UserProfile[] }).users || [];
  } catch (error) {
    console.error('Error getting all users:', error);
    return [];
  }
};

/**
 * Role hierarchy helper
 */
export const getRoleLevel = (role: string): number => {
  const levels = {
    student: 1,
    instructor: 2,
    admin: 3
  };
  return levels[role as keyof typeof levels] || 0;
};

/**
 * Check if user can manage another user
 */
export const canManageUser = async (targetUserRole: string): Promise<boolean> => {
  try {
    const claims = await getUserClaims();
    const currentUserLevel = getRoleLevel(claims.role as string);
    const targetUserLevel = getRoleLevel(targetUserRole);
    
    return currentUserLevel > targetUserLevel;
  } catch {
    return false;
  }
};

/**
 * Role-based route protection
 */
export const checkRouteAccess = async (
  requiredRoles: string[]
): Promise<{ hasAccess: boolean; userRole?: string }> => {
  try {
    const claims = await getUserClaims();
    const userRole = claims.role as string;
    const hasAccess = requiredRoles.includes(userRole) || userRole === 'admin';
    
    return { hasAccess, userRole };
  } catch {
    return { hasAccess: false };
  }
};

/**
 * Initialize role on user registration
 */
export const initializeUserRole = async (
  uid: string,
  role: 'student' | 'instructor' = 'student'
): Promise<void> => {
  try {
    // Set custom claims
    await setUserRole({ uid, role });
    
    // Update Firestore profile
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      await updateDoc(userRef, {
        role,
        updatedAt: new Date()
      });
    }
  } catch (error) {
    console.error('Error initializing user role:', error);
    throw error;
  }
};
