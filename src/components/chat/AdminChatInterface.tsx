'use client';

import { useAuth } from '@/contexts/AuthContext';
import {
    assignAdminToSupport,
    closeSupportSession,
    listenToSupportMessages,
    listenToSupportSessions,
    markSupportMessagesAsRead,
    sendSupportMessage
} from '@/lib/chat/supportService';
import { ChatMessage, ChatSession } from '@/types/chat';
import { useEffect, useRef, useState } from 'react';

export default function AdminChatInterface() {
  const { user, userProfile } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && userProfile?.role === 'admin') {
      const unsubscribe = listenToSupportSessions((newSessions) => {
        setSessions(newSessions);
      });

      return () => unsubscribe();
    }
  }, [user, userProfile]);

  useEffect(() => {
    if (selectedSession) {
      const unsubscribe = listenToSupportMessages(selectedSession.id, (newMessages) => {
        setMessages(newMessages);
        
        // Mark messages as read
        if (user) {
          markSupportMessagesAsRead(selectedSession.id, user.uid);
        }
      });

      return () => unsubscribe();
    }
  }, [selectedSession, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectSession = async (session: ChatSession) => {
    setSelectedSession(session);
    
    // Assign admin to session if not assigned
    if (!session.adminId && user && userProfile) {
      try {
        await assignAdminToSupport(
          session.id,
          user.uid,
          userProfile.firstName || 'Admin'
        );
      } catch (error) {
        console.error('Error assigning admin:', error);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedSession || !user || !userProfile) return;

    try {
      setLoading(true);
      await sendSupportMessage(
        selectedSession.id,
        user.uid,
        userProfile.firstName || 'Admin',
        'admin',
        newMessage.trim()
      );
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCloseSession = async (sessionId: string) => {
    try {
      await closeSupportSession(sessionId);
      if (selectedSession?.id === sessionId) {
        setSelectedSession(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error closing session:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      waiting: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800'
    };
    
    const labels = {
      waiting: 'Chờ',
      active: 'Đang chat',
      closed: 'Đã đóng'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  if (!user || userProfile?.role !== 'admin') {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Chỉ admin mới có thể truy cập tính năng này.</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-100 flex">
      {/* Sessions Sidebar */}
      <div className="w-1/3 bg-white border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Hỗ trợ khách hàng</h2>
          <p className="text-sm text-gray-500">
            {sessions.filter(s => s.status !== 'closed').length} cuộc trò chuyện đang hoạt động
          </p>
        </div>
        
        <div className="overflow-y-auto">
          {sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => handleSelectSession(session)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                selectedSession?.id === session.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">{session.userName}</h3>
                {getStatusBadge(session.status)}
              </div>
              
              <p className="text-sm text-gray-600 mb-1">{session.userEmail}</p>
              
              {session.lastMessage && (
                <p className="text-sm text-gray-500 truncate">
                  {session.lastMessage}
                </p>
              )}
              
              <p className="text-xs text-gray-400 mt-1">
                {new Date(session.lastMessageTime).toLocaleString('vi-VN')}
              </p>
            </div>
          ))}
          
          {sessions.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <p>Chưa có cuộc trò chuyện nào</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedSession ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{selectedSession.userName}</h3>
                  <p className="text-sm text-gray-500">{selectedSession.userEmail}</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  {getStatusBadge(selectedSession.status)}
                  
                  {selectedSession.status !== 'closed' && (
                    <button
                      onClick={() => handleCloseSession(selectedSession.id)}
                      className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
                    >
                      Đóng chat
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderRole === 'admin' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg ${
                      message.senderRole === 'admin'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.senderRole === 'admin' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {message.senderName} • {new Date(message.timestamp).toLocaleTimeString('vi-VN', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            {selectedSession.status !== 'closed' && (
              <div className="bg-white border-t border-gray-200 p-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Gửi
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Chọn cuộc trò chuyện</h3>
              <p className="mt-1 text-sm text-gray-500">
                Chọn một cuộc trò chuyện từ danh sách để bắt đầu hỗ trợ khách hàng
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
