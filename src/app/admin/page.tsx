'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import LearnerManagement from '@/components/admin/LearnerManagement';
import NotificationSystem from '@/components/admin/NotificationSystem';
import StatisticsDashboard from '@/components/admin/StatisticsDashboard';
import VideoManagement from '@/components/admin/VideoManagement';
import CourseManagement from '@/components/course/CourseManagement';
import QuizManagement from '@/components/quiz/QuizManagement';
import { ROUTES } from '@/constants/app';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type TabType = 'courses' | 'videos' | 'quizzes' | 'learners' | 'notifications' | 'statistics';

const AdminPage = () => {
  const { isAuthenticated, userProfile, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('courses');

  // Check authentication and admin role
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push(ROUTES.LOGIN);
        return;
      }
      
      if (userProfile?.role !== 'admin') {
        router.push(ROUTES.UNAUTHORIZED);
        return;
      }
    }
  }, [isAuthenticated, userProfile, loading, router]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Don't render admin content until auth is verified
  if (!isAuthenticated || userProfile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang xác thực...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'courses':
        return <CourseManagement />;
      case 'videos':
        return <VideoManagement />;
      case 'quizzes':
        return <QuizManagement />;
      case 'learners':
        return <LearnerManagement />;
      case 'notifications':
        return <NotificationSystem />;
      case 'statistics':
        return <StatisticsDashboard />;
      default:
        return <CourseManagement />;
    }
  };

  return (
    <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </AdminLayout>
  );
};

export default AdminPage;