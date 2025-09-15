import CertificatesPage from '@/components/certificate/CertificatesPage';
import DiscussionForum from '@/components/discussion/DiscussionForum';
import QuizResults from '@/components/quiz/QuizResults';
import QuizTaker from '@/components/quiz/QuizTaker';
import { Quiz, QuizAttempt } from '@/types/quiz';
import { useState } from 'react';

const sampleQuiz: Quiz = {
  id: 'demo-quiz-1',
  courseId: 'demo-course',
  title: 'JavaScript Fundamentals Quiz',
  description: 'Test your knowledge of JavaScript basics',
  timeLimit: 15, // 15 minutes
  attempts: 3,
  passingScore: 70,
  questions: [
    {
      id: 'q1',
      quizId: 'demo-quiz-1',
      type: 'multiple_choice',
      question: 'What is the correct way to declare a variable in JavaScript?',
      explanation: 'let and const are the modern ways to declare variables in JavaScript.',
      points: 10,
      order: 1,
      options: [
        { id: 'a', text: 'var myVar = 5;', isCorrect: false },
        { id: 'b', text: 'let myVar = 5;', isCorrect: true },
        { id: 'c', text: 'variable myVar = 5;', isCorrect: false },
        { id: 'd', text: 'declare myVar = 5;', isCorrect: false }
      ],
      correctAnswers: ['b']
    },
    {
      id: 'q2',
      quizId: 'demo-quiz-1',
      type: 'true_false',
      question: 'JavaScript is a statically typed language.',
      explanation: 'JavaScript is dynamically typed, meaning variable types are determined at runtime.',
      points: 10,
      order: 2,
      options: [
        { id: 'true', text: 'True', isCorrect: false },
        { id: 'false', text: 'False', isCorrect: true }
      ],
      correctAnswers: ['false']
    },
    {
      id: 'q3',
      quizId: 'demo-quiz-1',
      type: 'fill_blank',
      question: 'Complete the code: console.___("Hello World");',
      explanation: 'console.log() is used to output messages to the console.',
      points: 15,
      order: 3,
      options: [],
      correctAnswers: ['log']
    }
  ],
  status: 'published',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export default function LearningFeaturesDemo() {
  const [currentDemo, setCurrentDemo] = useState<'quiz' | 'results' | 'discussion' | 'certificates'>('quiz');
  const [quizAttempt, setQuizAttempt] = useState<QuizAttempt | null>(null);

  const handleQuizComplete = (attempt: QuizAttempt) => {
    setQuizAttempt(attempt);
    setCurrentDemo('results');
  };

  const handleRetryQuiz = () => {
    setQuizAttempt(null);
    setCurrentDemo('quiz');
  };

  const mockQuizAttempt: QuizAttempt = {
    id: 'attempt-1',
    quizId: 'demo-quiz-1',
    studentId: 'demo-user',
    answers: [
      {
        questionId: 'q1',
        selectedAnswers: ['b'],
        isCorrect: true,
        pointsEarned: 10
      },
      {
        questionId: 'q2',
        selectedAnswers: ['false'],
        isCorrect: true,
        pointsEarned: 10
      },
      {
        questionId: 'q3',
        selectedAnswers: [],
        textAnswer: 'log',
        isCorrect: true,
        pointsEarned: 15
      }
    ],
    score: 35,
    maxScore: 35,
    passed: true,
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    timeSpent: 420, // 7 minutes
    attemptNumber: 1
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto p-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Learning Features Demo</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setCurrentDemo('quiz')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentDemo === 'quiz'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📝 Quiz System
            </button>
            <button
              onClick={() => {
                setQuizAttempt(mockQuizAttempt);
                setCurrentDemo('results');
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentDemo === 'results'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📊 Quiz Results
            </button>
            <button
              onClick={() => setCurrentDemo('discussion')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentDemo === 'discussion'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              💬 Discussions
            </button>
            <button
              onClick={() => setCurrentDemo('certificates')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentDemo === 'certificates'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🏆 Certificates
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="py-8">
        {currentDemo === 'quiz' && (
          <div className="max-w-4xl mx-auto p-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h2 className="text-lg font-semibold text-blue-800 mb-2">🎯 Quiz System Features</h2>
              <ul className="text-blue-700 space-y-1 text-sm">
                <li>• Multiple question types (Multiple Choice, True/False, Fill in Blank, Essay)</li>
                <li>• Time limits and auto-submission</li>
                <li>• Multiple attempts with tracking</li>
                <li>• Auto-grading with manual review for essays</li>
                <li>• Progress tracking and answer persistence</li>
              </ul>
            </div>
            <QuizTaker
              quiz={sampleQuiz}
              onComplete={handleQuizComplete}
              onCancel={() => alert('Quiz cancelled')}
            />
          </div>
        )}

        {currentDemo === 'results' && quizAttempt && (
          <div className="max-w-4xl mx-auto p-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h2 className="text-lg font-semibold text-green-800 mb-2">📈 Results & Grading Features</h2>
              <ul className="text-green-700 space-y-1 text-sm">
                <li>• Automatic grading with detailed feedback</li>
                <li>• Question-by-question review</li>
                <li>• Performance analytics and insights</li>
                <li>• Retry attempts tracking</li>
                <li>• Certificate generation upon passing</li>
              </ul>
            </div>
            <QuizResults
              attempt={quizAttempt}
              quiz={sampleQuiz}
              onRetry={handleRetryQuiz}
              onClose={() => setCurrentDemo('quiz')}
              canRetry={true}
            />
          </div>
        )}

        {currentDemo === 'discussion' && (
          <div>
            <div className="max-w-6xl mx-auto p-6 mb-6">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-purple-800 mb-2">💭 Discussion Forum Features</h2>
                <ul className="text-purple-700 space-y-1 text-sm">
                  <li>• Threaded discussions with categories</li>
                  <li>• Q&A with accepted answers</li>
                  <li>• File attachments and rich content</li>
                  <li>• Moderation tools and reporting</li>
                  <li>• Real-time notifications and mentions</li>
                </ul>
              </div>
            </div>
            <DiscussionForum courseId="demo-course" />
          </div>
        )}

        {currentDemo === 'certificates' && (
          <div>
            <div className="max-w-6xl mx-auto p-6 mb-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-yellow-800 mb-2">🎖️ Certificates & Badges Features</h2>
                <ul className="text-yellow-700 space-y-1 text-sm">
                  <li>• Automatic certificate generation upon course completion</li>
                  <li>• PDF certificates with verification codes</li>
                  <li>• Achievement badges for various milestones</li>
                  <li>• Portfolio view of earned credentials</li>
                  <li>• Public verification system</li>
                </ul>
              </div>
            </div>
            <CertificatesPage />
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="bg-white border-t mt-12">
        <div className="max-w-6xl mx-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">🚀 Implementation Status</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✅ Quiz System (Frontend + Backend)</li>
                <li>✅ Auto-grading Logic</li>
                <li>✅ Discussion Forum</li>
                <li>🔄 Certificate Generation (In Progress)</li>
                <li>🔄 Badge System (In Progress)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">📊 Data Models</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Quiz & Questions Types</li>
                <li>• Attempt & Answer Tracking</li>
                <li>• Discussion & Reply Models</li>
                <li>• Certificate & Badge Schemas</li>
                <li>• Moderation & Settings</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">🔧 Technical Features</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Real-time updates with Firestore</li>
                <li>• File upload to Firebase Storage</li>
                <li>• PDF generation with jsPDF</li>
                <li>• TypeScript type safety</li>
                <li>• Responsive UI components</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
