import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    updateDoc,
    where
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Quiz, QuizAttempt } from '../../types/quiz';

// Simple quiz result calculation (separate from QuizResult type)
interface SimpleQuizResult {
  correctAnswers: number;
  totalQuestions: number;
  percentage: number;
  pointsEarned: number;
  totalPoints: number;
  passed: boolean;
  questionResults: Array<{
    questionId: string;
    userAnswer: string | string[];
    correctAnswer: string[];
    isCorrect: boolean;
    points: number;
  }>;
}

// Collection references
const QUIZ_COLLECTION = 'quizzes';
const QUIZ_ATTEMPTS_COLLECTION = 'quiz_attempts';

// Create a new quiz
export const createQuiz = async (quizData: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const now = new Date().toISOString();
    const docRef = await addDoc(collection(db, QUIZ_COLLECTION), {
      ...quizData,
      createdAt: now,
      updatedAt: now
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating quiz:', error);
    throw new Error('Failed to create quiz');
  }
};

// Get all quizzes
export const getAllQuizzes = async (): Promise<Quiz[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, QUIZ_COLLECTION));
    const quizzes: Quiz[] = [];
    
    querySnapshot.forEach((doc) => {
      quizzes.push({
        id: doc.id,
        ...doc.data()
      } as Quiz);
    });
    
    return quizzes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error('Error getting quizzes:', error);
    throw new Error('Failed to get quizzes');
  }
};

