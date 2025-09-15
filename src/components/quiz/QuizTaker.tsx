'use client';

import { useAuth } from '@/contexts/AuthContext';
import { quizService } from '@/lib/quiz/quizService';
import { Quiz, QuizAnswer, QuizAttempt, QuizQuestion } from '@/types/quiz';
import { useCallback, useEffect, useState } from 'react';

interface QuizTakerProps {
  quiz: Quiz;
  onComplete: (attempt: QuizAttempt) => void;
  onCancel: () => void;
}

export default function QuizTaker({ quiz, onComplete, onCancel }: QuizTakerProps) {
  const { user } = useAuth();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, QuizAnswer>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  useEffect(() => {
    if (user && !attemptId) {
      startAttempt();
    }
  }, [user, attemptId]);

  useEffect(() => {
    if (quiz.timeLimit && timeRemaining === null) {
      setTimeRemaining(quiz.timeLimit * 60); // Convert minutes to seconds
    }
  }, [quiz.timeLimit, timeRemaining]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timeRemaining !== null && timeRemaining > 0) {
      timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      handleSubmitQuiz();
    }
    return () => clearTimeout(timer);
  }, [timeRemaining]);

  const handleSubmitQuiz = useCallback(async () => {
    if (!attemptId || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const completedAttempt = await quizService.completeQuizAttempt(attemptId);
      onComplete(completedAttempt);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Error submitting quiz. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [attemptId, isSubmitting, onComplete]);

  const startAttempt = useCallback(async () => {
    if (!user) return;
    
    try {
      const id = await quizService.startQuizAttempt(quiz.id, user.uid);
      setAttemptId(id);
    } catch (error) {
      console.error('Error starting quiz attempt:', error);
      alert('Could not start quiz. Please try again.');
      onCancel();
    }
  }, [user, quiz.id, onCancel]);

  const handleAnswerChange = (answer: QuizAnswer) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }));

    // Auto-save answer
    if (attemptId) {
      quizService.submitQuizAnswer(attemptId, currentQuestion.id, answer);
    }
  };

  const handleNextQuestion = () => {
    if (!isLastQuestion) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAnsweredCount = (): number => {
    return Object.keys(answers).length;
  };

  if (!user || !attemptId) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3">Starting quiz...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="bg-blue-600 text-white p-6 rounded-t-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{quiz.title}</h1>
            <p className="text-blue-100">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </p>
          </div>
          <div className="text-right">
            {timeRemaining !== null && (
              <div className={`text-lg font-mono ${timeRemaining < 300 ? 'text-red-200' : ''}`}>
                ⏱️ {formatTime(timeRemaining)}
              </div>
            )}
            <div className="text-sm text-blue-100">
              Answered: {getAnsweredCount()}/{quiz.questions.length}
            </div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-4 bg-blue-500 rounded-full h-2">
          <div 
            className="bg-white rounded-full h-2 transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Question Content */}
      <div className="p-6">
        <QuestionRenderer
          question={currentQuestion}
          answer={answers[currentQuestion.id]}
          onAnswerChange={handleAnswerChange}
        />
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center p-6 border-t">
        <button
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          
          {isLastQuestion ? (
            <button
              onClick={handleSubmitQuiz}
              disabled={isSubmitting}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Question Renderer Component
interface QuestionRendererProps {
  question: QuizQuestion;
  answer?: QuizAnswer;
  onAnswerChange: (answer: QuizAnswer) => void;
}

function QuestionRenderer({ question, answer, onAnswerChange }: QuestionRendererProps) {
  const handleMultipleChoice = (optionId: string) => {
    onAnswerChange({
      questionId: question.id,
      selectedAnswers: [optionId],
      isCorrect: false,
      pointsEarned: 0
    });
  };

  const handleTrueFalse = (value: string) => {
    onAnswerChange({
      questionId: question.id,
      selectedAnswers: [value],
      isCorrect: false,
      pointsEarned: 0
    });
  };

  const handleTextAnswer = (text: string) => {
    onAnswerChange({
      questionId: question.id,
      selectedAnswers: [],
      textAnswer: text,
      isCorrect: false,
      pointsEarned: 0
    });
  };

  return (
    <div className="space-y-6">
      {/* Question */}
      <div>
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-semibold text-gray-800">{question.question}</h2>
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            {question.points} {question.points === 1 ? 'point' : 'points'}
          </span>
        </div>
        
        {question.explanation && (
          <p className="text-gray-600 mb-4">{question.explanation}</p>
        )}
      </div>

      {/* Answer Options */}
      <div className="space-y-3">
        {question.type === 'multiple_choice' && (
          <div className="space-y-3">
            {question.options.map((option) => (
              <label key={option.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name={question.id}
                  value={option.id}
                  checked={answer?.selectedAnswers.includes(option.id) || false}
                  onChange={() => handleMultipleChoice(option.id)}
                  className="mt-1 text-blue-600"
                />
                <span className="flex-1">{option.text}</span>
              </label>
            ))}
          </div>
        )}

        {question.type === 'true_false' && (
          <div className="space-y-3">
            <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name={question.id}
                value="true"
                checked={answer?.selectedAnswers.includes('true') || false}
                onChange={() => handleTrueFalse('true')}
                className="text-blue-600"
              />
              <span>True</span>
            </label>
            <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name={question.id}
                value="false"
                checked={answer?.selectedAnswers.includes('false') || false}
                onChange={() => handleTrueFalse('false')}
                className="text-blue-600"
              />
              <span>False</span>
            </label>
          </div>
        )}

        {(question.type === 'fill_blank' || question.type === 'essay') && (
          <textarea
            value={answer?.textAnswer || ''}
            onChange={(e) => handleTextAnswer(e.target.value)}
            placeholder={question.type === 'essay' ? 'Write your essay here...' : 'Enter your answer...'}
            rows={question.type === 'essay' ? 8 : 3}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}
      </div>
    </div>
  );
}
