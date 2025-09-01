export interface Quiz {
  id: string;
  courseId?: string;
  lessonId?: string;
  title: string;
  description?: string;
  timeLimit?: number; // in seconds
  attempts: number;
  passingScore: number;
  questions: QuizQuestion[];
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  type: 'multiple_choice' | 'true_false' | 'essay' | 'fill_blank' | 'matching';
  question: string;
  explanation?: string;
  points: number;
  order: number;
  options: QuizOption[];
  correctAnswers: string[];
  media?: QuizMedia;
}

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

export interface QuizMedia {
  type: 'image' | 'video' | 'audio';
  url: string;
  thumbnail?: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  answers: QuizAnswer[];
  score: number;
  maxScore: number;
  passed: boolean;
  startedAt: string;
  completedAt?: string;
  timeSpent: number; // in seconds
  attemptNumber: number;
}

export interface QuizAnswer {
  questionId: string;
  selectedAnswers: string[];
  textAnswer?: string;
  isCorrect: boolean;
  pointsEarned: number;
}

export interface QuizResult {
  attempt: QuizAttempt;
  quiz: Quiz;
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
  passed: boolean;
  feedback: string;
}
