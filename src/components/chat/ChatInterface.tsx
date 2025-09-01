'use client';

import { useAuth } from '@/contexts/AuthContext';
import {
    ChatMessage,
    ChatRoom,
    formatMessageTime,
    sendMessage,
    subscribeToChatRooms,
    subscribeToMessages,
} from '@/lib/chat/chatService';
import React, { useEffect, useRef, useState } from 'react';

interface ChatInterfaceProps {
  courseId: string;
}

export default function ChatInterface({ courseId }: ChatInterfaceProps) {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { userProfile } = useAuth();

  // Subscribe to chat rooms
  useEffect(() => {
    if (!courseId) return;

    const unsubscribe = subscribeToChatRooms(courseId, (roomsData) => {
      setRooms(roomsData);
      
      // Auto-select first room
      if (roomsData.length > 0 && !activeRoom) {
        setActiveRoom(roomsData[0]);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, [courseId, activeRoom]);

  // Subscribe to messages for active room
  useEffect(() => {
    if (!activeRoom) return;

    const unsubscribe = subscribeToMessages(activeRoom.id, (messagesData) => {
      setMessages(messagesData);
    });

    return unsubscribe;
  }, [activeRoom]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !activeRoom || !userProfile) return;

    setSending(true);
    try {
      await sendMessage(
        activeRoom.id,
        courseId,
        userProfile.uid,
        userProfile.displayName,
        userProfile.role,
        newMessage.trim()
      );
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Không thể gửi tin nhắn. Vui lòng thử lại.');
    } finally {
      setSending(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'instructor': return 'text-purple-600';
      case 'admin': return 'text-red-600';
      default: return 'text-gray-700';
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'instructor':
        return <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Giảng viên</span>;
      case 'admin':
        return <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Admin</span>;
      default:
        return null;
    }
  };

  if (!isChatOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsChatOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[32rem] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Chat khóa học</h3>
          <p className="text-sm text-blue-100">
            {activeRoom?.name || 'Chọn phòng chat'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {rooms.length > 1 && (
            <select
              value={activeRoom?.id || ''}
              onChange={(e) => {
                const room = rooms.find(r => r.id === e.target.value);
                setActiveRoom(room || null);
              }}
              className="bg-blue-500 border-blue-400 text-white text-sm rounded px-2 py-1"
            >
              {rooms.map((room) => (
                <option key={room.id} value={room.id} className="bg-white text-black">
                  {room.name}
                </option>
              ))}
            </select>
          )}
          <button
            onClick={() => setIsChatOpen(false)}
            className="text-blue-100 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="text-center text-gray-500">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
            Đang tải chat...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-2">💬</div>
            <p>Chưa có tin nhắn nào</p>
            <p className="text-sm">Hãy là người đầu tiên gửi tin nhắn!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.senderId === userProfile?.uid ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.senderId === userProfile?.uid
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {message.senderId !== userProfile?.uid && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-sm font-semibold ${getRoleColor(message.senderRole)}`}>
                      {message.senderName}
                    </span>
                    {getRoleBadge(message.senderRole)}
                  </div>
                )}
                
                <div className="text-sm">{message.content}</div>
                
                <div className={`text-xs mt-1 ${
                  message.senderId === userProfile?.uid 
                    ? 'text-blue-100' 
                    : 'text-gray-500'
                }`}>
                  {formatMessageTime(message.timestamp)}
                  {message.edited && ' (đã chỉnh sửa)'}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            disabled={sending || !activeRoom}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending || !activeRoom}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
