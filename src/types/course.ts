export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  price: string;
  oldPrice?: string;
  thumbnail: string;
  lessons: Lesson[];
  publishedDate: string;
  socialLinks: {
    fanpage?: string;
    group?: string;
    youtube?: string;
    sonDang?: string;
  };
  isNew?: boolean;
  slug: string;
  students: number;
  color: string;
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  description: string;
  isLocked: boolean;
  order: number;
}

export interface CourseProgress {
  userId: string;
  courseId: string;
  completedLessons: string[];
  currentLesson: string;
  progressPercentage: number;
  lastAccessedAt: Date;
}
