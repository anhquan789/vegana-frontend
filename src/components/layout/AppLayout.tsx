import React from 'react';
import Sidebar from '../../app/home/Sidebar';
import styles from './AppLayout.module.css';

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className={styles['app-layout']}>
      <Sidebar />
      <main className={styles['app-main']}>{children}</main>
    </div>
  );
};

export default AppLayout;
