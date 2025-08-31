'use client';

import ProtectedRoute from '@/components/common/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

// Simple demo course page
interface SimpleCourse {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  level: string;
  price: string;
  image?: string;
  lessons: SimpleLesson[];
}

interface SimpleLesson {
  id: string;
  title: string;
  duration: string;
  isLocked: boolean;
  isCompleted: boolean;
}

const CoursePage = () => {
  const params = useParams();
  const { userProfile } = useAuth();
  const courseId = params?.id as string;
  const [course, setCourse] = useState<SimpleCourse | null>(null);
  const [currentLesson, setCurrentLesson] = useState<SimpleLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    // Mock course data with lessons
    const mockLessons: SimpleLesson[] = [
      {
        id: '1',
        title: 'Giới thiệu',
        duration: '01:46',
        isLocked: false,
        isCompleted: true
      },
      {
        id: '2',
        title: 'IIFE là gì?',
        duration: '23:57',
        isLocked: false,
        isCompleted: false
      },
      {
        id: '3',
        title: 'Scope là gì?',
        duration: '36:27',
        isLocked: !isEnrolled,
        isCompleted: false
      },
      {
        id: '4',
        title: 'Closure nâng cao',
        duration: '45:12',
        isLocked: !isEnrolled,
        isCompleted: false
      }
    ];

    const mockCourse: SimpleCourse = {
      id: courseId,
      title: 'Lập Trình JavaScript Nâng Cao',
      description: 'Khóa học JavaScript nâng cao với các chủ đề chuyên sâu về IIFE, Scope, Closure và các pattern quan trọng.',
      instructor: 'Sơn Đặng',
      duration: '40 giờ',
      level: 'Nâng cao',
      price: isEnrolled ? 'Đã mua' : '999.000đ',
      image: '/api/placeholder/600/400',
      lessons: mockLessons
    };

    setCourse(mockCourse);
    setCurrentLesson(mockLessons[0]);
    // Simulate enrollment check
    setIsEnrolled(userProfile?.role === 'admin' || Math.random() > 0.5);
    setLoading(false);
  }, [courseId, userProfile, isEnrolled]);

  const handleEnroll = () => {
    setIsEnrolled(true);
    // Update lessons to unlock them
    if (course) {
      const updatedLessons = course.lessons.map(lesson => ({
        ...lesson,
        isLocked: false
      }));
      setCourse({ ...course, lessons: updatedLessons, price: 'Đã mua' });
    }
  };

  const handleLessonClick = (lesson: SimpleLesson) => {
    if (!lesson.isLocked) {
      setCurrentLesson(lesson);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Không tìm thấy khóa học
          </h2>
          <p className="text-gray-600">
            Khóa học bạn đang tìm không tồn tại hoặc đã bị xóa.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Course Header */}
        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div className="px-6 py-8">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <Link 
                  href="/course" 
                  className="text-green-600 hover:text-green-700 text-sm font-medium mb-2 inline-block"
                >
                  ← Quay lại danh sách khóa học
                </Link>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {course.title}
                </h1>
                <p className="text-gray-600 mb-6">
                  {course.description}
                </p>
              </div>
              
              {!isEnrolled && (
                <div className="ml-6">
                  <Button onClick={handleEnroll} className="bg-green-600 hover:bg-green-700">
                    Đăng ký ngay - {course.price}
                  </Button>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900">Giảng viên</h3>
                <p className="text-gray-600">{course.instructor}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900">Thời lượng</h3>
                <p className="text-gray-600">{course.duration}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900">Cấp độ</h3>
                <p className="text-gray-600">{course.level}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900">Trạng thái</h3>
                <p className={`font-semibold ${isEnrolled ? 'text-green-600' : 'text-orange-600'}`}>
                  {isEnrolled ? 'Đã đăng ký' : 'Chưa đăng ký'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Course Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lesson List */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Danh sách bài học ({course.lessons.length} bài)
                </h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {course.lessons.map((lesson, index) => (
                  <div
                    key={lesson.id}
                    onClick={() => handleLessonClick(lesson)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      currentLesson?.id === lesson.id ? 'bg-green-50 border-r-2 border-green-500' : ''
                    } ${lesson.isLocked ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {lesson.isCompleted ? (
                          <span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </span>
                        ) : lesson.isLocked ? (
                          <span className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                          </span>
                        ) : (
                          <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                            {index + 1}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${lesson.isLocked ? 'text-gray-400' : 'text-gray-900'}`}>
                          {lesson.title}
                        </p>
                        <p className="text-xs text-gray-500">{lesson.duration}</p>
                      </div>

                      {lesson.isLocked && (
                        <div className="flex-shrink-0">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            Premium
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Current Lesson Display */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              {currentLesson ? (
                <>
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {currentLesson.title}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Thời lượng: {currentLesson.duration}
                    </p>
                  </div>
                  
                  <div className="p-6">
                    {currentLesson.isLocked ? (
                      <div className="text-center py-12">
                        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-10 h-10 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Nội dung Premium
                        </h3>
                        <p className="text-gray-600 mb-6">
                          Bạn cần đăng ký khóa học để xem nội dung này.
                        </p>
                        <Button onClick={handleEnroll} className="bg-green-600 hover:bg-green-700">
                          Đăng ký ngay - {course.price}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Video Player Placeholder */}
                        <div className="aspect-w-16 aspect-h-9 bg-gray-900 rounded-lg flex items-center justify-center">
                          <div className="text-white text-center">
                            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <p className="text-lg font-medium">Video: {currentLesson.title}</p>
                            <p className="text-sm opacity-75">Thời lượng: {currentLesson.duration}</p>
                          </div>
                        </div>

                        {/* Lesson Description */}
                        <div className="prose max-w-none">
                          <h3>Nội dung bài học</h3>
                          <p>
                            Trong bài học này, bạn sẽ tìm hiểu về <strong>{currentLesson.title}</strong> - 
                            một khái niệm quan trọng trong JavaScript. Chúng ta sẽ đi sâu vào các ví dụ thực tế 
                            và ứng dụng trong dự án thực tế.
                          </p>
                          
                          <h4>Bạn sẽ học được:</h4>
                          <ul>
                            <li>Khái niệm cơ bản và định nghĩa</li>
                            <li>Cách sử dụng trong thực tế</li>
                            <li>Best practices và common pitfalls</li>
                            <li>Ví dụ code thực tế</li>
                          </ul>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                          <Button
                            variant="outline"
                            onClick={() => {
                              const currentIndex = course.lessons.findIndex(l => l.id === currentLesson.id);
                              if (currentIndex > 0) {
                                const prevLesson = course.lessons[currentIndex - 1];
                                if (!prevLesson.isLocked) {
                                  setCurrentLesson(prevLesson);
                                }
                              }
                            }}
                            disabled={course.lessons.findIndex(l => l.id === currentLesson.id) === 0}
                          >
                            ← Bài trước
                          </Button>

                          <div className="text-center">
                            <p className="text-sm text-gray-500">
                              Bài {course.lessons.findIndex(l => l.id === currentLesson.id) + 1} / {course.lessons.length}
                            </p>
                          </div>

                          <Button
                            onClick={() => {
                              const currentIndex = course.lessons.findIndex(l => l.id === currentLesson.id);
                              if (currentIndex < course.lessons.length - 1) {
                                const nextLesson = course.lessons[currentIndex + 1];
                                if (!nextLesson.isLocked) {
                                  setCurrentLesson(nextLesson);
                                }
                              }
                            }}
                            disabled={
                              course.lessons.findIndex(l => l.id === currentLesson.id) === course.lessons.length - 1 ||
                              course.lessons[course.lessons.findIndex(l => l.id === currentLesson.id) + 1]?.isLocked
                            }
                          >
                            Bài tiếp theo →
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="p-6 text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Chọn một bài học để bắt đầu
                  </h3>
                  <p className="text-gray-600">
                    Hãy chọn một bài học từ danh sách bên trái để xem nội dung.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Course Stats */}
        <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              🎉 Demo Course Page hoạt động thành công!
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-green-50 p-3 rounded">
                <span className="font-medium text-green-800">✅ Authentication:</span>
                <span className="text-green-700 ml-1">
                  {userProfile ? `Đăng nhập như ${userProfile.displayName}` : 'Chưa đăng nhập'}
                </span>
              </div>
              <div className="bg-blue-50 p-3 rounded">
                <span className="font-medium text-blue-800">📚 Course System:</span>
                <span className="text-blue-700 ml-1">Dynamic course loading</span>
              </div>
              <div className="bg-purple-50 p-3 rounded">
                <span className="font-medium text-purple-800">🔐 Premium Content:</span>
                <span className="text-purple-700 ml-1">Enrollment-based access</span>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default CoursePage;
