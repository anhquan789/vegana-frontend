'use client';

import { useState, useEffect, useCallback } from 'react';
import { Discussion } from '@/types/discussion';
import { discussionService } from '@/lib/discussion/discussionService';
import { useAuth } from '@/contexts/AuthContext';

interface DiscussionForumProps {
  courseId: string;
}

export default function DiscussionForum({ courseId }: DiscussionForumProps) {
  const { user } = useAuth();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { value: 'all', label: 'All Discussions' },
    { value: 'general', label: 'General' },
    { value: 'question', label: 'Questions' },
    { value: 'announcement', label: 'Announcements' },
    { value: 'assignment', label: 'Assignments' }
  ];

  useEffect(() => {
    loadDiscussions();
  }, [courseId, selectedCategory, loadDiscussions]);

  const loadDiscussions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await discussionService.getCourseDiscussions(
        courseId, 
        selectedCategory === 'all' ? undefined : selectedCategory
      );
      setDiscussions(data);
    } catch (error) {
      console.error('Error loading discussions:', error);
    } finally {
      setLoading(false);
    }
  }, [courseId, selectedCategory]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadDiscussions();
      return;
    }

    try {
      setLoading(true);
      const results = await discussionService.searchDiscussions(
        courseId, 
        searchTerm, 
        selectedCategory === 'all' ? undefined : selectedCategory
      );
      setDiscussions(results);
    } catch (error) {
      console.error('Error searching discussions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDiscussions = discussions.filter(discussion => {
    if (!searchTerm) return true;
    return discussion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           discussion.content.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Course Discussions</h1>
        {user && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            New Discussion
          </button>
        )}
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Category Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="flex-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search discussions..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Discussions List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3">Loading discussions...</span>
          </div>
        ) : filteredDiscussions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <div className="text-gray-400 text-6xl mb-4">💬</div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">No discussions found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search terms' : 'Be the first to start a discussion!'}
            </p>
          </div>
        ) : (
          filteredDiscussions.map(discussion => (
            <DiscussionCard 
              key={discussion.id} 
              discussion={discussion}
              onClick={() => window.location.href = `/course/${courseId}/discussion/${discussion.id}`}
            />
          ))
        )}
      </div>

      {/* Create Discussion Modal */}
      {showCreateForm && (
        <CreateDiscussionModal
          courseId={courseId}
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            setShowCreateForm(false);
            loadDiscussions();
          }}
        />
      )}
    </div>
  );
}

// Discussion Card Component
interface DiscussionCardProps {
  discussion: Discussion;
  onClick: () => void;
}

function DiscussionCard({ discussion, onClick }: DiscussionCardProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'question': return '❓';
      case 'announcement': return '📢';
      case 'assignment': return '📝';
      default: return '💬';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'question': return 'bg-blue-100 text-blue-800';
      case 'announcement': return 'bg-yellow-100 text-yellow-800';
      case 'assignment': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-blue-500"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          {discussion.isPinned && (
            <span className="text-yellow-500" title="Pinned">📌</span>
          )}
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(discussion.category)}`}>
            {getCategoryIcon(discussion.category)} {discussion.category}
          </span>
          {discussion.tags.map(tag => (
            <span key={tag} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-800 mb-2">{discussion.title}</h3>
      
      <p className="text-gray-600 mb-4 line-clamp-2">{discussion.content}</p>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          <span className="flex items-center">
            <span className="mr-1">👤</span>
            {discussion.authorName}
            <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
              discussion.authorRole === 'instructor' ? 'bg-blue-100 text-blue-800' :
              discussion.authorRole === 'admin' ? 'bg-purple-100 text-purple-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {discussion.authorRole}
            </span>
          </span>
          <span className="flex items-center">
            <span className="mr-1">💬</span>
            {discussion.replyCount} replies
          </span>
          <span className="flex items-center">
            <span className="mr-1">👁️</span>
            {discussion.viewCount} views
          </span>
        </div>
        
        <div className="text-right">
          <div>{formatDate(discussion.createdAt)}</div>
          {discussion.lastReplyAt && (
            <div className="text-xs">
              Last reply: {formatDate(discussion.lastReplyAt)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Create Discussion Modal
interface CreateDiscussionModalProps {
  courseId: string;
  onClose: () => void;
  onSuccess: () => void;
}

function CreateDiscussionModal({ courseId, onClose, onSuccess }: CreateDiscussionModalProps) {
  const { user, userProfile } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { value: 'general', label: 'General Discussion' },
    { value: 'question', label: 'Question' },
    { value: 'assignment', label: 'Assignment Help' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userProfile || !title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      await discussionService.createDiscussion({
        courseId,
        title: title.trim(),
        content: content.trim(),
        authorId: user.uid,
        authorName: userProfile.firstName || user.email?.split('@')[0] || 'User',
        authorRole: userProfile.role === 'instructor' ? 'instructor' : 'student',
        category: category as 'general' | 'question' | 'announcement' | 'assignment',
        tags: tagArray,
        isPinned: false,
        isLocked: false,
        attachments: []
      });

      onSuccess();
    } catch (error) {
      console.error('Error creating discussion:', error);
      alert('Failed to create discussion. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Create New Discussion</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter discussion title..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your discussion content..."
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags (optional)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Enter tags separated by commas..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Example: javascript, debugging, help</p>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !title.trim() || !content.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating...' : 'Create Discussion'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
