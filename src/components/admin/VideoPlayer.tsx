'use client';

import { VideoFile } from '@/utils/videoUtils';
import { useEffect, useRef, useState } from 'react';

interface VideoPlayerProps {
  video: VideoFile;
  isOpen: boolean;
  onClose: () => void;
  onProgress?: (currentTime: number, duration: number) => void;
}

const VideoPlayer = ({ video, isOpen, onClose, onProgress }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  // Use Firebase Storage URL directly
  const videoSrc = video.videoUrl;

  useEffect(() => {
    console.log('🎥 Loading video from Firebase:', { 
      videoId: video.id, 
      title: video.title, 
      firebaseUrl: videoSrc
    });
  }, [video.id, video.title, videoSrc]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleTimeUpdate = () => {
      setCurrentTime(videoElement.currentTime);
      if (onProgress) {
        onProgress(videoElement.currentTime, videoElement.duration);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(videoElement.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoElement.addEventListener('ended', handleEnded);

    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.removeEventListener('ended', handleEnded);
    };
  }, [onProgress]);

  const togglePlayPause = () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (isPlaying) {
      videoElement.pause();
    } else {
      videoElement.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const newTime = parseFloat(e.target.value);
    videoElement.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const newVolume = parseFloat(e.target.value);
    videoElement.volume = newVolume;
    setVolume(newVolume);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="relative w-full max-w-4xl mx-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 text-2xl z-10"
        >
          ✕
        </button>

        {/* Video Title */}
        <div className="mb-4 text-white">
          <h2 className="text-2xl font-bold">{video.title}</h2>
          {video.description && (
            <p className="text-gray-300 mt-2">{video.description}</p>
          )}
        </div>

        {/* Video Player */}
        <div className="relative bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-auto max-h-[70vh]"
            poster={video.thumbnailUrl}
            src={videoSrc}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />

          {/* Custom Controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
            {/* Progress Bar */}
            <div className="mb-4">
              <input
                type="range"
                min="0"
                max={duration}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentTime / duration) * 100}%, #4b5563 ${(currentTime / duration) * 100}%, #4b5563 100%)`
                }}
              />
              <div className="flex justify-between text-white text-sm mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Play/Pause Button */}
                <button
                  onClick={togglePlayPause}
                  className="text-white hover:text-blue-400 text-3xl"
                >
                  {isPlaying ? '⏸️' : '▶️'}
                </button>

                {/* Volume Control */}
                <div className="flex items-center space-x-2">
                  <span className="text-white text-xl">
                    {volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Current Time */}
                <span className="text-white text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                {/* Video Info */}
                <div className="text-white text-sm">
                  <span className="bg-black bg-opacity-50 px-2 py-1 rounded">
                    📚 {video.course}
                  </span>
                </div>

                {/* Fullscreen Button */}
                <button
                  onClick={() => {
                    if (videoRef.current) {
                      if (videoRef.current.requestFullscreen) {
                        videoRef.current.requestFullscreen();
                      }
                    }
                  }}
                  className="text-white hover:text-blue-400 text-xl"
                >
                  ⛶
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Video Stats */}
        <div className="mt-4 text-white text-sm">
          <div className="flex justify-between">
            <span>👁️ {video.views.toLocaleString()} lượt xem</span>
            <span>✅ {video.completions.toLocaleString()} hoàn thành</span>
            <span>📁 {video.fileName}</span>
            <span>📅 {new Date(video.uploadDate).toLocaleDateString('vi-VN')}</span>
          </div>
          {video.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {video.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="bg-blue-600 text-white text-xs px-2 py-1 rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
