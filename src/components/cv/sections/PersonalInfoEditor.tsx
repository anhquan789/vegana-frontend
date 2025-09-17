'use client';

import React from 'react';
import { PersonalInfo, CVTemplate } from '../../../types/cv';
import styles from './PersonalInfoEditor.module.css';

interface PersonalInfoEditorProps {
  personalInfo?: PersonalInfo;
  onUpdate: (updates: { personalInfo: PersonalInfo }) => void;
  template: CVTemplate;
}

const PersonalInfoEditor: React.FC<PersonalInfoEditorProps> = ({
  personalInfo,
  onUpdate
}) => {
  const currentInfo = personalInfo || {
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

  const handleChange = (field: string, value: string) => {
    const updatedInfo = { ...currentInfo };
    
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      if (parent === 'contact') {
        updatedInfo.contact = {
          ...updatedInfo.contact,
          [child]: value
        };
      }
    } else {
      // Handle top-level fields
      if (field === 'firstName') updatedInfo.firstName = value;
      else if (field === 'lastName') updatedInfo.lastName = value;
      else if (field === 'title') updatedInfo.title = value;
    }
    
    onUpdate({ personalInfo: updatedInfo });
  };

  const handleAddressChange = (field: string, value: string) => {
    const updatedInfo = {
      ...currentInfo,
      contact: {
        ...currentInfo.contact,
        address: {
          ...currentInfo.contact.address,
          [field]: value
        }
      }
    };
    
    onUpdate({ personalInfo: updatedInfo });
  };

  return (
    <div className={styles.personalInfoEditor}>
      <h3>Personal Information</h3>
      
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label>First Name *</label>
          <input
            type="text"
            value={currentInfo.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            placeholder="Enter your first name"
            className={styles.input}
          />
        </div>
        
        <div className={styles.formGroup}>
          <label>Last Name *</label>
          <input
            type="text"
            value={currentInfo.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            placeholder="Enter your last name"
            className={styles.input}
          />
        </div>
        
        <div className={styles.formGroup}>
          <label>Professional Title *</label>
          <input
            type="text"
            value={currentInfo.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="e.g. Software Developer, Marketing Manager"
            className={styles.input}
          />
        </div>
        
        <div className={styles.formGroup}>
          <label>Email Address *</label>
          <input
            type="email"
            value={currentInfo.contact.email}
            onChange={(e) => handleChange('contact.email', e.target.value)}
            placeholder="your.email@example.com"
            className={styles.input}
          />
        </div>
        
        <div className={styles.formGroup}>
          <label>Phone Number</label>
          <input
            type="tel"
            value={currentInfo.contact.phone || ''}
            onChange={(e) => handleChange('contact.phone', e.target.value)}
            placeholder="+1 (555) 123-4567"
            className={styles.input}
          />
        </div>
        
        <div className={styles.formGroup}>
          <label>Website/Portfolio</label>
          <input
            type="url"
            value={currentInfo.contact.website || ''}
            onChange={(e) => handleChange('contact.website', e.target.value)}
            placeholder="https://yourwebsite.com"
            className={styles.input}
          />
        </div>
        
        <div className={styles.formGroup}>
          <label>LinkedIn</label>
          <input
            type="url"
            value={currentInfo.contact.linkedin || ''}
            onChange={(e) => handleChange('contact.linkedin', e.target.value)}
            placeholder="https://linkedin.com/in/yourprofile"
            className={styles.input}
          />
        </div>
        
        <div className={styles.formGroup}>
          <label>GitHub</label>
          <input
            type="url"
            value={currentInfo.contact.github || ''}
            onChange={(e) => handleChange('contact.github', e.target.value)}
            placeholder="https://github.com/yourusername"
            className={styles.input}
          />
        </div>
      </div>
      
      <div className={styles.addressSection}>
        <h4>Address (Optional)</h4>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label>City</label>
            <input
              type="text"
              value={currentInfo.contact.address?.city || ''}
              onChange={(e) => handleAddressChange('city', e.target.value)}
              placeholder="Your city"
              className={styles.input}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>State/Province</label>
            <input
              type="text"
              value={currentInfo.contact.address?.state || ''}
              onChange={(e) => handleAddressChange('state', e.target.value)}
              placeholder="Your state/province"
              className={styles.input}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Country</label>
            <input
              type="text"
              value={currentInfo.contact.address?.country || ''}
              onChange={(e) => handleAddressChange('country', e.target.value)}
              placeholder="Your country"
              className={styles.input}
            />
          </div>
        </div>
      </div>
      
      <div className={styles.previewSection}>
        <h4>Preview</h4>
        <div className={styles.preview}>
          <div className={styles.previewName}>
            {currentInfo.firstName} {currentInfo.lastName}
          </div>
          <div className={styles.previewTitle}>
            {currentInfo.title}
          </div>
          <div className={styles.previewContact}>
            {currentInfo.contact.email && (
              <span>📧 {currentInfo.contact.email}</span>
            )}
            {currentInfo.contact.phone && (
              <span>📱 {currentInfo.contact.phone}</span>
            )}
            {currentInfo.contact.address?.city && (
              <span>📍 {currentInfo.contact.address.city}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoEditor;
