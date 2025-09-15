export interface CourseCategory {
  id: string;
  name: string;
  description?: string;
  slug: string;
  icon?: string;
  color?: string;
  parentId?: string; // For hierarchical categories
  sortOrder: number;
  isActive: boolean;
  courseCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CourseMetadata {
  duration: number; // in minutes
  level: 'beginner' | 'intermediate' | 'advanced';
  language: string;
  tags: string[];
  prerequisites: string[];
  learningObjectives: string[];
  certificateTemplate?: string;
  completionCriteria: {
    passQuizzes: boolean;
    completeAllLessons: boolean;
    minimumScore?: number;
  };
}

export interface CourseMedia {
  id: string;
  type: 'video' | 'image' | 'document' | 'audio';
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  thumbnail?: string;
  duration?: number; // for video/audio
  uploadedAt: string;
  uploadedBy: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  slug: string;
  thumbnail?: string;
  coverImage?: string;
  instructorId: string;
  instructorName: string;
  instructorAvatar?: string;
  categoryId: string;
  category?: CourseCategory;
  metadata: CourseMetadata;
  price: number;
  originalPrice?: number;
  currency: string;
  status: 'draft' | 'published' | 'archived' | 'under_review';
  totalLessons: number;
  totalStudents: number;
  enrollmentCount: number;
  rating: number;
  reviewCount: number;
  isPromoted: boolean;
  promotionEndDate?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  lastModified: string;
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

// Additional types for CRUD operations
export interface CreateCourseData {
  title: string;
  description: string;
  shortDescription?: string;
  categoryId: string;
  price: number;
  currency: string;
  metadata: Omit<CourseMetadata, 'duration'>;
  thumbnail?: File;
  coverImage?: File;
}

export interface UpdateCourseData extends Partial<CreateCourseData> {
  id: string;
  status?: Course['status'];
}

// Search and Filter Types
export interface CourseFilters {
  category?: string;
  level?: string;
  price?: 'free' | 'paid' | 'all';
  rating?: number;
  duration?: string;
  language?: string;
  tags?: string[];
  instructor?: string;
}

export interface CourseSortOptions {
  field: 'title' | 'price' | 'rating' | 'enrollmentCount' | 'createdAt' | 'updatedAt';
  direction: 'asc' | 'desc';
}

export interface CourseSearchResult {
  courses: Course[];
  total: number;
  page: number;
  limit: number;
  filters: CourseFilters;
  sort: CourseSortOptions;
}
