import { db } from '@/lib/firebase';
import {
    Course,
    CourseProgress,
    Enrollment,
    LessonProgress
} from '@/types/course';
import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    increment,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where,
    writeBatch
} from 'firebase/firestore';

const COLLECTIONS = {
  ENROLLMENTS: 'enrollments',
  COURSE_PROGRESS: 'course_progress',
  LESSON_PROGRESS: 'lesson_progress',
  COURSES: 'courses'
};

export class EnrollmentService {
  /**
   * Enroll student in a course
   */
  static async enrollStudent(
    courseId: string, 
    studentId: string, 
    paymentId?: string
  ): Promise<{ success: boolean; enrollmentId?: string; error?: string }> {
    try {
      const batch = writeBatch(db);
      const enrollmentId = `enrollment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Get course details
      const courseDoc = await getDoc(doc(db, COLLECTIONS.COURSES, courseId));
      if (!courseDoc.exists()) {
        return { success: false, error: 'Course not found' };
      }
      
      const course = courseDoc.data() as Course;

      // Check if already enrolled
      const existingEnrollment = await this.getEnrollment(courseId, studentId);
      if (existingEnrollment) {
        return { success: false, error: 'Already enrolled in this course' };
      }

      // Create course progress
      const progressId = `progress_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const courseProgress: CourseProgress = {
        id: progressId,
        courseId,
        studentId,
        completedLessons: [],
        totalLessons: course.totalLessons || 0,
        progressPercentage: 0,
        startedAt: new Date().toISOString(),
        certificateIssued: false
      };

      // Create enrollment
      const enrollment: Enrollment = {
        id: enrollmentId,
        courseId,
        studentId,
        enrolledAt: new Date().toISOString(),
        status: 'active',
        paymentStatus: paymentId ? 'paid' : 'free',
        progress: courseProgress
      };

      // Batch write
      batch.set(doc(db, COLLECTIONS.ENROLLMENTS, enrollmentId), {
        ...enrollment,
        enrolledAt: serverTimestamp()
      });

      batch.set(doc(db, COLLECTIONS.COURSE_PROGRESS, progressId), {
        ...courseProgress,
        startedAt: serverTimestamp()
      });

      // Update course enrollment count
      batch.update(doc(db, COLLECTIONS.COURSES, courseId), {
        enrollmentCount: increment(1),
        totalStudents: increment(1)
      });

      await batch.commit();

      return { success: true, enrollmentId };
    } catch (error) {
      console.error('Error enrolling student:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get enrollment by course and student
   */
  static async getEnrollment(courseId: string, studentId: string): Promise<Enrollment | null> {
    try {
      const q = query(
        collection(db, COLLECTIONS.ENROLLMENTS),
        where('courseId', '==', courseId),
        where('studentId', '==', studentId)
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;

      const enrollmentDoc = snapshot.docs[0];
      return { id: enrollmentDoc.id, ...enrollmentDoc.data() } as Enrollment;
    } catch (error) {
      console.error('Error getting enrollment:', error);
      return null;
    }
  }

  /**
   * Get all enrollments for a student
   */
  static async getStudentEnrollments(studentId: string): Promise<Enrollment[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.ENROLLMENTS),
        where('studentId', '==', studentId),
        where('status', '==', 'active'),
        orderBy('enrolledAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Enrollment[];
    } catch (error) {
      console.error('Error getting student enrollments:', error);
      return [];
    }
  }

  /**
   * Get all enrollments for a course
   */
  static async getCourseEnrollments(courseId: string): Promise<Enrollment[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.ENROLLMENTS),
        where('courseId', '==', courseId),
        orderBy('enrolledAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Enrollment[];
    } catch (error) {
      console.error('Error getting course enrollments:', error);
      return [];
    }
  }

  /**
   * Update enrollment status
   */
  static async updateEnrollmentStatus(
    enrollmentId: string, 
    status: Enrollment['status']
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await updateDoc(doc(db, COLLECTIONS.ENROLLMENTS, enrollmentId), {
        status,
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating enrollment status:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Cancel enrollment
   */
  static async cancelEnrollment(enrollmentId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const enrollment = await getDoc(doc(db, COLLECTIONS.ENROLLMENTS, enrollmentId));
      if (!enrollment.exists()) {
        return { success: false, error: 'Enrollment not found' };
      }

      const enrollmentData = enrollment.data() as Enrollment;
      
      const batch = writeBatch(db);
      
      // Update enrollment status
      batch.update(doc(db, COLLECTIONS.ENROLLMENTS, enrollmentId), {
        status: 'cancelled',
        cancelledAt: serverTimestamp()
      });

      // Decrease course enrollment count
      batch.update(doc(db, COLLECTIONS.COURSES, enrollmentData.courseId), {
        enrollmentCount: increment(-1),
        totalStudents: increment(-1)
      });

      await batch.commit();

      return { success: true };
    } catch (error) {
      console.error('Error cancelling enrollment:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get enrollment with real-time updates
   */
  static subscribeToEnrollment(
    courseId: string, 
    studentId: string, 
    callback: (enrollment: Enrollment | null) => void
  ) {
    const q = query(
      collection(db, COLLECTIONS.ENROLLMENTS),
      where('courseId', '==', courseId),
      where('studentId', '==', studentId)
    );

    return onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        callback(null);
      } else {
        const enrollmentDoc = snapshot.docs[0];
        callback({ id: enrollmentDoc.id, ...enrollmentDoc.data() } as Enrollment);
      }
    });
  }
}

export class ProgressService {
  /**
   * Update course progress
   */
  static async updateCourseProgress(
    courseId: string,
    studentId: string,
    completedLessonId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get current progress
      const progressQuery = query(
        collection(db, COLLECTIONS.COURSE_PROGRESS),
        where('courseId', '==', courseId),
        where('studentId', '==', studentId)
      );

      const progressSnapshot = await getDocs(progressQuery);
      if (progressSnapshot.empty) {
        return { success: false, error: 'Progress record not found' };
      }

      const progressDoc = progressSnapshot.docs[0];
      const currentProgress = progressDoc.data() as CourseProgress;

      // Add completed lesson if not already completed
      const completedLessons = [...currentProgress.completedLessons];
      if (!completedLessons.includes(completedLessonId)) {
        completedLessons.push(completedLessonId);
      }

      // Calculate progress percentage
      const progressPercentage = Math.round(
        (completedLessons.length / currentProgress.totalLessons) * 100
      );

      // Check if course is completed
      const isCompleted = progressPercentage >= 100;
      const updateData: Partial<CourseProgress> = {
        completedLessons,
        progressPercentage,
        lastWatchedLesson: completedLessonId,
        lastWatchedAt: new Date().toISOString()
      };

      if (isCompleted && !currentProgress.completedAt) {
        updateData.completedAt = new Date().toISOString();
      }

      await updateDoc(doc(db, COLLECTIONS.COURSE_PROGRESS, progressDoc.id), {
        ...updateData,
        updatedAt: serverTimestamp()
      });

      // Update enrollment progress
      const enrollment = await EnrollmentService.getEnrollment(courseId, studentId);
      if (enrollment) {
        await updateDoc(doc(db, COLLECTIONS.ENROLLMENTS, enrollment.id), {
          'progress.completedLessons': completedLessons,
          'progress.progressPercentage': progressPercentage,
          'progress.lastWatchedLesson': completedLessonId,
          'progress.lastWatchedAt': new Date().toISOString(),
          ...(isCompleted && { status: 'completed' })
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating course progress:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get course progress
   */
  static async getCourseProgress(courseId: string, studentId: string): Promise<CourseProgress | null> {
    try {
      const q = query(
        collection(db, COLLECTIONS.COURSE_PROGRESS),
        where('courseId', '==', courseId),
        where('studentId', '==', studentId)
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;

      const progressDoc = snapshot.docs[0];
      return { id: progressDoc.id, ...progressDoc.data() } as CourseProgress;
    } catch (error) {
      console.error('Error getting course progress:', error);
      return null;
    }
  }

  /**
   * Update lesson progress
   */
  static async updateLessonProgress(
    lessonId: string,
    studentId: string,
    courseId: string,
    data: Partial<LessonProgress>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if lesson progress exists
      const q = query(
        collection(db, COLLECTIONS.LESSON_PROGRESS),
        where('lessonId', '==', lessonId),
        where('studentId', '==', studentId)
      );

      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        // Create new lesson progress
        const progressId = `lesson_progress_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const lessonProgress: LessonProgress = {
          id: progressId,
          lessonId,
          studentId,
          courseId,
          isCompleted: data.isCompleted || false,
          watchTime: data.watchTime || 0,
          totalTime: data.totalTime || 0,
          lastPosition: data.lastPosition || 0,
          attempts: data.attempts || 1,
          score: data.score
        };

        await addDoc(collection(db, COLLECTIONS.LESSON_PROGRESS), {
          ...lessonProgress,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } else {
        // Update existing lesson progress
        const progressDoc = snapshot.docs[0];
        await updateDoc(doc(db, COLLECTIONS.LESSON_PROGRESS, progressDoc.id), {
          ...data,
          attempts: increment(1),
          updatedAt: serverTimestamp()
        });
      }

      // If lesson is completed, update course progress
      if (data.isCompleted) {
        await this.updateCourseProgress(courseId, studentId, lessonId);
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating lesson progress:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get lesson progress
   */
  static async getLessonProgress(lessonId: string, studentId: string): Promise<LessonProgress | null> {
    try {
      const q = query(
        collection(db, COLLECTIONS.LESSON_PROGRESS),
        where('lessonId', '==', lessonId),
        where('studentId', '==', studentId)
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;

      const progressDoc = snapshot.docs[0];
      return { id: progressDoc.id, ...progressDoc.data() } as LessonProgress;
    } catch (error) {
      console.error('Error getting lesson progress:', error);
      return null;
    }
  }

  /**
   * Get all lesson progress for a course
   */
  static async getCourseLessonProgress(courseId: string, studentId: string): Promise<LessonProgress[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.LESSON_PROGRESS),
        where('courseId', '==', courseId),
        where('studentId', '==', studentId),
        orderBy('updatedAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as LessonProgress[];
    } catch (error) {
      console.error('Error getting course lesson progress:', error);
      return [];
    }
  }

  /**
   * Subscribe to course progress updates
   */
  static subscribeToCourseProgress(
    courseId: string,
    studentId: string,
    callback: (progress: CourseProgress | null) => void
  ) {
    const q = query(
      collection(db, COLLECTIONS.COURSE_PROGRESS),
      where('courseId', '==', courseId),
      where('studentId', '==', studentId)
    );

    return onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        callback(null);
      } else {
        const progressDoc = snapshot.docs[0];
        callback({ id: progressDoc.id, ...progressDoc.data() } as CourseProgress);
      }
    });
  }

  /**
   * Get progress statistics for a student
   */
  static async getStudentProgressStats(studentId: string): Promise<{
    totalCourses: number;
    completedCourses: number;
    inProgressCourses: number;
    totalLessonsCompleted: number;
    averageProgress: number;
  }> {
    try {
      const q = query(
        collection(db, COLLECTIONS.COURSE_PROGRESS),
        where('studentId', '==', studentId)
      );

      const snapshot = await getDocs(q);
      const progressRecords = snapshot.docs.map(doc => doc.data() as CourseProgress);

      const totalCourses = progressRecords.length;
      const completedCourses = progressRecords.filter(p => p.completedAt).length;
      const inProgressCourses = totalCourses - completedCourses;
      const totalLessonsCompleted = progressRecords.reduce((sum, p) => sum + p.completedLessons.length, 0);
      const averageProgress = totalCourses > 0 
        ? progressRecords.reduce((sum, p) => sum + p.progressPercentage, 0) / totalCourses 
        : 0;

      return {
        totalCourses,
        completedCourses,
        inProgressCourses,
        totalLessonsCompleted,
        averageProgress: Math.round(averageProgress)
      };
    } catch (error) {
      console.error('Error getting student progress stats:', error);
      return {
        totalCourses: 0,
        completedCourses: 0,
        inProgressCourses: 0,
        totalLessonsCompleted: 0,
        averageProgress: 0
      };
    }
  }
}
