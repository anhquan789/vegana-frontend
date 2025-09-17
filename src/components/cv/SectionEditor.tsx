'use client';

import React from 'react';
import { CVSection, CVTemplate } from '../../types/cv';
import PersonalInfoEditor from './sections/PersonalInfoEditor';
import SummaryEditor from './sections/SummaryEditor';
import SkillsEditor from './sections/SkillsEditor';
import ExperienceEditor from './sections/ExperienceEditor';
import EducationEditor from './sections/EducationEditor';
import ProjectsEditor from './sections/ProjectsEditor';
import styles from './SectionEditor.module.css';

interface SectionEditorProps {
  section: CVSection;
  onUpdate: (updates: Partial<CVSection>) => void;
  template: CVTemplate;
}

const SectionEditor: React.FC<SectionEditorProps> = ({
  section,
  onUpdate,
  template
}) => {
  const handleContentUpdate = (contentUpdates: Record<string, unknown>) => {
    onUpdate({
      content: {
        ...section.content,
        ...contentUpdates
      }
    });
  };

  const handleSectionSettings = (settingsUpdates: Partial<CVSection>) => {
    onUpdate(settingsUpdates);
  };

  const renderSectionEditor = () => {
    switch (section.type) {
      case 'personal-info':
        return (
          <PersonalInfoEditor
            personalInfo={section.content.personalInfo}
            onUpdate={handleContentUpdate}
            template={template}
          />
        );
      
      case 'summary':
        return (
          <SummaryEditor
            summary={section.content.summary}
            onUpdate={handleContentUpdate}
            template={template}
          />
        );
      
      case 'skills':
        return (
          <SkillsEditor
            skills={section.content.skills || []}
            onUpdate={handleContentUpdate}
            template={template}
          />
        );
      
      case 'experience':
        return (
          <ExperienceEditor
            experience={section.content.experience || []}
            onUpdate={handleContentUpdate}
            template={template}
          />
        );
      
      case 'education':
        return (
          <EducationEditor
            education={section.content.education || []}
            onUpdate={handleContentUpdate}
            template={template}
          />
        );
      
      case 'projects':
        return (
          <ProjectsEditor
            projects={section.content.projects || []}
            onUpdate={handleContentUpdate}
            template={template}
          />
        );
      
      default:
        return (
          <div className={styles.placeholderEditor}>
            <h3>Section Editor</h3>
            <p>Editor for {section.type} section is coming soon...</p>
          </div>
        );
    }
  };

  return (
    <div className={styles.sectionEditor}>
      {/* Section Header */}
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitle}>
          <input
            type="text"
            value={section.title}
            onChange={(e) => handleSectionSettings({ title: e.target.value })}
            className={styles.titleInput}
            placeholder="Section Title"
          />
        </div>
        
        <div className={styles.sectionControls}>
          <label className={styles.visibilityToggle}>
            <input
              type="checkbox"
              checked={section.isVisible}
              onChange={(e) => handleSectionSettings({ isVisible: e.target.checked })}
            />
            <span>Visible</span>
          </label>
        </div>
      </div>

      {/* Section Content Editor */}
      <div className={styles.sectionContent}>
        {renderSectionEditor()}
      </div>
    </div>
  );
};

export default SectionEditor;
