'use client';

import { useEffect, useState } from 'react';
import { Course, CourseCategory } from '../../types/course';
import {
    createCourse,
    deleteCourse,
    getAllCourses,
    getCourseCategories,
    updateCourse
} from '../../utils/course/courseUtils';

interface CourseFormData {
  title: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  originalPrice?: number;
  currency: string;
  duration: number;
  language: string;
  requirements: string[];
  whatYoullLearn: string[];
  tags: string[];
}

type ArrayFieldType = 'requirements' | 'whatYoullLearn' | 'tags';

const CourseManagement = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    description: '',
    category: '',
    level: 'beginner',
    price: 0,
    currency: 'VND',
    duration: 0,
    language: 'vi',
    requirements: [''],
    whatYoullLearn: [''],
    tags: ['']
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [coursesData, categoriesData] = await Promise.all([
        getAllCourses({ status: 'all' }), // Load all courses for admin
        getCourseCategories()
      ]);
      setCourses(coursesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const courseData = {
        ...formData,
        instructorId: 'current-user-id', // Replace with actual user ID
        instructorName: 'Current User', // Replace with actual user name
        thumbnail: '',
        status: 'draft' as const,
        totalLessons: 0,
        totalStudents: 0,
        rating: 0,
        reviewCount: 0,
        slug: formData.title.toLowerCase().replace(/\s+/g, '-'),
        requirements: formData.requirements.filter(r => r.trim()),
        whatYoullLearn: formData.whatYoullLearn.filter(w => w.trim()),
        tags: formData.tags.filter(t => t.trim()),
        lastModified: new Date().toISOString()
      };

      await createCourse(courseData);
      await loadData();
      setShowCreateModal(false);
      resetForm();
      alert('Khóa học đã được tạo thành công!');
    } catch (error) {
      console.error('Error creating course:', error);
      alert('Có lỗi xảy ra khi tạo khóa học');
    }
  };

  const handleUpdateCourse = async (courseId: string, updates: Partial<Course>) => {
    try {
      await updateCourse(courseId, updates);
      await loadData();
      alert('Khóa học đã được cập nhật!');
    } catch (error) {
      console.error('Error updating course:', error);
      alert('Có lỗi xảy ra khi cập nhật khóa học');
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa khóa học này?')) {
      try {
        await deleteCourse(courseId);
        await loadData();
        alert('Khóa học đã được xóa!');
      } catch (error) {
        console.error('Error deleting course:', error);
        alert('Có lỗi xảy ra khi xóa khóa học');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      level: 'beginner',
      price: 0,
      currency: 'VND',
      duration: 0,
      language: 'vi',
      requirements: [''],
      whatYoullLearn: [''],
      tags: ['']
    });
    setEditingCourse(null);
  };

  const addArrayField = (field: ArrayFieldType) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const updateArrayField = (field: ArrayFieldType, index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const removeArrayField = (field: ArrayFieldType, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý Khóa học</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Tạo khóa học mới
        </button>
      </div>

      {/* Course List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Danh sách khóa học</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khóa học
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Danh mục
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Học viên
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giá
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {courses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-16 w-24 bg-gray-200 rounded-md mr-4">
                        {course.thumbnail && (
                          <img 
                            src={course.thumbnail} 
                            alt={course.title}
                            className="h-full w-full object-cover rounded-md"
                          />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{course.title}</div>
                        <div className="text-sm text-gray-500">{course.instructorName}</div>
                        <div className="text-xs text-gray-400">{course.level}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {course.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      course.status === 'published' 
                        ? 'bg-green-100 text-green-800'
                        : course.status === 'draft'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {course.status === 'published' ? 'Đã xuất bản' : 
                       course.status === 'draft' ? 'Bản nháp' : 'Lưu trữ'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {course.totalStudents}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {course.price === 0 ? 'Miễn phí' : `${course.price.toLocaleString()} ${course.currency}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button 
                      onClick={() => setEditingCourse(course)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Sửa
                    </button>
                    <button 
                      onClick={() => handleUpdateCourse(course.id, { 
                        status: course.status === 'published' ? 'draft' : 'published' 
                      })}
                      className="text-green-600 hover:text-green-900"
                    >
                      {course.status === 'published' ? 'Ẩn' : 'Xuất bản'}
                    </button>
                    <button 
                      onClick={() => handleDeleteCourse(course.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingCourse) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">
                {editingCourse ? 'Chỉnh sửa khóa học' : 'Tạo khóa học mới'}
              </h2>
            </div>
            
            <form onSubmit={handleCreateCourse} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên khóa học *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Danh mục *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cấp độ
                  </label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      level: e.target.value as 'beginner' | 'intermediate' | 'advanced'
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="beginner">Cơ bản</option>
                    <option value="intermediate">Trung cấp</option>
                    <option value="advanced">Nâng cao</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giá (VND)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thời lượng (phút)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Dynamic Array Fields */}
              {['requirements', 'whatYoullLearn', 'tags'].map((field) => {
                const fieldName = field as ArrayFieldType;
                const fieldData = formData[fieldName];
                return (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field === 'requirements' ? 'Yêu cầu' : 
                       field === 'whatYoullLearn' ? 'Học viên sẽ được gì' : 'Tags'}
                    </label>
                    {fieldData.map((item: string, index: number) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => updateArrayField(fieldName, index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={`${field === 'requirements' ? 'Yêu cầu' : 
                                       field === 'whatYoullLearn' ? 'Kết quả học tập' : 'Tag'} ${index + 1}`}
                        />
                        {fieldData.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayField(fieldName, index)}
                            className="px-3 py-2 text-red-600 hover:text-red-800"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayField(fieldName)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      + Thêm {field === 'requirements' ? 'yêu cầu' : 
                              field === 'whatYoullLearn' ? 'kết quả' : 'tag'}
                    </button>
                  </div>
                );
              })}

              <div className="flex justify-end space-x-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingCourse(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingCourse ? 'Cập nhật' : 'Tạo khóa học'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;
