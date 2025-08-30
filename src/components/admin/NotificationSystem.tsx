'use client';

import { useState } from 'react';
import styles from './NotificationSystem.module.css';

interface Quiz {
  id: string;
  title: string;
  course: string;
  lesson: string;
  questions: number;
  avgScore: number;
  completions: number;
  status: 'active' | 'draft';
}

interface Notification {
  id: string;
  type: 'completion' | 'quiz_passed' | 'achievement';
  title: string;
  message: string;
  course: string;
  triggerCondition: string;
  sent: number;
  status: 'active' | 'paused';
}

const NotificationSystem = () => {
  const [activeTab, setActiveTab] = useState<'notifications' | 'quizzes'>('notifications');
  const [showAddForm, setShowAddForm] = useState(false);

  const [notifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'completion',
      title: 'Chúc mừng hoàn thành bài học!',
      message: 'Bạn đã hoàn thành bài học "Giới thiệu HTML". Hãy tiếp tục với bài tiếp theo!',
      course: 'HTML, CSS Pro',
      triggerCondition: 'Hoàn thành bài học',
      sent: 45,
      status: 'active'
    },
    {
      id: '2',
      type: 'quiz_passed',
      title: 'Xuất sắc! Bạn đã vượt qua quiz',
      message: 'Điểm số của bạn: {score}/10. Tiếp tục học tập để đạt kết quả tốt hơn!',
      course: 'JavaScript Pro',
      triggerCondition: 'Hoàn thành quiz với điểm >= 7',
      sent: 23,
      status: 'active'
    }
  ]);

  const [quizzes] = useState<Quiz[]>([
    {
      id: '1',
      title: 'Kiểm tra HTML cơ bản',
      course: 'HTML, CSS Pro',
      lesson: 'Giới thiệu HTML',
      questions: 10,
      avgScore: 8.5,
      completions: 156,
      status: 'active'
    },
    {
      id: '2',
      title: 'JavaScript Functions Quiz',
      course: 'JavaScript Pro',
      lesson: 'Functions và Scope',
      questions: 15,
      avgScore: 7.2,
      completions: 89,
      status: 'draft'
    }
  ]);

  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'notifications' ? styles.active : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          📢 Thông báo tự động
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'quizzes' ? styles.active : ''}`}
          onClick={() => setActiveTab('quizzes')}
        >
          📝 Quiz kiểm tra
        </button>
      </div>

      <div className={styles.actions}>
        <button 
          className={styles.addBtn}
          onClick={() => setShowAddForm(true)}
        >
          ➕ {activeTab === 'notifications' ? 'Thêm thông báo' : 'Tạo quiz mới'}
        </button>
      </div>

      {activeTab === 'notifications' && (
        <div className={styles.notificationsList}>
          {notifications.map((notification) => (
            <div key={notification.id} className={styles.notificationCard}>
              <div className={styles.cardHeader}>
                <div className={styles.notificationType}>
                  {notification.type === 'completion' && '🎯'}
                  {notification.type === 'quiz_passed' && '✅'}
                  {notification.type === 'achievement' && '🏆'}
                  <span className={styles.typeLabel}>
                    {notification.type === 'completion' && 'Hoàn thành bài học'}
                    {notification.type === 'quiz_passed' && 'Vượt qua quiz'}
                    {notification.type === 'achievement' && 'Thành tích'}
                  </span>
                </div>
                <span className={`${styles.status} ${styles[notification.status]}`}>
                  {notification.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
                </span>
              </div>
              <h4 className={styles.notificationTitle}>{notification.title}</h4>
              <p className={styles.notificationMessage}>{notification.message}</p>
              <div className={styles.cardMeta}>
                <span>📚 {notification.course}</span>
                <span>🎯 {notification.triggerCondition}</span>
                <span>📤 Đã gửi: {notification.sent} lần</span>
              </div>
              <div className={styles.cardActions}>
                <button className={styles.editBtn}>✏️ Sửa</button>
                <button className={styles.toggleBtn}>
                  {notification.status === 'active' ? '⏸️ Tạm dừng' : '▶️ Kích hoạt'}
                </button>
                <button className={styles.deleteBtn}>🗑️ Xóa</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'quizzes' && (
        <div className={styles.quizzesList}>
          {quizzes.map((quiz) => (
            <div key={quiz.id} className={styles.quizCard}>
              <div className={styles.cardHeader}>
                <h4 className={styles.quizTitle}>{quiz.title}</h4>
                <span className={`${styles.status} ${styles[quiz.status]}`}>
                  {quiz.status === 'active' ? 'Đang hoạt động' : 'Nháp'}
                </span>
              </div>
              <div className={styles.quizInfo}>
                <p>📚 Khóa học: {quiz.course}</p>
                <p>📖 Bài học: {quiz.lesson}</p>
                <p>❓ Số câu hỏi: {quiz.questions}</p>
              </div>
              <div className={styles.quizStats}>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>{quiz.avgScore.toFixed(1)}/10</span>
                  <span className={styles.statLabel}>Điểm TB</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>{quiz.completions}</span>
                  <span className={styles.statLabel}>Lượt làm</span>
                </div>
              </div>
              <div className={styles.cardActions}>
                <button className={styles.editBtn}>✏️ Chỉnh sửa</button>
                <button className={styles.viewBtn}>👁️ Xem kết quả</button>
                <button className={styles.deleteBtn}>🗑️ Xóa</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>
                {activeTab === 'notifications' ? 'Tạo thông báo tự động' : 'Tạo quiz kiểm tra'}
              </h3>
              <button 
                className={styles.closeBtn}
                onClick={() => setShowAddForm(false)}
              >
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              {activeTab === 'notifications' ? (
                <form className={styles.form}>
                  <div className={styles.formGroup}>
                    <label>Loại thông báo</label>
                    <select className={styles.input}>
                      <option value="">Chọn loại thông báo</option>
                      <option value="completion">Hoàn thành bài học</option>
                      <option value="quiz_passed">Vượt qua quiz</option>
                      <option value="achievement">Thành tích</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Tiêu đề thông báo</label>
                    <input type="text" className={styles.input} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Nội dung thông báo</label>
                    <textarea rows={4} className={styles.input}></textarea>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Khóa học áp dụng</label>
                    <select className={styles.input}>
                      <option value="">Chọn khóa học</option>
                      <option value="html-css">HTML, CSS Pro</option>
                      <option value="javascript">JavaScript Pro</option>
                    </select>
                  </div>
                  <div className={styles.formActions}>
                    <button type="button" className={styles.cancelBtn} onClick={() => setShowAddForm(false)}>
                      Hủy
                    </button>
                    <button type="submit" className={styles.submitBtn}>
                      Tạo thông báo
                    </button>
                  </div>
                </form>
              ) : (
                <form className={styles.form}>
                  <div className={styles.formGroup}>
                    <label>Tiêu đề quiz</label>
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
                    <label>Bài học</label>
                    <select className={styles.input}>
                      <option value="">Chọn bài học</option>
                      <option value="lesson1">Giới thiệu HTML</option>
                      <option value="lesson2">CSS Flexbox</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Số câu hỏi</label>
                    <input type="number" min="1" max="50" className={styles.input} />
                  </div>
                  <div className={styles.formActions}>
                    <button type="button" className={styles.cancelBtn} onClick={() => setShowAddForm(false)}>
                      Hủy
                    </button>
                    <button type="submit" className={styles.submitBtn}>
                      Tạo quiz
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationSystem;