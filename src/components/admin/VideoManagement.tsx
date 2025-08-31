'use client';

import { Button } from '@/components/ui/Button';
import {
  VideoFile,
  deleteVideoFromStorage,
  formatFileSize,
  getVideosFromStorage,
  initializeVideosCollection,
  updateVideoInStorage
} from '@/utils/videoUtils';
import Image from 'next/image';
import { useEffect, useState } from 'react';
// import StorageDebugger from './StorageDebugger'; // Disabled for Firebase
import styles from './VideoManagement.module.css';
import VideoPlayer from './VideoPlayer';
import VideoUploadModal from './VideoUploadModal';

const VideoManagement = () => {
  const [videos, setVideos] = useState<VideoFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [playingVideo, setPlayingVideo] = useState<VideoFile | null>(null);
  const [filterCourse, setFilterCourse] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Load videos from Firestore on component mount
  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      console.log('🔄 Starting to load videos...');
      setLoading(true);
      
      // Initialize collection first
      await initializeVideosCollection();
      
      const videoList = await getVideosFromStorage();
      console.log('📋 Videos loaded from Firestore:', videoList.length, videoList);
      setVideos(videoList);
    } catch (error) {
      console.error('❌ Error loading videos:', error);
    } finally {
      setLoading(false);
      console.log('✅ Loading completed');
    }
  };

  const handleVideoUpload = (newVideo: VideoFile) => {
    // Video is already saved to Firestore in the upload modal
    setVideos(prev => [newVideo, ...prev]);
    setShowUploadModal(false);
  };

  const handleDeleteVideo = async (videoId: string) => {
    const video = videos.find(v => v.id === videoId);
    if (!video) return;
    
    if (confirm('Bạn có chắc muốn xóa video này?')) {
      try {
        await deleteVideoFromStorage(videoId, video.videoUrl);
        setVideos(prev => prev.filter(v => v.id !== videoId));
      } catch (error) {
        console.error('❌ Error deleting video:', error);
        alert('Không thể xóa video. Vui lòng thử lại.');
      }
    }
  };

  const handleStatusToggle = async (videoId: string) => {
    const video = videos.find(v => v.id === videoId);
    if (video) {
      const newStatus = video.status === 'active' ? 'inactive' : 'active';
      try {
        await updateVideoInStorage(videoId, { status: newStatus });
        setVideos(prev => prev.map(v => 
          v.id === videoId ? { ...v, status: newStatus } : v
        ));
      } catch (error) {
        console.error('❌ Error updating video status:', error);
        alert('Không thể cập nhật trạng thái video.');
      }
    }
  };

  // Filter videos based on search and filters
  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = !filterCourse || video.course === filterCourse;
    const matchesStatus = !filterStatus || video.status === filterStatus;
    
    return matchesSearch && matchesCourse && matchesStatus;
  });

  const totalSize = videos.reduce((sum, video) => sum + video.fileSize, 0);
  const activeVideos = videos.filter(v => v.status === 'active').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Storage Debugger - Disabled for Firebase */}
      {/* <StorageDebugger /> */}
      
      {/* Header với thống kê */}
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">{videos.length}</div>
            <div className="text-sm text-gray-600">Tổng videos</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">{activeVideos}</div>
            <div className="text-sm text-gray-600">Đang hoạt động</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-orange-600">{formatFileSize(totalSize)}</div>
            <div className="text-sm text-gray-600">Tổng dung lượng</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-purple-600">
              {videos.reduce((sum, v) => sum + v.views, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Tổng lượt xem</div>
          </div>
        </div>
      </div>

      {/* Actions và Filters */}
      <div className={styles.actions}>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowUploadModal(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            📹 Upload Video Mới
          </Button>
        </div>
        
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Tìm kiếm video..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select 
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            className={styles.select}
          >
            <option value="">Tất cả khóa học</option>
            <option value="html-css">HTML, CSS Pro</option>
            <option value="javascript">JavaScript Pro</option>
            <option value="react">React Pro</option>
            <option value="nodejs">Node.js Pro</option>
          </select>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={styles.select}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Không hoạt động</option>
            <option value="processing">Đang xử lý</option>
          </select>
        </div>
      </div>

      {/* Upload Modal */}
      <VideoUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleVideoUpload}
      />

      {/* Video Player Modal */}
      {playingVideo && (
        <VideoPlayer
          video={playingVideo}
          isOpen={!!playingVideo}
          onClose={() => setPlayingVideo(null)}
        />
      )}

      {/* Videos Grid */}
      <div className={styles.videoGrid}>
        {filteredVideos.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
            <div className="text-6xl mb-4">🎥</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {videos.length === 0 ? 'Chưa có video nào' : 'Không tìm thấy video'}
            </h3>
            <p className="text-gray-600 mb-4">
              {videos.length === 0 
                ? 'Hãy upload video đầu tiên để bắt đầu!' 
                : 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.'
              }
            </p>
            {videos.length === 0 && (
              <Button 
                onClick={() => setShowUploadModal(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                📹 Upload Video Đầu Tiên
              </Button>
            )}
          </div>
        ) : (
          filteredVideos.map((video) => (
            <div key={video.id} className={styles.videoCard}>
              {/* Thumbnail */}
              <div className="relative mb-3">
                {video.thumbnailUrl ? (
                  <Image 
                    src={video.thumbnailUrl}
                    alt={video.title}
                    width={300}
                    height={128}
                    className="w-full h-32 object-cover rounded"
                  />
                ) : (
                  <div className="w-full h-32 bg-gray-200 rounded flex items-center justify-center">
                    <span className="text-4xl">🎥</span>
                  </div>
                )}
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                  {video.duration}
                </div>
              </div>

              {/* Video Header */}
              <div className={styles.videoHeader}>
                <h4 className={styles.videoTitle} title={video.title}>
                  {video.title}
                </h4>
                <span 
                  className={`${styles.status} ${styles[video.status]} cursor-pointer`}
                  onClick={() => handleStatusToggle(video.id)}
                  title="Click để thay đổi trạng thái"
                >
                  {video.status === 'active' ? '🟢 Hoạt động' : 
                   video.status === 'inactive' ? '🔴 Tạm dừng' : 
                   '🟡 Xử lý'}
                </span>
              </div>

              {/* Video Info */}
              <div className={styles.videoInfo}>
                <p className={styles.course}>📚 {video.course}</p>
                <p className="text-sm text-gray-500 mb-2">
                  📁 {video.fileName} ({formatFileSize(video.fileSize)})
                </p>
                {video.description && (
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {video.description}
                  </p>
                )}
                <div className={styles.stats}>
                  <span>👁️ {video.views.toLocaleString()}</span>
                  <span>✅ {video.completions.toLocaleString()}</span>
                </div>
                {video.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {video.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  📅 {new Date(video.uploadDate).toLocaleDateString('vi-VN')}
                </p>
              </div>

              {/* Video Actions */}
              <div className={styles.videoActions}>
                <button 
                  className={styles.editBtn}
                  onClick={() => console.log('Edit video:', video.id)}
                  title="Chỉnh sửa video"
                >
                  ✏️ Sửa
                </button>
                <button 
                  className={styles.deleteBtn}
                  onClick={() => handleDeleteVideo(video.id)}
                  title="Xóa video"
                >
                  🗑️ Xóa
                </button>
                {video.videoUrl && (
                  <button 
                    className="text-blue-600 hover:text-blue-800 text-sm"
                    onClick={() => setPlayingVideo(video)}
                    title="Xem video"
                  >
                    ▶️ Xem
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VideoManagement;