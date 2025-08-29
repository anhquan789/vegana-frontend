'use client';

import styles from './AdminLayout.module.css';

type TabType = 'videos' | 'learners' | 'notifications' | 'statistics';

interface AdminLayoutProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  children: React.ReactNode;
}

const AdminLayout = ({ activeTab, onTabChange, children }: AdminLayoutProps) => {
  const tabs = [
    { id: 'videos' as TabType, label: 'Quản lý Video', icon: '🎬' },
    { id: 'learners' as TabType, label: 'Quản lý Học viên', icon: '👥' },
    { id: 'notifications' as TabType, label: 'Thông báo & Quiz', icon: '📢' },
    { id: 'statistics' as TabType, label: 'Thống kê', icon: '📊' },
  ];

  return (
    <div className={styles.adminLayout}>
      <div className={styles.sidebar}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            <span className={styles.logo}>🎓</span>
            Admin Panel
          </h1>
        </div>
        <nav className={styles.nav}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.navItem} ${activeTab === tab.id ? styles.active : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              <span className={styles.icon}>{tab.icon}</span>
              <span className={styles.label}>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
      <div className={styles.content}>
        <div className={styles.contentHeader}>
          <h2>{tabs.find(t => t.id === activeTab)?.label}</h2>
        </div>
        <div className={styles.contentBody}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;