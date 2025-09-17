'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { CVTemplate } from '../../types/cv';
import CVService from '../../lib/cv/cvService';
import styles from './TemplateSelector.module.css';

interface TemplateSelectorProps {
  selectedTemplateId?: string;
  onTemplateSelect: (template: CVTemplate) => void;
  category?: string;
  showPremium?: boolean;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTemplateId,
  onTemplateSelect,
  category,
  showPremium = true
}) => {
  const [templates, setTemplates] = useState<CVTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(category || 'all');

  const categories = [
    { id: 'all', name: 'All Templates', icon: '📋' },
    { id: 'modern', name: 'Modern', icon: '🎨' },
    { id: 'classic', name: 'Classic', icon: '📄' },
    { id: 'creative', name: 'Creative', icon: '✨' },
    { id: 'minimal', name: 'Minimal', icon: '⚪' },
    { id: 'professional', name: 'Professional', icon: '💼' }
  ];

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setLoading(true);
        const fetchedTemplates = await CVService.getTemplates(
          selectedCategory === 'all' ? undefined : selectedCategory,
          showPremium ? undefined : false
        );
        setTemplates(fetchedTemplates);
      } catch (error) {
        console.error('Error loading templates:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, [selectedCategory, showPremium]);

  const handleTemplateClick = (template: CVTemplate) => {
    onTemplateSelect(template);
  };

  return (
    <div className={styles.templateSelector}>
      <div className={styles.header}>
        <h3>Choose a Template</h3>
        <p>Select a professional template to get started</p>
      </div>

      {/* Category Filter */}
      <div className={styles.categoryFilter}>
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`${styles.categoryButton} ${
              selectedCategory === cat.id ? styles.active : ''
            }`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            <span className={styles.categoryIcon}>{cat.icon}</span>
            {cat.name}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading templates...</p>
        </div>
      ) : (
        <div className={styles.templatesGrid}>
          {templates.map(template => (
            <div
              key={template.id}
              className={`${styles.templateCard} ${
                selectedTemplateId === template.id ? styles.selected : ''
              }`}
              onClick={() => handleTemplateClick(template)}
            >
              <div className={styles.templateThumbnail}>
                <Image 
                  src={template.thumbnail} 
                  alt={template.name}
                  width={280}
                  height={200}
                  style={{ objectFit: 'cover' }}
                />
                {template.isPremium && (
                  <div className={styles.premiumBadge}>
                    <span>👑 Premium</span>
                  </div>
                )}
              </div>
              
              <div className={styles.templateInfo}>
                <h4>{template.name}</h4>
                <p>{template.description}</p>
                
                <div className={styles.templateMeta}>
                  <span className={styles.category}>
                    {template.category}
                  </span>
                  <span className={styles.layout}>
                    {template.layout.replace('-', ' ')}
                  </span>
                </div>

                <div className={styles.colorScheme}>
                  <div 
                    className={styles.colorDot}
                    style={{ backgroundColor: template.colorScheme.primary }}
                  ></div>
                  <div 
                    className={styles.colorDot}
                    style={{ backgroundColor: template.colorScheme.secondary }}
                  ></div>
                  <div 
                    className={styles.colorDot}
                    style={{ backgroundColor: template.colorScheme.accent }}
                  ></div>
                </div>
              </div>

              {selectedTemplateId === template.id && (
                <div className={styles.selectedIndicator}>
                  <span>✓</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {templates.length === 0 && !loading && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📄</div>
          <h4>No templates found</h4>
          <p>Try adjusting your filters or check back later for new templates.</p>
        </div>
      )}
    </div>
  );
};

export default TemplateSelector;
