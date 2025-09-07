'use client';

import { useState, useEffect } from 'react';
import { UserProfile } from '../../types/profile';
import { 
  getUserProfile, 
  createUserProfile, 
  updateUserProfile, 
  uploadAvatar,
  deleteUserProfile 
} from '../../lib/profile/profileService';
import ProfileView from '../../components/profile/ProfileView';
import ProfileForm from '../../components/profile/ProfileForm';

// Mock user ID for demo (replace with actual auth)
const MOCK_USER_ID = 'demo-user-123';

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'view' | 'edit' | 'create'>('view');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userProfile = await getUserProfile(MOCK_USER_ID);
      
      if (userProfile) {
        setProfile(userProfile);
        setMode('view');
      } else {
        setMode('create');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setError('Không thể tải thông tin hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (profileData: Partial<UserProfile>) => {
    try {
      setError(null);
      
      if (mode === 'create') {
        const newProfile = await createUserProfile({
          ...profileData,
          uid: MOCK_USER_ID,
          displayName: `${profileData.firstName} ${profileData.lastName}`,
          email: profileData.email || '',
          firstName: profileData.firstName || '',
          lastName: profileData.lastName || '',
          role: profileData.role || 'student'
        });
        setProfile(newProfile);
        setMode('view');
        alert('Tạo hồ sơ thành công!');
      } else {
        const updatedProfile = await updateUserProfile(MOCK_USER_ID, {
          ...profileData,
          displayName: `${profileData.firstName} ${profileData.lastName}`
        });
        setProfile(updatedProfile);
        setMode('view');
        alert('Cập nhật hồ sơ thành công!');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('Lưu hồ sơ thất bại. Vui lòng thử lại.');
    }
  };

  const handleUploadAvatar = async (file: File): Promise<string> => {
    try {
      const downloadURL = await uploadAvatar(MOCK_USER_ID, file);
      
      // Update local profile state
      if (profile) {
        setProfile({ ...profile, avatar: downloadURL });
      }
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw new Error('Upload ảnh thất bại');
    }
  };

  const handleDelete = async () => {
    if (!profile) return;
    
    const confirmed = window.confirm(
      'Bạn có chắc chắn muốn xóa hồ sơ này? Hành động này không thể hoàn tác.'
    );
    
    if (confirmed) {
      try {
        setError(null);
        await deleteUserProfile(profile.uid);
        setProfile(null);
        setMode('create');
        alert('Xóa hồ sơ thành công!');
      } catch (error) {
        console.error('Error deleting profile:', error);
        setError('Xóa hồ sơ thất bại. Vui lòng thử lại.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {mode === 'view' && profile ? (
          <ProfileView
            profile={profile}
            onEdit={() => setMode('edit')}
            onDelete={handleDelete}
            canEdit={true}
            canDelete={true}
          />
        ) : (
          <ProfileForm
            profile={mode === 'edit' ? profile : null}
            onSave={handleSave}
            onUploadAvatar={handleUploadAvatar}
            mode={mode === 'create' ? 'create' : 'edit'}
          />
        )}

        {mode !== 'view' && (
          <div className="mt-6 text-center">
            <button
              onClick={() => mode === 'edit' ? setMode('view') : loadProfile()}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 underline"
            >
              {mode === 'edit' ? 'Hủy chỉnh sửa' : 'Quay lại'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
