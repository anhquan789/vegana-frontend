'use client';

import React from 'react';
import { Experience, CVTemplate } from '../../../types/cv';

interface ExperienceEditorProps {
  experience: Experience[];
  onUpdate: (updates: { experience: Experience[] }) => void;
  template: CVTemplate;
}

const ExperienceEditor: React.FC<ExperienceEditorProps> = ({
  experience
}) => {
  return (
    <div>
      <h3>Work Experience</h3>
      <p style={{ color: '#6c757d', marginBottom: '20px' }}>
        Experience editor is coming soon. Currently showing {experience.length} experience entries.
      </p>
      
      {experience.length > 0 && (
        <div>
          <h4>Current Experience:</h4>
          {experience.map((exp, index) => (
            <div
              key={index}
              style={{
                padding: '16px',
                background: '#f8f9fa',
                border: '1px solid #dee2e6',
                borderRadius: '8px',
                marginBottom: '12px'
              }}
            >
              <h5 style={{ margin: '0 0 4px 0' }}>{exp.position}</h5>
              <p style={{ margin: '0 0 8px 0', color: '#007bff', fontWeight: '500' }}>
                {exp.company}
              </p>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#6c757d' }}>
                {new Date(exp.startDate).toLocaleDateString()} - 
                {exp.isCurrent ? ' Present' : new Date(exp.endDate!).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExperienceEditor;
