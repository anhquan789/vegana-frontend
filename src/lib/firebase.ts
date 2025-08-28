import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

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
    // Connect to Firestore emulator
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
    console.log('Connected to Firestore emulator');
  } catch (error) {
    console.log('Firestore emulator already connected or connection failed:', error);
  }
  
  try {
    // Connect to Storage emulator  
    connectStorageEmulator(storage, '127.0.0.1', 9199);
    console.log('Connected to Storage emulator');
  } catch (error) {
    console.log('Storage emulator already connected or connection failed:', error);
  }
}

export { db, storage };
export default app;