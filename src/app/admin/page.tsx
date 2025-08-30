'use client';

import AdminLayout from '../../components/admin/AdminLayout';
import VideoManagement from '../../components/admin/VideoManagement';
import LearnerManagement from '../../components/admin/LearnerManagement';
import NotificationSystem from '../../components/admin/NotificationSystem';
import StatisticsDashboard from '../../components/admin/StatisticsDashboard';
import { useState } from 'react';

type TabType = 'videos' | 'learners' | 'notifications' | 'statistics';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>('videos');

  const renderContent = () => {
    switch (activeTab) {
      case 'videos':
        return <VideoManagement />;
      case 'learners':
        return <LearnerManagement />;
      case 'notifications':
        return <NotificationSystem />;
      case 'statistics':
        return <StatisticsDashboard />;
      default:
        return <VideoManagement />;
    }
  };

  return (
    <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </AdminLayout>
  );
};

export default AdminPage;