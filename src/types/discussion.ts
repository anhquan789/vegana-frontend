export interface Discussion {
  id: string;
  courseId: string;
  lessonId?: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole: 'student' | 'instructor' | 'admin';
  category: 'general' | 'question' | 'announcement' | 'assignment';
  tags: string[];
  isPinned: boolean;
  isLocked: boolean;
  viewCount: number;
  replyCount: number;
  lastReplyAt?: string;
  lastReplyBy?: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'hidden' | 'deleted';
  attachments: DiscussionAttachment[];
}

export interface DiscussionReply {
  id: string;
  discussionId: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole: 'student' | 'instructor' | 'admin';
  parentReplyId?: string; // For nested replies
  isAcceptedAnswer: boolean;
  likes: number;
  likedBy: string[];
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'hidden' | 'deleted';
  attachments: DiscussionAttachment[];
  mentions: string[]; // User IDs mentioned in reply
}

export interface DiscussionAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: string;
}

export interface DiscussionModeration {
  id: string;
  discussionId?: string;
  replyId?: string;
  reportedBy: string;
  reason: 'spam' | 'inappropriate' | 'off-topic' | 'harassment' | 'other';
  description: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  moderatorId?: string;
  moderatorNotes?: string;
  actionTaken?: 'none' | 'warning' | 'hidden' | 'deleted' | 'user_suspended';
  reportedAt: string;
  reviewedAt?: string;
}

export interface DiscussionSettings {
  courseId: string;
  allowStudentPosts: boolean;
  allowAnonymous: boolean;
  requireApproval: boolean;
  allowAttachments: boolean;
  maxAttachmentSize: number; // MB
  allowedFileTypes: string[];
  autoLockAfterDays?: number;
  moderatorIds: string[];
  notificationSettings: {
    newPosts: boolean;
    newReplies: boolean;
    mentions: boolean;
    reports: boolean;
  };
}

export interface DiscussionNotification {
  id: string;
  userId: string;
  type: 'new_post' | 'new_reply' | 'mention' | 'accepted_answer' | 'moderation';
  discussionId: string;
  replyId?: string;
  triggeredBy: string;
  triggeredByName: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}
