import { db } from '@/lib/firebase';
import {
    addDoc,
    collection,
    doc,
    getDocs,
    limit,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where
} from 'firebase/firestore';

export interface ChatMessage {
  id: string;
  courseId: string;
  senderId: string;
  senderName: string;
  senderRole: 'student' | 'instructor' | 'admin';
  content: string;
  type: 'text' | 'image' | 'file';
  timestamp: Date;
  edited?: boolean;
  editedAt?: Date;
  replyTo?: string;
}

export interface ChatRoom {
  id: string;
  courseId: string;
  name: string;
  type: 'general' | 'qa' | 'announcements';
  participants: string[];
  lastMessage?: ChatMessage;
  createdAt: Date;
  isActive: boolean;
}

const COLLECTIONS = {
  CHAT_ROOMS: 'chat_rooms',
  MESSAGES: 'messages',
};

/**
 * Create a chat room for a course
 */
export const createChatRoom = async (
  courseId: string,
  name: string,
  type: ChatRoom['type'] = 'general'
): Promise<string> => {
  try {
    const chatRoomData = {
      courseId,
      name,
      type,
      participants: [],
      createdAt: serverTimestamp(),
      isActive: true,
    };

    const docRef = await addDoc(collection(db, COLLECTIONS.CHAT_ROOMS), chatRoomData);
    console.log('✅ Chat room created:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error creating chat room:', error);
    throw error;
  }
};

/**
 * Get chat rooms for a course
 */
export const getChatRooms = async (courseId: string): Promise<ChatRoom[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.CHAT_ROOMS),
      where('courseId', '==', courseId),
      where('isActive', '==', true),
      orderBy('createdAt', 'asc')
    );

    const querySnapshot = await getDocs(q);
    const chatRooms = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as ChatRoom;
    });

    return chatRooms;
  } catch (error) {
    console.error('❌ Error getting chat rooms:', error);
    return [];
  }
};

/**
 * Send a message to a chat room
 */
export const sendMessage = async (
  roomId: string,
  courseId: string,
  senderId: string,
  senderName: string,
  senderRole: ChatMessage['senderRole'],
  content: string,
  type: ChatMessage['type'] = 'text',
  replyTo?: string
): Promise<string> => {
  try {
    const messageData = {
      courseId,
      roomId,
      senderId,
      senderName,
      senderRole,
      content,
      type,
      timestamp: serverTimestamp(),
      edited: false,
      ...(replyTo && { replyTo })
    };

    const docRef = await addDoc(collection(db, COLLECTIONS.MESSAGES), messageData);
    
    // Update room's last message
    await updateDoc(doc(db, COLLECTIONS.CHAT_ROOMS, roomId), {
      lastMessage: {
        id: docRef.id,
        senderId,
        senderName,
        content: type === 'text' ? content : `[${type}]`,
        timestamp: new Date(),
      }
    });

    console.log('✅ Message sent:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error sending message:', error);
    throw error;
  }
};

/**
 * Get messages for a chat room
 */
export const getMessages = async (
  roomId: string,
  limitCount: number = 50
): Promise<ChatMessage[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.MESSAGES),
      where('roomId', '==', roomId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const messages = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate() || new Date(),
        editedAt: data.editedAt?.toDate(),
      } as ChatMessage;
    }).reverse(); // Reverse to show oldest first

    return messages;
  } catch (error) {
    console.error('❌ Error getting messages:', error);
    return [];
  }
};

/**
 * Subscribe to real-time messages
 */
export const subscribeToMessages = (
  roomId: string,
  callback: (messages: ChatMessage[]) => void,
  limitCount: number = 50
) => {
  const q = query(
    collection(db, COLLECTIONS.MESSAGES),
    where('roomId', '==', roomId),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate() || new Date(),
        editedAt: data.editedAt?.toDate(),
      } as ChatMessage;
    }).reverse();

    callback(messages);
  });
};

/**
 * Subscribe to chat rooms
 */
export const subscribeToChatRooms = (
  courseId: string,
  callback: (rooms: ChatRoom[]) => void
) => {
  const q = query(
    collection(db, COLLECTIONS.CHAT_ROOMS),
    where('courseId', '==', courseId),
    where('isActive', '==', true),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const rooms = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as ChatRoom;
    });

    callback(rooms);
  });
};

/**
 * Edit a message
 */
export const editMessage = async (
  messageId: string,
  newContent: string
): Promise<void> => {
  try {
    await updateDoc(doc(db, COLLECTIONS.MESSAGES, messageId), {
      content: newContent,
      edited: true,
      editedAt: serverTimestamp(),
    });

    console.log('✅ Message edited:', messageId);
  } catch (error) {
    console.error('❌ Error editing message:', error);
    throw error;
  }
};

/**
 * Join a chat room
 */
export const joinChatRoom = async (
  roomId: string,
  userId: string
): Promise<void> => {
  try {
    const roomRef = doc(db, COLLECTIONS.CHAT_ROOMS, roomId);
    
    // Add user to participants if not already present
    await updateDoc(roomRef, {
      participants: [...new Set([userId])] // This will need proper array union in real implementation
    });

    console.log('✅ Joined chat room:', roomId);
  } catch (error) {
    console.error('❌ Error joining chat room:', error);
    throw error;
  }
};

/**
 * Format message timestamp
 */
export const formatMessageTime = (timestamp: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - timestamp.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return 'Vừa xong';
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  
  return timestamp.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};
