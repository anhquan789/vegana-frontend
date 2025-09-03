'use client';

import { useAuth } from '@/contexts/AuthContext';
import {
    EnrolledCourseWithProgress,
    getStudentDashboardData,
    LearningStats,
    RecentActivity
} from '@/lib/dashboard/dashboardService';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const StudentDashboard = () => {
  const { userProfile } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourseWithProgress[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [stats, setStats] = useState<LearningStats>({
    totalCoursesEnrolled: 0,
    totalCoursesCompleted: 0,
    totalLessonsCompleted: 0,
    totalHoursLearned: 0,
    currentStreak: 0,
    totalCertificates: 0
  });
  const [loading, setLoading] = useState(true);

  // Load real data from Firebase
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!userProfile?.uid) return;

      try {
        console.log('📊 Loading dashboard for user:', userProfile.uid);
        const dashboardData = await getStudentDashboardData(userProfile.uid);
        
        setEnrolledCourses(dashboardData.enrolledCourses);
        setRecentActivities(dashboardData.recentActivities);
        setStats(dashboardData.stats);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Fallback to empty data
        setEnrolledCourses([]);
        setRecentActivities([]);
        setStats({
          totalCoursesEnrolled: 0,
          totalCoursesCompleted: 0,
          totalLessonsCompleted: 0,
          totalHoursLearned: 0,
          currentStreak: 0,
          totalCertificates: 0
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [userProfile?.uid]);

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'lesson_completed':
        return '📚';
      case 'quiz_passed':
        return '✅';
      case 'course_enrolled':
        return '🎯';
      case 'certificate_earned':
        return '🏆';
      default:
        return '📖';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Học tập</h1>
          <p className="text-gray-600 mt-2">Theo dõi tiến trình học tập của bạn</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <span className="text-2xl">📚</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Khóa học đang học</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCoursesEnrolled}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Khóa học hoàn thành</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCoursesCompleted}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <span className="text-2xl">📖</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Bài học hoàn thành</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalLessonsCompleted}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <span className="text-2xl">⏰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Giờ học</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalHoursLearned}h</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <span className="text-2xl">🔥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Streak hiện tại</p>
                <p className="text-2xl font-bold text-gray-900">{stats.currentStreak} ngày</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <span className="text-2xl">🏆</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Chứng chỉ</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCertificates}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Enrolled Courses */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Khóa học đang học</h2>
              </div>
              <div className="p-6">
                {enrolledCourses.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Bạn chưa đăng ký khóa học nào</p>
                    <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                      Khám phá khóa học
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {enrolledCourses.map((course) => (
                      <div key={course.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start space-x-4">
                          <div className="w-20 h-16 bg-gray-200 rounded-md flex-shrink-0 relative overflow-hidden">
                            {course.thumbnail ? (
                              <Image 
                                src={course.thumbnail} 
                                alt={course.title}
                                fill
                                className="object-cover rounded-md"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-300 rounded-md flex items-center justify-center">
                                <span className="text-gray-500 text-xs">No image</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-medium text-gray-900 mb-1">
                              {course.title}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              Giảng viên: {course.instructor} • {course.category}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>{course.completedLessons}/{course.totalLessons} bài học</span>
                              <span>Lần cuối: {formatDate(course.lastAccessed)}</span>
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-gray-600">Tiến độ</span>
                                <span className="text-gray-900 font-medium">{course.progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${course.progress}%` }}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <Link 
                              href={`/courses/${course.id}`}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                            >
                              Tiếp tục học
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Hoạt động gần đây</h2>
              </div>
              <div className="p-6">
                {recentActivities.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Chưa có hoạt động nào
                  </p>
                ) : (
                  <div className="space-y-4">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-lg">{getActivityIcon(activity.type)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {activity.title}
                          </p>
                          <p className="text-sm text-gray-600">
                            {activity.courseTitle}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(activity.timestamp)}
                          </p>
                          {activity.description && (
                            <p className="text-xs text-gray-500 mt-1">
                              {activity.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow mt-6">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Thao tác nhanh</h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center">
                      <span className="text-lg mr-3">🔍</span>
                      <span className="text-sm font-medium">Khám phá khóa học mới</span>
                    </div>
                  </button>
                  
                  <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center">
                      <span className="text-lg mr-3">📝</span>
                      <span className="text-sm font-medium">Xem kết quả quiz</span>
                    </div>
                  </button>
                  
                  <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center">
                      <span className="text-lg mr-3">🏆</span>
                      <span className="text-sm font-medium">Chứng chỉ của tôi</span>
                    </div>
                  </button>
                  
                  <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center">
                      <span className="text-lg mr-3">📊</span>
                      <span className="text-sm font-medium">Báo cáo tiến độ</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
