'use client';

import VideoManagement from '@/components/admin/VideoManagement';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminVideoPage() {
  const { userProfile } = useAuth();

  // Simple role check
  if (!userProfile || userProfile.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Không có quyền truy cập
          </h1>
          <p className="text-gray-600">
            Bạn cần có quyền admin để truy cập trang này.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Quản lý Video
                </h1>
                <p className="mt-2 text-gray-600">
                  Upload và quản lý video bài học cho các khóa học
                </p>
              </div>
              <div className="text-sm text-gray-500">
                Xin chào, {userProfile?.displayName || 'Admin'} 👋
              </div>
            </div>
          </div>
          
          <VideoManagement />
        </div>
      </div>
    </div>
  );
}
