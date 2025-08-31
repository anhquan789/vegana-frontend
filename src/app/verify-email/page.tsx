'use client';

import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/constants/app';
import { useAuth } from '@/contexts/AuthContext';
import { getPostLoginRedirect } from '@/utils/navigation';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function VerifyEmailPage() {
  const { user, userProfile, isEmailVerified, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Auto redirect when email is verified
  useEffect(() => {
    if (!authLoading && isEmailVerified && userProfile) {
      // Email is verified, redirect to appropriate page
      const redirectUrl = getPostLoginRedirect(userProfile, isEmailVerified);
      setTimeout(() => {
        router.push(redirectUrl);
      }, 1000); // Small delay to show success message
    }
  }, [isEmailVerified, userProfile, authLoading, router]);

  // Refresh auth state every 5 seconds to check for email verification
  useEffect(() => {
    const interval = setInterval(async () => {
      if (user && !isEmailVerified) {
        try {
          await user.reload(); // Refresh user data from Firebase
        } catch (error) {
          console.error('Error refreshing user:', error);
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [user, isEmailVerified]);

  const handleResendEmail = async () => {
    if (!user) return;
    
    setIsResending(true);
    setMessage(null);
    
    try {
      // Import Firebase functions dynamically
      const { sendEmailVerification } = await import('firebase/auth');
      await sendEmailVerification(user);
      setMessage('Email xác thực đã được gửi lại thành công!');
    } catch (error) {
      console.error('Resend email error:', error);
      setMessage('Có lỗi xảy ra khi gửi email xác thực. Vui lòng thử lại.');
    } finally {
      setIsResending(false);
    }
  };

  // Show success message if email is verified
  if (!authLoading && isEmailVerified) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              </div>
              <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                Email đã được xác thực!
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                Email của bạn đã được xác thực thành công. Đang chuyển hướng...
              </p>
            </div>
            
            <div className="mt-6">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
              <svg
                className="h-6 w-6 text-yellow-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 21.75 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                />
              </svg>
            </div>
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
              Xác thực email
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Chúng tôi đã gửi email xác thực đến địa chỉ:
            </p>
            <p className="mt-1 text-center text-sm font-medium text-gray-900">
              {user?.email}
            </p>
          </div>
          
          <div className="mt-6 space-y-4">
            <p className="text-sm text-gray-600 text-center">
              Vui lòng kiểm tra email và nhấn vào link xác thực để hoàn tất đăng ký.
            </p>
            
            {message && (
              <div className={`rounded-md p-4 ${
                message.includes('thành công') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                <div className="text-sm">{message}</div>
              </div>
            )}
            
            <div className="space-y-3">
              <Button
                onClick={handleResendEmail}
                loading={isResending}
                disabled={isResending}
                variant="outline"
                className="w-full"
              >
                Gửi lại email xác thực
              </Button>
              
              <Button
                onClick={() => {
                  const redirectUrl = getPostLoginRedirect(userProfile, false, true); // Skip email verification
                  router.push(redirectUrl);
                }}
                variant="secondary"
                className="w-full"
              >
                Bỏ qua và tiếp tục
              </Button>
              
              <Button
                onClick={() => router.push(ROUTES.DASHBOARD)}
                variant="outline"
                className="w-full"
              >
                Quay lại Dashboard
              </Button>
              
              <Link
                href={ROUTES.LOGIN}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Đã xác thực? Đăng nhập
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
