import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { UserProfile } from '../../types/profile';
import { db, storage } from '../firebase';

const COLLECTION_NAME = 'users';

// Get user profile by UID
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

// Create new user profile
export const createUserProfile = async (profile: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserProfile> => {
  try {
    const now = new Date().toISOString();
    const newProfile: Omit<UserProfile, 'id'> = {
      ...profile,
      createdAt: now,
      updatedAt: now
    };
    
    await setDoc(doc(db, COLLECTION_NAME, profile.uid), newProfile);
    
    return { id: profile.uid, ...newProfile };
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>): Promise<UserProfile> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, uid);
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await updateDoc(docRef, updateData);
    
    // Get updated profile
    const updatedProfile = await getUserProfile(uid);
    if (!updatedProfile) {
      throw new Error('Failed to get updated profile');
    }
    
    return updatedProfile;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Delete user profile
export const deleteUserProfile = async (uid: string): Promise<void> => {
  try {
    const userDocRef = doc(db, COLLECTION_NAME, uid);
    await deleteDoc(userDocRef);
    console.log('User profile deleted successfully');
  } catch (error) {
    console.error('Error deleting user profile:', error);
    throw new Error('Failed to delete user profile');
  }
};

// Upload avatar
export const uploadAvatar = async (uid: string, file: File): Promise<string> => {
  try {
    // Validate file
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      throw new Error('File size must be less than 5MB');
    }
    
    // Upload to storage
    const avatarRef = ref(storage, `users/${uid}/avatar/${file.name}`);
    const uploadResult = await uploadBytes(avatarRef, file);
    
    // Get download URL
    const downloadURL = await getDownloadURL(uploadResult.ref);
    
    // Update profile with new avatar URL
    await updateUserProfile(uid, { avatar: downloadURL });
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw error;
  }
};

// Get users by role
export const getUsersByRole = async (role: UserProfile['role']): Promise<UserProfile[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), where('role', '==', role));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as UserProfile[];
  } catch (error) {
    console.error('Error getting users by role:', error);
    throw error;
  }
};

// Update user role (admin only)
export const updateUserRole = async (uid: string, newRole: UserProfile['role']): Promise<void> => {
  try {
    const userDocRef = doc(db, COLLECTION_NAME, uid);
    await updateDoc(userDocRef, {
      role: newRole,
      updatedAt: new Date().toISOString()
    });
    console.log('User role updated successfully');
  } catch (error) {
    console.error('Error updating user role:', error);
    throw new Error('Failed to update user role');
  }
};

// Update last login
export const updateLastLogin = async (uid: string): Promise<void> => {
  try {
    await updateUserProfile(uid, { lastLoginAt: new Date().toISOString() });
  } catch (error) {
    console.error('Error updating last login:', error);
    // Don't throw error for last login update
  }
};
