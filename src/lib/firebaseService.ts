import { addDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';
import { getDownloadURL, ref, uploadString } from 'firebase/storage';
import { db, storage } from './firebase';

// Firestore operations
export const firestoreService = {
  // Test connection by adding a document
  async testConnection() {
    try {
      console.log('Testing Firestore connection...');
      const docRef = await addDoc(collection(db, 'test'), {
        message: 'Hello Firestore!',
        timestamp: serverTimestamp(),
        status: 'connected',
        testTime: new Date().toISOString()
      });
      console.log('Document written with ID: ', docRef.id);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Firestore test failed:', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  },

  // Get all test documents
  async getTestDocs() {
    try {
      console.log('Getting test documents...');
      const querySnapshot = await getDocs(collection(db, 'test'));
      const docs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('Retrieved documents:', docs);
      return { success: true, data: docs };
    } catch (error) {
      console.error('Get documents failed:', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }
};

// Storage operations
export const storageService = {
  // Test connection by uploading a simple text file
  async testConnection() {
    try {
      console.log('Testing Storage connection...');
      const testData = `Test upload at ${new Date().toISOString()}\nThis is a test file for Firebase Storage connection.`;
      const fileName = `test-${Date.now()}.txt`;
      const storageRef = ref(storage, `test-uploads/${fileName}`);
      
      console.log('Uploading to:', storageRef.fullPath);
      const snapshot = await uploadString(storageRef, testData);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      console.log('File uploaded successfully:', downloadURL);
      return { 
        success: true, 
        url: downloadURL, 
        path: snapshot.ref.fullPath,
        fileName: fileName
      };
    } catch (error) {
      console.error('Storage test failed:', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }
};