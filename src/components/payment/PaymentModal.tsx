'use client';

import { useAuth } from '@/contexts/AuthContext';
import { createPayment } from '@/lib/payment/paymentService';
import { Course } from '@/types/course';
import Image from 'next/image';
import { useState } from 'react';

interface PaymentModalProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  type: 'card' | 'wallet' | 'bank';
}

const paymentMethods: PaymentMethod[] = [
  { id: 'vnpay', name: 'VNPay', icon: '💳', type: 'wallet' },
  { id: 'momo', name: 'MoMo', icon: '📱', type: 'wallet' },
  { id: 'zalopay', name: 'ZaloPay', icon: '💰', type: 'wallet' },
  { id: 'visa', name: 'Visa/Mastercard', icon: '💳', type: 'card' },
  { id: 'bank', name: 'Chuyển khoản ngân hàng', icon: '🏦', type: 'bank' },
];

export default function PaymentModal({ course, isOpen, onClose, onSuccess }: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });
  
  const { userProfile } = useAuth();

  const handlePayment = async () => {
    if (!selectedMethod) {
      alert('Vui lòng chọn phương thức thanh toán');
      return;
    }

    if (!userProfile?.uid) {
      alert('Vui lòng đăng nhập để thanh toán');
      return;
    }

    setIsProcessing(true);
    
    try {
      const result = await createPayment(
        course.id,
        userProfile.uid,
        course.price,
        course.currency,
        selectedMethod
      );
      
      if (result.success) {
        alert('Thanh toán thành công! Bạn đã được ghi danh vào khóa học.');
        onSuccess();
        onClose();
      } else {
        alert(result.error || 'Thanh toán thất bại! Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Thanh toán thất bại! Vui lòng thử lại.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    if (currency === 'VND') {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(price);
    }
    return `$${price}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Thanh toán khóa học</h2>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Course Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-4">
              {course.thumbnail && (
                <Image 
                  src={course.thumbnail} 
                  alt={course.title}
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{course.title}</h3>
                <p className="text-sm text-gray-600 mt-1">Giảng viên: {course.instructorId}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-2xl font-bold text-blue-600">
                    {formatPrice(course.price, course.currency)}
                  </span>
                  {course.originalPrice && course.originalPrice > course.price && (
                    <span className="text-sm text-gray-500 line-through">
                      {formatPrice(course.originalPrice, course.currency)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Chọn phương thức thanh toán</h3>
            <div className="space-y-2">
              {paymentMethods.map((method) => (
                <label key={method.id} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={selectedMethod === method.id}
                    onChange={(e) => {
                      setSelectedMethod(e.target.value);
                      setShowCardForm(method.type === 'card');
                    }}
                    className="mr-3"
                  />
                  <span className="text-2xl mr-3">{method.icon}</span>
                  <span className="font-medium">{method.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Card Form */}
          {showCardForm && selectedMethod === 'visa' && (
            <div className="mb-6 p-4 border rounded-lg bg-gray-50">
              <h4 className="font-semibold text-gray-900 mb-4">Thông tin thẻ</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số thẻ
                  </label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardData.number}
                    onChange={(e) => setCardData({...cardData, number: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    MM/YY
                  </label>
                  <input
                    type="text"
                    placeholder="12/25"
                    value={cardData.expiry}
                    onChange={(e) => setCardData({...cardData, expiry: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CVV
                  </label>
                  <input
                    type="text"
                    placeholder="123"
                    value={cardData.cvv}
                    onChange={(e) => setCardData({...cardData, cvv: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên trên thẻ
                  </label>
                  <input
                    type="text"
                    placeholder="NGUYEN VAN A"
                    value={cardData.name}
                    onChange={(e) => setCardData({...cardData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Security Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <div>
                <p className="text-sm text-blue-800 font-medium">Bảo mật thanh toán</p>
                <p className="text-sm text-blue-700 mt-1">
                  Thông tin thanh toán của bạn được bảo vệ bằng mã hóa SSL 256-bit.
                </p>
              </div>
            </div>
          </div>

          {/* Total and Actions */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-6">
              <span className="text-lg font-medium text-gray-900">Tổng thanh toán:</span>
              <span className="text-2xl font-bold text-blue-600">
                {formatPrice(course.price, course.currency)}
              </span>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={onClose}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handlePayment}
                disabled={!selectedMethod || isProcessing}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang xử lý...
                  </>
                ) : (
                  'Thanh toán ngay'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
