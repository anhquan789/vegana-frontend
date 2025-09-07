'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { UserProfile } from '../../../types/profile';
import { getUsersByRole, updateUserRole, deleteUserProfile } from '../../../lib/profile/profileService';

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<UserProfile['role'] | 'all'>('all');
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let userData: UserProfile[] = [];
      
      if (selectedRole === 'all') {
        // Load all users by getting each role separately
        const [students, instructors, admins] = await Promise.all([
          getUsersByRole('student'),
          getUsersByRole('instructor'),
          getUsersByRole('admin')
        ]);
        userData = [...students, ...instructors, ...admins];
      } else {
        userData = await getUsersByRole(selectedRole);
      }
      
      setUsers(userData);
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  }, [selectedRole]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleRoleChange = async (userId: string, newRole: UserProfile['role']) => {
    try {
      await updateUserRole(userId, newRole);
      
      // Update local state
      setUsers(prev => 
        prev.map(user => 
          user.uid === userId ? { ...user, role: newRole } : user
        )
      );
      
      alert('Cập nhật vai trò thành công!');
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Cập nhật vai trò thất bại. Vui lòng thử lại.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const confirmed = window.confirm(
      'Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.'
    );
    
    if (confirmed) {
      try {
        await deleteUserProfile(userId);
        
        // Update local state
        setUsers(prev => prev.filter(user => user.uid !== userId));
        
        alert('Xóa người dùng thành công!');
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Xóa người dùng thất bại. Vui lòng thử lại.');
      }
    }
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'admin': return 'Quản trị viên';
      case 'instructor': return 'Giảng viên';
      case 'student': return 'Học viên';
      default: return role;
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'instructor': return 'bg-blue-100 text-blue-800';
      case 'student': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Quản lý người dùng</h1>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Filter */}
          <div className="flex items-center space-x-4 mb-6">
            <label className="text-sm font-medium text-gray-700">Lọc theo vai trò:</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserProfile['role'] | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả</option>
              <option value="student">Học viên</option>
              <option value="instructor">Giảng viên</option>
              <option value="admin">Quản trị viên</option>
            </select>
            
            <span className="text-sm text-gray-500">
              Tổng: {users.length} người dùng
            </span>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Người dùng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Liên hệ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vai trò
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.uid} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200 mr-4">
                          {user.avatar ? (
                            <Image 
                              src={user.avatar} 
                              alt="Avatar" 
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                              <svg 
                                className="w-6 h-6 text-gray-400" 
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
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          {user.position && (
                            <div className="text-sm text-gray-500">
                              {user.position}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                      {user.phone && (
                        <div className="text-sm text-gray-500">{user.phone}</div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.uid, e.target.value as UserProfile['role'])}
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeClass(user.role)} border-0 focus:ring-2 focus:ring-blue-500`}
                      >
                        <option value="student">Học viên</option>
                        <option value="instructor">Giảng viên</option>
                        <option value="admin">Quản trị viên</option>
                      </select>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => window.open(`/profile?uid=${user.uid}`, '_blank')}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Xem
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.uid)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {users.length === 0 && !loading && (
            <div className="text-center py-12">
              <svg 
                className="mx-auto h-12 w-12 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" 
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Không có người dùng</h3>
              <p className="mt-1 text-sm text-gray-500">
                {selectedRole === 'all' 
                  ? 'Chưa có người dùng nào trong hệ thống.' 
                  : `Chưa có người dùng nào với vai trò ${getRoleDisplay(selectedRole)}.`
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
