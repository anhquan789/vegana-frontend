'use client';

import { DashboardData, getStudentDashboardData } from '@/lib/dashboard/dashboardService';
import { db } from '@/lib/firebase';
import { getUserProfile } from '@/lib/profile/profileService';
import { UserProfile } from '@/types/profile';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';

interface QuizAttempt {
  id: string;
  quizId: string;
  score: number;
  total: number;
  passed: boolean;
  takenAt: string;
}

interface Review {
  id: string;
  courseId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export default function AdminUserDetailPage({ params }: { params: { uid: string } }) {
  const { uid } = params;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const p = await getUserProfile(uid);
        setProfile(p);

        const dash = await getStudentDashboardData(uid);
        setDashboard(dash);

        // Load quiz attempts
        const attemptsQ = query(collection(db, 'quizAttempts'), where('userId', '==', uid), orderBy('takenAt', 'desc'));
        const attemptsSnap = await getDocs(attemptsQ);
        const attempts: QuizAttempt[] = attemptsSnap.docs.map(d => {
          const data = d.data() as unknown as Record<string, unknown>;
          return {
            id: d.id,
            quizId: String(data.quizId || ''),
            score: Number(data.score || 0),
            total: Number(data.total || 0),
            passed: Boolean(data.passed || false),
            takenAt: String(data.takenAt || '')
          };
        });
        setQuizAttempts(attempts);

        // Load reviews
        const reviewsQ = query(collection(db, 'reviews'), where('userId', '==', uid), orderBy('createdAt', 'desc'));
        const reviewsSnap = await getDocs(reviewsQ);
        const rv: Review[] = reviewsSnap.docs.map(d => {
          const data = d.data() as unknown as Record<string, unknown>;
          return {
            id: d.id,
            courseId: String(data.courseId || ''),
            rating: Number(data.rating || 0),
            comment: data.comment ? String(data.comment) : undefined,
            createdAt: String(data.createdAt || '')
          };
        });
        setReviews(rv);
      } catch (err) {
        console.error('Error loading user detail:', err);
        setError('Không thể tải thông tin người dùng');
      } finally {
        setLoading(false);
      }
    })();
  }, [uid]);

  if (loading) {
    return <div className="p-8">Đang tải...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">{error}</div>;
  }

  if (!profile) {
    return <div className="p-8">Người dùng không tồn tại</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded shadow p-6">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100">
            {profile.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">No</div>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-semibold">{profile.firstName} {profile.lastName}</h2>
            <p className="text-sm text-gray-600">{profile.email}</p>
            <p className="text-sm text-gray-500">Vai trò: {profile.role}</p>
          </div>
        </div>

        <hr className="my-6" />

        <section className="mb-6">
          <h3 className="text-lg font-medium">Khóa học đang học</h3>
          {dashboard?.enrolledCourses?.length ? (
            <ul className="mt-4 space-y-3">
              {dashboard.enrolledCourses.map((c) => (
                <li key={c.id} className="p-3 border rounded">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{c.title}</div>
                      <div className="text-sm text-gray-500">{c.instructor}</div>
                    </div>
                    <div className="text-sm text-gray-700">{c.progress}%</div>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">Đã học {c.completedLessons}/{c.totalLessons} bài</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-gray-500 mt-2">Không có khóa học</div>
          )}
        </section>

        <section className="mb-6">
          <h3 className="text-lg font-medium">Quiz Attempts</h3>
          {quizAttempts.length ? (
            <ul className="mt-4 space-y-2">
              {quizAttempts.map(q => (
                <li key={q.id} className="p-3 border rounded flex justify-between">
                  <div>
                    <div className="font-medium">Quiz: {q.quizId}</div>
                    <div className="text-sm text-gray-500">Taken on: {q.takenAt}</div>
                  </div>
                  <div className="text-sm">{q.score}/{q.total} ({q.passed ? 'Passed' : 'Failed'})</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-gray-500 mt-2">No quiz attempts</div>
          )}
        </section>

        <section>
          <h3 className="text-lg font-medium">Reviews</h3>
          {reviews.length ? (
            <ul className="mt-4 space-y-2">
              {reviews.map(r => (
                <li key={r.id} className="p-3 border rounded">
                  <div className="flex justify-between">
                    <div className="text-sm font-medium">Course: {r.courseId}</div>
                    <div className="text-sm text-yellow-600">{r.rating} ★</div>
                  </div>
                  {r.comment && <div className="mt-2 text-sm text-gray-600">{r.comment}</div>}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-gray-500 mt-2">No reviews</div>
          )}
        </section>
      </div>
    </div>
  );
}
