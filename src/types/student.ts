import { Course, CourseProgress, Enrollment, Lesson } from './course';

export interface StudentDashboard {
  student: StudentProfile;
  enrolledCourses: EnrolledCourse[];
  recentActivity: Activity[];
  achievements: Achievement[];
  learningStats: LearningStats;
  upcomingDeadlines: Deadline[];
}

export interface StudentProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  location?: string;
  joinedAt: string;
  lastActiveAt: string;
  preferences: StudentPreferences;
}

export interface StudentPreferences {
  language: string;
  timezone: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyReports: boolean;
  learningReminders: boolean;
}

export interface EnrolledCourse {
  course: Course;
  enrollment: Enrollment;
  progress: CourseProgress;
  nextLesson?: Lesson;
  lastActivity?: string;
}

export interface Activity {
  id: string;
  type: 'lesson_completed' | 'quiz_passed' | 'course_enrolled' | 'achievement_earned';
  title: string;
  description: string;
  courseId?: string;
  lessonId?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'learning' | 'engagement' | 'milestone' | 'special';
  earnedAt: string;
  courseId?: string;
}

export interface LearningStats {
  totalCoursesEnrolled: number;
  totalCoursesCompleted: number;
  totalLearningTime: number; // in minutes
  currentStreak: number; // days
  longestStreak: number; // days
  averageScore: number;
  totalCertificates: number;
}

export interface Deadline {
  id: string;
  type: 'assignment' | 'quiz' | 'course_completion';
  title: string;
  courseId: string;
  courseName: string;
  dueDate: string;
  isOverdue: boolean;
}

export interface StudentNote {
  id: string;
  studentId: string;
  courseId: string;
  lessonId: string;
  videoTimestamp?: number;
  content: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Bookmark {
  id: string;
  studentId: string;
  courseId: string;
  lessonId: string;
  videoTimestamp?: number;
  title: string;
  createdAt: string;
}
