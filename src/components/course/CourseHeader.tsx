'use client';

import Link from 'next/link';

interface Course {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  isLocked: boolean;
}

interface CourseHeaderProps {
  course: Course;
  currentLesson: Lesson | null;
}

const CourseHeader: React.FC<CourseHeaderProps> = ({ course, currentLesson }) => {
  const completedLessons = course.lessons.filter(lesson => !lesson.isLocked).length;
  const totalLessons = course.lessons.length;
  const progressPercentage = Math.round((completedLessons / totalLessons) * 100);
  
  const currentLessonIndex = currentLesson 
    ? course.lessons.findIndex(lesson => lesson.id === currentLesson.id) + 1
    : 1;

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
      <div className="flex items-center gap-4">
        <Link href="/" className="text-2xl font-bold text-gray-600 hover:text-gray-800 transition-colors">
          {'<'}
        </Link>
        <span className="bg-orange-500 text-white px-3 py-1 rounded-full font-bold text-lg">F8</span>
        <span className="font-semibold text-gray-800 text-lg">{course.title}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-gray-600">
          {progressPercentage}% | {currentLessonIndex}/{totalLessons} bài học
        </span>
        <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
          Ghi chú
        </button>
        <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
          Hướng dẫn
        </button>
      </div>
    </header>
  );
};

export default CourseHeader;
