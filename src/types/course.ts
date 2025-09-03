export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  instructorId: string;
  instructorName: string;
  category: '' | 'business' | 'design' | 'development';
  level: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  originalPrice?: number;
  currency: string;
  duration: number; // in minutes
  language: string;
  status: 'draft' | 'published' | 'archived';
  tags: string[];
  requirements: string[];
  whatYoullLearn: string[];
  totalLessons: number;
  totalStudents: number;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
  lastModified: string;
  slug: string;
  socialLinks?: {
    fanpage?: string;
    group?: string;
    youtube?: string;
    sonDang?: string;
  };
  isNew?: boolean;
  students?: number;
  color?: string;
}

export interface CourseProgress {
  id: string;
  courseId: string;
  studentId: string;
  completedLessons: string[];
  totalLessons: number;
  progressPercentage: number;
  lastWatchedLesson?: string;
  lastWatchedAt?: string;
  startedAt: string;
  completedAt?: string;
  certificateIssued: boolean;
}

export interface Enrollment {
  id: string;
  courseId: string;
  studentId: string;
  enrolledAt: string;
  status: 'active' | 'completed' | 'dropped';
  paymentStatus: 'paid' | 'pending' | 'free';
  progress: CourseProgress;
}

export interface CourseSection {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  order: number;
  lessons: Lesson[];
  isLocked: boolean;
  estimatedDuration: number;
}

export interface Lesson {
  id: string;
  courseId: string;
  sectionId: string;
  title: string;
  description?: string;
  type: 'video' | 'text' | 'quiz' | 'assignment';
  content: LessonContent;
  order: number;
  duration: number; // in seconds
  isPreview: boolean;
  isCompleted: boolean;
  resources: LessonResource[];
  createdAt: string;
  updatedAt: string;
}

export interface LessonContent {
  videoId?: string;
  videoUrl?: string;
  textContent?: string;
  quizId?: string;
  assignmentId?: string;
}

export interface LessonResource {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'link' | 'image';
  url: string;
  size?: number;
}

export interface LessonProgress {
  id: string;
  lessonId: string;
  studentId: string;
  courseId: string;
  isCompleted: boolean;
  watchTime: number; // in seconds
  totalTime: number; // in seconds
  lastPosition: number; // video position in seconds
  completedAt?: string;
  attempts: number;
  score?: number;
}

export interface CourseCategory {
  id: string;
  name: string;
  description: string;
  slug: string;
  parentId?: string;
  icon: string;
  color: string;
  courseCount: number;
}

export interface CourseReview {
  id: string;
  courseId: string;
  studentId: string;
  studentName: string;
  rating: number;
  comment: string;
  createdAt: string;
  isVerified: boolean;
}

export interface CourseCertificate {
  id: string;
  courseId: string;
  studentId: string;
  studentName: string;
  courseName: string;
  instructorName: string;
  completionDate: string;
  certificateUrl: string;
  verificationCode: string;
}
