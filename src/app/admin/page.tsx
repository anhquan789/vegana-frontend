'use client';

import { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import LearnerManagement from '../../components/admin/LearnerManagement';
import NotificationSystem from '../../components/admin/NotificationSystem';
import StatisticsDashboard from '../../components/admin/StatisticsDashboard';
import VideoManagement from '../../components/admin/VideoManagement';
import CourseManagement from '../../components/course/CourseManagement';
import QuizManagement from '../../components/quiz/QuizManagement';

type TabType = 'courses' | 'videos' | 'quizzes' | 'learners' | 'notifications' | 'statistics';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>('courses');

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