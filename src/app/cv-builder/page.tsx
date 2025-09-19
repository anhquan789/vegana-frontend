'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import CVEditor from '../../components/cv/CVEditor';
import { useAuth } from '../../contexts/AuthContext';
import CVService from '../../lib/cv/cvService';
import { CVProfile } from '../../types/cv';
import styles from './CVBuilder.module.css';

const CVBuilderPage: React.FC = () => {
  const [cvs, setCvs] = useState<CVProfile[]>([]);
  const [selectedCV, setSelectedCV] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const loadCVs = async () => {
      if (!user) {
        router.push('/login');
        return;
      }
      
      try {
        setLoading(true);
        const userCVs = await CVService.getUserCVs(user.uid);
        setCvs(userCVs);
      } catch (error) {
        console.error('Error loading CVs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCVs();
  }, [user, router]);

  const loadUserCVs = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userCVs = await CVService.getUserCVs(user.uid);
      setCvs(userCVs);
    } catch (error) {
      console.error('Error loading CVs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setSelectedCV(null);
    setShowEditor(true);
  };

  const handleEditCV = (cvId: string) => {
    setSelectedCV(cvId);
    setShowEditor(true);
  };

  const handleDeleteCV = async (cvId: string) => {
    if (!window.confirm('Are you sure you want to delete this CV?')) {
      return;
    }

    try {
      await CVService.deleteCV(cvId);
      setCvs(cvs.filter(cv => cv.id !== cvId));
    } catch (error) {
      console.error('Error deleting CV:', error);
    }
  };

  const handleDuplicateCV = async (cvId: string, title: string) => {
    try {
      await CVService.duplicateCV(cvId, `Copy of ${title}`);
      await loadUserCVs(); // Reload to show the new CV
    } catch (error) {
      console.error('Error duplicating CV:', error);
    }
  };

  const handleCloseEditor = () => {
    setShowEditor(false);
    setSelectedCV(null);
    loadUserCVs(); // Reload to reflect any changes
  };

  if (!user) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Checking authentication...</p>
      </div>
    );
  }

  if (showEditor) {
    return (
      <CVEditor
        cvId={selectedCV || undefined}
        userId={user.uid}
        onClose={handleCloseEditor}
        onSave={() => {
          // CV saved successfully, could show a toast here
        }}
      />
    );
  }

  return (
    <div className={styles.cvBuilder}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1>My CVs</h1>
          <p>Create and manage your professional CVs</p>
        </div>
        
        <button
          className={styles.createButton}
          onClick={handleCreateNew}
        >
          + Create New CV
        </button>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading your CVs...</p>
          </div>
        ) : cvs.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📄</div>
            <h2>No CVs yet</h2>
            <p>Create your first professional CV to get started</p>
            <button
              className={styles.primaryButton}
              onClick={handleCreateNew}
            >
              Create Your First CV
            </button>
          </div>
        ) : (
          <div className={styles.cvsGrid}>
            {cvs.map(cv => (
              <div key={cv.id} className={styles.cvCard}>
                <div className={styles.cvHeader}>
                  <h3 className={styles.cvTitle}>{cv.title}</h3>
                  <div className={styles.statusBadge}>
                    <span className={styles[cv.status]}>{cv.status}</span>
                  </div>
                </div>
                
                <div className={styles.cvMeta}>
                  <p className={styles.template}>
                    Template: {cv.template.name}
                  </p>
                  <p className={styles.lastUpdated}>
                    Updated: {cv.updatedAt.toLocaleDateString()}
                  </p>
                  <p className={styles.sections}>
                    {cv.sections.filter(s => s.isVisible).length} sections
                  </p>
                  {cv.downloadCount > 0 && (
                    <p className={styles.downloads}>
                      {cv.downloadCount} downloads
                    </p>
                  )}
                </div>

                <div className={styles.cvActions}>
                  <button
                    className={styles.editButton}
                    onClick={() => handleEditCV(cv.id)}
                  >
                    Edit
                  </button>
                  
                  <button
                    className={styles.previewButton}
                    onClick={() => {
                      // Open preview in new window/modal
                      console.log('Preview CV:', cv.id);
                    }}
                  >
                    Preview
                  </button>
                  
                  <div className={styles.dropdown}>
                    <button className={styles.moreButton}>⋯</button>
                    <div className={styles.dropdownContent}>
                      <button
                        onClick={() => handleDuplicateCV(cv.id, cv.title)}
                      >
                        Duplicate
                      </button>
                      <button
                        onClick={() => {
                          // Download as PDF
                          console.log('Download CV:', cv.id);
                        }}
                      >
                        Download PDF
                      </button>
                      <button
                        onClick={() => {
                          // Share CV
                          console.log('Share CV:', cv.id);
                        }}
                      >
                        Share
                      </button>
                      <hr />
                      <button
                        className={styles.deleteButton}
                        onClick={() => handleDeleteCV(cv.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CVBuilderPage;
