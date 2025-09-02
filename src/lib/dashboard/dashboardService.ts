import { getAllCourses, getStudentEnrollments } from '@/utils/course/courseUtils';

export interface DashboardData {
  enrolledCourses: EnrolledCourseWithProgress[];
  recentActivities: RecentActivity[];
  stats: LearningStats;
}

export interface EnrolledCourseWithProgress {
  id: string;
  title: string;
  thumbnail: string;
  instructor: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  lastAccessed: string;
  category: string;
  price: number;
  level: string;
}

export interface RecentActivity {
  id: string;
  type: 'lesson_completed' | 'quiz_passed' | 'course_enrolled' | 'certificate_earned';
  title: string;
  courseTitle: string;
  timestamp: string;
  description: string;
}

export interface LearningStats {
  totalCoursesEnrolled: number;
  totalCoursesCompleted: number;
  totalLessonsCompleted: number;
  totalHoursLearned: number;
  currentStreak: number;
  totalCertificates: number;
}

/**
 * Get dashboard data for a student
 */
export const getStudentDashboardData = async (studentId: string): Promise<DashboardData> => {
  try {
    console.log('📊 Loading dashboard data for student:', studentId);

    // Get student enrollments
    const enrollments = await getStudentEnrollments(studentId);
    console.log('📚 Found enrollments:', enrollments.length);

    // Get enrolled courses with progress
    const enrolledCourses: EnrolledCourseWithProgress[] = [];
    let totalCompletedLessons = 0;
    let totalCompletedCourses = 0;

    for (const enrollment of enrollments) {
      try {
        // Get course details
        const allCourses = await getAllCourses({ status: 'all' });
        const course = allCourses.find(c => c.id === enrollment.courseId);
        
        if (course) {
          const progress = enrollment.progress?.progressPercentage || 0;
          const completedLessons = enrollment.progress?.completedLessons?.length || 0;
          
          enrolledCourses.push({
            id: course.id,
            title: course.title,
            thumbnail: course.thumbnail || '',
            instructor: course.instructorName || 'Instructor',
            progress: Math.round(progress),
            totalLessons: course.totalLessons || 0,
            completedLessons: completedLessons,
            lastAccessed: enrollment.enrolledAt,
            category: course.category,
            price: course.price,
            level: course.level
          });

          totalCompletedLessons += completedLessons;
          if (progress >= 100) {
            totalCompletedCourses++;
          }
        }
      } catch (error) {
        console.error('Error loading course details:', error);
      }
    }

    // Mock recent activities for now - can be enhanced later
    const recentActivities: RecentActivity[] = enrollments.slice(0, 5).map((enrollment, index) => ({
      id: `activity_${index}`,
      type: 'course_enrolled' as const,
      title: 'Đăng ký khóa học mới',
      courseTitle: `Course ${enrollment.courseId}`,
      timestamp: enrollment.enrolledAt,
      description: 'Bạn đã đăng ký khóa học này'
    }));

    // Calculate stats
    const stats: LearningStats = {
      totalCoursesEnrolled: enrollments.length,
      totalCoursesCompleted: totalCompletedCourses,
      totalLessonsCompleted: totalCompletedLessons,
      totalHoursLearned: Math.round(totalCompletedLessons * 0.5), // Estimate 30min per lesson
      currentStreak: 1, // Mock data
      totalCertificates: totalCompletedCourses // One certificate per completed course
    };

    console.log('✅ Dashboard data loaded:', {
      enrolledCourses: enrolledCourses.length,
      stats
    });

    return {
      enrolledCourses,
      recentActivities,
      stats
    };
  } catch (error) {
    console.error('❌ Error loading dashboard data:', error);
    return {
      enrolledCourses: [],
      recentActivities: [],
      stats: {
        totalCoursesEnrolled: 0,
        totalCoursesCompleted: 0,
        totalLessonsCompleted: 0,
        totalHoursLearned: 0,
        currentStreak: 0,
        totalCertificates: 0
      }
    };
  }
};

/**
 * Get certificates for a student
 */
export const getStudentCertificatesData = async (studentId: string) => {
  try {
    console.log('🏆 Loading certificates for student:', studentId);

    const enrollments = await getStudentEnrollments(studentId);
    const completedCourses = enrollments.filter(
      enrollment => enrollment.progress?.progressPercentage >= 100
    );

    const certificates = [];
    
    for (const enrollment of completedCourses) {
      try {
        const allCourses = await getAllCourses({ status: 'all' });
        const course = allCourses.find(c => c.id === enrollment.courseId);
        
        if (course) {
          certificates.push({
            id: `cert_${enrollment.id}`,
            courseId: course.id,
            courseName: course.title,
            studentName: 'Student', // Would get from user profile
            completionDate: enrollment.progress?.completedAt || enrollment.enrolledAt,
            grade: 'A', // Mock grade
            instructorName: course.instructorName || 'Instructor',
            certificateUrl: `/api/certificates/generate?enrollmentId=${enrollment.id}`,
            duration: course.duration || 3600, // Default 1 hour
            skills: course.tags || ['Programming'],
            isValid: true
          });
        }
      } catch (error) {
        console.error('Error loading certificate course:', error);
      }
    }

    console.log('✅ Certificates loaded:', certificates.length);
    return certificates;
  } catch (error) {
    console.error('❌ Error loading certificates:', error);
    return [];
  }
};
