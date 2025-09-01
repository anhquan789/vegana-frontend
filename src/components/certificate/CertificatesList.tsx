'use client';

import { ROUTES } from '@/constants/app';
import { useAuth } from '@/contexts/AuthContext';
import {
    Certificate,
    formatCertificateDate,
    getGradeColor,
    getGradeText,
    getStudentCertificates
} from '@/lib/certificate/certificateService';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function CertificatesList() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const { userProfile } = useAuth();

  useEffect(() => {
    const loadCertificates = async () => {
      if (!userProfile?.uid) return;
      
      setLoading(true);
      try {
        const studentCertificates = await getStudentCertificates(userProfile.uid);
        setCertificates(studentCertificates);
      } catch (error) {
        console.error('Error loading certificates:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCertificates();
  }, [userProfile?.uid]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải chứng chỉ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Chứng chỉ của tôi</h1>
          <p className="text-gray-600 mt-2">
            Các chứng chỉ bạn đã đạt được từ các khóa học
          </p>
        </div>

        {/* Certificates Grid */}
        {certificates.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Chưa có chứng chỉ nào
            </h3>
            <p className="text-gray-600 mb-6">
              Hoàn thành các khóa học để nhận chứng chỉ
            </p>
            <Link
              href={ROUTES.COURSES}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Khám phá khóa học
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((certificate) => (
              <div
                key={certificate.id}
                className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Certificate Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-2xl">🏆</div>
                    <div className="text-right">
                      <div className="text-sm opacity-90">Chứng chỉ</div>
                      <div className="text-lg font-bold">VEGANA</div>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold mb-2 line-clamp-2">
                    {certificate.courseTitle}
                  </h3>
                  
                  <div className="text-sm opacity-90">
                    Cấp cho: <strong>{certificate.studentName}</strong>
                  </div>
                </div>

                {/* Certificate Body */}
                <div className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Giảng viên: {certificate.instructorName}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h8m-8 0l-4 14m4-14h8m-8 0l8 14M5 11l7-7 7 7" />
                      </svg>
                      Hoàn thành: {formatCertificateDate(certificate.completedAt)}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                      Cấp ngày: {formatCertificateDate(certificate.issuedAt)}
                    </div>

                    {certificate.grade && (
                      <div className="flex items-center text-sm">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        Điểm: <span className={`font-semibold ${getGradeColor(certificate.grade)}`}>
                          {certificate.grade}/100 ({getGradeText(certificate.grade)})
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Skills */}
                  {certificate.skills && certificate.skills.length > 0 && (
                    <div className="mt-4">
                      <div className="text-sm font-medium text-gray-700 mb-2">Kỹ năng đã học:</div>
                      <div className="flex flex-wrap gap-2">
                        {certificate.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-6 flex space-x-3">
                    <Link
                      href={`/certificates/${certificate.id}`}
                      className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Xem chi tiết
                    </Link>
                    <button
                      onClick={() => {
                        // Copy verification code to clipboard
                        navigator.clipboard.writeText(certificate.verificationCode);
                        alert('Đã copy mã xác thực!');
                      }}
                      className="flex-1 bg-gray-100 text-gray-700 text-center py-2 px-4 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                      Copy mã
                    </button>
                  </div>

                  {/* Verification Code */}
                  <div className="mt-3 text-center">
                    <div className="text-xs text-gray-500">Mã xác thực:</div>
                    <div className="text-sm font-mono text-gray-700 bg-gray-50 px-2 py-1 rounded">
                      {certificate.verificationCode}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {certificates.length > 0 && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {certificates.length}
              </div>
              <div className="text-gray-600">Tổng chứng chỉ</div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {certificates.filter(c => c.grade && c.grade >= 80).length}
              </div>
              <div className="text-gray-600">Loại giỏi trở lên</div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {new Set(certificates.map(c => c.courseId)).size}
              </div>
              <div className="text-gray-600">Khóa học khác nhau</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
