'use client';

import { Quiz } from '@/types/quiz';
import { canUserTakeQuiz, getQuizzesByCourseId } from '@/utils/quiz/quizUtils';
import React, { useEffect, useState } from 'react';

interface QuizListProps {
  courseId: string;
  studentId: string;
  onStartQuiz: (quiz: Quiz) => void;
}

interface QuizWithStatus extends Quiz {
  canTake: boolean;
  reason?: string;
}

export const QuizList: React.FC<QuizListProps> = ({
  courseId,
  studentId,
  onStartQuiz
}) => {
  const [quizzes, setQuizzes] = useState<QuizWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        setLoading(true);
        const courseQuizzes = await getQuizzesByCourseId(courseId);
        
        // Filter published quizzes and check if user can take them
        const publishedQuizzes = courseQuizzes.filter(quiz => quiz.status === 'published');
        
        const quizzesWithStatus = await Promise.all(
          publishedQuizzes.map(async (quiz) => {
            const canTakeResult = await canUserTakeQuiz(studentId, quiz.id, quiz);
            return {
              ...quiz,
              canTake: canTakeResult.canTake,
              reason: canTakeResult.reason
            };
          })
        );

        setQuizzes(quizzesWithStatus);
      } catch (err) {
        console.error('Error loading quizzes:', err);
        setError('Không thể tải danh sách quiz. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    loadQuizzes();
  }, [courseId, studentId]);

  const formatDuration = (seconds: number): string => {
    if (!seconds) return 'Không giới hạn';
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours} giờ ${minutes % 60} phút`;
    }
    return `${minutes} phút`;
  };

  const getDifficultyColor = (passingScore: number): string => {
    if (passingScore >= 90) return 'text-red-600 bg-red-100';
    if (passingScore >= 80) return 'text-orange-600 bg-orange-100';
    if (passingScore >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getDifficultyLabel = (passingScore: number): string => {
    if (passingScore >= 90) return 'Rất khó';
    if (passingScore >= 80) return 'Khó';
    if (passingScore >= 70) return 'Trung bình';
    return 'Dễ';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-800">{error}</div>
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <div className="text-gray-500 text-lg mb-2">Chưa có quiz nào</div>
        <p className="text-gray-400">Giảng viên chưa tạo quiz cho khóa học này.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Danh sách Quiz</h2>
        <p className="text-gray-600">Hoàn thành các quiz để kiểm tra kiến thức của bạn.</p>
      </div>

      {quizzes.map((quiz) => (
        <div
          key={quiz.id}
          className="bg-white rounded-lg shadow-lg border hover:shadow-xl transition-shadow duration-200"
        >
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {quiz.title}
                </h3>
                {quiz.description && (
                  <p className="text-gray-600 mb-3">{quiz.description}</p>
                )}
              </div>
              
              <div className="ml-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(quiz.passingScore)}`}>
                  {getDifficultyLabel(quiz.passingScore)}
                </span>
              </div>
            </div>

            {/* Quiz Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                {quiz.questions.length} câu hỏi
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                {formatDuration(quiz.timeLimit || 0)}
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                {quiz.passingScore}% để qua
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                {quiz.attempts} lần thử
              </div>
            </div>

            {/* Points Information */}
            <div className="bg-blue-50 rounded-lg p-3 mb-4">
              <div className="text-sm text-blue-800">
                <strong>Tổng điểm:</strong> {quiz.questions.reduce((sum, q) => sum + q.points, 0)} điểm
              </div>
            </div>

            {/* Action Button */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Cập nhật: {new Date(quiz.updatedAt).toLocaleDateString('vi-VN')}
              </div>
              
              <div>
                {quiz.canTake ? (
                  <button
                    onClick={() => onStartQuiz(quiz)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Bắt đầu Quiz
                  </button>
                ) : (
                  <div className="text-center">
                    <button
                      disabled
                      className="px-6 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed mb-1"
                    >
                      Không thể làm
                    </button>
                    {quiz.reason && (
                      <div className="text-xs text-red-600">{quiz.reason}</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuizList;
