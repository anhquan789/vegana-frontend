'use client';

import { useState } from 'react';
import { addVideoToStorage, getVideosFromStorage, VideoFile } from '../utils/videoUtils';

export default function VideoStorageTest() {
  const [videos, setVideos] = useState<VideoFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTestVideo = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const testVideo: VideoFile = {
        id: 'test-' + Date.now(),
        title: 'Test Video ' + new Date().toLocaleString(),
        description: 'This is a test video created for debugging',
        fileName: 'test.mp4',
        fileSize: 1024000,
        duration: '2:30',
        course: 'test-course',
        status: 'active',
        uploadDate: new Date().toISOString(),
        views: 0,
        completions: 0,
        videoUrl: 'test-url-' + Date.now(),
        thumbnailUrl: '',
        tags: ['test', 'debug']
      };

      console.log('🎬 Creating test video:', testVideo);
      await addVideoToStorage(testVideo);
      console.log('✅ Test video saved successfully');
      
      // Reload videos
      await loadVideos();
    } catch (err: unknown) {
      console.error('❌ Error creating test video:', err);
      setError('Error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const loadVideos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📋 Loading videos from storage...');
      const loadedVideos = await getVideosFromStorage();
      console.log('✅ Loaded videos:', loadedVideos.length);
      setVideos(loadedVideos);
    } catch (err: unknown) {
      console.error('❌ Error loading videos:', err);
      setError('Error loading videos: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>🎬 Video Storage Test</h2>
      
      {error && (
        <div style={{ color: 'red', marginBottom: '20px', padding: '10px', background: '#fee' }}>
          <strong>❌ Error:</strong> {error}
        </div>
      )}
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={createTestVideo} 
          disabled={loading}
          style={{ marginRight: '10px', padding: '10px 20px' }}
        >
          {loading ? 'Creating...' : 'Create Test Video'}
        </button>
        
        <button 
          onClick={loadVideos} 
          disabled={loading}
          style={{ padding: '10px 20px' }}
        >
          {loading ? 'Loading...' : 'Load Videos'}
        </button>
      </div>
      
      <h3>Videos in Storage ({videos.length}):</h3>
      <div style={{ maxHeight: '400px', overflow: 'auto', border: '1px solid #ccc', padding: '10px' }}>
        {videos.length === 0 ? (
          <p>No videos found</p>
        ) : (
          videos.map(video => (
            <div key={video.id} style={{ 
              marginBottom: '15px', 
              padding: '10px', 
              border: '1px solid #ddd',
              background: '#f9f9f9'
            }}>
              <div><strong>ID:</strong> {video.id}</div>
              <div><strong>Title:</strong> {video.title}</div>
              <div><strong>Course:</strong> {video.course}</div>
              <div><strong>Upload Date:</strong> {new Date(video.uploadDate).toLocaleString()}</div>
              <div><strong>Status:</strong> {video.status}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
