import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';

export interface Certificate {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  instructorName: string;
  completedAt: Date;
  issuedAt: Date;
  certificateUrl?: string;
  verificationCode: string;
  grade?: number;
  skills: string[];
}

const COLLECTIONS = {
  CERTIFICATES: 'certificates',
};

/**
 * Generate certificate for a student
 */
export const generateCertificate = async (
  studentId: string,
  studentName: string,
  courseId: string,
  courseTitle: string,
  instructorName: string,
  completedAt: Date,
  grade?: number,
  skills: string[] = []
): Promise<Certificate> => {
  try {
    const certificateId = `cert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const verificationCode = `VGN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    const certificate: Certificate = {
      id: certificateId,
      studentId,
      studentName,
      courseId,
      courseTitle,
      instructorName,
      completedAt,
      issuedAt: new Date(),
      verificationCode,
      grade,
      skills,
    };

    await setDoc(doc(db, COLLECTIONS.CERTIFICATES, certificateId), {
      ...certificate,
      completedAt: completedAt.toISOString(),
      issuedAt: new Date().toISOString(),
    });

    console.log('✅ Certificate generated:', certificateId);
    return certificate;
  } catch (error) {
    console.error('❌ Error generating certificate:', error);
    throw error;
  }
};

/**
 * Get certificates for a student
 */
export const getStudentCertificates = async (studentId: string): Promise<Certificate[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.CERTIFICATES),
      where('studentId', '==', studentId)
    );

    const querySnapshot = await getDocs(q);
    const certificates = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        completedAt: new Date(data.completedAt),
        issuedAt: new Date(data.issuedAt),
      } as Certificate;
    });

    return certificates.sort((a, b) => b.issuedAt.getTime() - a.issuedAt.getTime());
  } catch (error) {
    console.error('❌ Error getting student certificates:', error);
    return [];
  }
};

/**
 * Get certificate by verification code
 */
export const getCertificateByCode = async (verificationCode: string): Promise<Certificate | null> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.CERTIFICATES),
      where('verificationCode', '==', verificationCode)
    );

    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    return {
      ...data,
      completedAt: new Date(data.completedAt),
      issuedAt: new Date(data.issuedAt),
    } as Certificate;
  } catch (error) {
    console.error('❌ Error getting certificate by code:', error);
    return null;
  }
};

/**
 * Get certificate by ID
 */
export const getCertificate = async (certificateId: string): Promise<Certificate | null> => {
  try {
    const certificateDoc = await getDoc(doc(db, COLLECTIONS.CERTIFICATES, certificateId));
    
    if (certificateDoc.exists()) {
      const data = certificateDoc.data();
      return {
        ...data,
        completedAt: new Date(data.completedAt),
        issuedAt: new Date(data.issuedAt),
      } as Certificate;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error getting certificate:', error);
    return null;
  }
};

/**
 * Generate certificate URL/PDF
 */
export const generateCertificateURL = (certificate: Certificate): string => {
  // In a real app, this would generate a PDF or link to certificate viewer
  return `/certificates/${certificate.id}`;
};

/**
 * Format certificate display date
 */
export const formatCertificateDate = (date: Date): string => {
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Get grade text
 */
export const getGradeText = (grade?: number): string => {
  if (!grade) return 'Hoàn thành';
  
  if (grade >= 90) return 'Xuất sắc';
  if (grade >= 80) return 'Giỏi';
  if (grade >= 70) return 'Khá';
  if (grade >= 60) return 'Trung bình';
  return 'Yếu';
};

/**
 * Get grade color
 */
export const getGradeColor = (grade?: number): string => {
  if (!grade) return 'text-blue-600';
  
  if (grade >= 90) return 'text-green-600';
  if (grade >= 80) return 'text-blue-600';
  if (grade >= 70) return 'text-yellow-600';
  if (grade >= 60) return 'text-orange-600';
  return 'text-red-600';
};
