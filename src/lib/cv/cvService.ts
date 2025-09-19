import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    Timestamp,
    updateDoc,
    where,
    writeBatch
} from 'firebase/firestore';
import {
    getDownloadURL,
    ref,
    uploadBytes
} from 'firebase/storage';
import {
    CVProfile,
    CVSection,
    CVSettings,
    CVShareSettings,
    CVTemplate,
    PersonalInfo
} from '../../types/cv';
import { db, storage } from '../firebase';

export class CVService {
  /**
   * Create a new CV profile
   */
  static async createCV(
    userId: string, 
    title: string, 
    templateId: string
  ): Promise<string> {
    try {
      const template = await this.getTemplate(templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      const defaultSections: CVSection[] = [
        {
          id: 'personal-info',
          type: 'personal-info',
          title: 'Personal Information',
          order: 1,
          isVisible: true,
          isRequired: true,
          content: { personalInfo: this.getDefaultPersonalInfo() }
        },
        {
          id: 'summary',
          type: 'summary',
          title: 'Professional Summary',
          order: 2,
          isVisible: true,
          isRequired: false,
          content: { summary: { content: '', keywords: [] } }
        },
        {
          id: 'experience',
          type: 'experience',
          title: 'Work Experience',
          order: 3,
          isVisible: true,
          isRequired: false,
          content: { experience: [] }
        },
        {
          id: 'education',
          type: 'education',
          title: 'Education',
          order: 4,
          isVisible: true,
          isRequired: false,
          content: { education: [] }
        },
        {
          id: 'skills',
          type: 'skills',
          title: 'Skills',
          order: 5,
          isVisible: true,
          isRequired: false,
          content: { skills: [] }
        }
      ];

      const cvData: Omit<CVProfile, 'id'> = {
        userId,
        title,
        template,
        sections: defaultSections,
        settings: this.getDefaultSettings(),
        createdAt: new Date(),
        updatedAt: new Date(),
        isPublic: false,
        downloadCount: 0,
        status: 'draft'
      };

      const docRef = await addDoc(collection(db, 'cvProfiles'), {
        ...cvData,
        createdAt: Timestamp.fromDate(cvData.createdAt),
        updatedAt: Timestamp.fromDate(cvData.updatedAt)
      });

      return docRef.id;
    } catch (error) {
      console.error('Error creating CV:', error);
      throw error;
    }
  }

  /**
   * Get CV by ID
   */
  static async getCVById(cvId: string): Promise<CVProfile | null> {
    try {
      const docRef = doc(db, 'cvProfiles', cvId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as CVProfile;
      }

      return null;
    } catch (error) {
      console.error('Error getting CV:', error);
      throw error;
    }
  }

  /**
   * Get all CVs for a user
   */
  static async getUserCVs(
    userId: string, 
    status?: CVProfile['status']
  ): Promise<CVProfile[]> {
    try {
      let q = query(
        collection(db, 'cvProfiles'),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      );

      if (status) {
        q = query(
          collection(db, 'cvProfiles'),
          where('userId', '==', userId),
          where('status', '==', status),
          orderBy('updatedAt', 'desc')
        );
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as CVProfile;
      });
    } catch (error) {
      console.error('Error getting user CVs:', error);
      throw error;
    }
  }

  /**
   * Update CV
   */
  static async updateCV(
    cvId: string, 
    updates: Partial<CVProfile>
  ): Promise<void> {
    try {
      const docRef = doc(db, 'cvProfiles', cvId);
      const { createdAt, ...otherUpdates } = updates;
      
      const updateData = {
        ...otherUpdates,
        updatedAt: Timestamp.fromDate(new Date()),
        ...(createdAt && { createdAt: Timestamp.fromDate(createdAt) })
      };

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating CV:', error);
      throw error;
    }
  }

