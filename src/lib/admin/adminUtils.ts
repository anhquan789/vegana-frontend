import { auth, db } from '@/lib/firebase';
import { UserProfile } from '@/types/auth';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

/**
 * Create admin user for testing - DO NOT USE IN PRODUCTION
 */
export const createAdminUser = async (email: string, password: string, firstName: string, lastName: string) => {
  try {
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create admin profile in Firestore
    const adminProfile: UserProfile = {
      uid: user.uid,
      email: email,
      displayName: `${firstName} ${lastName}`,
      firstName: firstName,
      lastName: lastName,
      role: 'admin',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await setDoc(doc(db, 'users', user.uid), adminProfile);

    console.log('Admin user created successfully:', email);
    return { success: true, user, profile: adminProfile };
  } catch (error) {
    console.error('Error creating admin user:', error);
    return { success: false, error };
  }
};

/**
 * Quick login for testing
 */
export const quickAdminLogin = async () => {
  const adminEmail = 'admin@vegana.com';
  const adminPassword = 'admin123456';

  try {
    // Try to login first
    const userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
    console.log('Admin logged in successfully');
    return { success: true, user: userCredential.user };
  } catch (error: unknown) {
    const firebaseError = error as { code?: string };
    if (firebaseError.code === 'auth/user-not-found') {
      // User doesn't exist, create it
      console.log('Admin user not found, creating...');
      return await createAdminUser(adminEmail, adminPassword, 'Admin', 'Vegana');
    } else {
      console.error('Login error:', error);
      return { success: false, error };
    }
  }
};
