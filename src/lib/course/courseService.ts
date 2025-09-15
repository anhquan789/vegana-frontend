import { db, storage } from '@/lib/firebase';
import { Course, CourseCategory, CreateCourseData, UpdateCourseData, CourseFilters, CourseSortOptions, CourseSearchResult, CourseMedia } from '@/types/course';
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  startAfter,
  serverTimestamp,
  increment as firestoreIncrement,
  setDoc
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';

const COLLECTIONS = {
  COURSES: 'courses',
  CATEGORIES: 'course_categories',
  SECTIONS: 'course_sections',
  LESSONS: 'course_lessons',
  MEDIA: 'course_media'
};

// Helper function to generate UUID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

// Course CRUD Operations
export class CourseService {
  /**
   * Create a new course
   */
  static async createCourse(data: CreateCourseData, instructorId: string): Promise<{ success: boolean; courseId?: string; error?: string }> {
    try {
      const courseId = generateId();
      const slug = this.generateSlug(data.title);
      
      // Upload media files if provided
      let thumbnailUrl: string | undefined;
      let coverImageUrl: string | undefined;

      if (data.thumbnail) {
        const thumbnailResult = await this.uploadMedia(data.thumbnail, 'thumbnails');
        if (thumbnailResult.success) {
          thumbnailUrl = thumbnailResult.url;
        }
      }

      if (data.coverImage) {
        const coverResult = await this.uploadMedia(data.coverImage, 'covers');
        if (coverResult.success) {
          coverImageUrl = coverResult.url;
        }
      }

      const courseData: Omit<Course, 'id'> = {
        title: data.title,
        description: data.description,
        shortDescription: data.shortDescription,
        slug,
        thumbnail: thumbnailUrl,
        coverImage: coverImageUrl,
        instructorId,
        instructorName: '', // Will be populated from user profile
        instructorAvatar: '',
        categoryId: data.categoryId,
        metadata: {
          ...data.metadata,
          duration: 0 // Will be calculated from lessons
        },
        price: data.price,
        originalPrice: data.price,
        currency: data.currency,
        status: 'draft',
        totalLessons: 0,
        totalStudents: 0,
        enrollmentCount: 0,
        rating: 0,
        reviewCount: 0,
        isPromoted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      };

      await setDoc(doc(db, COLLECTIONS.COURSES, courseId), {
        ...courseData,
        id: courseId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return { success: true, courseId };
    } catch (error) {
      console.error('Error creating course:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Update an existing course
   */
  static async updateCourse(data: UpdateCourseData): Promise<{ success: boolean; error?: string }> {
    try {
      const courseRef = doc(db, COLLECTIONS.COURSES, data.id);
      const updateData: Record<string, unknown> = {
        ...data,
        updatedAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      };

      // Handle media uploads
      if (data.thumbnail instanceof File) {
        const result = await this.uploadMedia(data.thumbnail, 'thumbnails');
        if (result.success) {
          updateData.thumbnail = result.url;
        }
      }

      if (data.coverImage instanceof File) {
        const result = await this.uploadMedia(data.coverImage, 'covers');
        if (result.success) {
          updateData.coverImage = result.url;
        }
      }

      await updateDoc(courseRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating course:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get course by ID
   */
  static async getCourse(courseId: string): Promise<Course | null> {
    try {
      const courseDoc = await getDoc(doc(db, COLLECTIONS.COURSES, courseId));
      if (courseDoc.exists()) {
        return { id: courseDoc.id, ...courseDoc.data() } as Course;
      }
      return null;
    } catch (error) {
      console.error('Error getting course:', error);
      return null;
    }
  }

  /**
   * Search and filter courses
   */
  static async searchCourses(
    filters: CourseFilters = {},
    sort: CourseSortOptions = { field: 'createdAt', direction: 'desc' },
    page: number = 1,
    limitCount: number = 12
  ): Promise<CourseSearchResult> {
    try {
      const q = collection(db, COLLECTIONS.COURSES);
      
      // Apply filters
      const queryConstraints = [];

      if (filters.category) {
        queryConstraints.push(where('categoryId', '==', filters.category));
      }

      if (filters.level) {
        queryConstraints.push(where('metadata.level', '==', filters.level));
      }

      if (filters.price === 'free') {
        queryConstraints.push(where('price', '==', 0));
      } else if (filters.price === 'paid') {
        queryConstraints.push(where('price', '>', 0));
      }

      if (filters.rating) {
        queryConstraints.push(where('rating', '>=', filters.rating));
      }

      if (filters.instructor) {
        queryConstraints.push(where('instructorId', '==', filters.instructor));
      }

      if (filters.language) {
        queryConstraints.push(where('metadata.language', '==', filters.language));
      }

      // Add sorting
      queryConstraints.push(orderBy(sort.field, sort.direction));

      // Add pagination
      queryConstraints.push(firestoreLimit(limitCount));
      if (page > 1) {
        // For pagination, you'd need to implement cursor-based pagination
        // This is a simplified version
        const offset = (page - 1) * limitCount;
        queryConstraints.push(startAfter(offset));
      }

      const coursesQuery = query(q, ...queryConstraints);
      const snapshot = await getDocs(coursesQuery);
      
      const courses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Course[];

      // Get total count (simplified - in production, use a separate count document)
      const totalSnapshot = await getDocs(collection(db, COLLECTIONS.COURSES));
      const total = totalSnapshot.size;

      return {
        courses,
        total,
        page,
        limit: limitCount,
        filters,
        sort
      };
    } catch (error) {
      console.error('Error searching courses:', error);
      return {
        courses: [],
        total: 0,
        page,
        limit: limitCount,
        filters,
        sort
      };
    }
  }

  /**
   * Delete a course
   */
  static async deleteCourse(courseId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Delete associated media files
      await this.deleteAllCourseMedia(courseId);
      
      // Delete course document
      await deleteDoc(doc(db, COLLECTIONS.COURSES, courseId));
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting course:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Publish/unpublish course
   */
  static async updateCourseStatus(courseId: string, status: Course['status']): Promise<{ success: boolean; error?: string }> {
    try {
      const courseRef = doc(db, COLLECTIONS.COURSES, courseId);
      const updateData: Partial<Course> = {
        status,
        updatedAt: new Date().toISOString()
      };

      if (status === 'published') {
        updateData.publishedAt = new Date().toISOString();
      }

      await updateDoc(courseRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating course status:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Media Upload Methods
  /**
   * Upload media file to Firebase Storage
   */
  static async uploadMedia(
    file: File,
    folder: string = 'general',
    courseId?: string
  ): Promise<{ success: boolean; url?: string; mediaId?: string; error?: string }> {
    try {
      const mediaId = generateId();
      const fileName = `${mediaId}_${file.name}`;
      const folderPath = courseId ? `courses/${courseId}/${folder}` : folder;
      const storageRef = ref(storage, `${folderPath}/${fileName}`);

      // Upload file
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Save media record to Firestore
      const mediaData: Omit<CourseMedia, 'id'> = {
        type: this.getMediaType(file.type),
        url: downloadURL,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'current-user-id' // Should come from auth context
      };

      if (this.isVideoFile(file.type)) {
        // For video files, you might want to generate thumbnails
        // This would typically be done with a cloud function
        mediaData.thumbnail = await this.generateVideoThumbnail(downloadURL);
      }

      await addDoc(collection(db, COLLECTIONS.MEDIA), {
        ...mediaData,
        id: mediaId
      });

      return { success: true, url: downloadURL, mediaId };
    } catch (error) {
      console.error('Error uploading media:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Delete media file
   */
  static async deleteMedia(mediaId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get media document
      const mediaDoc = await getDoc(doc(db, COLLECTIONS.MEDIA, mediaId));
      if (!mediaDoc.exists()) {
        return { success: false, error: 'Media not found' };
      }

      const media = mediaDoc.data() as CourseMedia;
      
      // Delete from Storage
      const storageRef = ref(storage, media.url);
      await deleteObject(storageRef);

      // Delete from Firestore
      await deleteDoc(doc(db, COLLECTIONS.MEDIA, mediaId));

      return { success: true };
    } catch (error) {
      console.error('Error deleting media:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get course media files
   */
  static async getCourseMedia(courseId: string): Promise<CourseMedia[]> {
    try {
      const mediaQuery = query(
        collection(db, COLLECTIONS.MEDIA),
        where('courseId', '==', courseId),
        orderBy('uploadedAt', 'desc')
      );

      const snapshot = await getDocs(mediaQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as CourseMedia[];
    } catch (error) {
      console.error('Error getting course media:', error);
      return [];
    }
  }

  // Helper Methods
  private static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private static getMediaType(mimeType: string): CourseMedia['type'] {
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'document';
  }

  private static isVideoFile(mimeType: string): boolean {
    return mimeType.startsWith('video/');
  }

  private static async generateVideoThumbnail(videoUrl: string): Promise<string> {
    // This would typically be handled by a cloud function
    // For now, return a placeholder
    return '/api/placeholder/video-thumbnail';
  }

  private static async deleteAllCourseMedia(courseId: string): Promise<void> {
    try {
      const mediaFiles = await this.getCourseMedia(courseId);
      const deletePromises = mediaFiles.map(media => this.deleteMedia(media.id));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error deleting course media:', error);
    }
  }
}

// Category Management
export class CategoryService {
  /**
   * Get all categories
   */
  static async getCategories(): Promise<CourseCategory[]> {
    try {
      const categoriesQuery = query(
        collection(db, COLLECTIONS.CATEGORIES),
        where('isActive', '==', true),
        orderBy('sortOrder', 'asc')
      );

      const snapshot = await getDocs(categoriesQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as CourseCategory[];
    } catch (error) {
      console.error('Error getting categories:', error);
      return [];
    }
  }

  /**
   * Create new category
   */
  static async createCategory(data: Omit<CourseCategory, 'id' | 'createdAt' | 'updatedAt' | 'courseCount'>): Promise<{ success: boolean; categoryId?: string; error?: string }> {
    try {
      const categoryData = {
        ...data,
        courseCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, COLLECTIONS.CATEGORIES), categoryData);
      return { success: true, categoryId: docRef.id };
    } catch (error) {
      console.error('Error creating category:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Update category
   */
  static async updateCategory(categoryId: string, data: Partial<CourseCategory>): Promise<{ success: boolean; error?: string }> {
    try {
      await updateDoc(doc(db, COLLECTIONS.CATEGORIES, categoryId), {
        ...data,
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating category:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Update course count for category
   */
  static async updateCategoryCount(categoryId: string, incrementValue: number): Promise<void> {
    try {
      await updateDoc(doc(db, COLLECTIONS.CATEGORIES, categoryId), {
        courseCount: firestoreIncrement(incrementValue)
      });
    } catch (error) {
      console.error('Error updating category count:', error);
    }
  }
}
