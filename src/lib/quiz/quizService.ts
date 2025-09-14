import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Quiz, QuizAttempt, QuizAnswer, QuizQuestion } from '@/types/quiz';

export class QuizService {
  private static instance: QuizService;

  static getInstance(): QuizService {
    if (!QuizService.instance) {
      QuizService.instance = new QuizService();
    }
    return QuizService.instance;
  }

  // Quiz CRUD operations
  async createQuiz(quiz: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'quizzes'), {
      ...quiz,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  }

  async updateQuiz(quizId: string, updates: Partial<Quiz>): Promise<void> {
    const docRef = doc(db, 'quizzes', quizId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  }

  async deleteQuiz(quizId: string): Promise<void> {
    await deleteDoc(doc(db, 'quizzes', quizId));
  }

  async getQuiz(quizId: string): Promise<Quiz | null> {
    const docRef = doc(db, 'quizzes', quizId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Quiz;
    }
    return null;
  }

  async getCourseQuizzes(courseId: string): Promise<Quiz[]> {
    const q = query(
      collection(db, 'quizzes'),
      where('courseId', '==', courseId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    })) as Quiz[];
  }

  // Quiz attempt operations
  async startQuizAttempt(
    quizId: string, 
    userId: string
  ): Promise<string> {
    // Check if user has remaining attempts
    const remainingAttempts = await this.getRemainingAttempts(quizId, userId);
    if (remainingAttempts <= 0) {
      throw new Error('No more attempts remaining');
    }

    const attemptNumber = await this.getNextAttemptNumber(quizId, userId);
    
    const attempt: Omit<QuizAttempt, 'id'> = {
      quizId,
      studentId: userId,
      answers: [],
      score: 0,
      maxScore: 0,
      passed: false,
      startedAt: new Date().toISOString(),
      timeSpent: 0,
      attemptNumber
    };

    const docRef = await addDoc(collection(db, 'quizAttempts'), attempt);
    return docRef.id;
  }

  async submitQuizAnswer(
    attemptId: string, 
    questionId: string, 
    answer: QuizAnswer
  ): Promise<void> {
    const attemptRef = doc(db, 'quizAttempts', attemptId);
    const attemptDoc = await getDoc(attemptRef);
    
    if (!attemptDoc.exists()) {
      throw new Error('Quiz attempt not found');
    }

    const attempt = attemptDoc.data() as QuizAttempt;
    const existingAnswerIndex = attempt.answers.findIndex(a => a.questionId === questionId);
    
    if (existingAnswerIndex >= 0) {
      attempt.answers[existingAnswerIndex] = answer;
    } else {
      attempt.answers.push(answer);
    }

    await updateDoc(attemptRef, { answers: attempt.answers });
  }

  async completeQuizAttempt(attemptId: string): Promise<QuizAttempt> {
    const attemptRef = doc(db, 'quizAttempts', attemptId);
    const attemptDoc = await getDoc(attemptRef);
    
    if (!attemptDoc.exists()) {
      throw new Error('Quiz attempt not found');
    }

    const attempt = attemptDoc.data() as QuizAttempt;
    const quiz = await this.getQuiz(attempt.quizId);
    
    if (!quiz) {
      throw new Error('Quiz not found');
    }

    // Auto-grade the quiz
    const gradedAttempt = await this.gradeQuizAttempt(attempt, quiz);
    
    // Update attempt with results
    await updateDoc(attemptRef, {
      ...gradedAttempt,
      completedAt: new Date().toISOString()
    });

    return { 
      id: attemptId, 
      quizId: attempt.quizId,
      studentId: attempt.studentId,
      attemptNumber: attempt.attemptNumber,
      startedAt: attempt.startedAt,
      timeSpent: attempt.timeSpent,
      ...gradedAttempt 
    } as QuizAttempt;
  }

  private async gradeQuizAttempt(attempt: QuizAttempt, quiz: Quiz): Promise<Partial<QuizAttempt>> {
    let totalScore = 0;
    let maxScore = 0;
    
    const gradedAnswers: QuizAnswer[] = [];

    for (const question of quiz.questions) {
      maxScore += question.points;
      const userAnswer = attempt.answers.find(a => a.questionId === question.id);
      
      if (userAnswer) {
        const isCorrect = this.checkAnswer(question, userAnswer);
        const pointsEarned = isCorrect ? question.points : 0;
        
        gradedAnswers.push({
          ...userAnswer,
          isCorrect,
          pointsEarned
        });
        
        totalScore += pointsEarned;
      } else {
        // No answer provided
        gradedAnswers.push({
          questionId: question.id,
          selectedAnswers: [],
          isCorrect: false,
          pointsEarned: 0
        });
      }
    }

    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
    const passed = percentage >= quiz.passingScore;

    return {
      answers: gradedAnswers,
      score: totalScore,
      maxScore,
      passed
    };
  }

  private checkAnswer(question: QuizQuestion, userAnswer: QuizAnswer): boolean {
    switch (question.type) {
      case 'multiple_choice':
      case 'true_false':
        return this.arrayEquals(
          userAnswer.selectedAnswers.sort(), 
          question.correctAnswers.sort()
        );
      
      case 'essay':
        // Essay questions need manual grading
        return false;
      
      case 'fill_blank':
        // Simple text comparison (could be enhanced with fuzzy matching)
        const userText = userAnswer.textAnswer?.toLowerCase().trim() || '';
        return question.correctAnswers.some(correct => 
          correct.toLowerCase().trim() === userText
        );
      
      default:
        return false;
    }
  }

  private arrayEquals(a: string[], b: string[]): boolean {
    return a.length === b.length && a.every((val, index) => val === b[index]);
  }

  async getRemainingAttempts(quizId: string, userId: string): Promise<number> {
    const quiz = await this.getQuiz(quizId);
    if (!quiz) return 0;

    const q = query(
      collection(db, 'quizAttempts'),
      where('quizId', '==', quizId),
      where('studentId', '==', userId)
    );

    const snapshot = await getDocs(q);
    const usedAttempts = snapshot.docs.length;
    
    return Math.max(0, quiz.attempts - usedAttempts);
  }

  private async getNextAttemptNumber(quizId: string, userId: string): Promise<number> {
    const q = query(
      collection(db, 'quizAttempts'),
      where('quizId', '==', quizId),
      where('studentId', '==', userId),
      orderBy('attemptNumber', 'desc')
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return 1;
    
    const lastAttempt = snapshot.docs[0].data() as QuizAttempt;
    return lastAttempt.attemptNumber + 1;
  }

  async getUserQuizAttempts(quizId: string, userId: string): Promise<QuizAttempt[]> {
    const q = query(
      collection(db, 'quizAttempts'),
      where('quizId', '==', quizId),
      where('studentId', '==', userId),
      orderBy('startedAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    })) as QuizAttempt[];
  }

  async getBestQuizScore(quizId: string, userId: string): Promise<number> {
    const attempts = await this.getUserQuizAttempts(quizId, userId);
    const completedAttempts = attempts.filter(a => a.completedAt);
    
    if (completedAttempts.length === 0) return 0;
    
    return Math.max(...completedAttempts.map(a => a.score / a.maxScore * 100));
  }

  // Real-time listeners
  listenToQuizAttempts(
    quizId: string, 
    callback: (attempts: QuizAttempt[]) => void
  ): () => void {
    const q = query(
      collection(db, 'quizAttempts'),
      where('quizId', '==', quizId),
      orderBy('startedAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const attempts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as QuizAttempt[];
      callback(attempts);
    });
  }
}

export const quizService = QuizService.getInstance();
