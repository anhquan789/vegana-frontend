import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    setDoc,
    updateDoc,
    where
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import {
    Course,
    CourseCategory,
    CourseProgress,
    Enrollment,
    LessonProgress
} from '../../types/course';

const COLLECTIONS = {
  COURSES: 'courses',
  ENROLLMENTS: 'enrollments',
  PROGRESS: 'course_progress',
  LESSON_PROGRESS: 'lesson_progress',
  SECTIONS: 'course_sections',
  CATEGORIES: 'course_categories',
  REVIEWS: 'course_reviews'
};

// Course Management
export const createCourse = async (course: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const courseId = `course_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    const newCourse: Course = {
      ...course,
      id: courseId,
      createdAt: now,
      updatedAt: now,
      lastModified: now
    };
    
    await setDoc(doc(db, COLLECTIONS.COURSES, courseId), newCourse);
    console.log('✅ Course created:', courseId);
    return courseId;
  } catch (error) {
    console.error('❌ Error creating course:', error);
    throw error;
  }
};

export const getCourse = async (courseId: string): Promise<Course | null> => {
  try {
    const docRef = doc(db, COLLECTIONS.COURSES, courseId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as Course;
    }
    return null;
  } catch (error) {
    console.error('❌ Error getting course:', error);
    throw error;
  }
};

export const getAllCourses = async (filters?: {
  category?: string;
  level?: string;
  status?: string;
  limit?: number;
}): Promise<Course[]> => {
  try {
    let q = query(collection(db, COLLECTIONS.COURSES));
    
    if (filters?.category) {
      q = query(q, where('category', '==', filters.category));
    }
    
    if (filters?.level) {
      q = query(q, where('level', '==', filters.level));
    }
    
    if (filters?.status) {
      q = query(q, where('status', '==', filters.status));
    } else {
      // Default to published courses only
      q = query(q, where('status', '==', 'published'));
    }
    
    q = query(q, orderBy('createdAt', 'desc'));
    
    if (filters?.limit) {
      q = query(q, limit(filters.limit));
    }
    
    const querySnapshot = await getDocs(q);
    const courses = querySnapshot.docs.map(doc => doc.data() as Course);
    
    console.log('📚 Loaded courses:', courses.length);
    return courses;
  } catch (error) {
    console.error('❌ Error loading courses:', error);
    return [];
  }
};

export const updateCourse = async (courseId: string, updates: Partial<Course>): Promise<void> => {
  try {
    const updatedData = {
      ...updates,
      updatedAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };
    
    await updateDoc(doc(db, COLLECTIONS.COURSES, courseId), updatedData);
    console.log('✅ Course updated:', courseId);
  } catch (error) {
    console.error('❌ Error updating course:', error);
    throw error;
  }
};

export const deleteCourse = async (courseId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.COURSES, courseId));
    console.log('✅ Course deleted:', courseId);
  } catch (error) {
    console.error('❌ Error deleting course:', error);
    throw error;
  }
};

// Enrollment Management
export const enrollStudent = async (courseId: string, studentId: string): Promise<string> => {
  try {
    const enrollmentId = `enrollment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    // Create initial progress
    const initialProgress: CourseProgress = {
      id: `progress_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      courseId,
      studentId,
      completedLessons: [],
      totalLessons: 0, // Will be updated when course sections are loaded
      progressPercentage: 0,
      startedAt: now,
      certificateIssued: false
    };
    
    const enrollment: Enrollment = {
      id: enrollmentId,
      courseId,
      studentId,
      enrolledAt: now,
      status: 'active',
      paymentStatus: 'free', // Default for now
      progress: initialProgress
    };
    
    await setDoc(doc(db, COLLECTIONS.ENROLLMENTS, enrollmentId), enrollment);
    await setDoc(doc(db, COLLECTIONS.PROGRESS, initialProgress.id), initialProgress);
    
    console.log('✅ Student enrolled:', { courseId, studentId });
    return enrollmentId;
  } catch (error) {
    console.error('❌ Error enrolling student:', error);
    throw error;
  }
};

export const getStudentEnrollments = async (studentId: string): Promise<Enrollment[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.ENROLLMENTS),
      where('studentId', '==', studentId),
      orderBy('enrolledAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const enrollments = querySnapshot.docs.map(doc => doc.data() as Enrollment);
    
    console.log('📚 Loaded student enrollments:', enrollments.length);
    return enrollments;
  } catch (error) {
    console.error('❌ Error loading student enrollments:', error);
    return [];
  }
};

export const getCourseEnrollments = async (courseId: string): Promise<Enrollment[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.ENROLLMENTS),
      where('courseId', '==', courseId),
      orderBy('enrolledAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const enrollments = querySnapshot.docs.map(doc => doc.data() as Enrollment);
    
    console.log('👥 Loaded course enrollments:', enrollments.length);
    return enrollments;
  } catch (error) {
    console.error('❌ Error loading course enrollments:', error);
    return [];
  }
};

// Progress Tracking
export const updateLessonProgress = async (
  lessonId: string, 
  studentId: string, 
  courseId: string,
  progressData: Partial<LessonProgress>
): Promise<void> => {
  try {
    const progressId = `lesson_progress_${lessonId}_${studentId}`;
    
    const lessonProgress: LessonProgress = {
      id: progressId,
      lessonId,
      studentId,
      courseId,
      isCompleted: false,
      watchTime: 0,
      totalTime: 0,
      lastPosition: 0,
      attempts: 0,
      ...progressData
    };
    
    await setDoc(doc(db, COLLECTIONS.LESSON_PROGRESS, progressId), lessonProgress);
    
    // Update course progress if lesson is completed
    if (lessonProgress.isCompleted) {
      await updateCourseProgress(courseId, studentId);
    }
    
    console.log('✅ Lesson progress updated:', { lessonId, studentId });
  } catch (error) {
    console.error('❌ Error updating lesson progress:', error);
    throw error;
  }
};

export const updateCourseProgress = async (courseId: string, studentId: string): Promise<void> => {
  try {
    // Get all lesson progress for this student and course
    const q = query(
      collection(db, COLLECTIONS.LESSON_PROGRESS),
      where('studentId', '==', studentId),
      where('courseId', '==', courseId)
    );
    
    const querySnapshot = await getDocs(q);
    const lessonProgress = querySnapshot.docs.map(doc => doc.data() as LessonProgress);
    
    const completedLessons = lessonProgress
      .filter(progress => progress.isCompleted)
      .map(progress => progress.lessonId);
    
    const totalLessons = lessonProgress.length;
    const progressPercentage = totalLessons > 0 ? (completedLessons.length / totalLessons) * 100 : 0;
    
    // Update course progress
    const courseProgressQuery = query(
      collection(db, COLLECTIONS.PROGRESS),
      where('studentId', '==', studentId),
      where('courseId', '==', courseId)
    );
    
    const courseProgressSnapshot = await getDocs(courseProgressQuery);
    if (!courseProgressSnapshot.empty) {
      const progressDoc = courseProgressSnapshot.docs[0];
      const updates = {
        completedLessons,
        totalLessons,
        progressPercentage,
        lastWatchedAt: new Date().toISOString(),
        ...(progressPercentage === 100 && { completedAt: new Date().toISOString() })
      };
      
      await updateDoc(progressDoc.ref, updates);
      console.log('✅ Course progress updated:', { courseId, studentId, progressPercentage });
    }
  } catch (error) {
    console.error('❌ Error updating course progress:', error);
    throw error;
  }
};

export const getCourseProgress = async (courseId: string, studentId: string): Promise<CourseProgress | null> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.PROGRESS),
      where('studentId', '==', studentId),
      where('courseId', '==', courseId)
    );
    
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data() as CourseProgress;
    }
    return null;
  } catch (error) {
    console.error('❌ Error getting course progress:', error);
    return null;
  }
};

// Search and Filter
export const searchCourses = async (searchTerm: string, filters?: {
  category?: string;
  level?: string;
  minRating?: number;
}): Promise<Course[]> => {
  try {
    // Note: Firestore doesn't support full-text search natively
    // This is a basic implementation - consider using Algolia or similar for better search
    
    let q = query(collection(db, COLLECTIONS.COURSES), where('status', '==', 'published'));
    
    if (filters?.category) {
      q = query(q, where('category', '==', filters.category));
    }
    
    if (filters?.level) {
      q = query(q, where('level', '==', filters.level));
    }
    
    const querySnapshot = await getDocs(q);
    let courses = querySnapshot.docs.map(doc => doc.data() as Course);
    
    // Client-side filtering for search term and rating
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      courses = courses.filter(course => 
        course.title.toLowerCase().includes(searchLower) ||
        course.description.toLowerCase().includes(searchLower) ||
        course.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    if (filters?.minRating) {
      courses = courses.filter(course => course.rating >= filters.minRating!);
    }
    
    console.log('🔍 Search results:', courses.length);
    return courses;
  } catch (error) {
    console.error('❌ Error searching courses:', error);
    return [];
  }
};

// Categories
export const getCourseCategories = async (): Promise<CourseCategory[]> => {
  try {
    const q = query(collection(db, COLLECTIONS.CATEGORIES), orderBy('name', 'asc'));
    const querySnapshot = await getDocs(q);
    const categories = querySnapshot.docs.map(doc => doc.data() as CourseCategory);
    
    console.log('📂 Loaded categories:', categories.length);
    return categories;
  } catch (error) {
    console.error('❌ Error loading categories:', error);
    return [];
  }
};

// Utility functions
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} phút`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} giờ`;
  }
  
  return `${hours} giờ ${remainingMinutes} phút`;
};

export const formatPrice = (price: number, currency: string = 'VND'): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: currency
  }).format(price);
};

export const calculateDiscountPercentage = (originalPrice: number, salePrice: number): number => {
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
};
