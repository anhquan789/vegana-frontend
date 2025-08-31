'use client';

import ProtectedRoute from '@/components/common/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function DashboardPage() {
  const { userProfile } = useAuth();

  const getWelcomeMessage = () => {
    if (!userProfile) return 'Chào mừng bạn!';
    
    const timeOfDay = new Date().getHours();
    let greeting = 'Chào';
    
    if (timeOfDay < 12) {
      greeting = 'Chào buổi sáng';
    } else if (timeOfDay < 18) {
      greeting = 'Chào buổi chiều';
    } else {
      greeting = 'Chào buổi tối';
    }

    return `${greeting}, ${userProfile.displayName}!`;
  };

  const getRecommendedActions = () => {
    if (!userProfile) return [];

    const actions = [];

    switch (userProfile.role) {
      case 'admin':
        actions.push(
          { label: 'Quản lý hệ thống', href: '/admin', icon: '⚙️' },
          { label: 'Xem khóa học', href: '/course', icon: '📚' }
        );
        break;
      case 'instructor':
        actions.push(
          { label: 'Quản lý khóa học', href: '/my-courses', icon: '📖' },
          { label: 'Thống kê học viên', href: '/students', icon: '👥' },
          { label: 'Tạo nội dung mới', href: '/create', icon: '➕' }
        );
        break;
      case 'student':
        actions.push(
          { label: 'Khám phá khóa học', href: '/course', icon: '🔍' },
          { label: 'Khóa học của tôi', href: '/my-courses', icon: '📚' },
          { label: 'Lịch sử học tập', href: '/progress', icon: '📊' }
        );
        break;
    }

    actions.push({ label: 'Cập nhật hồ sơ', href: '/profile', icon: '👤' });

    return actions;
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">
                {getWelcomeMessage()}
              </h1>
              <p className="text-xl text-green-100 mb-6">
                {userProfile?.role === 'admin' && 'Quản lý và điều hành hệ thống'}
                {userProfile?.role === 'instructor' && 'Chia sẻ kiến thức và đào tạo học viên'}
                {userProfile?.role === 'student' && 'Tiếp tục hành trình học tập của bạn'}
              </p>
              <div className="flex justify-center space-x-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-200 text-green-800">
                  {userProfile?.role === 'admin' && '👨‍💼 Quản trị viên'}
                  {userProfile?.role === 'instructor' && '👨‍🏫 Giảng viên'}
                  {userProfile?.role === 'student' && '👨‍🎓 Học viên'}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-200 text-green-800">
                  📧 {userProfile?.email}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Hành động nhanh</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getRecommendedActions().map((action, index) => (
                <Link
                  key={index}
                  href={action.href}
                  className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{action.icon}</span>
                    <span className="text-lg font-medium text-gray-900 group-hover:text-green-600">
                      {action.label}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Hoạt động gần đây</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Đăng nhập lần cuối: {new Date(userProfile?.lastLoginAt || new Date()).toLocaleString('vi-VN')}</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>Tài khoản được tạo: {new Date(userProfile?.createdAt || new Date()).toLocaleString('vi-VN')}</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                <span>Trạng thái: {userProfile?.isActive ? 'Hoạt động' : 'Không hoạt động'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}