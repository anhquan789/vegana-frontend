'use client';

import { addDoc, collection, getDocs } from 'firebase/firestore';
import { useState } from 'react';
import { db } from '../../lib/firebase';

export default function DebugFirestore() {
  const [status, setStatus] = useState('');
  const [collections, setCollections] = useState<Record<string, unknown>[]>([]);

  const testFirestoreConnection = async () => {
    try {
      setStatus('🔄 Testing Firestore connection...');
      
      // Test 1: Add a test document
      console.log('📝 Adding test document...');
      const docRef = await addDoc(collection(db, 'test'), {
        message: 'Hello Firestore!',
        timestamp: new Date(),
        test: true
      });
      
      console.log('✅ Test document added with ID:', docRef.id);
      setStatus('✅ Test document created successfully!');
      
      // Test 2: Read the document back
      const snapshot = await getDocs(collection(db, 'test'));
      console.log('📖 Documents in test collection:', snapshot.size);
      
      setStatus(prev => prev + '\n📖 Found ' + snapshot.size + ' documents in test collection');
      
    } catch (error) {
      console.error('❌ Firestore test failed:', error);
      setStatus('❌ Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const createVideosCollection = async () => {
    try {
      setStatus('🔄 Creating videos collection...');
      
      const sampleVideo = {
        id: 'test_video_' + Date.now(),
        title: 'Test Video',
        description: 'Test video for collection creation',
        course: 'test-course',
        tags: ['test'],
        videoUrl: 'https://example.com/test.mp4',
        duration: '0:30',
        fileName: 'test.mp4',
        fileSize: 1000000,
        views: 0,
        completions: 0,
        status: 'active',
        uploadDate: new Date().toISOString(),
        thumbnailUrl: ''
      };
      
      const docRef = await addDoc(collection(db, 'videos'), sampleVideo);
      console.log('✅ Sample video created:', docRef.id);
      setStatus('✅ Videos collection created with sample video!');
      
    } catch (error) {
      console.error('❌ Error creating videos collection:', error);
      setStatus('❌ Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const loadVideosCollection = async () => {
    try {
      setStatus('🔄 Loading videos collection...');
      
      const snapshot = await getDocs(collection(db, 'videos'));
      const videos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setCollections(videos);
      setStatus(`✅ Loaded ${videos.length} videos from collection`);
      console.log('Videos:', videos);
      
    } catch (error) {
      console.error('❌ Error loading videos:', error);
      setStatus('❌ Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🔧 Firestore Debug</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button
          onClick={testFirestoreConnection}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          🧪 Test Connection
        </button>
        
        <button
          onClick={createVideosCollection}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          📹 Create Videos Collection
        </button>
        
        <button
          onClick={loadVideosCollection}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          📋 Load Videos
        </button>
      </div>

      {status && (
        <div className="bg-gray-100 p-4 rounded mb-6">
          <pre className="whitespace-pre-wrap text-sm">{status}</pre>
        </div>
      )}

      {collections.length > 0 && (
        <div className="bg-white border rounded p-4">
          <h2 className="text-lg font-semibold mb-3">📊 Videos Collection Data:</h2>
          <pre className="text-xs overflow-auto bg-gray-50 p-3 rounded">
            {JSON.stringify(collections, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-8 text-sm text-gray-600">
        <p><strong>Links to check:</strong></p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li><a href="http://127.0.0.1:4001/firestore" target="_blank" className="text-blue-600 underline">Firestore UI</a></li>
          <li><a href="http://127.0.0.1:4001/storage/demo-vegana-project.appspot.com" target="_blank" className="text-blue-600 underline">Storage UI</a></li>
        </ul>
      </div>
    </div>
  );
}
