'use client';
import { useState } from 'react';

interface TestResult {
  type: 'firestore' | 'storage';
  success: boolean;
  message: string;
  data?: {
    id?: string;
    url?: string;
    path?: string;
    fileName?: string;
    [key: string]: unknown;
  };
}

// Dynamic imports để tránh SSR issues
const FirebaseTestAdvanced = () => {
  const [firestoreResult, setFirestoreResult] = useState<TestResult | null>(null);
  const [storageResult, setStorageResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState<{ firestore: boolean; storage: boolean }>({
    firestore: false,
    storage: false
  });

  const testFirestoreConnection = async () => {
    setLoading(prev => ({ ...prev, firestore: true }));
    setFirestoreResult(null);
    
    try {
      // Dynamic import Firebase modules
      const { initializeApp, getApps } = await import('firebase/app');
      const { getFirestore, collection, addDoc, connectFirestoreEmulator, serverTimestamp } = await import('firebase/firestore');
      
      const firebaseConfig = {
        apiKey: "demo-api-key",
        authDomain: "demo-project.firebaseapp.com",
        projectId: "demo-project", 
        storageBucket: "demo-project.appspot.com",
        messagingSenderId: "123456789",
        appId: "demo-app-id"
      };
      
      const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
      const db = getFirestore(app);
      
      // Connect to emulator
      try {
        connectFirestoreEmulator(db, '127.0.0.1', 8080);
        console.log('Connected to Firestore emulator');
      } catch (error) {
        console.log('Firestore emulator already connected:', error);
      }
      
      // Test Firestore
      const docRef = await addDoc(collection(db, 'test'), {
        message: 'Hello from Firestore test!',
        timestamp: serverTimestamp(),
        testTime: new Date().toISOString(),
        status: 'connected'
      });
      
      setFirestoreResult({
        type: 'firestore',
        success: true,
        message: `✅ Firestore connected successfully! Document created with ID: ${docRef.id}`,
        data: { id: docRef.id }
      });
      
    } catch (error) {
      setFirestoreResult({
        type: 'firestore',
        success: false,
        message: `❌ Firestore Error: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
    
    setLoading(prev => ({ ...prev, firestore: false }));
  };

  const testStorageConnection = async () => {
    setLoading(prev => ({ ...prev, storage: true }));
    setStorageResult(null);
    
    try {
      // Dynamic import Firebase modules
      const { initializeApp, getApps } = await import('firebase/app');
      const { getStorage, ref, uploadString, getDownloadURL, connectStorageEmulator } = await import('firebase/storage');
      
      const firebaseConfig = {
        apiKey: "demo-api-key",
        authDomain: "demo-project.firebaseapp.com",
        projectId: "demo-project", 
        storageBucket: "demo-project.appspot.com",
        messagingSenderId: "123456789",
        appId: "demo-app-id"
      };
      
      const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
      const storage = getStorage(app);
      
      // Connect to emulator
      try {
        connectStorageEmulator(storage, '127.0.0.1', 9199);
        console.log('Connected to Storage emulator');
      } catch (error) {
        console.log('Storage emulator already connected:', error);
      }
      
      // Test Storage - Upload a text file
      const testData = `🔥 Firebase Storage Test File
Created at: ${new Date().toISOString()}
This is a test file to verify Storage emulator connection.

Test details:
- Emulator: 127.0.0.1:9199
- Project: demo-project
- Status: Connected successfully!`;

      const fileName = `test-${Date.now()}.txt`;
      const storageRef = ref(storage, `test-uploads/${fileName}`);
      
      console.log('Uploading to:', storageRef.fullPath);
      
      // Upload string as file
      const snapshot = await uploadString(storageRef, testData);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      console.log('File uploaded successfully:', downloadURL);
      
      setStorageResult({
        type: 'storage',
        success: true,
        message: `✅ Storage connected successfully! File uploaded: ${fileName}`,
        data: { 
          url: downloadURL, 
          path: snapshot.ref.fullPath,
          fileName: fileName,
          metadata: snapshot.metadata
        }
      });
      
    } catch (error) {
      setStorageResult({
        type: 'storage',
        success: false,
        message: `❌ Storage Error: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
    
    setLoading(prev => ({ ...prev, storage: false }));
  };

  const ResultDisplay = ({ result }: { result: TestResult }) => (
    <div style={{ 
      marginTop: '20px', 
      padding: '15px', 
      borderRadius: '8px',
      background: result.success ? '#d4edda' : '#f8d7da',
      border: result.success ? '1px solid #c3e6cb' : '1px solid #f5c6cb',
      color: result.success ? '#155724' : '#721c24'
    }}>
      <strong>Result:</strong><br/>
      {result.message}
      
      {result.success && result.data && (
        <div style={{ marginTop: '10px' }}>
          <details>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
              📋 View Details
            </summary>
            <pre style={{ 
              background: 'rgba(0,0,0,0.1)', 
              padding: '10px', 
              borderRadius: '4px', 
              marginTop: '8px',
              fontSize: '12px',
              overflow: 'auto'
            }}>
              {JSON.stringify(result.data, null, 2)}
            </pre>
          </details>
          
          {result.type === 'storage' && result.data.url && (
            <div style={{ marginTop: '10px' }}>
              <a 
                href={result.data.url} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  color: '#007bff', 
                  textDecoration: 'none',
                  fontWeight: 'bold'
                }}
              >
                � Download/View File
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <h1>🔥 Firebase Connection Test</h1>
      
      <div style={{ 
        background: '#e7f3ff', 
        padding: '20px', 
        borderRadius: '8px', 
        margin: '20px 0',
        border: '1px solid #007bff'
      }}>
        <h3>📋 Emulator Connection Info</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '10px' }}>
          <p><strong>🗄️ Firestore:</strong> http://127.0.0.1:8080</p>
          <p><strong>📁 Storage:</strong> http://127.0.0.1:9199</p>
          <p><strong>🎛️ Firebase UI:</strong> http://127.0.0.1:4000</p>
        </div>
        <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
          💡 Make sure all Firebase emulators are running before testing
        </p>
      </div>
      
      {/* Firestore Test Section */}
      <div style={{ 
        background: '#fff', 
        padding: '25px', 
        borderRadius: '10px', 
        border: '2px solid #dee2e6',
        marginBottom: '25px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h3>🗄️ Firestore Connection Test</h3>
        <p>This will create a new document in the &apos;test&apos; collection with timestamp</p>
        
        <button 
          onClick={testFirestoreConnection}
          disabled={loading.firestore}
          style={{ 
            background: loading.firestore ? '#ccc' : 'linear-gradient(135deg, #007bff, #0056b3)',
            color: 'white', 
            border: 'none', 
            padding: '12px 24px', 
            borderRadius: '8px', 
            cursor: loading.firestore ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            boxShadow: loading.firestore ? 'none' : '0 2px 10px rgba(0,123,255,0.3)',
            transition: 'all 0.3s ease'
          }}
        >
          {loading.firestore ? '⏳ Testing...' : '🧪 Test Firestore Connection'}
        </button>
        
        {firestoreResult && <ResultDisplay result={firestoreResult} />}
      </div>

      {/* Storage Test Section */}
      <div style={{ 
        background: '#fff', 
        padding: '25px', 
        borderRadius: '10px', 
        border: '2px solid #dee2e6',
        marginBottom: '25px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h3>📁 Storage Connection Test</h3>
        <p>This will upload a text file to Firebase Storage emulator</p>
        
        <button 
          onClick={testStorageConnection}
          disabled={loading.storage}
          style={{ 
            background: loading.storage ? '#ccc' : 'linear-gradient(135deg, #28a745, #1e7e34)',
            color: 'white', 
            border: 'none', 
            padding: '12px 24px', 
            borderRadius: '8px', 
            cursor: loading.storage ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            boxShadow: loading.storage ? 'none' : '0 2px 10px rgba(40,167,69,0.3)',
            transition: 'all 0.3s ease'
          }}
        >
          {loading.storage ? '⏳ Testing...' : '📤 Test Storage Connection'}
        </button>
        
        {storageResult && <ResultDisplay result={storageResult} />}
      </div>

      {/* Combined Test Section */}
      <div style={{ 
        background: '#f8f9fa', 
        padding: '25px', 
        borderRadius: '10px', 
        border: '2px solid #6c757d',
        marginBottom: '25px'
      }}>
        <h3>⚡ Quick Test All</h3>
        <p>Test both Firestore and Storage connections simultaneously</p>
        
        <button 
          onClick={async () => {
            await Promise.all([
              testFirestoreConnection(),
              testStorageConnection()
            ]);
          }}
          disabled={loading.firestore || loading.storage}
          style={{ 
            background: (loading.firestore || loading.storage) ? '#ccc' : 'linear-gradient(135deg, #6f42c1, #5a2d82)',
            color: 'white', 
            border: 'none', 
            padding: '12px 24px', 
            borderRadius: '8px', 
            cursor: (loading.firestore || loading.storage) ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            boxShadow: (loading.firestore || loading.storage) ? 'none' : '0 2px 10px rgba(111,66,193,0.3)',
            transition: 'all 0.3s ease'
          }}
        >
          {(loading.firestore || loading.storage) ? '⏳ Testing...' : '🚀 Test All Connections'}
        </button>
      </div>
    </div>
  );
};

export default FirebaseTestAdvanced;
