'use client';

import { QUICK_QUESTIONS } from '@/constants/smartChat';
import { smartChatService } from '@/lib/chat/smartChatService';
import { useState } from 'react';

export default function SmartChatDemo() {
  const [testMessage, setTestMessage] = useState('');
  const [response, setResponse] = useState('');
  const [suggestions, setSuggestions] = useState(smartChatService.getSuggestions());

  const handleTest = () => {
    const reply = smartChatService.generateSmartReply(testMessage);
    setResponse(reply);
    
    const newSuggestions = smartChatService.getSuggestions(testMessage);
    setSuggestions(newSuggestions);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Demo Hệ thống Chat Thông minh</h2>
        
        {/* Test input */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nhập tin nhắn test:
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Ví dụ: Làm sao để đăng ký khóa học?"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleTest}
                disabled={!testMessage.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Test
              </button>
            </div>
          </div>

          {/* Response */}
          {response && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <h3 className="font-medium text-green-800 mb-2">Phản hồi tự động:</h3>
              <div className="text-green-700 whitespace-pre-wrap">{response}</div>
            </div>
          )}
        </div>
      </div>

      {/* Quick questions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Câu hỏi thường gặp</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {QUICK_QUESTIONS.map((question) => (
            <button
              key={question.id}
              onClick={() => setTestMessage(question.text)}
              className="text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
            >
              <div className="font-medium text-gray-800">{question.text}</div>
              <div className="text-xs text-gray-500 mt-1">
                Từ khóa: {question.keywords.join(', ')}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Suggestions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Gợi ý hiện tại</h3>
        <div className="space-y-2">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-md"
            >
              <span className="text-blue-800">{suggestion.text}</span>
              <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
                {suggestion.type}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Features info */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Tính năng Chat Thông minh</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">🤖 Trả lời tự động</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Nhận diện từ khóa thông minh</li>
              <li>• Phản hồi ngay lập tức</li>
              <li>• Tìm kiếm gần đúng (fuzzy matching)</li>
              <li>• Phân tích ý định người dùng</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">💡 Gợi ý thông minh</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Câu hỏi thường gặp</li>
              <li>• Gợi ý theo ngữ cảnh</li>
              <li>• Follow-up questions</li>
              <li>• Phân loại theo chủ đề</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
