'use client';

import { ROUTES } from '@/constants/app';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '../ui/Button';

export default function MainNavigation() {
  const { isAuthenticated, userProfile, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Don't show navigation on auth pages
  const authPages = [ROUTES.LOGIN, ROUTES.REGISTER, ROUTES.VERIFY_EMAIL];
  if (authPages.some(authPage => pathname === authPage)) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/courses'); // Redirect to public courses page
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const NavLink = ({ href, children, className = '' }: { 
    href: string; 
    children: React.ReactNode; 
    className?: string;
  }) => {
    const isActive = pathname === href || pathname.startsWith(href + '/');
    return (
      <Link
        href={href}
        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          isActive 
            ? 'bg-green-100 text-green-800' 
            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
        } ${className}`}
      >
        {children}
      </Link>
    );
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-green-600">🌱 Vegana</span>
            </Link>

            {/* Main Navigation */}
            <div className="hidden md:flex space-x-4">
              <NavLink href="/courses">Khóa học</NavLink>
              
              {isAuthenticated && (
                <>
                  <NavLink href="/dashboard">Bảng điều khiển</NavLink>
                  <NavLink href="/certificates">Chứng chỉ</NavLink>
                  <NavLink href="/payment/history">Thanh toán</NavLink>
                  {userProfile?.role === 'admin' && (
                    <>
                      <NavLink href="/admin">Quản trị</NavLink>
                      <NavLink href="/admin/users">Quản lý người dùng</NavLink>
                      <NavLink href="/admin/chat">Hỗ trợ khách hàng</NavLink>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  Xin chào, <strong>{userProfile?.displayName}</strong>
                </span>
                <div className="flex items-center space-x-2">
                  <NavLink href="/profile" className="!px-3 !py-2">
                    Hồ sơ
                  </NavLink>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    size="sm"
                    className="text-sm"
                  >
                    Đăng xuất
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href={ROUTES.LOGIN}
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Đăng nhập
                </Link>
                <Link href={ROUTES.REGISTER}>
                  <Button size="sm">
                    Đăng ký
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-3">
          <div className="flex flex-wrap gap-2">
            <NavLink href="/course">Khóa học</NavLink>
            
            {isAuthenticated && (
              <>
                <NavLink href="/dashboard">Bảng điều khiển</NavLink>
                {userProfile?.role === 'admin' && (
                  <NavLink href="/admin">Quản trị</NavLink>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
