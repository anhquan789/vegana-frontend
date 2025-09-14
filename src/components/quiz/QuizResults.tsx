'use client';

import { QuizAttempt, Quiz } from '@/types/quiz';
import { useState } from 'react';

interface QuizResultsProps {
  attempt: QuizAttempt;
  quiz: Quiz;
  onRetry?: () => void;
  onClose: () => void;
  canRetry?: boolean;
}

export default function QuizResults({ attempt, quiz, onRetry, onClose, canRetry = false }: QuizResultsProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  const percentage = (attempt.score / attempt.maxScore) * 100;
  const isPassed = attempt.passed;

  const getGradeLetter = (percentage: number): string => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className={`p-6 text-white ${isPassed ? 'bg-green-600' : 'bg-red-600'}`}>
        <div className="text-center">
          <div className="text-6xl mb-4">
            {isPassed ? '🎉' : '😔'}
          </div>
          <h1 className="text-3xl font-bold mb-2">
            {isPassed ? 'Congratulations!' : 'Better Luck Next Time'}
          </h1>
          <p className="text-lg opacity-90">
            {isPassed ? 'You passed the quiz!' : 'You did not pass this time'}
          </p>
        </div>
      </div>

      {/* Results Summary */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {/* Score */}
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-gray-800 mb-1">
              {attempt.score}/{attempt.maxScore}
            </div>
            <div className="text-sm text-gray-600">Points Earned</div>
          </div>

          {/* Percentage */}
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-gray-800 mb-1">
              {percentage.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Percentage</div>
          </div>

          {/* Grade */}
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className={`text-3xl font-bold mb-1 ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
              {getGradeLetter(percentage)}
            </div>
            <div className="text-sm text-gray-600">Grade</div>
          </div>

          {/* Time */}
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-gray-800 mb-1">
              {formatTime(attempt.timeSpent)}
            </div>
            <div className="text-sm text-gray-600">Time Spent</div>
          </div>
        </div>

        {/* Pass/Fail Status */}
        <div className={`p-4 rounded-lg mb-6 ${isPassed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <div className="flex items-center">
            <div className={`w-4 h-4 rounded-full mr-3 ${isPassed ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className={`font-medium ${isPassed ? 'text-green-800' : 'text-red-800'}`}>
              {isPassed ? `Passed! (Required: ${quiz.passingScore}%)` : `Failed (Required: ${quiz.passingScore}%)`}
            </span>
          </div>
        </div>

        {/* Question Details Toggle */}
        <div className="mb-6">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="font-medium">Question Details</span>
            <svg 
              className={`w-5 h-5 transform transition-transform ${showDetails ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Question Details */}
        {showDetails && (
          <div className="space-y-4 mb-6">
            {quiz.questions.map((question, index) => {
              const userAnswer = attempt.answers.find(a => a.questionId === question.id);
              const isCorrect = userAnswer?.isCorrect || false;
              
              return (
                <div key={question.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-medium text-gray-800">
                      {index + 1}. {question.question}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                      <span className="text-sm text-gray-600">
                        {userAnswer?.pointsEarned || 0}/{question.points} pts
                      </span>
                    </div>
                  </div>

                  {/* Show correct answer for multiple choice/true-false */}
                  {(question.type === 'multiple_choice' || question.type === 'true_false') && (
                    <div className="space-y-2">
                      {question.type === 'multiple_choice' && question.options.map(option => {
                        const isUserChoice = userAnswer?.selectedAnswers.includes(option.id);
                        const isCorrectOption = question.correctAnswers.includes(option.id);
                        
                        return (
                          <div 
                            key={option.id}
                            className={`p-2 rounded border ${
                              isCorrectOption ? 'bg-green-50 border-green-200' : 
                              isUserChoice ? 'bg-red-50 border-red-200' : 'bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center">
                              {isUserChoice && <span className="mr-2">👤</span>}
                              {isCorrectOption && <span className="mr-2">✅</span>}
                              <span>{option.text}</span>
                            </div>
                          </div>
                        );
                      })}
                      
                      {question.type === 'true_false' && (
                        <div className="space-y-1">
                          <div className={`p-2 rounded ${
                            question.correctAnswers.includes('true') ? 'bg-green-50' : 
                            userAnswer?.selectedAnswers.includes('true') ? 'bg-red-50' : 'bg-gray-50'
                          }`}>
                            {userAnswer?.selectedAnswers.includes('true') && '👤 '}
                            {question.correctAnswers.includes('true') && '✅ '}
                            True
                          </div>
                          <div className={`p-2 rounded ${
                            question.correctAnswers.includes('false') ? 'bg-green-50' : 
                            userAnswer?.selectedAnswers.includes('false') ? 'bg-red-50' : 'bg-gray-50'
                          }`}>
                            {userAnswer?.selectedAnswers.includes('false') && '👤 '}
                            {question.correctAnswers.includes('false') && '✅ '}
                            False
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Show text answers */}
                  {(question.type === 'fill_blank' || question.type === 'essay') && (
                    <div className="space-y-2">
                      <div>
                        <strong className="text-sm text-gray-600">Your Answer:</strong>
                        <div className="mt-1 p-2 bg-gray-50 rounded border">
                          {userAnswer?.textAnswer || 'No answer provided'}
                        </div>
                      </div>
                      {question.type === 'fill_blank' && (
                        <div>
                          <strong className="text-sm text-gray-600">Correct Answer(s):</strong>
                          <div className="mt-1 p-2 bg-green-50 rounded border border-green-200">
                            {question.correctAnswers.join(', ')}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Question explanation */}
                  {question.explanation && (
                    <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                      <strong className="text-sm text-blue-800">Explanation:</strong>
                      <p className="mt-1 text-blue-700">{question.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-center space-x-4">
          {canRetry && onRetry && (
            <button
              onClick={onRetry}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          )}
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
