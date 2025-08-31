'use client';

import { addDoc, collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';

interface TestData {
  id: string;
  message: string;
  timestamp: Date;
}

export default function FirebaseTest() {
  const [testData, setTestData] = useState<TestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const testFirebase = async () => {
    try {
      console.log('🔥 Testing Firebase connection...');
      
      // Test write
      const docRef = await addDoc(collection(db, 'test'), {
        message: 'Hello from Firebase!',
        timestamp: new Date()
      });
      console.log('✅ Write test successful, doc ID:', docRef.id);
      
      // Test read
      const querySnapshot = await getDocs(collection(db, 'test'));
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as TestData));
      
      console.log('✅ Read test successful, found:', data.length, 'documents');
      setTestData(data);
      setError(null);
    } catch (err: unknown) {
      console.error('❌ Firebase test failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testFirebase();
  }, []);

  if (loading) return <div>Testing Firebase connection...</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>🔥 Firebase Connection Test</h2>
      
      {error ? (
        <div style={{ color: 'red', marginBottom: '20px' }}>
          <strong>❌ Error:</strong> {error}
        </div>
      ) : (
        <div style={{ color: 'green', marginBottom: '20px' }}>
          ✅ Firebase connection successful!
        </div>
      )}
      
      <button onClick={testFirebase} style={{ marginBottom: '20px' }}>
        Test Again
      </button>
      
      <h3>Test Data ({testData.length} items):</h3>
      <pre style={{ background: '#f5f5f5', padding: '10px' }}>
        {JSON.stringify(testData, null, 2)}
      </pre>
    </div>
  );
}
