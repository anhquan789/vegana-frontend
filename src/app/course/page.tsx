import CourseContent from '@/components/course/CourseContent';
import CourseFooter from '@/components/course/CourseFooter';
import CourseHeader from '@/components/course/CourseHeader';
import Playlist from '@/components/course/Playlist';
import VideoPlayer from '@/components/course/VideoPlayer';
import styles from './CoursePage.module.css';

const CoursePage = () => {
  return (
    <div className={styles.coursePage}>
      <CourseHeader />
      <div className={styles.mainLayout}>
        <div className={styles.contentArea}>
          <VideoPlayer />
          <CourseContent />
        </div>
        <Playlist />
      </div>
      <CourseFooter />
    </div>
  );
};

export default CoursePage;
