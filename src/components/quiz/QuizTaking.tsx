'use client';

import { Quiz, QuizAnswer, QuizQuestion } from '@/types/quiz';
import { calculateQuizResult, submitQuizAttempt } from '@/utils/quiz/quizUtils';
import Image from 'next/image';
import React, { useCallback, useEffect, useState } from 'react';

interface QuizTakingProps {
  quiz: Quiz;
  studentId: string;
  onComplete: (score: number, passed: boolean) => void;
  onCancel: () => void;
}

export const QuizTaking: React.FC<QuizTakingProps> = ({
  quiz,
  studentId,
  onComplete,
  onCancel
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(
    quiz.timeLimit ? quiz.timeLimit : null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startedAt] = useState(new Date().toISOString());

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const totalQuestions = quiz.questions.length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  // Submit quiz
  const handleSubmitQuiz = useCallback(async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      // Calculate results
      const result = calculateQuizResult(quiz, answers);
      
      // Create quiz answers array
      const quizAnswers: QuizAnswer[] = quiz.questions.map(question => {
        const userAnswer = answers[question.id];
        const selectedAnswers = Array.isArray(userAnswer) ? userAnswer : userAnswer ? [userAnswer] : [];
        
        // Check if answer is correct
        const isCorrect = question.correctAnswers.length === selectedAnswers.length &&
          question.correctAnswers.every(correct => selectedAnswers.includes(correct));
        
        // Calculate points earned
        const pointsEarned = isCorrect ? question.points : 0;
        
        return {
          questionId: question.id,
          selectedAnswers,
          textAnswer: typeof userAnswer === 'string' ? userAnswer : undefined,
          isCorrect,
          pointsEarned
        };
      });

      // Prepare attempt data
      const attemptData = {
        quizId: quiz.id,
        studentId,
        answers: quizAnswers,
        score: result.pointsEarned,
        maxScore: result.totalPoints,
        passed: result.passed,
        startedAt,
        completedAt: new Date().toISOString(),
        timeSpent: Math.floor((new Date().getTime() - new Date(startedAt).getTime()) / 1000),
        attemptNumber: 1 // This should be calculated based on previous attempts
      };

      // Submit attempt to Firebase
      await submitQuizAttempt(attemptData);
      
      // Call completion callback
      onComplete(result.pointsEarned, result.passed);
      
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Có lỗi xảy ra khi nộp bài. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  }, [quiz, answers, studentId, startedAt, onComplete, isSubmitting]);

  // Timer effect
  useEffect(() => {
    if (!timeRemaining || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev && prev <= 1) {
          handleSubmitQuiz(); // Auto-submit when time runs out
          return 0;
        }
        return prev ? prev - 1 : 0;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, handleSubmitQuiz]);

  // Format time remaining
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Handle answer selection
  const handleAnswerChange = (questionId: string, answer: string | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  // Handle multiple choice answer
  const handleMultipleChoiceAnswer = (questionId: string, optionId: string) => {
    const question = quiz.questions.find(q => q.id === questionId);
    if (!question) return;

    if (question.type === 'multiple_choice') {
      // Single selection for multiple choice
      handleAnswerChange(questionId, optionId);
    }
  };

  // Handle text answer
  const handleTextAnswer = (questionId: string, text: string) => {
    handleAnswerChange(questionId, text);
  };

  // Navigate to previous question
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Navigate to next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // Render question content
  const renderQuestion = (question: QuizQuestion) => {
    const userAnswer = answers[question.id];

    switch (question.type) {
      case 'multiple_choice':
        return (
          <div className="space-y-3">
            {question.options.map((option) => (
              <label
                key={option.id}
                className="flex items-start space-x-3 cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option.id}
                  checked={userAnswer === option.id}
                  onChange={() => handleMultipleChoiceAnswer(question.id, option.id)}
                  className="mt-1 text-blue-600"
                />
                <span className="flex-1">{option.text}</span>
              </label>
            ))}
          </div>
        );

      case 'true_false':
        return (
          <div className="space-y-3">
            {question.options.map((option) => (
              <label
                key={option.id}
                className="flex items-start space-x-3 cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option.id}
                  checked={userAnswer === option.id}
                  onChange={() => handleMultipleChoiceAnswer(question.id, option.id)}
                  className="mt-1 text-blue-600"
                />
                <span className="flex-1">{option.text}</span>
              </label>
            ))}
          </div>
        );

      case 'essay':
        return (
          <div>
            <textarea
              value={typeof userAnswer === 'string' ? userAnswer : ''}
              onChange={(e) => handleTextAnswer(question.id, e.target.value)}
              className="w-full h-32 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập câu trả lời của bạn..."
            />
          </div>
        );

      case 'fill_blank':
        return (
          <div>
            <input
              type="text"
              value={typeof userAnswer === 'string' ? userAnswer : ''}
              onChange={(e) => handleTextAnswer(question.id, e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập câu trả lời..."
            />
          </div>
        );

      default:
        return <div>Loại câu hỏi không được hỗ trợ</div>;
    }
  };

  if (isSubmitting) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang nộp bài...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Quiz Header */}
      <div className="bg-white rounded-lg shadow-lg mb-6 p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
          {timeRemaining && timeRemaining > 0 && (
            <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg font-mono text-lg">
              ⏱️ {formatTime(timeRemaining)}
            </div>
          )}
        </div>
        
        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Câu {currentQuestionIndex + 1} / {totalQuestions}</span>
            <span>{Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)}% hoàn thành</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="mb-4">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex-1">
              {currentQuestion.question}
            </h2>
            <div className="ml-4 text-sm text-gray-500">
              {currentQuestion.points} điểm
            </div>
          </div>
          
          {/* Question media */}
          {currentQuestion.media && (
            <div className="mb-4">
              {currentQuestion.media.type === 'image' && (
                <Image
                  src={currentQuestion.media.url}
                  alt="Question media"
                  width={800}
                  height={400}
                  className="max-w-full h-auto rounded-lg"
                />
              )}
            </div>
          )}
        </div>

        {/* Question content */}
        <div className="mb-6">
          {renderQuestion(currentQuestion)}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ← Câu trước
        </button>

        <div className="flex space-x-4">
          <button
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Hủy bỏ
          </button>

          {isLastQuestion ? (
            <button
              onClick={handleSubmitQuiz}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Nộp bài
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Câu tiếp →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizTaking;
