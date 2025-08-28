import styles from './CourseHeader.module.css';

const CourseHeader = () => {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <span className={styles.backIcon}>{'<'}</span>
        <span className={styles.logo}>F8</span>
        <span className={styles.courseTitle}>Lập Trình JavaScript Nâng Cao</span>
      </div>
      <div className={styles.right}>
        <span className={styles.progress}>3% | 1/29 bài học</span>
        <button className={styles.btn}>Ghi chú</button>
        <button className={styles.btn}>Hướng dẫn</button>
      </div>
    </header>
  );
};

export default CourseHeader;
