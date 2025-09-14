export interface Certificate {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  courseId: string;
  courseName: string;
  instructorName: string;
  completionDate: string;
  issuedDate: string;
  certificateNumber: string;
  grade?: string;
  score?: number;
  creditsEarned?: number;
  validUntil?: string;
  pdfUrl?: string;
  verificationCode: string;
  status: 'issued' | 'revoked' | 'expired';
  metadata: {
    templateId: string;
    courseHours: number;
    skills: string[];
    achievements: string[];
  };
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: 'completion' | 'achievement' | 'skill' | 'special';
  criteria: BadgeCriteria;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  points: number;
  createdAt: string;
}

export interface BadgeCriteria {
  type: 'course_completion' | 'quiz_score' | 'streak' | 'time_spent' | 'custom';
  requirements: {
    courseIds?: string[];
    minScore?: number;
    streakDays?: number;
    hoursSpent?: number;
    customConditions?: string;
  };
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  earnedAt: string;
  metadata?: {
    score?: number;
    courseId?: string;
    achievementData?: Record<string, unknown>;
  };
}

export interface CertificateTemplate {
  id: string;
  name: string;
  description: string;
  courseIds: string[];
  templateUrl: string;
  thumbnailUrl: string;
  fields: CertificateField[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CertificateField {
  id: string;
  name: string;
  type: 'text' | 'date' | 'signature' | 'logo' | 'qr_code';
  x: number; // Position X
  y: number; // Position Y
  width: number;
  height: number;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  alignment?: 'left' | 'center' | 'right';
}
