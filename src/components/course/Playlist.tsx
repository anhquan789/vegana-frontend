import styles from './Playlist.module.css';

const playlistData = [
  {
    title: '1. IIFE, Scope, Closure',
    duration: '01:46:19',
    lessons: [
      { title: '1. Giới thiệu', duration: '01:48', done: true },
      { title: '2. IIFE là gì?', duration: '23:57', active: true },
      { title: '3. Ôn tập về IIFE #1', duration: '00:35', locked: true },
      // ... more lessons
    ]
  },
  {
    title: '2. Hoisting, Strict Mode, Data Types',
    duration: '01:11:58',
    lessons: []
  }
];

const Playlist = () => {
  return (
    <aside className={styles.playlist}>
      <h3>Nội dung khóa học</h3>
      {playlistData.map((section, index) => (
        <div key={index} className={styles.section}>
          <div className={styles.sectionHeader}>
            <span>{section.title}</span>
            <span className={styles.sectionDuration}>{section.duration}</span>
          </div>
          <ul className={styles.lessonList}>
            {section.lessons.map((lesson, lessonIndex) => (
              <li key={lessonIndex} className={`${styles.lessonItem} ${lesson.active ? styles.active : ''}`}>
                <span className={styles.lessonTitle}>{lesson.title}</span>
                <span className={styles.lessonDuration}>{lesson.duration}</span>
                {lesson.done && <span className={styles.doneIcon}>✓</span>}
                {lesson.locked && <span className={styles.lockIcon}>🔒</span>}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </aside>
  );
};

export default Playlist;
