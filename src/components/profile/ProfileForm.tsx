'use client';

import { useEffect, useState } from 'react';
import { UserProfile } from '../../types/profile';
import AvatarUpload from './AvatarUpload';

interface ProfileFormProps {
  profile?: UserProfile | null;
  onSave: (profileData: Partial<UserProfile>) => Promise<void>;
  onUploadAvatar: (file: File) => Promise<string>;
  loading?: boolean;
  mode?: 'create' | 'edit';
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  profile,
  onSave,
  onUploadAvatar,
  loading = false,
  mode = 'edit'
}) => {
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    position: '',
    company: '',
    website: '',
    location: '',
    dateOfBirth: '',
    gender: undefined,
    role: 'student',
    socialLinks: {
      facebook: '',
      twitter: '',
      linkedin: '',
      github: ''
    },
    preferences: {
      language: 'vi',
      timezone: 'Asia/Ho_Chi_Minh',
      notifications: {
        email: true,
        push: true,
        marketing: false
      }
    }
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
        position: profile.position || '',
        company: profile.company || '',
        website: profile.website || '',
        location: profile.location || '',
        dateOfBirth: profile.dateOfBirth || '',
        gender: profile.gender,
        role: profile.role || 'student',
        socialLinks: {
          facebook: profile.socialLinks?.facebook || '',
          twitter: profile.socialLinks?.twitter || '',
          linkedin: profile.socialLinks?.linkedin || '',
          github: profile.socialLinks?.github || ''
        },
        preferences: {
          language: profile.preferences?.language || 'vi',
          timezone: profile.preferences?.timezone || 'Asia/Ho_Chi_Minh',
          notifications: {
            email: profile.preferences?.notifications?.email ?? true,
            push: profile.preferences?.notifications?.push ?? true,
            marketing: profile.preferences?.notifications?.marketing ?? false
          }
        }
      });
    }
  }, [profile]);

  const handleChange = (field: string, value: unknown) => {
    setFormData(prev => {
      if (field.includes('.')) {
        const keys = field.split('.');
        const newData = { ...prev } as Record<string, unknown>;
        let current: Record<string, unknown> = newData;

        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) current[keys[i]] = {};
          current = current[keys[i]] as Record<string, unknown>;
        }

        current[keys[keys.length - 1]] = value;
        return newData as Partial<UserProfile>;
      } else {
        return { ...prev, [field]: value } as Partial<UserProfile>;
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      await onSave(formData);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Lưu thông tin thất bại. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {mode === 'create' ? 'Tạo hồ sơ' : 'Chỉnh sửa hồ sơ'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Ảnh đại diện</h3>
            <AvatarUpload
              currentAvatar={profile?.avatar}
              onUpload={onUploadAvatar}
              loading={loading}
              size="lg"
            />
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <h3 className="col-span-full text-lg font-medium text-gray-900 border-b pb-2">
              Thông tin cơ bản
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Họ *
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading || saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên *
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading || saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading || saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số điện thoại
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading || saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày sinh
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading || saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giới tính
              </label>
              <select
                value={formData.gender || ''}
                onChange={(e) => handleChange('gender', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading || saving}
              >
                <option value="">Chọn giới tính</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>
          </div>

          {/* Professional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <h3 className="col-span-full text-lg font-medium text-gray-900 border-b pb-2">
              Thông tin nghề nghiệp
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chức vụ
              </label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => handleChange('position', e.target.value)}
                placeholder="VD: Senior Developer, Product Manager..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading || saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Công ty
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => handleChange('company', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading || saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading || saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Địa điểm
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading || saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vai trò
              </label>
              <select
                value={formData.role}
                onChange={(e) => handleChange('role', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading || saving}
              >
                <option value="student">Học viên</option>
                <option value="instructor">Giảng viên</option>
                <option value="admin">Quản trị viên</option>
              </select>
            </div>
          </div>

          {/* Bio */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">
              Giới thiệu bản thân
            </h3>
            <textarea
              value={formData.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              rows={4}
              placeholder="Viết vài dòng giới thiệu về bản thân..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading || saving}
            />
          </div>

          {/* Social Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <h3 className="col-span-full text-lg font-medium text-gray-900 border-b pb-2">
              Liên kết mạng xã hội
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Facebook
              </label>
              <input
                type="url"
                value={formData.socialLinks?.facebook}
                onChange={(e) => handleChange('socialLinks.facebook', e.target.value)}
                placeholder="https://facebook.com/username"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading || saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                LinkedIn
              </label>
              <input
                type="url"
                value={formData.socialLinks?.linkedin}
                onChange={(e) => handleChange('socialLinks.linkedin', e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading || saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Twitter
              </label>
              <input
                type="url"
                value={formData.socialLinks?.twitter}
                onChange={(e) => handleChange('socialLinks.twitter', e.target.value)}
                placeholder="https://twitter.com/username"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading || saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GitHub
              </label>
              <input
                type="url"
                value={formData.socialLinks?.github}
                onChange={(e) => handleChange('socialLinks.github', e.target.value)}
                placeholder="https://github.com/username"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading || saving}
              />
            </div>
          </div>

          {/* Preferences */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <h3 className="col-span-full text-lg font-medium text-gray-900 border-b pb-2">
              Tùy chọn
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngôn ngữ
              </label>
              <select
                value={formData.preferences?.language}
                onChange={(e) => handleChange('preferences.language', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading || saving}
              >
                <option value="vi">Tiếng Việt</option>
                <option value="en">English</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Múi giờ
              </label>
              <select
                value={formData.preferences?.timezone}
                onChange={(e) => handleChange('preferences.timezone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading || saving}
              >
                <option value="Asia/Ho_Chi_Minh">Việt Nam (GMT+7)</option>
                <option value="America/New_York">New York (GMT-5)</option>
                <option value="Europe/London">London (GMT+0)</option>
                <option value="Asia/Tokyo">Tokyo (GMT+9)</option>
              </select>
            </div>

            <div className="col-span-full">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Thông báo
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.preferences?.notifications?.email}
                    onChange={(e) => handleChange('preferences.notifications.email', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    disabled={loading || saving}
                  />
                  <span className="ml-2 text-sm text-gray-600">Nhận thông báo qua email</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.preferences?.notifications?.push}
                    onChange={(e) => handleChange('preferences.notifications.push', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    disabled={loading || saving}
                  />
                  <span className="ml-2 text-sm text-gray-600">Nhận thông báo đẩy</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.preferences?.notifications?.marketing}
                    onChange={(e) => handleChange('preferences.notifications.marketing', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    disabled={loading || saving}
                  />
                  <span className="ml-2 text-sm text-gray-600">Nhận email marketing</span>
                </label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="submit"
              disabled={loading || saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {saving ? 'Đang lưu...' : mode === 'create' ? 'Tạo hồ sơ' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileForm;
