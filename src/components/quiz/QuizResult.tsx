'use client';

import { Quiz, QuizAttempt } from '@/types/quiz';
import React from 'react';

interface QuizResultProps {
  quiz: Quiz;
  attempt: QuizAttempt;
  onRetakeQuiz?: () => void;
  onBackToCourse?: () => void;
}

export const QuizResult: React.FC<QuizResultProps> = ({
  quiz,
  attempt,
  onRetakeQuiz,
  onBackToCourse
}) => {
  const percentage = Math.round((attempt.score / attempt.maxScore) * 100);
  const isPassed = attempt.passed;
  
  // Format time spent
  const formatTimeSpent = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes} phút ${remainingSeconds} giây`;
    }
    return `${remainingSeconds} giây`;
  };

  // Get grade based on percentage
  const getGrade = (percentage: number): string => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  const grade = getGrade(percentage);
  const canRetake = quiz.attempts > attempt.attemptNumber;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Result Header */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <div className="text-center">
          {/* Pass/Fail Icon */}
          <div className="mb-6">
            {isPassed ? (
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            ) : (
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
            )}
          </div>

          {/* Result Status */}
          <h1 className={`text-3xl font-bold mb-2 ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
            {isPassed ? 'Chúc mừng!' : 'Chưa đạt yêu cầu'}
          </h1>
          
          <p className="text-gray-600 text-lg mb-6">
            {isPassed 
              ? 'Bạn đã hoàn thành quiz thành công!' 
              : `Bạn cần đạt tối thiểu ${quiz.passingScore}% để vượt qua quiz này.`
            }
          </p>

          {/* Score Display */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className={`text-3xl font-bold ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
                  {percentage}%
                </div>
                <div className="text-gray-600 text-sm">Điểm số</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">
                  {grade}
                </div>
                <div className="text-gray-600 text-sm">Xếp loại</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {attempt.score}/{attempt.maxScore}
                </div>
                <div className="text-gray-600 text-sm">Điểm</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {formatTimeSpent(attempt.timeSpent)}
                </div>
                <div className="text-gray-600 text-sm">Thời gian</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Results */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Chi tiết kết quả</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-700 mb-3">Thông tin chung</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Quiz:</span>
                <span className="font-medium">{quiz.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tổng câu hỏi:</span>
                <span className="font-medium">{quiz.questions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Câu trả lời đúng:</span>
                <span className="font-medium text-green-600">
                  {attempt.answers.filter(a => a.isCorrect).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Câu trả lời sai:</span>
                <span className="font-medium text-red-600">
                  {attempt.answers.filter(a => !a.isCorrect).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Lần thử:</span>
                <span className="font-medium">{attempt.attemptNumber}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-700 mb-3">Hiệu suất</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Điểm yêu cầu:</span>
                <span className="font-medium">{quiz.passingScore}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Điểm đạt được:</span>
                <span className={`font-medium ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
                  {percentage}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Trạng thái:</span>
                <span className={`font-medium ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
                  {isPassed ? 'Đạt' : 'Không đạt'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bắt đầu:</span>
                <span className="font-medium">
                  {new Date(attempt.startedAt).toLocaleString('vi-VN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Hoàn thành:</span>
                <span className="font-medium">
                  {attempt.completedAt && new Date(attempt.completedAt).toLocaleString('vi-VN')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Question by Question Results */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Kết quả từng câu hỏi</h2>
        
        <div className="space-y-4">
          {quiz.questions.map((question, index) => {
            const answer = attempt.answers.find(a => a.questionId === question.id);
            const isCorrect = answer?.isCorrect || false;
            
            return (
              <div
                key={question.id}
                className={`border rounded-lg p-4 ${
                  isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-900">
                    Câu {index + 1}: {question.question}
                  </h3>
                  <div className="flex items-center">
                    {isCorrect ? (
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        Đúng (+{question.points})
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        Sai (0)
                      </span>
                    )}
                  </div>
                </div>
                
                {answer && (
                  <div className="text-sm text-gray-600">
                    <div className="mb-1">
                      <strong>Câu trả lời của bạn:</strong>{' '}
                      {answer.textAnswer || answer.selectedAnswers.join(', ')}
                    </div>
                    {!isCorrect && (
                      <div>
                        <strong className="text-green-600">Đáp án đúng:</strong>{' '}
                        {question.correctAnswers.join(', ')}
                      </div>
                    )}
                  </div>
                )}
                
                {question.explanation && (
                  <div className="mt-2 text-sm text-blue-600">
                    <strong>Giải thích:</strong> {question.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {canRetake && !isPassed && onRetakeQuiz && (
            <button
              onClick={onRetakeQuiz}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Làm lại quiz ({quiz.attempts - attempt.attemptNumber} lần còn lại)
            </button>
          )}
          
          {onBackToCourse && (
            <button
              onClick={onBackToCourse}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Quay về khóa học
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizResult;
