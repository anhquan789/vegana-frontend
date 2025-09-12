'use client';

interface TypingIndicatorProps {
  isVisible: boolean;
  senderName?: string;
}

export default function TypingIndicator({ isVisible, senderName = 'Trợ lý' }: TypingIndicatorProps) {
  if (!isVisible) return null;

  return (
    <div className="flex justify-start mb-3">
      <div className="bg-gray-100 rounded-lg rounded-bl-none px-3 py-2 max-w-xs">
        <div className="flex items-center space-x-1">
          <span className="text-xs text-gray-500">{senderName} đang nhập...</span>
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
