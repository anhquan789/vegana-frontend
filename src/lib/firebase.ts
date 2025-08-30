import { getApp, getApps, initializeApp } from 'firebase/app';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectStorageEmulator, getStorage } from 'firebase/storage';

// Firebase config for local development
const firebaseConfig = {
  apiKey: "demo-api-key",
  authDomain: "demo-project.firebaseapp.com",
  projectId: "demo-project", 
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "demo-app-id"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore
const db = getFirestore(app);

// Initialize Storage
const storage = getStorage(app);

// Connect to emulators in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  try {
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
    console.log('✅ Connected to Firestore emulator at 127.0.0.1:8080');
  } catch {
    console.log('Firestore emulator already connected or connection failed');
  }
  
  try {
    connectStorageEmulator(storage, '127.0.0.1', 9199);
    console.log('✅ Connected to Storage emulator at 127.0.0.1:9199');
  } catch {
    console.log('Storage emulator already connected or connection failed');
  }
}

export { db, storage };
export default app;