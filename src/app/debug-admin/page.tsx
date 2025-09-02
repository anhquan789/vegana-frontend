'use client';

import { useAuth } from '@/contexts/AuthContext';
import { quickAdminLogin } from '@/lib/admin/adminUtils';
import { enrollStudent } from '@/utils/course/courseUtils';
import { useState } from 'react';

export default function DebugAdminPage() {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleCreateAdmin = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const result = await quickAdminLogin();
      if (result.success) {
        setMessage('Admin user created/logged in successfully! Email: admin@vegana.com, Password: admin123456');
      } else {
        setMessage(`Error: ${JSON.stringify(result)}`);
      }
    } catch (error) {
      setMessage(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollInCourse = async () => {
    if (!userProfile?.uid) {
      setMessage('Please login first');
      return;
    }

    const courseId = prompt('Enter course ID to enroll in:');
    if (!courseId) return;

    setLoading(true);
    try {
      await enrollStudent(courseId, userProfile.uid);
      setMessage('Successfully enrolled in course!');
    } catch (error) {
      setMessage(`Failed to enroll: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Debug Admin</h1>
        
        {userProfile && (
          <div className="mb-6 p-4 bg-blue-50 rounded">
            <h3 className="font-semibold">Current User:</h3>
            <p>Email: {userProfile.email}</p>
            <p>Role: {userProfile.role}</p>
            <p>Name: {userProfile.displayName}</p>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleCreateAdmin}
            disabled={loading}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating/Logging in Admin...' : 'Create/Login Admin User'}
          </button>

          <button
            onClick={handleEnrollInCourse}
            disabled={loading || !userProfile}
            className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Enrolling...' : 'Enroll in Course'}
          </button>
        </div>

        {message && (
          <div className={`mt-4 p-4 rounded ${message.includes('Error') ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}>
            {message}
          </div>
        )}

        <div className="mt-6 text-sm text-gray-600">
          <p><strong>Admin credentials:</strong></p>
          <p>Email: admin@vegana.com</p>
          <p>Password: admin123456</p>
        </div>
      </div>
    </div>
  );
}
