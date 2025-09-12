export interface QuickQuestion {
  id: string;
  text: string;
  category: 'course' | 'payment' | 'technical' | 'general';
  keywords: string[];
}

export interface AutoReply {
  id: string;
  keywords: string[];
  response: string;
  category: string;
  followUpQuestions?: QuickQuestion[];
}

export interface ChatSuggestion {
  id: string;
  text: string;
  type: 'quick_reply' | 'question' | 'action';
  action?: string;
}

export interface SmartChatState {
  suggestions: ChatSuggestion[];
  isTyping: boolean;
  lastBotMessage?: string;
  userIntent?: string;
}
