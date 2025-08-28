import styles from './Header.module.css';

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles['search-bar']}>
        <input type="text" placeholder="Tìm kiếm khóa học, bài viết, video, ..." />
      </div>
      <div className={styles['header-actions']}>
        <span>Khóa học của tôi</span>
        <span className={styles['icon-bell']} />
        <span className={styles['icon-user']} />
      </div>
    </header>
  );
};

export default Header;
