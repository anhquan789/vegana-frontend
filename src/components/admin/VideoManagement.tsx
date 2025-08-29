'use client';

import { useState } from 'react';
import styles from './VideoManagement.module.css';

interface VideoLesson {
  id: string;
  title: string;
  duration: string;
  course: string;
  status: 'active' | 'inactive';
  views: number;
  completions: number;
}

const VideoManagement = () => {
  const [videos] = useState<VideoLesson[]>([
    {
      id: '1',
      title: 'Giới thiệu HTML',
      duration: '15:30',
      course: 'HTML, CSS Pro',
      status: 'active',
      views: 1250,
      completions: 980
    },
    {
      id: '2',
      title: 'CSS Flexbox',
      duration: '28:45',
      course: 'HTML, CSS Pro',
      status: 'active',
      views: 890,
      completions: 750
    },
    {
      id: '3',
      title: 'JavaScript Cơ bản',
      duration: '45:20',
      course: 'JavaScript Pro',
      status: 'inactive',
      views: 2100,
      completions: 1800
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className={styles.container}>
      <div className={styles.actions}>
        <button 
          className={styles.addBtn}
          onClick={() => setShowAddForm(true)}
        >
          ➕ Thêm video mới
        </button>
        <div className={styles.filters}>
          <select className={styles.select}>
            <option value="">Tất cả khóa học</option>
            <option value="html-css">HTML, CSS Pro</option>
            <option value="javascript">JavaScript Pro</option>
          </select>
          <select className={styles.select}>
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Không hoạt động</option>
          </select>
        </div>
      </div>

      {showAddForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Thêm video bài học mới</h3>
              <button 
                className={styles.closeBtn}
                onClick={() => setShowAddForm(false)}
              >
                ✕
              </button>
            </div>
            <form className={styles.form}>
              <div className={styles.formGroup}>
                <label>Tiêu đề bài học</label>
                <input type="text" className={styles.input} />
              </div>
              <div className={styles.formGroup}>
                <label>Khóa học</label>
                <select className={styles.input}>
                  <option value="">Chọn khóa học</option>
                  <option value="html-css">HTML, CSS Pro</option>
                  <option value="javascript">JavaScript Pro</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>URL Video</label>
                <input type="url" className={styles.input} />
              </div>
              <div className={styles.formGroup}>
                <label>Thời lượng</label>
                <input type="text" placeholder="VD: 15:30" className={styles.input} />
              </div>
              <div className={styles.formActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowAddForm(false)}>
                  Hủy
                </button>
                <button type="submit" className={styles.submitBtn}>
                  Thêm video
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className={styles.videoGrid}>
        {videos.map((video) => (
          <div key={video.id} className={styles.videoCard}>
            <div className={styles.videoHeader}>
              <h4 className={styles.videoTitle}>{video.title}</h4>
              <span className={`${styles.status} ${styles[video.status]}`}>
                {video.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
              </span>
            </div>
            <div className={styles.videoInfo}>
              <p className={styles.course}>📚 {video.course}</p>
              <p className={styles.duration}>⏱️ {video.duration}</p>
              <div className={styles.stats}>
                <span>👁️ {video.views.toLocaleString()} lượt xem</span>
                <span>✅ {video.completions.toLocaleString()} hoàn thành</span>
              </div>
            </div>
            <div className={styles.videoActions}>
              <button className={styles.editBtn}>✏️ Sửa</button>
              <button className={styles.deleteBtn}>🗑️ Xóa</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoManagement;