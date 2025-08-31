// Firebase Connection Test
import { addDoc, collection } from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '../lib/firebase.ts';

console.log('🔥 Testing Firebase Connection...');

// Test Firestore
async function testFirestore() {
  try {
    const docRef = await addDoc(collection(db, 'test'), {
      message: 'Hello Firebase!',
      timestamp: new Date()
    });
    console.log('✅ Firestore test successful, doc ID:', docRef.id);
  } catch (error) {
    console.error('❌ Firestore test failed:', error);
  }
}

// Test Storage  
async function testStorage() {
  try {
    const testFile = new Blob(['test content'], { type: 'text/plain' });
    const storageRef = ref(storage, 'test/test-file.txt');
    await uploadBytes(storageRef, testFile);
    console.log('✅ Storage test successful');
  } catch (error) {
    console.error('❌ Storage test failed:', error);
  }
}

// Run tests
testFirestore();
testStorage();

export { testFirestore, testStorage };
