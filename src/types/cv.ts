// CV Builder Types
export interface CVProfile {
  id: string;
  userId: string;
  title: string; // CV title/name
  template: CVTemplate;
  sections: CVSection[];
  settings: CVSettings;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  shareUrl?: string;
  downloadCount: number;
  status: 'draft' | 'published' | 'archived';
}

export interface CVTemplate {
  id: string;
  name: string;
  description: string;
  category: 'modern' | 'classic' | 'creative' | 'minimal' | 'professional';
  thumbnail: string;
  layout: 'single-column' | 'two-column' | 'three-column';
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    background: string;
  };
  fonts: {
    heading: string;
    body: string;
    size: {
      heading: number;
      body: number;
      small: number;
    };
  };
  spacing: {
    margin: number;
    padding: number;
    lineHeight: number;
  };
  isPremium: boolean;
}

export interface CVSettings {
  pageSize: 'A4' | 'Letter' | 'Legal';
  orientation: 'portrait' | 'landscape';
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  showPageNumbers: boolean;
  headerFooter: {
    showHeader: boolean;
    showFooter: boolean;
    headerText?: string;
    footerText?: string;
  };
  privacy: {
    hideContact: boolean;
    hidePersonalInfo: boolean;
    showWatermark: boolean;
  };
}

export interface CVSection {
  id: string;
  type: CVSectionType;
  title: string;
  order: number;
  isVisible: boolean;
  isRequired: boolean;
  content: CVSectionContent;
  layout?: {
    columns: number;
    spacing: number;
    alignment: 'left' | 'center' | 'right';
  };
}

export type CVSectionType = 
  | 'personal-info'
  | 'summary'
  | 'skills'
  | 'experience'
  | 'education'
  | 'projects'
  | 'certificates'
  | 'awards'
  | 'courses'
  | 'languages'
  | 'references'
  | 'custom';

export interface CVSectionContent {
  personalInfo?: PersonalInfo;
  summary?: Summary;
  skills?: Skill[];
  experience?: Experience[];
  education?: Education[];
  projects?: Project[];
  certificates?: Certificate[];
  awards?: Award[];
  courses?: CourseResult[];
  languages?: Language[];
  references?: Reference[];
  custom?: CustomSection;
}

// Personal Information
export interface PersonalInfo {
  firstName: string;
  lastName: string;
  title: string; // Job title/position
  avatar?: string;
  contact: {
    email: string;
    phone?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      zipCode?: string;
    };
    website?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
    socialLinks?: SocialLink[];
  };
  dateOfBirth?: Date;
  nationality?: string;
  maritalStatus?: string;
}

export interface SocialLink {
  platform: string;
  url: string;
  icon?: string;
}

// Summary
export interface Summary {
  content: string;
  keywords: string[];
}

// Skills
export interface Skill {
  id: string;
  name: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  rating?: number; // 1-5 stars
  yearsOfExperience?: number;
  endorsements?: number;
  isHighlighted?: boolean;
}

// Work Experience
export interface Experience {
  id: string;
  company: string;
  position: string;
  location?: string;
  startDate: Date;
  endDate?: Date;
  isCurrent: boolean;
  description: string;
  achievements: string[];
  technologies: string[];
  companyLogo?: string;
  companyWebsite?: string;
  references?: ContactReference[];
}

export interface ContactReference {
  name: string;
  title: string;
  email?: string;
  phone?: string;
}

// Education
export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: Date;
  endDate?: Date;
  isCurrent: boolean;
  gpa?: number;
  maxGpa?: number;
  description?: string;
  achievements?: string[];
  coursework?: string[];
  location?: string;
  institutionLogo?: string;
}

// Projects
export interface Project {
  id: string;
  name: string;
  description: string;
  role: string;
  startDate: Date;
  endDate?: Date;
  technologies: string[];
  features: string[];
  demoUrl?: string;
  repoUrl?: string;
  images: string[];
  thumbnail?: string;
  teamSize?: number;
  status: 'completed' | 'in-progress' | 'on-hold' | 'cancelled';
}

// Certificates & Awards
export interface Certificate {
  id: string;
  name: string;
  issuer: string;
  issueDate: Date;
  expiryDate?: Date;
  credentialId?: string;
  verificationUrl?: string;
  description?: string;
  skills: string[];
  badge?: string;
  pdfUrl?: string;
}

export interface Award {
  id: string;
  name: string;
  issuer: string;
  date: Date;
  description?: string;
  category: string;
  rank?: string; // 1st place, 2nd place, etc.
  prize?: string;
  certificateUrl?: string;
}

// Course Results (từ platform)
export interface CourseResult {
  id: string;
  courseId: string;
  courseName: string;
  instructor: string;
  completionDate: Date;
  score?: number;
  grade?: string;
  certificate?: Certificate;
  skills: string[];
  duration: number; // hours
  progress: number; // percentage
  category: string;
}

// Languages
export interface Language {
  id: string;
  name: string;
  level: 'elementary' | 'intermediate' | 'advanced' | 'fluent' | 'native';
  certification?: string;
  description?: string;
}

// References
export interface Reference {
  id: string;
  name: string;
  title: string;
  company: string;
  email?: string;
  phone?: string;
  relationship: string;
  description?: string;
  linkedin?: string;
}

// Custom Section
export interface CustomSection {
  title: string;
  content: string;
  format: 'text' | 'list' | 'table' | 'timeline';
  items?: CustomItem[];
}

export interface CustomItem {
  id: string;
  title?: string;
  content: string;
  date?: Date;
  url?: string;
}

// CV Builder State
export interface CVBuilderState {
  currentCV: CVProfile | null;
  selectedSection: string | null;
  previewMode: boolean;
  isDirty: boolean;
  isLoading: boolean;
  error: string | null;
}

// CV Export Options
export interface CVExportOptions {
  format: 'pdf' | 'html' | 'docx' | 'json';
  quality: 'low' | 'medium' | 'high';
  includeImages: boolean;
  includeLinks: boolean;
  watermark?: {
    text: string;
    opacity: number;
    position: 'top' | 'bottom' | 'center';
  };
}

// CV Analytics
export interface CVAnalytics {
  cvId: string;
  views: number;
  downloads: number;
  shares: number;
  completenessScore: number;
  suggestions: string[];
  lastViewed?: Date;
  popularSections: string[];
}

// CV Share Settings
export interface CVShareSettings {
  isPublic: boolean;
  allowDownload: boolean;
  requireAuth: boolean;
  expiryDate?: Date;
  password?: string;
  allowedEmails?: string[];
  trackViews: boolean;
}

// Template Categories & Filters
export interface TemplateFilter {
  category?: string[];
  layout?: string[];
  isPremium?: boolean;
  colorScheme?: string[];
  industry?: string[];
}

export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  templates: string[];
}
