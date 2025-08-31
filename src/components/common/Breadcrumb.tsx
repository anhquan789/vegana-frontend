'use client';

import { ROUTES } from '@/constants/app';
import { getRouteDisplayName } from '@/utils/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Breadcrumb() {
  const pathname = usePathname();

  // Don't show breadcrumb on auth pages and home
  const skipPages = [ROUTES.HOME, ROUTES.LOGIN, ROUTES.REGISTER, ROUTES.VERIFY_EMAIL];
  if (skipPages.some(page => pathname === page)) {
    return null;
  }

  // Generate breadcrumb items
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbItems = [];

  // Always add home
  breadcrumbItems.push({
    label: 'Trang chủ',
    href: '/',
    isLast: false
  });

  // Add path segments
  let currentPath = '';
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === pathSegments.length - 1;
    
    // Get display name for the segment
    let label = getRouteDisplayName(currentPath);
    if (label === 'Trang không xác định') {
      // Fallback to segment name with proper formatting
      label = segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' ');
    }

    breadcrumbItems.push({
      label,
      href: currentPath,
      isLast
    });
  });

  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <nav className="bg-gray-50 border-b border-gray-200" aria-label="Breadcrumb">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center py-3">
          <ol className="flex items-center space-x-2 text-sm">
            {breadcrumbItems.map((item, index) => (
              <li key={item.href} className="flex items-center">
                {index > 0 && (
                  <svg
                    className="w-4 h-4 mx-2 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                )}
                {item.isLast ? (
                  <span className="text-gray-500 font-medium">{item.label}</span>
                ) : (
                  <Link
                    href={item.href}
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </nav>
  );
}
