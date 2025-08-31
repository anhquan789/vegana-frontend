import Link from 'next/link';
import React from 'react';

export interface CourseCardProps {
  title: string;
  description: string;
  price: string;
  oldPrice?: string;
  time: string;
  students: number;
  author: string;
  color: string;
  isNew?: boolean;
  slug: string; // Add slug for routing
}

const CourseCard: React.FC<CourseCardProps> = ({ title, description, price, oldPrice, time, students, author, color, isNew, slug }) => {
  const colorClasses = {
    blue: 'border-l-4 border-l-blue-500',
    yellow: 'border-l-4 border-l-yellow-500', 
    pink: 'border-l-4 border-l-pink-500',
  };

  return (
    <Link href={`/course/${slug}`} className="block no-underline text-inherit transition-transform hover:-translate-y-1">
      <div className={`
        rounded-2xl bg-white shadow-sm hover:shadow-lg transition-shadow
        p-8 min-w-80 max-w-80 flex-1 flex flex-col gap-3 relative
        ${colorClasses[color as keyof typeof colorClasses] || ''}
      `}>
        <div className="flex items-center mb-2">
          <span className="text-xl font-bold text-gray-800">
            {title} {isNew && <span className="bg-orange-500 text-white text-xs font-semibold rounded-md px-2 py-1 ml-2">MỚI</span>}
          </span>
        </div>
        <div className="text-base text-gray-600 mb-2">{description}</div>
        <div className="flex items-center gap-3 mb-2">
          {oldPrice && <span className="text-gray-400 line-through text-sm">{oldPrice}</span>}
          <span className="text-orange-500 text-lg font-bold">{price}</span>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{author}</span>
          <span>{students} học viên</span>
          <span>{time}</span>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
