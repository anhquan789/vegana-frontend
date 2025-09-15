import { db } from '@/lib/firebase';
import { Course, CourseFilters, CourseSortOptions, CourseSearchResult } from '@/types/course';
import {
  collection,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  startAfter,
  getDocs,
  DocumentSnapshot
} from 'firebase/firestore';

export class SearchService {
  /**
   * Advanced course search with multiple filters
   */
  static async searchCourses(
    searchTerm: string = '',
    filters: CourseFilters = {},
    sort: CourseSortOptions = { field: 'createdAt', direction: 'desc' },
    page: number = 1,
    pageSize: number = 12,
    lastDoc?: DocumentSnapshot
  ): Promise<CourseSearchResult> {
    try {
      let coursesQuery = collection(db, 'courses');
      const queryConstraints = [];

      // Text search (simplified - in production use Algolia or similar)
      if (searchTerm) {
        // Firestore doesn't support full-text search, so we'll search by title
        // For better search, implement Algolia or use Cloud Functions
        queryConstraints.push(
          where('title', '>=', searchTerm),
          where('title', '<=', searchTerm + '\uf8ff')
        );
      }

      // Category filter
      if (filters.category) {
        queryConstraints.push(where('categoryId', '==', filters.category));
      }

      // Level filter
      if (filters.level) {
        queryConstraints.push(where('metadata.level', '==', filters.level));
      }

      // Price filter
      if (filters.price === 'free') {
        queryConstraints.push(where('price', '==', 0));
      } else if (filters.price === 'paid') {
        queryConstraints.push(where('price', '>', 0));
      }

      // Rating filter
      if (filters.rating) {
        queryConstraints.push(where('rating', '>=', filters.rating));
      }

      // Language filter
      if (filters.language) {
        queryConstraints.push(where('metadata.language', '==', filters.language));
      }

      // Instructor filter
      if (filters.instructor) {
        queryConstraints.push(where('instructorId', '==', filters.instructor));
      }

      // Only published courses
      queryConstraints.push(where('status', '==', 'published'));

      // Sorting
      queryConstraints.push(orderBy(sort.field, sort.direction));

      // Pagination
      if (lastDoc) {
        queryConstraints.push(startAfter(lastDoc));
      }
      queryConstraints.push(firestoreLimit(pageSize));

      // Execute query
      const finalQuery = query(coursesQuery, ...queryConstraints);
      const snapshot = await getDocs(finalQuery);

      const courses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Course[];

      // Get total count (simplified)
      const countQuery = query(
        collection(db, 'courses'),
        where('status', '==', 'published')
      );
      const countSnapshot = await getDocs(countQuery);
      const total = countSnapshot.size;

      return {
        courses,
        total,
        page,
        limit: pageSize,
        filters,
        sort
      };
    } catch (error) {
      console.error('Error searching courses:', error);
      return {
        courses: [],
        total: 0,
        page,
        limit: pageSize,
        filters,
        sort
      };
    }
  }

