'use client';

import { useState } from 'react';
import styles from './StatisticsDashboard.module.css';

interface CourseStats {
  id: string;
  title: string;
  totalStudents: number;
  activeStudents: number;
  completionRate: number;
  avgScore: number;
  totalWatchTime: string;
}

interface LearningTrend {
  month: string;
  students: number;
  completions: number;
  watchTime: number;
}

const StatisticsDashboard = () => {
  const [timeRange, setTimeRange] = useState('7days');
  
  const [courseStats] = useState<CourseStats[]>([
    {
      id: '1',
      title: 'HTML, CSS Pro',
      totalStudents: 1250,
      activeStudents: 890,
      completionRate: 68,
      avgScore: 8.2,
      totalWatchTime: '2,450h'
    },
    {
      id: '2',
      title: 'JavaScript Pro',
      totalStudents: 980,
      activeStudents: 720,
      completionRate: 55,
      avgScore: 7.8,
      totalWatchTime: '1,890h'
    },
    {
      id: '3',
      title: 'Ngôn ngữ Sass',
      totalStudents: 450,
      activeStudents: 320,
      completionRate: 72,
      avgScore: 8.5,
      totalWatchTime: '890h'
    }
  ]);

  const [learningTrends] = useState<LearningTrend[]>([
    { month: 'T1', students: 150, completions: 89, watchTime: 450 },
    { month: 'T2', students: 180, completions: 105, watchTime: 520 },
    { month: 'T3', students: 220, completions: 140, watchTime: 680 },
    { month: 'T4', students: 195, completions: 125, watchTime: 590 },
    { month: 'T5', students: 240, completions: 160, watchTime: 750 },
    { month: 'T6', students: 280, completions: 195, watchTime: 890 },
  ]);

  const overallStats = {
    totalStudents: 2680,
    activeStudents: 1930,
    totalCourses: 3,
    completedCourses: 354,
    totalWatchTime: '5,230h',
    avgScore: 8.1
  };

  const getMaxValue = (data: LearningTrend[], key: keyof LearningTrend) => {
    return Math.max(...data.map(item => typeof item[key] === 'number' ? item[key] : 0));
  };

  return (
    <div className={styles.container}>
      {/* Overview Stats */}
      <div className={styles.overviewStats}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>👥</div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{overallStats.totalStudents.toLocaleString()}</div>
            <div className={styles.statLabel}>Tổng học viên</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🔥</div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{overallStats.activeStudents.toLocaleString()}</div>
            <div className={styles.statLabel}>Đang hoạt động</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>⏰</div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{overallStats.totalWatchTime}</div>
            <div className={styles.statLabel}>Tổng thời lượng</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🎯</div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{overallStats.avgScore.toFixed(1)}/10</div>
            <div className={styles.statLabel}>Điểm trung bình</div>
          </div>
        </div>
      </div>

      {/* Time Range Filter */}
      <div className={styles.controls}>
        <div className={styles.timeFilter}>
          <button 
            className={`${styles.timeBtn} ${timeRange === '7days' ? styles.active : ''}`}
            onClick={() => setTimeRange('7days')}
          >
            7 ngày
          </button>
          <button 
            className={`${styles.timeBtn} ${timeRange === '30days' ? styles.active : ''}`}
            onClick={() => setTimeRange('30days')}
          >
            30 ngày
          </button>
          <button 
            className={`${styles.timeBtn} ${timeRange === '6months' ? styles.active : ''}`}
            onClick={() => setTimeRange('6months')}
          >
            6 tháng
          </button>
        </div>
      </div>

      {/* Charts Section */}
      <div className={styles.chartsSection}>
        <div className={styles.chartCard}>
          <h3>Xu hướng học tập</h3>
          <div className={styles.chart}>
            <div className={styles.chartLegend}>
              <span className={styles.legendItem}>
                <span className={`${styles.legendDot} ${styles.students}`}></span>
                Số học viên mới
              </span>
              <span className={styles.legendItem}>
                <span className={`${styles.legendDot} ${styles.completions}`}></span>
                Khóa học hoàn thành
              </span>
            </div>
            <div className={styles.chartContainer}>
              {learningTrends.map((trend, index) => (
                <div key={index} className={styles.chartBar}>
                  <div className={styles.barGroup}>
                    <div 
                      className={`${styles.bar} ${styles.studentsBar}`}
                      style={{ height: `${(trend.students / getMaxValue(learningTrends, 'students')) * 100}%` }}
                    ></div>
                    <div 
                      className={`${styles.bar} ${styles.completionsBar}`}
                      style={{ height: `${(trend.completions / getMaxValue(learningTrends, 'completions')) * 100}%` }}
                    ></div>
                  </div>
                  <div className={styles.barLabel}>{trend.month}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.chartCard}>
          <h3>Thời lượng học (giờ)</h3>
          <div className={styles.chart}>
            <div className={styles.chartContainer}>
              {learningTrends.map((trend, index) => (
                <div key={index} className={styles.chartBar}>
                  <div className={styles.barGroup}>
                    <div 
                      className={`${styles.bar} ${styles.timeBar}`}
                      style={{ height: `${(trend.watchTime / getMaxValue(learningTrends, 'watchTime')) * 100}%` }}
                    ></div>
                  </div>
                  <div className={styles.barLabel}>{trend.month}</div>
                  <div className={styles.barValue}>{trend.watchTime}h</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Course Performance */}
      <div className={styles.coursePerformance}>
        <h3>Hiệu suất theo khóa học</h3>
        <div className={styles.courseCards}>
          {courseStats.map((course) => (
            <div key={course.id} className={styles.courseCard}>
              <h4 className={styles.courseTitle}>{course.title}</h4>
              <div className={styles.courseStats}>
                <div className={styles.courseStat}>
                  <span className={styles.statNumber}>{course.totalStudents.toLocaleString()}</span>
                  <span className={styles.statDesc}>Tổng học viên</span>
                </div>
                <div className={styles.courseStat}>
                  <span className={styles.statNumber}>{course.activeStudents.toLocaleString()}</span>
                  <span className={styles.statDesc}>Đang học</span>
                </div>
              </div>
              <div className={styles.progressSection}>
                <div className={styles.progressRow}>
                  <span>Tỷ lệ hoàn thành</span>
                  <span className={styles.progressValue}>{course.completionRate}%</span>
                </div>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill}
                    style={{ width: `${course.completionRate}%` }}
                  ></div>
                </div>
              </div>
              <div className={styles.courseMetrics}>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>Điểm TB</span>
                  <span className={styles.metricValue}>{course.avgScore.toFixed(1)}/10</span>
                </div>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>Thời lượng</span>
                  <span className={styles.metricValue}>{course.totalWatchTime}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatisticsDashboard;