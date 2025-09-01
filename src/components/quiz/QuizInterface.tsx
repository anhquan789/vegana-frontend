'use client';

import { Quiz, QuizAttempt } from '@/types/quiz';
import React, { useState } from 'react';
import QuizList from './QuizList';
import QuizResult from './QuizResult';
import QuizTaking from './QuizTaking';

interface QuizInterfaceProps {
  courseId: string;
  studentId: string;
}

type QuizState = 'list' | 'taking' | 'result';

export const QuizInterface: React.FC<QuizInterfaceProps> = ({
  courseId,
  studentId
}) => {
  const [currentState, setCurrentState] = useState<QuizState>('list');
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [quizResult, setQuizResult] = useState<{
    quiz: Quiz;
    attempt: QuizAttempt;
  } | null>(null);

  // Handle starting a quiz
  const handleStartQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setCurrentState('taking');
  };

  // Handle quiz completion
  const handleQuizComplete = (score: number, passed: boolean) => {
    if (selectedQuiz) {
      // Create a mock attempt result (in a real app, this would come from the API)
      const mockAttempt: QuizAttempt = {
        id: 'temp-id',
        quizId: selectedQuiz.id,
        studentId,
        answers: [], // This would be populated with actual answers
        score,
        maxScore: selectedQuiz.questions.reduce((sum, q) => sum + q.points, 0),
        passed,
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        timeSpent: 0, // This would be calculated
        attemptNumber: 1 // This would be calculated
      };

      setQuizResult({
        quiz: selectedQuiz,
        attempt: mockAttempt
      });
      setCurrentState('result');
    }
  };

  // Handle quiz cancellation
  const handleQuizCancel = () => {
    setSelectedQuiz(null);
    setCurrentState('list');
  };

  // Handle retaking a quiz
  const handleRetakeQuiz = () => {
    setQuizResult(null);
    setCurrentState('taking');
  };

  // Handle returning to course
  const handleBackToCourse = () => {
    setSelectedQuiz(null);
    setQuizResult(null);
    setCurrentState('list');
  };

  // Render based on current state
  switch (currentState) {
    case 'taking':
      return selectedQuiz ? (
        <QuizTaking
          quiz={selectedQuiz}
          studentId={studentId}
          onComplete={handleQuizComplete}
          onCancel={handleQuizCancel}
        />
      ) : null;

    case 'result':
      return quizResult ? (
        <QuizResult
          quiz={quizResult.quiz}
          attempt={quizResult.attempt}
          onRetakeQuiz={handleRetakeQuiz}
          onBackToCourse={handleBackToCourse}
        />
      ) : null;

    case 'list':
    default:
      return (
        <QuizList
          courseId={courseId}
          studentId={studentId}
          onStartQuiz={handleStartQuiz}
        />
      );
  }
};

export default QuizInterface;
