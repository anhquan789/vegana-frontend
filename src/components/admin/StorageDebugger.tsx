'use client';

import { clearAllVideoData, debugLocalStorage } from '@/utils/videoUtils';
import { useState } from 'react';

interface DebugInfo {
  totalVideos: number;
  videos: Array<{
    id: string;
    title: string;
    fileSize: string;
    hasVideoData: boolean;
    storageKey: string;
    videoUrl?: string;
  }>;
  localStorage: {
    totalKeys: number;
    veganaKeys: string[];
    videoKeys: string[];
    totalSize: number;
  };
}

const StorageDebugger = () => {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const checkStorage = () => {
    const info = debugLocalStorage();
    setDebugInfo(info);
  };

  const clearStorage = () => {
    if (confirm('⚠️ Xóa tất cả video data? Hành động này không thể hoàn tác!')) {
      const deletedCount = clearAllVideoData();
      alert(`✅ Đã xóa ${deletedCount} items từ localStorage`);
      setDebugInfo(null);
      window.location.reload();
    }
  };

  const copyToClipboard = () => {
    if (debugInfo) {
      navigator.clipboard.writeText(JSON.stringify(debugInfo, null, 2));
      alert('📋 Đã copy debug info vào clipboard!');
    }
  };

  return (
    <div className="bg-gray-800 text-white rounded-lg mb-6 overflow-hidden">
      <div className="p-4 bg-gray-900 flex justify-between items-center">
        <h3 className="text-lg font-semibold">🔧 Storage Debugger</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-400 hover:text-white"
        >
          {isExpanded ? '🔽' : '▶️'}
        </button>
      </div>
      
      {isExpanded && (
        <div className="p-4">
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={checkStorage}
              className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm"
            >
              🔍 Kiểm tra Storage
            </button>
            
            <button
              onClick={clearStorage}
              className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded text-sm"
            >
              🗑️ Xóa All Data
            </button>

            {debugInfo && (
              <button
                onClick={copyToClipboard}
                className="bg-green-600 hover:bg-green-700 px-3 py-2 rounded text-sm"
              >
                📋 Copy Debug Info
              </button>
            )}

            <button
              onClick={() => {
                console.log('localStorage keys:', Object.keys(localStorage));
                console.log('localStorage size:', JSON.stringify(localStorage).length, 'bytes');
              }}
              className="bg-yellow-600 hover:bg-yellow-700 px-3 py-2 rounded text-sm"
            >
              📊 Console Log
            </button>
          </div>

          {debugInfo && (
            <div className="bg-gray-900 p-3 rounded">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-800 p-3 rounded">
                  <h4 className="font-semibold text-blue-400 mb-2">📊 Tổng quan</h4>
                  <div className="text-sm space-y-1">
                    <div>📹 Videos: <span className="text-yellow-400">{debugInfo.totalVideos}</span></div>
                    <div>🔑 Total Keys: <span className="text-yellow-400">{debugInfo.localStorage.totalKeys}</span></div>
                    <div>🏷️ Vegana Keys: <span className="text-yellow-400">{debugInfo.localStorage.veganaKeys.length}</span></div>
                    <div>🎥 Video Keys: <span className="text-yellow-400">{debugInfo.localStorage.videoKeys.length}</span></div>
                    <div>💾 Storage Size: <span className="text-yellow-400">{(debugInfo.localStorage.totalSize / 1024 / 1024).toFixed(2)} MB</span></div>
                  </div>
                </div>

                <div className="bg-gray-800 p-3 rounded">
                  <h4 className="font-semibold text-green-400 mb-2">🔑 Keys trong localStorage</h4>
                  <div className="text-xs max-h-32 overflow-y-auto">
                    {debugInfo.localStorage.veganaKeys.map((key: string, index: number) => (
                      <div key={index} className="py-1 border-b border-gray-700">
                        {key}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 p-3 rounded">
                <h4 className="font-semibold text-purple-400 mb-2">🎬 Chi tiết Videos</h4>
                {debugInfo.videos.length === 0 ? (
                  <div className="text-gray-500 text-center py-4">
                    Chưa có video nào được lưu
                  </div>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {debugInfo.videos.map((video, index: number) => (
                      <div key={index} className="bg-gray-900 p-2 rounded text-sm">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium text-white">{video.title}</div>
                            <div className="text-gray-400">ID: {video.id}</div>
                            <div className="text-gray-400">Size: {video.fileSize}</div>
                          </div>
                          <div className="text-right">
                            <div className={`px-2 py-1 rounded text-xs ${
                              video.hasVideoData 
                                ? 'bg-green-600 text-white' 
                                : 'bg-red-600 text-white'
                            }`}>
                              {video.hasVideoData ? '✅ Có data' : '❌ Không có data'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-3 p-2 bg-gray-900 rounded">
                <details>
                  <summary className="cursor-pointer text-sm text-gray-400 hover:text-white">
                    🔍 Raw Debug Data (click to expand)
                  </summary>
                  <pre className="text-xs mt-2 p-2 bg-black rounded overflow-x-auto">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StorageDebugger;