// Get quiz by ID
export const getQuizById = async (quizId: string): Promise<Quiz | null> => {
  try {
    const docRef = doc(db, QUIZ_COLLECTION, quizId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Quiz;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting quiz:', error);
    throw new Error('Failed to get quiz');
  }
};

// Get quizzes by course ID
export const getQuizzesByCourseId = async (courseId: string): Promise<Quiz[]> => {
  try {
    const q = query(
      collection(db, QUIZ_COLLECTION), 
      where('courseId', '==', courseId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const quizzes: Quiz[] = [];
    
    querySnapshot.forEach((doc) => {
      quizzes.push({
        id: doc.id,
        ...doc.data()
      } as Quiz);
    });
    
    return quizzes;
  } catch (error) {
    console.error('Error getting quizzes by course:', error);
    throw new Error('Failed to get quizzes by course');
  }
};

// Update quiz
export const updateQuiz = async (quizId: string, updates: Partial<Quiz>): Promise<void> => {
  try {
    const docRef = doc(db, QUIZ_COLLECTION, quizId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating quiz:', error);
    throw new Error('Failed to update quiz');
  }
};

// Delete quiz
export const deleteQuiz = async (quizId: string): Promise<void> => {
  try {
    const docRef = doc(db, QUIZ_COLLECTION, quizId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting quiz:', error);
    throw new Error('Failed to delete quiz');
  }
};

// Publish/Unpublish quiz
export const toggleQuizStatus = async (quizId: string): Promise<void> => {
  try {
    const quiz = await getQuizById(quizId);
    if (!quiz) throw new Error('Quiz not found');
    
    const newStatus = quiz.status === 'published' ? 'draft' : 'published';
    await updateQuiz(quizId, { status: newStatus });
  } catch (error) {
    console.error('Error toggling quiz status:', error);
    throw new Error('Failed to toggle quiz status');
  }
};

// Submit quiz attempt
export const submitQuizAttempt = async (attemptData: Omit<QuizAttempt, 'id' | 'submittedAt'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, QUIZ_ATTEMPTS_COLLECTION), {
      ...attemptData,
      submittedAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error submitting quiz attempt:', error);
    throw new Error('Failed to submit quiz attempt');
  }
};

// Get quiz attempts by user
export const getQuizAttemptsByUser = async (userId: string): Promise<QuizAttempt[]> => {
  try {
    const q = query(
      collection(db, QUIZ_ATTEMPTS_COLLECTION),
      where('userId', '==', userId),
      orderBy('submittedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const attempts: QuizAttempt[] = [];
    
    querySnapshot.forEach((doc) => {
      attempts.push({
        id: doc.id,
        ...doc.data()
      } as QuizAttempt);
    });
    
    return attempts;
  } catch (error) {
    console.error('Error getting quiz attempts by user:', error);
    throw new Error('Failed to get quiz attempts');
  }
};

// Get quiz attempts for a specific quiz
export const getQuizAttemptsByQuizId = async (quizId: string): Promise<QuizAttempt[]> => {
  try {
    const q = query(
      collection(db, QUIZ_ATTEMPTS_COLLECTION),
      where('quizId', '==', quizId),
      orderBy('submittedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const attempts: QuizAttempt[] = [];
    
    querySnapshot.forEach((doc) => {
      attempts.push({
        id: doc.id,
        ...doc.data()
      } as QuizAttempt);
    });
    
    return attempts;
  } catch (error) {
    console.error('Error getting quiz attempts by quiz:', error);
    throw new Error('Failed to get quiz attempts');
  }
};

// Simple quiz result calculation (separate from QuizResult type)
interface SimpleQuizResult {
  correctAnswers: number;
  totalQuestions: number;
  percentage: number;
  pointsEarned: number;
  totalPoints: number;
  passed: boolean;
  questionResults: Array<{
    questionId: string;
    userAnswer: string | string[];
    correctAnswer: string[];
    isCorrect: boolean;
    points: number;
  }>;
}

// Calculate quiz result
export const calculateQuizResult = (quiz: Quiz, answers: Record<string, string | string[]>): SimpleQuizResult => {
  let correctAnswers = 0;
  const totalQuestions = quiz.questions.length;
  let totalPoints = 0;
  let pointsEarned = 0;
  
  const questionResults = quiz.questions.map(question => {
    totalPoints += question.points;
    const userAnswer = answers[question.id];
    
    let isCorrect = false;
    
    // Check based on question type
    switch (question.type) {
      case 'multiple_choice':
        if (typeof userAnswer === 'string') {
          isCorrect = question.correctAnswers.includes(userAnswer);
        }
        break;
      case 'true_false':
        if (typeof userAnswer === 'string') {
          isCorrect = question.correctAnswers.includes(userAnswer);
        }
        break;
      case 'fill_blank':
      case 'essay':
        // For these types, manual grading might be required
        // For now, we'll mark as correct if answer exists
        isCorrect = Boolean(userAnswer && (userAnswer as string).trim().length > 0);
        break;
    }
    
    if (isCorrect) {
      correctAnswers++;
      pointsEarned += question.points;
    }
    
    return {
      questionId: question.id,
      userAnswer,
      correctAnswer: question.correctAnswers,
      isCorrect,
      points: isCorrect ? question.points : 0
    };
  });
  
  const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  const passed = percentage >= quiz.passingScore;
  
  return {
    correctAnswers,
    totalQuestions,
    percentage,
    pointsEarned,
    totalPoints,
    passed,
    questionResults
  };
};

// Get user's best attempt for a quiz
export const getBestQuizAttempt = async (userId: string, quizId: string): Promise<QuizAttempt | null> => {
  try {
    const q = query(
      collection(db, QUIZ_ATTEMPTS_COLLECTION),
      where('userId', '==', userId),
      where('quizId', '==', quizId),
      orderBy('result.percentage', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const bestAttempt = querySnapshot.docs[0];
      return {
        id: bestAttempt.id,
        ...bestAttempt.data()
      } as QuizAttempt;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting best quiz attempt:', error);
    return null;
  }
};

// Check if user can take quiz (based on retry settings)
export const canUserTakeQuiz = async (userId: string, quizId: string, quiz: Quiz): Promise<{ canTake: boolean; reason?: string }> => {
  try {
    const userAttempts = await getQuizAttemptsByUser(userId);
    const quizAttempts = userAttempts.filter(attempt => attempt.quizId === quizId);
    
    if (quizAttempts.length === 0) {
      return { canTake: true };
    }
    
    // Check maximum attempts
    if (quizAttempts.length >= quiz.attempts) {
      return { canTake: false, reason: 'Đã hết số lần thử' };
    }
    
    // Check if user has passed (using QuizAttempt.passed property)
    const hasPassedAttempt = quizAttempts.some(attempt => attempt.passed);
    if (hasPassedAttempt) {
      return { canTake: false, reason: 'Bạn đã vượt qua quiz này' };
    }
    
    return { canTake: true };
  } catch (error) {
    console.error('Error checking if user can take quiz:', error);
    return { canTake: false, reason: 'Có lỗi xảy ra khi kiểm tra' };
  }
};

// Get quiz statistics
export const getQuizStatistics = async (quizId: string) => {
  try {
    const attempts = await getQuizAttemptsByQuizId(quizId);
    
    if (attempts.length === 0) {
      return {
        totalAttempts: 0,
        uniqueUsers: 0,
        averageScore: 0,
        passRate: 0,
        highestScore: 0,
        lowestScore: 0
      };
    }
    
    // Use studentId instead of userId, and score/passed properties from QuizAttempt
    const uniqueUsers = new Set(attempts.map(attempt => attempt.studentId)).size;
    const scores = attempts.map(attempt => Math.round((attempt.score / attempt.maxScore) * 100));
    const passedAttempts = attempts.filter(attempt => attempt.passed).length;
    
    const averageScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
    const passRate = Math.round((passedAttempts / attempts.length) * 100);
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);
    
    return {
      totalAttempts: attempts.length,
      uniqueUsers,
      averageScore,
      passRate,
      highestScore,
      lowestScore
    };
  } catch (error) {
    console.error('Error getting quiz statistics:', error);
    throw new Error('Failed to get quiz statistics');
  }
};
