'use client';

import { addDoc, collection, getDocs } from 'firebase/firestore';
import { useState } from 'react';
import { db } from '../../lib/firebase';

export default function SimpleFirestoreTest() {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const testFirestore = async () => {
    setIsRunning(true);
    setResult(null);
    
    try {
      console.log('🧪 Testing Firestore only...');
      
      // Test write
      const testDoc = await addDoc(collection(db, 'test'), {
        message: 'Hello from Firebase test!',
        timestamp: new Date().toISOString()
      });
      
      console.log('✅ Firestore write success:', testDoc.id);
      
      // Test read
      const snapshot = await getDocs(collection(db, 'test'));
      console.log('✅ Firestore read success:', snapshot.size, 'documents');
      
      setResult(`✅ SUCCESS! 
      - Document created: ${testDoc.id}
      - Total documents: ${snapshot.size}
      - Firestore is working correctly!`);
      
    } catch (error) {
      console.error('❌ Firestore test failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setResult(`❌ FAILED: ${errorMessage}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">🔥 Simple Firestore Test</h2>
      <p className="text-gray-600 mb-4">
        Test basic Firestore operations (create/read documents)
      </p>
      
      <button
        onClick={testFirestore}
        disabled={isRunning}
        className={`px-6 py-3 rounded-lg font-medium mb-4 ${
          isRunning
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-green-600 hover:bg-green-700 text-white'
        }`}
      >
        {isRunning ? 'Testing...' : 'Test Firestore Only'}
      </button>

      {result && (
        <div className={`p-4 rounded-lg text-sm whitespace-pre-line ${
          result.includes('✅') 
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {result}
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-500">
        <p>This test only uses Firestore (no Storage) to verify basic Firebase connection.</p>
        <p>If this passes, the issue is specifically with Storage configuration.</p>
      </div>
    </div>
  );
}
