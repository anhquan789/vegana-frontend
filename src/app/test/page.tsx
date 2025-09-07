'use client';
import { useState } from 'react';
import FirebaseTest from '../../components/FirebaseTest';
import VideoStorageTest from '../../components/VideoStorageTest';
import FirebaseTestAdvanced from '../../components/test/FirebaseTestAdvanced';
import SimpleFirestoreTest from '../../components/test/SimpleFirestoreTest';
import SimpleTest from '../../components/test/SimpleTest';
import { runAllTests } from '../../test/firebase-integration-test';

function FirebaseIntegrationTest() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<{
    firebase?: { success: boolean; documentId?: string; error?: string; code?: string };
    categories?: { success: boolean; error?: string };
    course?: { success: boolean; error?: string };
    error?: string;
  } | null>(null);

  const handleRunTests = async () => {
    setIsRunning(true);
    setResults(null);
    
    try {
      const testResults = await runAllTests();
      setResults(testResults);
    } catch (error) {
      console.error('Test execution failed:', error);
      setResults({ error: 'Test execution failed' });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">🧪 Firebase Integration Test</h2>
      <p className="text-gray-600 mb-4">
        Test Firebase connection, video upload, and CRUD operations.
      </p>
      
      <button
        onClick={handleRunTests}
        disabled={isRunning}
        className={`px-6 py-3 rounded-lg font-medium mb-4 ${
          isRunning
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {isRunning ? 'Running Tests...' : 'Run Firebase Tests'}
      </button>

      {results && (
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2 flex items-center">
              <span className={`mr-2 ${results.firebase?.success ? 'text-green-500' : 'text-red-500'}`}>
                {results.firebase?.success ? '✅' : '❌'}
              </span>
              Firebase Connection & Video Upload
            </h4>
            {results.firebase?.success ? (
              <div className="text-sm text-gray-600">
                <p>✅ Firestore write/read successful</p>
                <p>✅ Storage upload successful</p>
                <p>✅ Document ID: {results.firebase.documentId}</p>
              </div>
            ) : (
              <div className="text-sm text-red-600">
                <p>❌ Error: {results.firebase?.error}</p>
                <p>❌ Code: {results.firebase?.code}</p>
              </div>
            )}
          </div>

          {results.firebase?.success && results.categories?.success && results.course?.success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">🎉 All Tests Passed!</h4>
              <p className="text-green-700 text-sm">
                Firebase integration is working. Video upload permission errors should be fixed!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Firebase Test Suite</h1>
        
        <SimpleFirestoreTest />
        <FirebaseIntegrationTest />
        
        <div className="grid gap-6">
          <FirebaseTest />
          <VideoStorageTest />
          <FirebaseTestAdvanced />
          <SimpleTest />
        </div>
      </div>
    </div>
  );
}