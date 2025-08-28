import styles from './CourseContent.module.css';

const CourseContent = () => {
  return (
    <div className={styles.content}>
      <h2>IIFE là gì?</h2>
      <p className={styles.updated}>Cập nhật tháng 11 năm 2022</p>
      <button className={styles.addNote}>+ Thêm ghi chú tại 00:00</button>
      <p>Tham gia các cộng đồng để cùng học hỏi, chia sẻ và &quot;thám thính&quot; xem F8 sắp có gì mới nhé!</p>
      <ul>
        <li>Fanpage: <a href="https://www.facebook.com/f8vnofficial">https://www.facebook.com/f8vnofficial</a></li>
        <li>Group: <a href="https://www.facebook.com/groups/649972919142215">https://www.facebook.com/groups/649972919142215</a></li>
        <li>Youtube: <a href="https://www.youtube.com/F8VNOfficial">https://www.youtube.com/F8VNOfficial</a></li>
        <li>Sơn Đặng: <a href="https://www.facebook.com/sondn.f8">https://www.facebook.com/sondn.f8</a></li>
      </ul>
      <div className={styles.actions}>
        <button className={styles.askQuestion}>Hỏi đáp</button>
      </div>
    </div>
  );
};

export default CourseContent;
