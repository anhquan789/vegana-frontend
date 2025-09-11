export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderRole: 'user' | 'admin';
  content: string;
  type: 'text' | 'image' | 'file';
  timestamp: string;
  isRead: boolean;
}

export interface ChatSession {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  adminId?: string;
  adminName?: string;
  status: 'waiting' | 'active' | 'closed';
  subject?: string;
  lastMessage?: string;
  lastMessageTime: string;
  createdAt: string;
  updatedAt: string;
  unreadCount: number;
}

export interface ChatTyping {
  chatId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
  timestamp: string;
}
