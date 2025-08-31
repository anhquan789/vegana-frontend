'use client';

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
}

const CoursePage = () => {
  const params = useParams();
  const courseId = params?.id as string;
  const [course, setCourse] = useState<SimpleCourse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock course data
    const mockCourse: SimpleCourse = {
      id: courseId,
      title: 'Lập Trình JavaScript Nâng Cao',
      description: 'Khóa học JavaScript nâng cao với các chủ đề chuyên sâu',
      instructor: 'Sơn Đặng',
      duration: '40 giờ',
      level: 'Nâng cao',
      price: 'Miễn phí'
    };

    setCourse(mockCourse);
    setLoading(false);
  }, [courseId]);

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {course.title}
            </h1>
            <p className="text-gray-600 mb-6">
              {course.description}
            </p>
            
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
                <h3 className="font-medium text-gray-900">Giá</h3>
                <p className="text-green-600 font-semibold">{course.price}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Nội dung khóa học
            </h2>
          </div>
          
          <div className="p-6">
            <p className="text-gray-600 mb-4">
              Đây là trang demo cho khóa học. Trong phiên bản thực tế, đây sẽ là danh sách các bài học chi tiết.
            </p>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-green-800 mb-2">
                🎉 Hệ thống xác thực hoạt động thành công!
              </h3>
              <p className="text-green-700">
                Bạn đã đăng nhập và có thể truy cập vào các trang được bảo vệ như trang này.
                Hệ thống Firebase Authentication, Firestore và các components UI đã được thiết lập hoàn chỉnh.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePage;
