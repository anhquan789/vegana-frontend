'use client';

import React, { useState, useEffect } from 'react';
import { CVProfile, CVSection, CVTemplate } from '../../types/cv';
import CVService from '../../lib/cv/cvService';
import TemplateSelector from './TemplateSelector';
import SectionEditor from './SectionEditor';
import CVPreview from './CVPreview';
import styles from './CVEditor.module.css';

interface CVEditorProps {
  cvId?: string;
  userId: string;
  onSave?: (cv: CVProfile) => void;
  onClose?: () => void;
}

const CVEditor: React.FC<CVEditorProps> = ({
  cvId,
  userId,
  onSave,
  onClose
}) => {
  const [cv, setCV] = useState<CVProfile | null>(null);
  const [selectedSection, setSelectedSection] = useState<string>('personal-info');
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const loadCVData = async () => {
      if (!cvId) return;
      
      try {
        setLoading(true);
        const loadedCV = await CVService.getCVById(cvId);
        if (loadedCV) {
          setCV(loadedCV);
        }
      } catch (error) {
        console.error('Error loading CV:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCVData();
  }, [cvId]);

  const handleTemplateSelect = async (template: CVTemplate) => {
    try {
      setSaving(true);
      
      if (cv) {
        // Update existing CV with new template
        await CVService.updateCV(cv.id, { template });
        setCV({ ...cv, template });
      } else {
        // Create new CV with selected template
        const newCVId = await CVService.createCV(
          userId, 
          'My CV', 
          template.id
        );
        const newCV = await CVService.getCVById(newCVId);
        if (newCV) {
          setCV(newCV);
        }
      }
      
      setShowTemplateSelector(false);
      setIsDirty(true);
    } catch (error) {
      console.error('Error selecting template:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSectionUpdate = async (sectionId: string, updatedSection: Partial<CVSection>) => {
    if (!cv) return;

    try {
      await CVService.updateCVSection(cv.id, sectionId, updatedSection);
      
      // Update local state
      const updatedSections = cv.sections.map(section =>
        section.id === sectionId ? { ...section, ...updatedSection } : section
      );
      
      setCV({ ...cv, sections: updatedSections });
      setIsDirty(true);
    } catch (error) {
      console.error('Error updating section:', error);
    }
  };

  const handleSectionAdd = async (newSection: CVSection) => {
    if (!cv) return;

    try {
      await CVService.addCVSection(cv.id, newSection);
      setCV({ ...cv, sections: [...cv.sections, newSection] });
      setSelectedSection(newSection.id);
      setIsDirty(true);
    } catch (error) {
      console.error('Error adding section:', error);
    }
  };

  const handleSectionRemove = async (sectionId: string) => {
    if (!cv) return;

    try {
      await CVService.removeCVSection(cv.id, sectionId);
      const updatedSections = cv.sections.filter(s => s.id !== sectionId);
      setCV({ ...cv, sections: updatedSections });
      
      // Select first section if current was deleted
      if (selectedSection === sectionId && updatedSections.length > 0) {
        setSelectedSection(updatedSections[0].id);
      }
      
      setIsDirty(true);
    } catch (error) {
      console.error('Error removing section:', error);
    }
  };

  const handleSectionReorder = async (sectionIds: string[]) => {
    if (!cv) return;

    try {
      await CVService.reorderCVSections(cv.id, sectionIds);
      
      // Update local state
      const reorderedSections = sectionIds.map((id, index) => {
        const section = cv.sections.find(s => s.id === id);
        return section ? { ...section, order: index + 1 } : null;
      }).filter(Boolean) as CVSection[];
      
      setCV({ ...cv, sections: reorderedSections });
      setIsDirty(true);
    } catch (error) {
      console.error('Error reordering sections:', error);
    }
  };

  const handleSave = async () => {
    if (!cv) return;

    try {
      setSaving(true);
      await CVService.updateCV(cv.id, {
        title: cv.title,
        sections: cv.sections,
        settings: cv.settings,
        status: cv.status
      });
      
      setIsDirty(false);
      onSave?.(cv);
    } catch (error) {
      console.error('Error saving CV:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleTitleChange = async (newTitle: string) => {
    if (!cv) return;

    try {
      await CVService.updateCV(cv.id, { title: newTitle });
      setCV({ ...cv, title: newTitle });
      setIsDirty(true);
    } catch (error) {
      console.error('Error updating title:', error);
    }
  };

  const selectedSectionData = cv?.sections.find(s => s.id === selectedSection);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading CV...</p>
      </div>
    );
  }

  if (!cv && !showTemplateSelector) {
    return (
      <div className={styles.noCV}>
        <div className={styles.noCVContent}>
          <h2>Create Your Professional CV</h2>
          <p>Choose a template to get started with your CV</p>
          <button
            className={styles.primaryButton}
            onClick={() => setShowTemplateSelector(true)}
          >
            Choose Template
          </button>
        </div>
      </div>
    );
  }

  if (showTemplateSelector) {
    return (
      <div className={styles.templateSelectorWrapper}>
        <div className={styles.templateHeader}>
          <h2>Choose a CV Template</h2>
          {cv && (
            <button
              className={styles.secondaryButton}
              onClick={() => setShowTemplateSelector(false)}
            >
              Cancel
            </button>
          )}
        </div>
        <TemplateSelector
          selectedTemplateId={cv?.template.id}
          onTemplateSelect={handleTemplateSelect}
        />
      </div>
    );
  }

  return (
    <div className={styles.cvEditor}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <input
            type="text"
            value={cv.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className={styles.titleInput}
            placeholder="CV Title"
          />
          <div className={styles.statusBadge}>
            <span className={styles[cv.status]}>{cv.status}</span>
          </div>
        </div>
        
        <div className={styles.headerActions}>
          <button
            className={styles.templateButton}
            onClick={() => setShowTemplateSelector(true)}
          >
            Change Template
          </button>
          
          <button
            className={`${styles.previewButton} ${previewMode ? styles.active : ''}`}
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? 'Edit' : 'Preview'}
          </button>
          
          <button
            className={styles.saveButton}
            onClick={handleSave}
            disabled={saving || !isDirty}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          
          {onClose && (
            <button
              className={styles.closeButton}
              onClick={onClose}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.content}>
        {previewMode ? (
          <div className={styles.previewContainer}>
            <CVPreview cv={cv} />
          </div>
        ) : (
          <div className={styles.editorContainer}>
            {/* Sidebar */}
            <div className={styles.sidebar}>
              <div className={styles.sectionsList}>
                <h3>CV Sections</h3>
                
                {cv.sections
                  .sort((a, b) => a.order - b.order)
                  .map(section => (
                    <div
                      key={section.id}
                      className={`${styles.sectionItem} ${
                        selectedSection === section.id ? styles.active : ''
                      }`}
                      onClick={() => setSelectedSection(section.id)}
                    >
                      <div className={styles.sectionIcon}>
                        {getSectionIcon(section.type)}
                      </div>
                      <div className={styles.sectionInfo}>
                        <span className={styles.sectionTitle}>{section.title}</span>
                        <span className={styles.sectionType}>{section.type}</span>
                      </div>
                      <div className={styles.sectionActions}>
                        {!section.isRequired && (
                          <button
                            className={styles.removeButton}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSectionRemove(section.id);
                            }}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                
                <button
                  className={styles.addSectionButton}
                  onClick={() => {/* Add section modal */}}
                >
                  + Add Section
                </button>
              </div>
            </div>

            {/* Section Editor */}
            <div className={styles.mainEditor}>
              {selectedSectionData && (
                <SectionEditor
                  section={selectedSectionData}
                  onUpdate={(updates: Partial<CVSection>) => handleSectionUpdate(selectedSection, updates)}
                  template={cv.template}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to get section icons
const getSectionIcon = (type: string): string => {
  const icons: Record<string, string> = {
    'personal-info': '👤',
    'summary': '📝',
    'skills': '🛠️',
    'experience': '💼',
    'education': '🎓',
    'projects': '🚀',
    'certificates': '🏆',
    'awards': '🥇',
    'courses': '📚',
    'languages': '🌍',
    'references': '📞',
    'custom': '⚙️'
  };
  return icons[type] || '📄';
};

export default CVEditor;
