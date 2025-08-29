'use client';
import { useState } from 'react';
import { firestoreService, storageService } from '../../lib/firebaseService';
import styles from './FirebaseTest.module.css';

interface TestResult {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

interface DocumentData {
  id: string;
  message?: string;
  timestamp?: unknown;
  status?: string;
  testTime?: string;
}

const FirebaseTest = () => {
  const [firestoreResult, setFirestoreResult] = useState<TestResult | null>(null);
  const [storageResult, setStorageResult] = useState<TestResult | null>(null);
  const [testDocs, setTestDocs] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(false);

  const testFirestore = async () => {
    setLoading(true);
    setFirestoreResult(null);
    try {
      console.log('Starting Firestore test...');
      const result = await firestoreService.testConnection();
      if (result.success) {
        setFirestoreResult({
          success: true,
          message: `✅ Firestore connected successfully! Document ID: ${result.id}`,
          data: result
        });
      } else {
        setFirestoreResult({
          success: false,
          message: `❌ Firestore connection failed: ${result.error}`
        });
      }
    } catch (error) {
      setFirestoreResult({
        success: false,
        message: `❌ Firestore test error: ${error instanceof Error ? error.message : String(error)}`
      });
    }
    setLoading(false);
  };

  const testStorage = async () => {
    setLoading(true);
    setStorageResult(null);
    try {
      console.log('Starting Storage test...');
      const result = await storageService.testConnection();
      if (result.success) {
        setStorageResult({
          success: true,
          message: `✅ Storage connected successfully! File: ${result.fileName}`,
          data: result
        });
      } else {
        setStorageResult({
          success: false,
          message: `❌ Storage connection failed: ${result.error}`
        });
      }
    } catch (error) {
      setStorageResult({
        success: false,
        message: `❌ Storage test error: ${error instanceof Error ? error.message : String(error)}`
      });
    }
    setLoading(false);
  };

  const loadTestDocs = async () => {
    setLoading(true);
    setTestDocs([]);
    try {
      console.log('Loading test documents...');
      const result = await firestoreService.getTestDocs();
      if (result.success) {
        setTestDocs(result.data || []);
      }
    } catch (error) {
      console.error('Load docs error:', error);
    }
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <h1>🔥 Firebase Connection Test</h1>
      
      <div className={styles.info}>
        <h3>📋 Connection Info</h3>
        <p><strong>Firestore Emulator:</strong> http://127.0.0.1:8080</p>
        <p><strong>Storage Emulator:</strong> http://127.0.0.1:9199</p>
        <p><strong>Firebase UI:</strong> http://127.0.0.1:4000</p>
        <p>Make sure Firebase emulators are running locally</p>
      </div>

      <div className={styles.section}>
        <h3>🗄️ Firestore Test</h3>
        <p>This will create a new document in the &apos;test&apos; collection</p>
        <button onClick={testFirestore} disabled={loading} className={styles.button}>
          {loading ? '⏳ Testing...' : '🧪 Test Firestore Connection'}
        </button>
        {firestoreResult && (
          <div className={`${styles.result} ${firestoreResult.success ? styles.success : styles.error}`}>
            <p>{firestoreResult.message}</p>
            {firestoreResult.data && (
              <pre>{JSON.stringify(firestoreResult.data, null, 2)}</pre>
            )}
          </div>
        )}
      </div>

      <div className={styles.section}>
        <h3>📁 Storage Test</h3>
        <p>This will upload a text file to Firebase Storage</p>
        <button onClick={testStorage} disabled={loading} className={styles.button}>
          {loading ? '⏳ Testing...' : '📤 Test Storage Connection'}
        </button>
        {storageResult && (
          <div className={`${styles.result} ${storageResult.success ? styles.success : styles.error}`}>
            <p>{storageResult.message}</p>
            {storageResult.data && typeof storageResult.data.url === 'string' && (
              <p>
                <strong>Download URL:</strong> <br />
                <a href={storageResult.data.url} target="_blank" rel="noopener noreferrer" className={styles.link}>
                  View uploaded file
                </a>
              </p>
            )}
          </div>
        )}
      </div>

      <div className={styles.section}>
        <h3>📚 Test Documents</h3>
        <p>Load and display all documents from the &apos;test&apos; collection</p>
        <button onClick={loadTestDocs} disabled={loading} className={styles.button}>
          {loading ? '⏳ Loading...' : '📖 Load Test Documents'}
        </button>
        {testDocs.length > 0 && (
          <div className={styles.docs}>
            <h4>Documents found: {testDocs.length}</h4>
            {testDocs.map((doc, index) => (
              <div key={doc.id} className={styles.doc}>
                <strong>Document {index + 1} (ID: {doc.id}):</strong>
                <pre>{JSON.stringify(doc, null, 2)}</pre>
              </div>
            ))}
          </div>
        )}
        {testDocs.length === 0 && firestoreResult?.success && (
          <p className={styles.noData}>No documents found. Try running the Firestore test first.</p>
        )}
      </div>
    </div>
  );
};

export default FirebaseTest;