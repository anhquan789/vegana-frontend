import {
    addDoc,
    collection,
    doc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    setDoc,
    updateDoc,
    where
} from 'firebase/firestore';
import { ChatMessage, ChatSession, ChatTyping } from '../../types/chat';
import { db } from '../firebase';

const SUPPORT_SESSIONS_COLLECTION = 'supportSessions';
const SUPPORT_MESSAGES_COLLECTION = 'supportMessages';
const SUPPORT_TYPING_COLLECTION = 'supportTyping';

// Create new support chat session
export const createSupportSession = async (userId: string, userName: string, userEmail: string, subject?: string): Promise<string> => {
  try {
    const chatSession: Omit<ChatSession, 'id'> = {
      userId,
      userName,
      userEmail,
      status: 'waiting',
      subject: subject || 'Hỗ trợ khách hàng',
      lastMessage: '',
      lastMessageTime: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      unreadCount: 0
    };

    const docRef = await addDoc(collection(db, SUPPORT_SESSIONS_COLLECTION), chatSession);
    return docRef.id;
  } catch (error) {
    console.error('Error creating support session:', error);
    throw error;
  }
};

// Get user's active support session
export const getUserSupportSession = async (userId: string): Promise<ChatSession | null> => {
  try {
    const q = query(
      collection(db, SUPPORT_SESSIONS_COLLECTION),
      where('userId', '==', userId),
      where('status', 'in', ['waiting', 'active']),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as ChatSession;
  } catch (error) {
    console.error('Error getting user support session:', error);
    throw error;
  }
};

// Send support message
export const sendSupportMessage = async (
  chatId: string, 
  senderId: string, 
  senderName: string, 
  senderRole: 'user' | 'admin',
  content: string,
  type: 'text' | 'image' | 'file' = 'text'
): Promise<void> => {
  try {
    const message: Omit<ChatMessage, 'id'> = {
      chatId,
      senderId,
      senderName,
      senderRole,
      content,
      type,
      timestamp: new Date().toISOString(),
      isRead: false
    };

    await addDoc(collection(db, SUPPORT_MESSAGES_COLLECTION), message);
    
    // Update chat session
    await updateDoc(doc(db, SUPPORT_SESSIONS_COLLECTION, chatId), {
      lastMessage: content,
      lastMessageTime: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active'
    });
  } catch (error) {
    console.error('Error sending support message:', error);
    throw error;
  }
};

// Listen to support messages in a chat
export const listenToSupportMessages = (chatId: string, callback: (messages: ChatMessage[]) => void) => {
  const q = query(
    collection(db, SUPPORT_MESSAGES_COLLECTION),
    where('chatId', '==', chatId),
    orderBy('timestamp', 'asc')
  );

  return onSnapshot(q, (querySnapshot) => {
    const messages: ChatMessage[] = [];
    querySnapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() } as ChatMessage);
    });
    callback(messages);
  });
};

// Listen to support sessions (for admin)
export const listenToSupportSessions = (callback: (sessions: ChatSession[]) => void) => {
  const q = query(
    collection(db, SUPPORT_SESSIONS_COLLECTION),
    orderBy('updatedAt', 'desc')
  );

  return onSnapshot(q, (querySnapshot) => {
    const sessions: ChatSession[] = [];
    querySnapshot.forEach((doc) => {
      sessions.push({ id: doc.id, ...doc.data() } as ChatSession);
    });
    callback(sessions);
  });
};

// Assign admin to support chat
export const assignAdminToSupport = async (chatId: string, adminId: string, adminName: string): Promise<void> => {
  try {
    await updateDoc(doc(db, SUPPORT_SESSIONS_COLLECTION, chatId), {
      adminId,
      adminName,
      status: 'active',
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error assigning admin to support:', error);
    throw error;
  }
};

// Close support session
export const closeSupportSession = async (chatId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, SUPPORT_SESSIONS_COLLECTION, chatId), {
      status: 'closed',
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error closing support session:', error);
    throw error;
  }
};

// Mark support messages as read
export const markSupportMessagesAsRead = async (chatId: string, userId: string): Promise<void> => {
  try {
    const q = query(
      collection(db, SUPPORT_MESSAGES_COLLECTION),
      where('chatId', '==', chatId),
      where('senderId', '!=', userId),
      where('isRead', '==', false)
    );
    
    const querySnapshot = await getDocs(q);
    const updatePromises = querySnapshot.docs.map(doc => 
      updateDoc(doc.ref, { isRead: true })
    );
    
    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error marking support messages as read:', error);
    throw error;
  }
};

// Set typing indicator for support
export const setSupportTypingIndicator = async (chatId: string, userId: string, userName: string, isTyping: boolean): Promise<void> => {
  try {
    const typingDoc = doc(db, SUPPORT_TYPING_COLLECTION, `${chatId}_${userId}`);
    
    if (isTyping) {
      const typingData = {
        chatId,
        userId,
        userName,
        isTyping: true,
        timestamp: new Date().toISOString()
      };
      await setDoc(typingDoc, typingData);
    } else {
      await updateDoc(typingDoc, { isTyping: false });
    }
  } catch (error) {
    console.error('Error setting support typing indicator:', error);
  }
};

// Listen to support typing indicators
export const listenToSupportTyping = (chatId: string, callback: (typing: ChatTyping[]) => void) => {
  const q = query(
    collection(db, SUPPORT_TYPING_COLLECTION),
    where('chatId', '==', chatId),
    where('isTyping', '==', true)
  );

  return onSnapshot(q, (querySnapshot) => {
    const typing: ChatTyping[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as ChatTyping;
      // Only show typing if it's recent (last 10 seconds)
      const isRecent = new Date().getTime() - new Date(data.timestamp).getTime() < 10000;
      if (isRecent) {
        typing.push(data);
      }
    });
    callback(typing);
  });
};
