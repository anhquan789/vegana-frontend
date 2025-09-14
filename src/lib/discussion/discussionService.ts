import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { 
  Discussion, 
  DiscussionReply, 
  DiscussionModeration, 
  DiscussionSettings,
  DiscussionAttachment 
} from '@/types/discussion';

export class DiscussionService {
  private static instance: DiscussionService;

  static getInstance(): DiscussionService {
    if (!DiscussionService.instance) {
      DiscussionService.instance = new DiscussionService();
    }
    return DiscussionService.instance;
  }

  // Discussion CRUD operations
  async createDiscussion(discussionData: Omit<Discussion, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'replyCount' | 'status'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'discussions'), {
      ...discussionData,
      viewCount: 0,
      replyCount: 0,
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  }

  async updateDiscussion(discussionId: string, updates: Partial<Discussion>): Promise<void> {
    const docRef = doc(db, 'discussions', discussionId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  }

  async deleteDiscussion(discussionId: string): Promise<void> {
    await updateDoc(doc(db, 'discussions', discussionId), {
      status: 'deleted',
      updatedAt: serverTimestamp()
    });
  }

  async getDiscussion(discussionId: string): Promise<Discussion | null> {
    const docRef = doc(db, 'discussions', discussionId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      // Increment view count
      await updateDoc(docRef, {
        viewCount: increment(1)
      });
      
      return { id: docSnap.id, ...docSnap.data() } as Discussion;
    }
    return null;
  }

  async getCourseDiscussions(
    courseId: string, 
    category?: string
  ): Promise<Discussion[]> {
    let q = query(
      collection(db, 'discussions'),
      where('courseId', '==', courseId),
      where('status', '==', 'active'),
      orderBy('isPinned', 'desc'),
      orderBy('lastReplyAt', 'desc')
    );

    if (category && category !== 'all') {
      q = query(
        collection(db, 'discussions'),
        where('courseId', '==', courseId),
        where('category', '==', category),
        where('status', '==', 'active'),
        orderBy('isPinned', 'desc'),
        orderBy('lastReplyAt', 'desc')
      );
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    })) as Discussion[];
  }

  // Reply operations
  async createReply(replyData: Omit<DiscussionReply, 'id' | 'createdAt' | 'updatedAt' | 'likes' | 'likedBy' | 'status'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'discussionReplies'), {
      ...replyData,
      likes: 0,
      likedBy: [],
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Update discussion reply count and last reply info
    await updateDoc(doc(db, 'discussions', replyData.discussionId), {
      replyCount: increment(1),
      lastReplyAt: serverTimestamp(),
      lastReplyBy: replyData.authorName,
      updatedAt: serverTimestamp()
    });

    return docRef.id;
  }

  async updateReply(replyId: string, updates: Partial<DiscussionReply>): Promise<void> {
    const docRef = doc(db, 'discussionReplies', replyId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  }

  async deleteReply(replyId: string): Promise<void> {
    const reply = await this.getReply(replyId);
    if (!reply) return;

    await updateDoc(doc(db, 'discussionReplies', replyId), {
      status: 'deleted',
      updatedAt: serverTimestamp()
    });

    // Decrease discussion reply count
    await updateDoc(doc(db, 'discussions', reply.discussionId), {
      replyCount: increment(-1),
      updatedAt: serverTimestamp()
    });
  }

  async getReply(replyId: string): Promise<DiscussionReply | null> {
    const docSnap = await getDoc(doc(db, 'discussionReplies', replyId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as DiscussionReply;
    }
    return null;
  }

  async getDiscussionReplies(discussionId: string): Promise<DiscussionReply[]> {
    const q = query(
      collection(db, 'discussionReplies'),
      where('discussionId', '==', discussionId),
      where('status', '==', 'active'),
      orderBy('isAcceptedAnswer', 'desc'),
      orderBy('createdAt', 'asc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    })) as DiscussionReply[];
  }

  // Like/Unlike functionality
  async toggleReplyLike(replyId: string, userId: string): Promise<void> {
    const replyRef = doc(db, 'discussionReplies', replyId);
    const reply = await this.getReply(replyId);
    
    if (!reply) return;

    const isLiked = reply.likedBy.includes(userId);
    
    if (isLiked) {
      // Unlike
      await updateDoc(replyRef, {
        likes: increment(-1),
        likedBy: arrayRemove(userId)
      });
    } else {
      // Like
      await updateDoc(replyRef, {
        likes: increment(1),
        likedBy: arrayUnion(userId)
      });
    }
  }

  async markAsAcceptedAnswer(replyId: string, discussionId: string): Promise<void> {
    // First, remove accepted status from other replies
    const replies = await this.getDiscussionReplies(discussionId);
    for (const reply of replies) {
      if (reply.isAcceptedAnswer && reply.id !== replyId) {
        await updateDoc(doc(db, 'discussionReplies', reply.id), {
          isAcceptedAnswer: false
        });
      }
    }

    // Mark the selected reply as accepted
    await updateDoc(doc(db, 'discussionReplies', replyId), {
      isAcceptedAnswer: true
    });
  }

  // Attachment operations
  async uploadAttachment(
    file: File, 
    discussionId: string
  ): Promise<DiscussionAttachment> {
    const fileName = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `discussions/${discussionId}/${fileName}`);
    
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    
    return {
      id: fileName,
      name: file.name,
      url,
      type: file.type,
      size: file.size,
      uploadedAt: new Date().toISOString()
    };
  }

  // Moderation operations
  async reportContent(
    reportData: Omit<DiscussionModeration, 'id' | 'status' | 'reportedAt'>
  ): Promise<string> {
    const docRef = await addDoc(collection(db, 'discussionModerations'), {
      ...reportData,
      status: 'pending',
      reportedAt: serverTimestamp()
    });
    return docRef.id;
  }

  async getModerationReports(status?: string): Promise<DiscussionModeration[]> {
    let q = query(
      collection(db, 'discussionModerations'),
      orderBy('reportedAt', 'desc')
    );

    if (status) {
      q = query(
        collection(db, 'discussionModerations'),
        where('status', '==', status),
        orderBy('reportedAt', 'desc')
      );
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    })) as DiscussionModeration[];
  }

  async reviewModerationReport(
    reportId: string,
    moderatorId: string,
    action: 'none' | 'warning' | 'hidden' | 'deleted' | 'user_suspended',
    notes?: string
  ): Promise<void> {
    await updateDoc(doc(db, 'discussionModerations', reportId), {
      status: 'reviewed',
      moderatorId,
      actionTaken: action,
      moderatorNotes: notes,
      reviewedAt: serverTimestamp()
    });

    // Apply the moderation action
    const report = await this.getModerationReport(reportId);
    if (!report) return;

    if (action === 'hidden' || action === 'deleted') {
      if (report.discussionId) {
        await this.updateDiscussion(report.discussionId, { status: action });
      }
      if (report.replyId) {
        await this.updateReply(report.replyId, { status: action });
      }
    }
  }

  private async getModerationReport(reportId: string): Promise<DiscussionModeration | null> {
    const docSnap = await getDoc(doc(db, 'discussionModerations', reportId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as DiscussionModeration;
    }
    return null;
  }

  // Settings operations
  async updateDiscussionSettings(
    courseId: string, 
    settings: Partial<DiscussionSettings>
  ): Promise<void> {
    const docRef = doc(db, 'discussionSettings', courseId);
    await updateDoc(docRef, {
      ...settings,
      updatedAt: serverTimestamp()
    });
  }

  async getDiscussionSettings(courseId: string): Promise<DiscussionSettings | null> {
    const docSnap = await getDoc(doc(db, 'discussionSettings', courseId));
    if (docSnap.exists()) {
      return docSnap.data() as DiscussionSettings;
    }
    return null;
  }

  // Search functionality
  async searchDiscussions(
    courseId: string, 
    searchTerm: string, 
    category?: string
  ): Promise<Discussion[]> {
    // Simple text search - in production, consider using Algolia or similar
    const discussions = await this.getCourseDiscussions(courseId, category);
    
    const searchLower = searchTerm.toLowerCase();
    return discussions.filter(discussion => 
      discussion.title.toLowerCase().includes(searchLower) ||
      discussion.content.toLowerCase().includes(searchLower) ||
      discussion.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  }

  // Real-time listeners
  listenToCourseDiscussions(
    courseId: string, 
    callback: (discussions: Discussion[]) => void
  ): () => void {
    const q = query(
      collection(db, 'discussions'),
      where('courseId', '==', courseId),
      where('status', '==', 'active'),
      orderBy('isPinned', 'desc'),
      orderBy('lastReplyAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const discussions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Discussion[];
      callback(discussions);
    });
  }

  listenToDiscussionReplies(
    discussionId: string, 
    callback: (replies: DiscussionReply[]) => void
  ): () => void {
    const q = query(
      collection(db, 'discussionReplies'),
      where('discussionId', '==', discussionId),
      where('status', '==', 'active'),
      orderBy('isAcceptedAnswer', 'desc'),
      orderBy('createdAt', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const replies = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DiscussionReply[];
      callback(replies);
    });
  }

  // Statistics
  async getDiscussionStats(courseId: string): Promise<{
    totalDiscussions: number;
    totalReplies: number;
    activeUsers: number;
    resolvedQuestions: number;
  }> {
    const discussions = await this.getCourseDiscussions(courseId);
    const totalDiscussions = discussions.length;
    
    let totalReplies = 0;
    let resolvedQuestions = 0;
    const activeUsers = new Set<string>();

    for (const discussion of discussions) {
      totalReplies += discussion.replyCount;
      activeUsers.add(discussion.authorId);
      
      if (discussion.category === 'question') {
        const replies = await this.getDiscussionReplies(discussion.id);
        if (replies.some(reply => reply.isAcceptedAnswer)) {
          resolvedQuestions++;
        }
      }
    }

    return {
      totalDiscussions,
      totalReplies,
      activeUsers: activeUsers.size,
      resolvedQuestions
    };
  }
}

export const discussionService = DiscussionService.getInstance();
