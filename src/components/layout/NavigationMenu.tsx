'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NavigationMenu = () => {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-blue-600';
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Home */}
          <Link href="/" className="text-xl font-bold text-blue-600">
            Vegana Learning
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            <Link 
              href="/home" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/home')}`}
            >
              Trang chủ
            </Link>
            
            <Link 
              href="/courses" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/courses')}`}
            >
              Khóa học
            </Link>

            <Link 
              href="/dashboard" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/dashboard')}`}
            >
              Dashboard
            </Link>

            <Link 
              href="/profile" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/profile')}`}
            >
              Hồ sơ
            </Link>

            {/* Admin Links */}
            <div className="relative group">
              <button className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-blue-600 flex items-center">
                Quản trị
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <Link 
                  href="/admin" 
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Tổng quan
                </Link>
                <Link 
                  href="/admin/users" 
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Quản lý người dùng
                </Link>
                <Link 
                  href="/admin/videos" 
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Quản lý video
                </Link>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Link 
                href="/login" 
                className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Đăng nhập
              </Link>
              <Link 
                href="/register" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Đăng ký
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavigationMenu;
