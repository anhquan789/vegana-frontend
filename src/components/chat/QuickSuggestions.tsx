'use client';

import { ChatSuggestion } from '@/types/smartChat';

interface QuickSuggestionsProps {
  suggestions: ChatSuggestion[];
  onSuggestionClick: (suggestion: ChatSuggestion) => void;
  isVisible: boolean;
}

export default function QuickSuggestions({ 
  suggestions, 
  onSuggestionClick, 
  isVisible 
}: QuickSuggestionsProps) {
  if (!isVisible || suggestions.length === 0) return null;

  return (
    <div className="px-4 pb-2">
      <div className="text-xs text-gray-500 mb-2">Câu hỏi gợi ý:</div>
      <div className="space-y-1">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.id}
            onClick={() => onSuggestionClick(suggestion)}
            className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-gray-700">{suggestion.text}</span>
              <div className="flex items-center space-x-1">
                {suggestion.type === 'question' && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    Câu hỏi
                  </span>
                )}
                {suggestion.type === 'quick_reply' && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Trả lời nhanh
                  </span>
                )}
                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
