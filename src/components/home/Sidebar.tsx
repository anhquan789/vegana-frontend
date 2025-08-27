
import styles from './Sidebar.module.css';

const Sidebar = () => {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <span className={styles['logo-icon']}>F8</span>
        <span className={styles['logo-text']}>Học Lập Trình Để Đi Làm</span>
      </div>
      <nav className={styles['sidebar-nav']}>
        <ul>
          <li className={styles.active}><span>Trang chủ</span></li>
          <li><span>Lộ trình</span></li>
          <li><span>Bài viết</span></li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