  /**
   * Update CV section
   */
  static async updateCVSection(
    cvId: string, 
    sectionId: string, 
    sectionData: Partial<CVSection>
  ): Promise<void> {
    try {
      const cv = await this.getCVById(cvId);
      if (!cv) {
        throw new Error('CV not found');
      }

      const sectionIndex = cv.sections.findIndex(s => s.id === sectionId);
      if (sectionIndex === -1) {
        throw new Error('Section not found');
      }

      cv.sections[sectionIndex] = { 
        ...cv.sections[sectionIndex], 
        ...sectionData 
      };

      await this.updateCV(cvId, { 
        sections: cv.sections,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating CV section:', error);
      throw error;
    }
  }

  /**
   * Add new section to CV
   */
  static async addCVSection(
    cvId: string, 
    section: CVSection
  ): Promise<void> {
    try {
      const cv = await this.getCVById(cvId);
      if (!cv) {
        throw new Error('CV not found');
      }

      cv.sections.push(section);
      cv.sections.sort((a, b) => a.order - b.order);

      await this.updateCV(cvId, { 
        sections: cv.sections,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error adding CV section:', error);
      throw error;
    }
  }

  /**
   * Remove section from CV
   */
  static async removeCVSection(
    cvId: string, 
    sectionId: string
  ): Promise<void> {
    try {
      const cv = await this.getCVById(cvId);
      if (!cv) {
        throw new Error('CV not found');
      }

      cv.sections = cv.sections.filter(s => s.id !== sectionId);

      await this.updateCV(cvId, { 
        sections: cv.sections,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error removing CV section:', error);
      throw error;
    }
  }

  /**
   * Reorder CV sections
   */
  static async reorderCVSections(
    cvId: string, 
    sectionIds: string[]
  ): Promise<void> {
    try {
      const cv = await this.getCVById(cvId);
      if (!cv) {
        throw new Error('CV not found');
      }

      const reorderedSections = sectionIds.map((id, index) => {
        const section = cv.sections.find(s => s.id === id);
        if (!section) {
          throw new Error(`Section with id ${id} not found`);
        }
        return { ...section, order: index + 1 };
      });

      await this.updateCV(cvId, { 
        sections: reorderedSections,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error reordering CV sections:', error);
      throw error;
    }
  }

  /**
   * Delete CV
   */
  static async deleteCV(cvId: string): Promise<void> {
    try {
      const docRef = doc(db, 'cvProfiles', cvId);
      await deleteDoc(docRef);

      // Clean up related data
      await this.cleanupCVData(cvId);
    } catch (error) {
      console.error('Error deleting CV:', error);
      throw error;
    }
  }

  /**
   * Duplicate CV
   */
  static async duplicateCV(
    cvId: string, 
    newTitle: string
  ): Promise<string> {
    try {
      const originalCV = await this.getCVById(cvId);
      if (!originalCV) {
        throw new Error('CV not found');
      }

      const duplicatedCV: Omit<CVProfile, 'id'> = {
        ...originalCV,
        title: newTitle,
        createdAt: new Date(),
        updatedAt: new Date(),
        isPublic: false,
        shareUrl: undefined,
        downloadCount: 0,
        status: 'draft'
      };

      const docRef = await addDoc(collection(db, 'cvProfiles'), {
        ...duplicatedCV,
        createdAt: Timestamp.fromDate(duplicatedCV.createdAt),
        updatedAt: Timestamp.fromDate(duplicatedCV.updatedAt)
      });

      return docRef.id;
    } catch (error) {
      console.error('Error duplicating CV:', error);
      throw error;
    }
  }

  /**
   * Upload avatar image
   */
  static async uploadAvatar(
    userId: string, 
    file: File
  ): Promise<string> {
    try {
      const fileName = `avatars/${userId}/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, fileName);
      
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    }
  }

  /**
   * Generate share URL
   */
  static async generateShareURL(
    cvId: string, 
    shareSettings: CVShareSettings
  ): Promise<string> {
    try {
      const shareToken = this.generateShareToken();
      const shareUrl = `${window.location.origin}/cv/share/${shareToken}`;

      await this.updateCV(cvId, { 
        shareUrl,
        updatedAt: new Date()
      });

      // Store share settings separately
      await this.saveShareSettings(cvId, shareSettings);

      return shareUrl;
    } catch (error) {
      console.error('Error generating share URL:', error);
      throw error;
    }
  }

  /**
   * Get CV templates
   */
  static async getTemplates(
    category?: string,
    isPremium?: boolean
  ): Promise<CVTemplate[]> {
    try {
      let q = query(
        collection(db, 'cvTemplates'),
        orderBy('name', 'asc')
      );

      if (category) {
        q = query(
          collection(db, 'cvTemplates'),
          where('category', '==', category),
          orderBy('name', 'asc')
        );
      }

      if (isPremium !== undefined) {
        q = query(
          collection(db, 'cvTemplates'),
          where('isPremium', '==', isPremium),
          orderBy('name', 'asc')
        );
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CVTemplate[];
    } catch (error) {
      console.error('Error getting templates:', error);
      throw error;
    }
  }

  /**
   * Get template by ID
   */
  static async getTemplate(templateId: string): Promise<CVTemplate | null> {
    try {
      const docRef = doc(db, 'cvTemplates', templateId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as CVTemplate;
      }

      return null;
    } catch (error) {
      console.error('Error getting template:', error);
      throw error;
    }
  }

  /**
   * Track CV analytics
   */
  static async trackCVView(cvId: string): Promise<void> {
    try {
      const docRef = doc(db, 'cvAnalytics', cvId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        await updateDoc(docRef, {
          views: data.views + 1,
          lastViewed: Timestamp.fromDate(new Date())
        });
      } else {
        await addDoc(collection(db, 'cvAnalytics'), {
          cvId,
          views: 1,
          downloads: 0,
          shares: 0,
          lastViewed: Timestamp.fromDate(new Date())
        });
      }
    } catch (error) {
      console.error('Error tracking CV view:', error);
    }
  }

  /**
   * Track CV download
   */
  static async trackCVDownload(cvId: string): Promise<void> {
    try {
      // Update main CV document
      const cvRef = doc(db, 'cvProfiles', cvId);
      const cvSnap = await getDoc(cvRef);
      
      if (cvSnap.exists()) {
        const currentCount = cvSnap.data().downloadCount || 0;
        await updateDoc(cvRef, {
          downloadCount: currentCount + 1
        });
      }

      // Update analytics
      const analyticsRef = doc(db, 'cvAnalytics', cvId);
      const analyticsSnap = await getDoc(analyticsRef);
      
      if (analyticsSnap.exists()) {
        const data = analyticsSnap.data();
        await updateDoc(analyticsRef, {
          downloads: data.downloads + 1
        });
      }
    } catch (error) {
      console.error('Error tracking CV download:', error);
    }
  }

  // Helper methods
  private static getDefaultPersonalInfo(): PersonalInfo {
    return {
      firstName: '',
      lastName: '',
      title: '',
      contact: {
        email: '',
        phone: '',
        address: {},
        socialLinks: []
      }
    };
  }

  private static getDefaultSettings(): CVSettings {
    return {
      pageSize: 'A4',
      orientation: 'portrait',
      margins: {
        top: 20,
        bottom: 20,
        left: 20,
        right: 20
      },
      showPageNumbers: false,
      headerFooter: {
        showHeader: false,
        showFooter: false
      },
      privacy: {
        hideContact: false,
        hidePersonalInfo: false,
        showWatermark: false
      }
    };
  }

  private static generateShareToken(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  private static async saveShareSettings(
    cvId: string, 
    settings: CVShareSettings
  ): Promise<void> {
    const docRef = doc(db, 'cvShareSettings', cvId);
    await updateDoc(docRef, {
      ...settings,
      createdAt: Timestamp.fromDate(new Date())
    });
  }

  private static async cleanupCVData(cvId: string): Promise<void> {
    const batch = writeBatch(db);
    
    // Delete analytics
    const analyticsRef = doc(db, 'cvAnalytics', cvId);
    batch.delete(analyticsRef);
    
    // Delete share settings
    const shareRef = doc(db, 'cvShareSettings', cvId);
    batch.delete(shareRef);
    
    await batch.commit();
  }
}

export default CVService;
