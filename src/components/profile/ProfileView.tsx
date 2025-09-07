'use client';

import { UserProfile } from '../../types/profile';

interface ProfileViewProps {
  profile: UserProfile;
  onEdit: () => void;
  onDelete?: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  onEdit,
  onDelete,
  canEdit = true,
  canDelete = false
}) => {
  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'admin': return 'Quản trị viên';
      case 'instructor': return 'Giảng viên';
      case 'student': return 'Học viên';
      default: return role;
    }
  };

  const getGenderDisplay = (gender?: string) => {
    switch (gender) {
      case 'male': return 'Nam';
      case 'female': return 'Nữ';
      case 'other': return 'Khác';
      default: return 'Chưa cập nhật';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Chưa cập nhật';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md">
      <div className="p-6">
        {/* Header with actions */}
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Hồ sơ cá nhân</h2>
          <div className="flex space-x-3">
            {canEdit && (
              <button
                onClick={onEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Chỉnh sửa
              </button>
            )}
            {canDelete && onDelete && (
              <button
                onClick={onDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Xóa
              </button>
            )}
          </div>
        </div>

        {/* Avatar and basic info */}
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 mb-8">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200">
            {profile.avatar ? (
              <img 
                src={profile.avatar} 
                alt="Avatar" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <svg 
                  className="w-16 h-16 text-gray-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                  />
                </svg>
              </div>
            )}
          </div>

          <div className="flex-1 text-center md:text-left">
            <h3 className="text-3xl font-bold text-gray-900 mb-2">
              {profile.firstName} {profile.lastName}
            </h3>
            <p className="text-lg text-gray-600 mb-2">{profile.email}</p>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                profile.role === 'admin' ? 'bg-red-100 text-red-800' :
                profile.role === 'instructor' ? 'bg-blue-100 text-blue-800' :
                'bg-green-100 text-green-800'
              }`}>
                {getRoleDisplay(profile.role)}
              </span>
              {profile.position && (
                <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                  {profile.position}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="mb-8">
            <h4 className="text-lg font-medium text-gray-900 mb-3">Giới thiệu</h4>
            <p className="text-gray-600 leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {/* Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Personal Information */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">
              Thông tin cá nhân
            </h4>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">Số điện thoại:</span>
                <p className="text-gray-900">{profile.phone || 'Chưa cập nhật'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Ngày sinh:</span>
                <p className="text-gray-900">{formatDate(profile.dateOfBirth)}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Giới tính:</span>
                <p className="text-gray-900">{getGenderDisplay(profile.gender)}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Địa điểm:</span>
                <p className="text-gray-900">{profile.location || 'Chưa cập nhật'}</p>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">
              Thông tin nghề nghiệp
            </h4>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">Chức vụ:</span>
                <p className="text-gray-900">{profile.position || 'Chưa cập nhật'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Công ty:</span>
                <p className="text-gray-900">{profile.company || 'Chưa cập nhật'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Website:</span>
                {profile.website ? (
                  <a 
                    href={profile.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    {profile.website}
                  </a>
                ) : (
                  <p className="text-gray-900">Chưa cập nhật</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Social Links */}
        {(profile.socialLinks?.facebook || profile.socialLinks?.linkedin || 
          profile.socialLinks?.twitter || profile.socialLinks?.github) && (
          <div className="mb-8">
            <h4 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">
              Liên kết mạng xã hội
            </h4>
            <div className="flex flex-wrap gap-4">
              {profile.socialLinks?.facebook && (
                <a
                  href={profile.socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <span>Facebook</span>
                </a>
              )}
              {profile.socialLinks?.linkedin && (
                <a
                  href={profile.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-900 transition-colors"
                >
                  <span>LinkedIn</span>
                </a>
              )}
              {profile.socialLinks?.twitter && (
                <a
                  href={profile.socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-400 text-white rounded-md hover:bg-blue-500 transition-colors"
                >
                  <span>Twitter</span>
                </a>
              )}
              {profile.socialLinks?.github && (
                <a
                  href={profile.socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors"
                >
                  <span>GitHub</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Preferences */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">
              Tùy chọn
            </h4>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">Ngôn ngữ:</span>
                <p className="text-gray-900">
                  {profile.preferences?.language === 'vi' ? 'Tiếng Việt' : 'English'}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Múi giờ:</span>
                <p className="text-gray-900">{profile.preferences?.timezone || 'Asia/Ho_Chi_Minh'}</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">
              Thông tin hệ thống
            </h4>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">Ngày tạo:</span>
                <p className="text-gray-900">{formatDate(profile.createdAt)}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Cập nhật lần cuối:</span>
                <p className="text-gray-900">{formatDate(profile.updatedAt)}</p>
              </div>
              {profile.lastLoginAt && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Đăng nhập lần cuối:</span>
                  <p className="text-gray-900">{formatDate(profile.lastLoginAt)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
