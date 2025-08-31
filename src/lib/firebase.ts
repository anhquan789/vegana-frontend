import { getApp, getApps, initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectStorageEmulator, getStorage } from 'firebase/storage';

// Firebase configuration
const FIREBASE_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-project", 
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "demo-app-id"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(FIREBASE_CONFIG) : getApp();

// Initialize services
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

// Connect to emulators in development (only on client side)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Firestore Emulator (port 8081 - changed from 8080)
  try {
    connectFirestoreEmulator(db, '127.0.0.1', 8081);
    console.log('✅ Connected to Firestore emulator on port 8081');
  } catch (error) {
    console.log('Firestore emulator connection info:', error);
  }
  
  // Storage Emulator (port 9198 - changed from 9199)
  try {
    connectStorageEmulator(storage, '127.0.0.1', 9198);
    console.log('✅ Connected to Storage emulator on port 9198');
  } catch (error) {
    console.log('Storage emulator connection info:', error);
  }

  // Auth Emulator (port 9098 - changed from 9099)
  try {
    connectAuthEmulator(auth, 'http://127.0.0.1:9098');
    console.log('✅ Connected to Auth emulator on port 9098');
  } catch (error) {
    console.log('Auth emulator connection info:', error);
  }
}

export { auth, db, storage };
export default app;