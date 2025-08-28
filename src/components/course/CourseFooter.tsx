import styles from './CourseFooter.module.css';

const CourseFooter = () => {
  return (
    <footer className={styles.footer}>
      <button className={styles.navButton}>{'<'} BÀI TRƯỚC</button>
      <button className={`${styles.navButton} ${styles.next}`}>BÀI TIẾP THEO {'>'}</button>
      <div className={styles.separator}></div>
      <div className={styles.nextLesson}>
        <span>1. IIFE, Scope, Closure</span> {'->'}
      </div>
    </footer>
  );
};

export default CourseFooter;
