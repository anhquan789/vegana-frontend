'use client';

import { Button } from '@/components/ui/Button';
import {
    addVideoToStorage,
    formatFileSize,
    generateVideoId,
    generateVideoThumbnail,
    getVideoDuration,
    storeVideoFile,
    UploadProgress,
    validateVideoFile,
    VideoFile
} from '@/utils/videoUtils';
import { ChangeEvent, DragEvent, useRef, useState } from 'react';

interface VideoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (video: VideoFile) => void;
}

const VideoUploadModal = ({ isOpen, onClose, onUpload }: VideoUploadModalProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course: '',
    tags: ''
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    const validation = validateVideoFile(file);
    if (!validation.isValid) {
      setError(validation.error || 'File không hợp lệ');
      return;
    }

    setSelectedFile(file);
    setError(null);
    
    // Auto-fill title from filename
    if (!formData.title) {
      const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, '');
      setFormData(prev => ({ ...prev, title: nameWithoutExtension }));
    }
  };

  const handleFormChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Vui lòng chọn file video');
      return;
    }

    if (!formData.title.trim()) {
      setError('Vui lòng nhập tiêu đề video');
      return;
    }

    if (!formData.course) {
      setError('Vui lòng chọn khóa học');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Generate video metadata first
      const videoId = generateVideoId();
      console.log('🎬 Starting video processing for:', videoId);
      
      // Get duration and thumbnail while uploading
      const [duration, thumbnailUrl] = await Promise.all([
        getVideoDuration(selectedFile),
        generateVideoThumbnail(selectedFile)
      ]);
      
      // Upload video to Firebase Storage with progress tracking
      const videoUrl = await storeVideoFile(videoId, selectedFile, (progress: UploadProgress) => {
        setUploadProgress(progress.progress);
        if (progress.error) {
          setError(progress.error);
        }
      });

      // Create video object
      const newVideo: VideoFile = {
        id: videoId,
        title: formData.title.trim(),
        description: formData.description.trim(),
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        duration,
        course: formData.course,
        status: 'active',
        uploadDate: new Date().toISOString(),
        views: 0,
        completions: 0,
        videoUrl,
        thumbnailUrl,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      // Save to Firestore
      console.log('💾 Saving video to Firestore:', newVideo);
      await addVideoToStorage(newVideo);
      console.log('✅ Video saved successfully to Firestore');

      console.log('✅ Video upload completed:', {
        id: newVideo.id,
        title: newVideo.title,
        fileSize: newVideo.fileSize,
        firebaseUrl: newVideo.videoUrl
      });
      
      // Notify parent component
      onUpload(newVideo);

      // Reset form
      setSelectedFile(null);
      setFormData({ title: '', description: '', course: '', tags: '' });
      setUploadProgress(0);
      
      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 1000);

    } catch (error) {
      console.error('Upload error:', error);
      setError('Có lỗi xảy ra khi upload video. Vui lòng thử lại.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Upload Video Mới</h2>
            <button
              onClick={onClose}
              disabled={isUploading}
              className="text-gray-400 hover:text-gray-600 text-2xl disabled:opacity-50"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* File Upload Area */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Chọn file video
            </label>
            
            {!selectedFile ? (
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <div className="space-y-2">
                  <div className="text-4xl">🎥</div>
                  <div className="text-gray-600">
                    <p className="text-lg">Kéo thả video vào đây hoặc</p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-2"
                    >
                      Chọn file từ máy tính
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">
                    Hỗ trợ: MP4, WebM, MOV, AVI (tối đa 500MB)
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">🎥</span>
                      <div>
                        <p className="font-medium text-gray-900">{selectedFile.name}</p>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(selectedFile.size)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeSelectedFile}
                    disabled={isUploading}
                    className="text-red-500 hover:text-red-700 disabled:opacity-50"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Đang upload...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiêu đề video *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleFormChange('title', e.target.value)}
                disabled={isUploading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                placeholder="Nhập tiêu đề video..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Khóa học *
              </label>
              <select
                value={formData.course}
                onChange={(e) => handleFormChange('course', e.target.value)}
                disabled={isUploading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">Chọn khóa học</option>
                <option value="html-css">HTML, CSS Pro</option>
                <option value="javascript">JavaScript Pro</option>
                <option value="react">React Pro</option>
                <option value="nodejs">Node.js Pro</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả (tùy chọn)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
              disabled={isUploading}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="Nhập mô tả chi tiết về nội dung video..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (tùy chọn)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => handleFormChange('tags', e.target.value)}
              disabled={isUploading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="html, css, frontend (phân cách bằng dấu phẩy)"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isUploading}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={!selectedFile || isUploading || !formData.title.trim() || !formData.course}
              loading={isUploading}
              className="flex-1"
            >
              {isUploading ? 'Đang upload...' : 'Upload Video'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VideoUploadModal;
