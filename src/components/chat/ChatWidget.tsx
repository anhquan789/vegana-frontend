'use client';

import { useAuth } from '@/contexts/AuthContext';
import { smartChatService } from '@/lib/chat/smartChatService';
import {
    closeSupportSession,
    createSupportSession,
    getUserSupportSession,
    listenToSupportMessages,
    markSupportMessagesAsRead,
    sendSupportMessage
} from '@/lib/chat/supportService';
import { ChatMessage, ChatSession } from '@/types/chat';
import { ChatSuggestion } from '@/types/smartChat';
import { useCallback, useEffect, useRef, useState } from 'react';
import QuickSuggestions from './QuickSuggestions';
import TypingIndicator from './TypingIndicator';

interface ChatWidgetProps {
  position?: 'bottom-right' | 'bottom-left';
}

export default function ChatWidget({ position = 'bottom-right' }: ChatWidgetProps) {
  const { user, userProfile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [suggestions, setSuggestions] = useState<ChatSuggestion[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const positionClasses = position === 'bottom-right' 
    ? 'bottom-6 right-6' 
    : 'bottom-6 left-6';

  const loadUserSession = useCallback(async () => {
    if (!user || !userProfile) return;

    try {
      setLoading(true);
      let existingSession = await getUserSupportSession(user.uid);
      
      if (!existingSession) {
        const sessionId = await createSupportSession(
          user.uid,
          userProfile.firstName || user.email?.split('@')[0] || 'User',
          user.email || '',
          'Hỗ trợ khách hàng'
        );
        existingSession = {
          id: sessionId,
          userId: user.uid,
          userName: userProfile.firstName || user.email?.split('@')[0] || 'User',
          userEmail: user.email || '',
          status: 'waiting',
          subject: 'Hỗ trợ khách hàng',
          lastMessage: '',
          lastMessageTime: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          unreadCount: 0
        };
      }
      
      setSession(existingSession);
    } catch (error) {
      console.error('Error loading user session:', error);
    } finally {
      setLoading(false);
    }
  }, [user, userProfile]);

  useEffect(() => {
    if (user && isOpen && !session) {
      loadUserSession();
    }
  }, [user, isOpen, session, loadUserSession]);

  useEffect(() => {
    if (session) {
      const unsubscribe = listenToSupportMessages(session.id, (newMessages) => {
        setMessages(newMessages);
        
        // Check for new messages from admin
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage && lastMessage.senderRole === 'admin' && !isOpen) {
          setHasNewMessage(true);
        }
        
        // Mark messages as read when chat is open
        if (isOpen && user) {
          markSupportMessagesAsRead(session.id, user.uid);
        }

        // Update suggestions based on last message
        if (lastMessage) {
          const newSuggestions = smartChatService.getSuggestions(lastMessage.content);
          setSuggestions(newSuggestions);
        }
      });

      return () => unsubscribe();
    }
  }, [session, isOpen, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setHasNewMessage(false);
      inputRef.current?.focus();
      
      // Load initial suggestions
      if (messages.length === 0) {
        const initialSuggestions = smartChatService.getSuggestions();
        setSuggestions(initialSuggestions);
      }
    }
  }, [isOpen, messages.length]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !session || !user || !userProfile) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setShowSuggestions(false);

    try {
      // Send user message
      await sendSupportMessage(
        session.id,
        user.uid,
        userProfile.firstName || user.email?.split('@')[0] || 'User',
        'user',
        messageContent
      );

      // Check if should auto-reply
      if (smartChatService.shouldShowAutoReply(messageContent)) {
        setIsTyping(true);
        
        // Simulate typing delay
        setTimeout(async () => {
          const autoReply = smartChatService.generateSmartReply(messageContent);
          
          await sendSupportMessage(
            session.id,
            'system',
            'Trợ lý ảo',
            'admin',
            autoReply
          );
          
          setIsTyping(false);
          
          // Update suggestions after auto reply
          const newSuggestions = smartChatService.getSuggestions(messageContent);
          setSuggestions(newSuggestions);
          setShowSuggestions(true);
        }, 1500 + Math.random() * 1000); // Random delay 1.5-2.5s
      } else {
        // Update suggestions for manual response
        const newSuggestions = smartChatService.getSuggestions(messageContent);
        setSuggestions(newSuggestions);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setNewMessage(messageContent); // Restore message on error
    }
  };

  const handleSuggestionClick = (suggestion: ChatSuggestion) => {
    setNewMessage(suggestion.text);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleClose = async () => {
    if (session) {
      try {
        await closeSupportSession(session.id);
        setSession(null);
        setMessages([]);
      } catch (error) {
        console.error('Error closing session:', error);
      }
    }
    setIsOpen(false);
  };

  if (!user) return null;

  return (
    <div className={`fixed ${positionClasses} z-50`}>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 relative"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          
          {hasNewMessage && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-lg shadow-xl w-96 h-96 flex flex-col">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="font-medium">Hỗ trợ trực tuyến</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <button
                onClick={handleClose}
                className="text-white hover:text-gray-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <p className="text-sm">Chúng tôi đã sẵn sàng hỗ trợ bạn!</p>
                <p className="text-xs mt-1">Thường trả lời trong vòng 5 phút</p>
                
                {/* Welcome suggestions */}
                <div className="mt-4 space-y-2">
                  <p className="text-xs text-gray-400">Các câu hỏi thường gặp:</p>
                  {suggestions.slice(0, 3).map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="block w-full text-left px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                    >
                      {suggestion.text}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderRole === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                        message.senderRole === 'user'
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : message.senderId === 'system'
                          ? 'bg-green-100 text-green-800 rounded-bl-none border border-green-200'
                          : 'bg-gray-100 text-gray-800 rounded-bl-none'
                      }`}
                    >
                      {message.senderId === 'system' && (
                        <div className="flex items-center space-x-1 mb-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs font-medium">Trợ lý ảo</span>
                        </div>
                      )}
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      <p className={`text-xs mt-1 ${
                        message.senderRole === 'user' 
                          ? 'text-blue-100' 
                          : message.senderId === 'system'
                          ? 'text-green-600'
                          : 'text-gray-500'
                      }`}>
                        {new Date(message.timestamp).toLocaleTimeString('vi-VN', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                
                {/* Typing indicator */}
                <TypingIndicator isVisible={isTyping} senderName="Trợ lý ảo" />
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions */}
          <QuickSuggestions
            suggestions={suggestions}
            onSuggestionClick={handleSuggestionClick}
            isVisible={showSuggestions && !isTyping && messages.length > 0}
          />

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập tin nhắn..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                disabled={loading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || loading}
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
