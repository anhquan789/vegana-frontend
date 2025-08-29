'use client';

import { useState } from 'react';
import styles from './LearnerManagement.module.css';

interface Learner {
  id: string;
  name: string;
  email: string;
  totalLearningTime: string;
  coursesEnrolled: number;
  coursesCompleted: number;
  lastActive: string;
  status: 'active' | 'inactive';
}

interface LearningProgress {
  courseTitle: string;
  progress: number;
  timeSpent: string;
  lastAccessed: string;
}

const LearnerManagement = () => {
  const [learners] = useState<Learner[]>([
    {
      id: '1',
      name: 'Nguyễn Văn An',
      email: 'an.nguyen@email.com',
      totalLearningTime: '45h 30m',
      coursesEnrolled: 3,
      coursesCompleted: 1,
      lastActive: '2024-01-15',
      status: 'active'
    },
    {
      id: '2', 
      name: 'Trần Thị Bình',
      email: 'binh.tran@email.com',
      totalLearningTime: '28h 15m',
      coursesEnrolled: 2,
      coursesCompleted: 0,
      lastActive: '2024-01-10',
      status: 'active'
    },
    {
      id: '3',
      name: 'Lê Minh Cường',
      email: 'cuong.le@email.com', 
      totalLearningTime: '12h 45m',
      coursesEnrolled: 1,
      coursesCompleted: 0,
      lastActive: '2023-12-20',
      status: 'inactive'
    }
  ]);

  const [selectedLearner, setSelectedLearner] = useState<Learner | null>(null);
  const [learnerProgress] = useState<Record<string, LearningProgress[]>>({
    '1': [
      {
        courseTitle: 'HTML, CSS Pro',
        progress: 100,
        timeSpent: '25h 15m',
        lastAccessed: '2024-01-15'
      },
      {
        courseTitle: 'JavaScript Pro',
        progress: 65,
        timeSpent: '20h 15m',
        lastAccessed: '2024-01-14'
      }
    ],
    '2': [
      {
        courseTitle: 'HTML, CSS Pro',
        progress: 45,
        timeSpent: '28h 15m',
        lastAccessed: '2024-01-10'
      }
    ],
    '3': [
      {
        courseTitle: 'JavaScript Pro',
        progress: 25,
        timeSpent: '12h 45m',
        lastAccessed: '2023-12-20'
      }
    ]
  });

  return (
    <div className={styles.container}>
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>127</div>
          <div className={styles.statLabel}>Tổng học viên</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>89</div>
          <div className={styles.statLabel}>Đang hoạt động</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>1,234h</div>
          <div className={styles.statLabel}>Tổng thời lượng học</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>45</div>
          <div className={styles.statLabel}>Hoàn thành khóa học</div>
        </div>
      </div>

      <div className={styles.actions}>
        <div className={styles.filters}>
          <input 
            type="text" 
            placeholder="Tìm kiếm học viên..." 
            className={styles.searchInput}
          />
          <select className={styles.select}>
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Không hoạt động</option>
          </select>
        </div>
      </div>

      <div className={styles.learnersTable}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Học viên</th>
              <th>Thời lượng học</th>
              <th>Khóa học</th>
              <th>Hoạt động cuối</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {learners.map((learner) => (
              <tr key={learner.id}>
                <td>
                  <div className={styles.learnerInfo}>
                    <div className={styles.avatar}>
                      {learner.name.charAt(0)}
                    </div>
                    <div>
                      <div className={styles.learnerName}>{learner.name}</div>
                      <div className={styles.learnerEmail}>{learner.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className={styles.timeInfo}>
                    <strong>{learner.totalLearningTime}</strong>
                  </div>
                </td>
                <td>
                  <div className={styles.courseInfo}>
                    <span>{learner.coursesEnrolled} đăng ký</span>
                    <span>{learner.coursesCompleted} hoàn thành</span>
                  </div>
                </td>
                <td>{new Date(learner.lastActive).toLocaleDateString('vi-VN')}</td>
                <td>
                  <span className={`${styles.status} ${styles[learner.status]}`}>
                    {learner.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                  </span>
                </td>
                <td>
                  <button 
                    className={styles.viewBtn}
                    onClick={() => setSelectedLearner(learner)}
                  >
                    👁️ Xem chi tiết
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedLearner && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Chi tiết học viên: {selectedLearner.name}</h3>
              <button 
                className={styles.closeBtn}
                onClick={() => setSelectedLearner(null)}
              >
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.learnerDetails}>
                <h4>Thông tin cơ bản</h4>
                <p><strong>Email:</strong> {selectedLearner.email}</p>
                <p><strong>Tổng thời lượng học:</strong> {selectedLearner.totalLearningTime}</p>
                <p><strong>Hoạt động cuối:</strong> {new Date(selectedLearner.lastActive).toLocaleDateString('vi-VN')}</p>
              </div>
              
              <div className={styles.progressSection}>
                <h4>Tiến độ học tập</h4>
                {learnerProgress[selectedLearner.id]?.map((progress, index) => (
                  <div key={index} className={styles.progressItem}>
                    <div className={styles.progressHeader}>
                      <span className={styles.courseTitle}>{progress.courseTitle}</span>
                      <span className={styles.progressPercent}>{progress.progress}%</span>
                    </div>
                    <div className={styles.progressBar}>
                      <div 
                        className={styles.progressFill}
                        style={{ width: `${progress.progress}%` }}
                      ></div>
                    </div>
                    <div className={styles.progressInfo}>
                      <span>Thời gian: {progress.timeSpent}</span>
                      <span>Truy cập cuối: {new Date(progress.lastAccessed).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearnerManagement;