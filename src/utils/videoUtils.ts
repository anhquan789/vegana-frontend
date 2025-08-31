/**
 * Video utilities for Firebase Storage and Firestore integration
 */

import { db, storage } from '@/lib/firebase';
import {
    collection,
    deleteDoc,
    doc,
    getDocs,
    orderBy,
    query,
    setDoc,
    updateDoc
} from 'firebase/firestore';
import {
    deleteObject,
    getDownloadURL,
    ref,
    uploadBytesResumable
} from 'firebase/storage';

export interface VideoFile {
  id: string;
  title: string;
  description?: string;
  fileName: string;
  fileSize: number;
  duration: string;
  course: string;
  status: 'active' | 'inactive' | 'processing';
  uploadDate: string;
  views: number;
  completions: number;
  videoUrl: string;
  thumbnailUrl?: string;
  tags: string[];
}

export interface UploadProgress {
  progress: number;
  isUploading: boolean;
  isComplete: boolean;
  error: string | null;
}

const VIDEO_COLLECTION = 'videos';

/**
 * Generate unique video ID
 */
export const generateVideoId = (): string => {
  return `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Initialize videos collection if it doesn't exist
 */
export const initializeVideosCollection = async (): Promise<void> => {
  try {
    console.log('🔄 Initializing videos collection...');
    
    // Check if collection exists by trying to get docs
    const q = query(collection(db, VIDEO_COLLECTION), orderBy('uploadDate', 'desc'));
    const snapshot = await getDocs(q);
    
    console.log('📊 Current videos in collection:', snapshot.size);
    
    if (snapshot.empty) {
      console.log('📝 Creating sample video document...');
      
      // Create a sample video document to initialize collection
      const sampleVideo: VideoFile = {
        id: 'sample_video_init',
        title: 'Sample Video (Can be deleted)',
        description: 'This is a sample video to initialize the collection',
        course: 'sample-course',
        tags: ['sample', 'init'],
        videoUrl: 'https://sample-url.com/video.mp4',
        thumbnailUrl: '',
        duration: '1:00',
        fileName: 'sample.mp4',
        fileSize: 1024000, // 1MB
        views: 0,
        completions: 0,
        status: 'inactive', // Inactive so it doesn't show in real list
        uploadDate: new Date().toISOString()
      };
      
      await setDoc(doc(db, VIDEO_COLLECTION, 'sample_video_init'), sampleVideo);
      console.log('✅ Sample video document created');
    } else {
      console.log('✅ Videos collection already exists with', snapshot.size, 'documents');
    }
  } catch (error) {
    console.error('❌ Error initializing videos collection:', error);
  }
};

/**
 * Get all videos from Firestore
 */
export const getVideosFromStorage = async (): Promise<VideoFile[]> => {
  try {
    // Initialize collection first if needed
    await initializeVideosCollection();
    
    const q = query(collection(db, VIDEO_COLLECTION), orderBy('uploadDate', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const videos = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as VideoFile));
    
    console.log('📋 Loaded videos from Firestore:', videos.length);
    return videos;
  } catch (error) {
    console.error('Error loading videos from Firestore:', error);
    return [];
  }
};

/**
 * Save video metadata to Firestore
 */
export const addVideoToStorage = async (video: VideoFile): Promise<void> => {
  try {
    await setDoc(doc(db, VIDEO_COLLECTION, video.id), video);
    console.log('✅ Video saved to Firestore:', video.id);
  } catch (error) {
    console.error('Error saving video to Firestore:', error);
    throw error;
  }
};

/**
 * Update video in Firestore
 */
export const updateVideoInStorage = async (videoId: string, updates: Partial<VideoFile>): Promise<void> => {
  try {
    await updateDoc(doc(db, VIDEO_COLLECTION, videoId), updates);
    console.log('📝 Video updated in Firestore:', videoId);
  } catch (error) {
    console.error('Error updating video in Firestore:', error);
    throw error;
  }
};

/**
 * Delete video from both Storage and Firestore
 */
export const deleteVideoFromStorage = async (videoId: string, videoUrl: string): Promise<void> => {
  try {
    // Delete file from Firebase Storage
    const videoRef = ref(storage, videoUrl);
    await deleteObject(videoRef);
    
    // Delete metadata from Firestore
    await deleteDoc(doc(db, VIDEO_COLLECTION, videoId));
    
    console.log('🗑️ Video deleted:', videoId);
  } catch (error) {
    console.error('Error deleting video:', error);
    throw error;
  }
};

/**
 * Generate video duration from file
 */
export const getVideoDuration = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      const duration = video.duration;
      const minutes = Math.floor(duration / 60);
      const seconds = Math.floor(duration % 60);
      resolve(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };
    
    video.onerror = () => {
      resolve('0:00');
    };
    
    video.src = URL.createObjectURL(file);
  });
};

/**
 * Generate video thumbnail
 */
export const generateVideoThumbnail = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    video.onloadeddata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      video.currentTime = 1; // Get frame at 1 second
    };
    
    video.onseeked = () => {
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const thumbnail = canvas.toDataURL('image/jpeg', 0.8);
        resolve(thumbnail);
      } else {
        resolve('');
      }
      window.URL.revokeObjectURL(video.src);
    };
    
    video.onerror = () => {
      resolve('');
      window.URL.revokeObjectURL(video.src);
    };
    
    video.src = URL.createObjectURL(file);
  });
};

/**
 * Upload video to Firebase Storage with progress tracking
 */
export const storeVideoFile = (
  videoId: string, 
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const fileName = `videos/${videoId}_${file.name}`;
    const storageRef = ref(storage, fileName);
    
    // Create upload task
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    console.log('🚀 Starting Firebase upload:', { videoId, fileName, size: formatFileSize(file.size) });
    
    uploadTask.on(
      'state_changed',
      // Progress callback
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(`📊 Upload progress: ${progress.toFixed(1)}%`);
        
        if (onProgress) {
          onProgress({
            progress,
            isUploading: true,
            isComplete: false,
            error: null
          });
        }
      },
      // Error callback
      (error) => {
        console.error('❌ Upload error:', error);
        if (onProgress) {
          onProgress({
            progress: 0,
            isUploading: false,
            isComplete: false,
            error: error.message
          });
        }
        reject(error);
      },
      // Success callback
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log('✅ Upload complete. Download URL:', downloadURL);
          
          if (onProgress) {
            onProgress({
              progress: 100,
              isUploading: false,
              isComplete: true,
              error: null
            });
          }
          
          resolve(downloadURL);
        } catch (error) {
          console.error('❌ Error getting download URL:', error);
          reject(error);
        }
      }
    );
  });
};

/**
 * Get video file URL (Firebase Storage URL)
 */
export const getVideoFileUrl = (videoId: string): string | null => {
  // For Firebase Storage, the URL is already stored in videoUrl field
  // This function is kept for backward compatibility
  console.log(`🔗 Getting video URL for: ${videoId}`);
  return null; // URL is directly available from Firestore
};

/**
 * Format file size to human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Validate video file
 */
export const validateVideoFile = (file: File): { isValid: boolean; error?: string } => {
  // Check file type
  if (!file.type.startsWith('video/')) {
    return { isValid: false, error: 'Chỉ chấp nhận file video' };
  }
  
  // Check file size (max 500MB)
  const maxSize = 500 * 1024 * 1024; // 500MB
  if (file.size > maxSize) {
    return { isValid: false, error: 'File video không được vượt quá 500MB' };
  }
  
  // Check supported formats
  const supportedFormats = ['video/mp4', 'video/webm', 'video/mov', 'video/avi', 'video/quicktime'];
  if (!supportedFormats.includes(file.type)) {
    return { isValid: false, error: 'Định dạng video không được hỗ trợ. Chỉ chấp nhận: MP4, WebM, MOV, AVI' };
  }
  
  return { isValid: true };
};