  /**
   * Get popular courses
   */
  static async getPopularCourses(limitCount: number = 10): Promise<Course[]> {
    try {
      const q = query(
        collection(db, 'courses'),
        where('status', '==', 'published'),
        orderBy('enrollmentCount', 'desc'),
        firestoreLimit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Course[];
    } catch (error) {
      console.error('Error getting popular courses:', error);
      return [];
    }
  }

  /**
   * Get featured courses
   */
  static async getFeaturedCourses(limitCount: number = 6): Promise<Course[]> {
    try {
      const q = query(
        collection(db, 'courses'),
        where('status', '==', 'published'),
        where('isPromoted', '==', true),
        orderBy('createdAt', 'desc'),
        firestoreLimit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Course[];
    } catch (error) {
      console.error('Error getting featured courses:', error);
      return [];
    }
  }

  /**
   * Get courses by category
   */
  static async getCoursesByCategory(categoryId: string, limitCount: number = 12): Promise<Course[]> {
    try {
      const q = query(
        collection(db, 'courses'),
        where('categoryId', '==', categoryId),
        where('status', '==', 'published'),
        orderBy('rating', 'desc'),
        firestoreLimit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Course[];
    } catch (error) {
      console.error('Error getting courses by category:', error);
      return [];
    }
  }

  /**
   * Get courses by instructor
   */
  static async getCoursesByInstructor(instructorId: string): Promise<Course[]> {
    try {
      const q = query(
        collection(db, 'courses'),
        where('instructorId', '==', instructorId),
        where('status', '==', 'published'),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Course[];
    } catch (error) {
      console.error('Error getting courses by instructor:', error);
      return [];
    }
  }

  /**
   * Search suggestions based on partial text
   */
  static async getSearchSuggestions(partialText: string, limitCount: number = 5): Promise<string[]> {
    try {
      // Simple implementation - in production use dedicated search service
      const q = query(
        collection(db, 'courses'),
        where('status', '==', 'published'),
        where('title', '>=', partialText),
        where('title', '<=', partialText + '\uf8ff'),
        firestoreLimit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data().title);
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      return [];
    }
  }

  /**
   * Get similar courses (based on category and tags)
   */
  static async getSimilarCourses(courseId: string, limitCount: number = 6): Promise<Course[]> {
    try {
      // Get the reference course
      const courseDoc = await getDocs(query(
        collection(db, 'courses'),
        where('id', '==', courseId)
      ));

      if (courseDoc.empty) return [];

      const course = courseDoc.docs[0].data() as Course;

      // Find courses in same category
      const q = query(
        collection(db, 'courses'),
        where('categoryId', '==', course.categoryId),
        where('status', '==', 'published'),
        where('id', '!=', courseId),
        orderBy('rating', 'desc'),
        firestoreLimit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Course[];
    } catch (error) {
      console.error('Error getting similar courses:', error);
      return [];
    }
  }

  /**
   * Advanced filter combinations
   */
  static buildAdvancedQuery(filters: CourseFilters) {
    const queryConstraints = [];

    // Multiple category filter
    if (filters.category) {
      queryConstraints.push(where('categoryId', '==', filters.category));
    }

    // Price range filter
    if (filters.price === 'free') {
      queryConstraints.push(where('price', '==', 0));
    } else if (filters.price === 'paid') {
      queryConstraints.push(where('price', '>', 0));
    }

    // Level filter
    if (filters.level) {
      queryConstraints.push(where('metadata.level', '==', filters.level));
    }

    // Language filter
    if (filters.language) {
      queryConstraints.push(where('metadata.language', '==', filters.language));
    }

    // Duration filter (in metadata)
    if (filters.duration) {
      const [min, max] = filters.duration.split('-').map(Number);
      if (min) queryConstraints.push(where('metadata.duration', '>=', min));
      if (max) queryConstraints.push(where('metadata.duration', '<=', max));
    }

    // Rating filter
    if (filters.rating) {
      queryConstraints.push(where('rating', '>=', filters.rating));
    }

    // Only published courses
    queryConstraints.push(where('status', '==', 'published'));

    return queryConstraints;
  }
}

// Indexed query helpers for better performance
export class IndexedSearchService {
  /**
   * Create composite indexes for common query patterns
   */
  static getIndexedQueries() {
    return {
      // Category + Level + Status
      categoryLevelStatus: ['categoryId', 'metadata.level', 'status'],
      
      // Price + Rating + Status
      priceRatingStatus: ['price', 'rating', 'status'],
      
      // Language + Level + Status  
      languageLevelStatus: ['metadata.language', 'metadata.level', 'status'],
      
      // Instructor + Status + Created
      instructorStatusCreated: ['instructorId', 'status', 'createdAt'],
      
      // Category + Status + Rating
      categoryStatusRating: ['categoryId', 'status', 'rating'],
      
      // Status + Promoted + Created
      statusPromotedCreated: ['status', 'isPromoted', 'createdAt']
    };
  }

  /**
   * Optimized query for category + level filtering
   */
  static async searchByCategoryAndLevel(
    categoryId: string,
    level: string,
    pageSize: number = 12
  ): Promise<Course[]> {
    try {
      const q = query(
        collection(db, 'courses'),
        where('categoryId', '==', categoryId),
        where('metadata.level', '==', level),
        where('status', '==', 'published'),
        orderBy('rating', 'desc'),
        firestoreLimit(pageSize)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Course[];
    } catch (error) {
      console.error('Error in optimized category/level search:', error);
      return [];
    }
  }

  /**
   * Optimized query for price range filtering
   */
  static async searchByPriceRange(
    minPrice: number,
    maxPrice: number,
    pageSize: number = 12
  ): Promise<Course[]> {
    try {
      const q = query(
        collection(db, 'courses'),
        where('price', '>=', minPrice),
        where('price', '<=', maxPrice),
        where('status', '==', 'published'),
        orderBy('price', 'asc'),
        firestoreLimit(pageSize)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Course[];
    } catch (error) {
      console.error('Error in price range search:', error);
      return [];
    }
  }
}

// Real-time search helpers
export class RealtimeSearchService {
  /**
   * Subscribe to search results with real-time updates
   */
  static subscribeToSearch(
    filters: CourseFilters,
    callback: (courses: Course[]) => void
  ) {
    const q = query(
      collection(db, 'courses'),
      where('status', '==', 'published'),
      orderBy('updatedAt', 'desc'),
      firestoreLimit(20)
    );

    return getDocs(q).then(snapshot => {
      const courses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Course[];
      callback(courses);
    });
  }

  /**
   * Subscribe to popular courses updates
   */
  static subscribeToPopularCourses(callback: (courses: Course[]) => void) {
    const q = query(
      collection(db, 'courses'),
      where('status', '==', 'published'),
      orderBy('enrollmentCount', 'desc'),
      firestoreLimit(10)
    );

    return getDocs(q).then(snapshot => {
      const courses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Course[];
      callback(courses);
    });
  }
}
