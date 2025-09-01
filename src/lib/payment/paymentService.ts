import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';

export interface PaymentData {
  id: string;
  courseId: string;
  userId: string;
  amount: number;
  currency: string;
  method: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  createdAt: string;
  completedAt?: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  transactionId?: string;
  redirectUrl?: string;
  error?: string;
}

const COLLECTIONS = {
  PAYMENTS: 'payments',
  ENROLLMENTS: 'enrollments',
};

/**
 * Create a payment record
 */
export const createPayment = async (
  courseId: string,
  userId: string,
  amount: number,
  currency: string,
  method: string
): Promise<PaymentResult> => {
  try {
    const paymentId = `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const paymentData: PaymentData = {
      id: paymentId,
      courseId,
      userId,
      amount,
      currency,
      method,
      status: 'pending',
      createdAt: now,
    };

    await setDoc(doc(db, COLLECTIONS.PAYMENTS, paymentId), paymentData);

    // Simulate payment processing based on method
    const result = await processPayment(paymentId, method, amount, currency);
    
    return {
      success: true,
      paymentId,
      ...result,
    };
  } catch (error) {
    console.error('Error creating payment:', error);
    return {
      success: false,
      error: 'Không thể tạo thanh toán',
    };
  }
};

/**
 * Process payment based on method
 */
const processPayment = async (
  paymentId: string,
  method: string,
  amount: number,
  currency: string
): Promise<Partial<PaymentResult>> => {
  try {
    // Simulate different payment methods
    switch (method) {
      case 'vnpay':
        return await processVNPay(paymentId, amount, currency);
      case 'momo':
        return await processMoMo(paymentId, amount, currency);
      case 'zalopay':
        return await processZaloPay(paymentId, amount, currency);
      case 'visa':
        return await processCard(paymentId, amount, currency);
      case 'bank':
        return await processBankTransfer(paymentId, amount, currency);
      default:
        throw new Error('Unsupported payment method');
    }
  } catch (error) {
    console.error('Error processing payment:', error);
    await updatePaymentStatus(paymentId, 'failed');
    return {
      success: false,
      error: 'Lỗi xử lý thanh toán',
    };
  }
};

/**
 * Simulate VNPay payment
 */
const processVNPay = async (paymentId: string, _amount: number, _currency: string) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const transactionId = `vnp_${Date.now()}`;
  await updatePaymentStatus(paymentId, 'completed', transactionId);
  
  return {
    success: true,
    transactionId,
  };
};

/**
 * Simulate MoMo payment
 */
const processMoMo = async (paymentId: string, _amount: number, _currency: string) => {
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  const transactionId = `momo_${Date.now()}`;
  await updatePaymentStatus(paymentId, 'completed', transactionId);
  
  return {
    success: true,
    transactionId,
  };
};

/**
 * Simulate ZaloPay payment
 */
const processZaloPay = async (paymentId: string, _amount: number, _currency: string) => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const transactionId = `zalo_${Date.now()}`;
  await updatePaymentStatus(paymentId, 'completed', transactionId);
  
  return {
    success: true,
    transactionId,
  };
};

/**
 * Simulate card payment
 */
const processCard = async (paymentId: string, _amount: number, _currency: string) => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const transactionId = `card_${Date.now()}`;
  await updatePaymentStatus(paymentId, 'completed', transactionId);
  
  return {
    success: true,
    transactionId,
  };
};

/**
 * Simulate bank transfer
 */
const processBankTransfer = async (paymentId: string, _amount: number, _currency: string) => {
  // Bank transfer requires manual verification
  await updatePaymentStatus(paymentId, 'pending');
  
  return {
    success: true,
    redirectUrl: '/payment/bank-transfer',
  };
};

/**
 * Update payment status
 */
export const updatePaymentStatus = async (
  paymentId: string,
  status: PaymentData['status'],
  transactionId?: string
): Promise<void> => {
  try {
    const updateData: Partial<PaymentData> = {
      status,
      ...(transactionId && { transactionId }),
      ...(status === 'completed' && { completedAt: new Date().toISOString() }),
    };

    await updateDoc(doc(db, COLLECTIONS.PAYMENTS, paymentId), updateData);

    // If payment is completed, create enrollment
    if (status === 'completed') {
      await createEnrollmentFromPayment(paymentId);
    }
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }
};

/**
 * Create enrollment after successful payment
 */
const createEnrollmentFromPayment = async (paymentId: string): Promise<void> => {
  try {
    // Get payment data
    const paymentDoc = await getDoc(doc(db, COLLECTIONS.PAYMENTS, paymentId));
    if (!paymentDoc.exists()) {
      throw new Error('Payment not found');
    }

    const payment = paymentDoc.data() as PaymentData;
    
    // Create enrollment
    const enrollmentId = `enrollment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const enrollment = {
      id: enrollmentId,
      courseId: payment.courseId,
      studentId: payment.userId,
      enrolledAt: now,
      status: 'active',
      paymentStatus: 'paid',
      paymentId: payment.id,
    };

    await setDoc(doc(db, COLLECTIONS.ENROLLMENTS, enrollmentId), enrollment);
    console.log('✅ Enrollment created from payment:', enrollmentId);
  } catch (error) {
    console.error('Error creating enrollment from payment:', error);
    throw error;
  }
};

/**
 * Get payment by ID
 */
export const getPayment = async (paymentId: string): Promise<PaymentData | null> => {
  try {
    const paymentDoc = await getDoc(doc(db, COLLECTIONS.PAYMENTS, paymentId));
    
    if (paymentDoc.exists()) {
      return paymentDoc.data() as PaymentData;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting payment:', error);
    return null;
  }
};

/**
 * Get user payments
 */
export const getUserPayments = async (userId: string): Promise<PaymentData[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.PAYMENTS),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    const payments = querySnapshot.docs.map(doc => doc.data() as PaymentData);

    return payments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error('Error getting user payments:', error);
    return [];
  }
};

/**
 * Get course payments
 */
export const getCoursePayments = async (courseId: string): Promise<PaymentData[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.PAYMENTS),
      where('courseId', '==', courseId),
      where('status', '==', 'completed')
    );

    const querySnapshot = await getDocs(q);
    const payments = querySnapshot.docs.map(doc => doc.data() as PaymentData);

    return payments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error('Error getting course payments:', error);
    return [];
  }
};

/**
 * Format price for display
 */
export const formatPrice = (amount: number, currency: string): string => {
  if (currency === 'VND') {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};
