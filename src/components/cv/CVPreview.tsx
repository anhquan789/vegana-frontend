'use client';

import React from 'react';
import { CVProfile } from '../../types/cv';
import styles from './CVPreview.module.css';

interface CVPreviewProps {
  cv: CVProfile;
  scale?: number;
}

const CVPreview: React.FC<CVPreviewProps> = ({
  cv,
  scale = 1
}) => {
  const renderPersonalInfo = () => {
    const personalInfo = cv.sections.find(s => s.type === 'personal-info')?.content.personalInfo;
    if (!personalInfo) return null;

    return (
      <div className={styles.personalInfo}>
        <div className={styles.nameSection}>
          <h1 className={styles.fullName}>
            {personalInfo.firstName} {personalInfo.lastName}
          </h1>
          <h2 className={styles.jobTitle}>{personalInfo.title}</h2>
        </div>
        
        {personalInfo.contact && (
          <div className={styles.contactInfo}>
            {personalInfo.contact.email && (
              <div className={styles.contactItem}>
                <span>📧</span> {personalInfo.contact.email}
              </div>
            )}
            {personalInfo.contact.phone && (
              <div className={styles.contactItem}>
                <span>📱</span> {personalInfo.contact.phone}
              </div>
            )}
            {personalInfo.contact.address?.city && (
              <div className={styles.contactItem}>
                <span>📍</span> {personalInfo.contact.address.city}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderSection = (section: any) => {
    if (!section.isVisible) return null;

    return (
      <div key={section.id} className={styles.section}>
        <h3 className={styles.sectionTitle}>{section.title}</h3>
        <div className={styles.sectionContent}>
          {renderSectionContent(section)}
        </div>
      </div>
    );
  };

  const renderSectionContent = (section: any) => {
    switch (section.type) {
      case 'summary':
        return (
          <p className={styles.summary}>
            {section.content.summary?.content}
          </p>
        );
      
      case 'skills':
        return (
          <div className={styles.skills}>
            {section.content.skills?.map((skill: any, index: number) => (
              <div key={index} className={styles.skillItem}>
                <span className={styles.skillName}>{skill.name}</span>
                <span className={styles.skillLevel}>({skill.level})</span>
              </div>
            ))}
          </div>
        );
      
      case 'experience':
        return (
          <div className={styles.experience}>
            {section.content.experience?.map((exp: any, index: number) => (
              <div key={index} className={styles.experienceItem}>
                <h4 className={styles.expTitle}>{exp.position}</h4>
                <div className={styles.expCompany}>{exp.company}</div>
                <div className={styles.expDuration}>
                  {new Date(exp.startDate).toLocaleDateString()} - 
                  {exp.isCurrent ? ' Present' : new Date(exp.endDate).toLocaleDateString()}
                </div>
                <p className={styles.expDescription}>{exp.description}</p>
              </div>
            ))}
          </div>
        );
      
      case 'education':
        return (
          <div className={styles.education}>
            {section.content.education?.map((edu: any, index: number) => (
              <div key={index} className={styles.educationItem}>
                <h4 className={styles.eduDegree}>{edu.degree}</h4>
                <div className={styles.eduInstitution}>{edu.institution}</div>
                <div className={styles.eduDuration}>
                  {new Date(edu.startDate).toLocaleDateString()} - 
                  {edu.isCurrent ? ' Present' : new Date(edu.endDate).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        );
      
      default:
        return <p>Content for {section.type} section</p>;
    }
  };

  return (
    <div 
      className={styles.cvPreview}
      style={{ 
        transform: `scale(${scale})`,
        transformOrigin: 'top left'
      }}
    >
      <div className={styles.cvPage}>
        {/* Header with Personal Info */}
        {renderPersonalInfo()}
        
        {/* Sections */}
        {cv.sections
          .filter(s => s.type !== 'personal-info')
          .sort((a, b) => a.order - b.order)
          .map(renderSection)}
      </div>
    </div>
  );
};

export default CVPreview;
