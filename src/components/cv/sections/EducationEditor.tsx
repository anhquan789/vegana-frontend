'use client';

import React from 'react';
import { Education, CVTemplate } from '../../../types/cv';

interface EducationEditorProps {
  education: Education[];
  onUpdate: (updates: { education: Education[] }) => void;
  template: CVTemplate;
}

const EducationEditor: React.FC<EducationEditorProps> = ({
  education
}) => {
  return (
    <div>
      <h3>Education</h3>
      <p style={{ color: '#6c757d', marginBottom: '20px' }}>
        Education editor is coming soon. Currently showing {education.length} education entries.
      </p>
      
      {education.length > 0 && (
        <div>
          <h4>Current Education:</h4>
          {education.map((edu, index) => (
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
              <h5 style={{ margin: '0 0 4px 0' }}>{edu.degree}</h5>
              <p style={{ margin: '0 0 8px 0', color: '#007bff', fontWeight: '500' }}>
                {edu.institution}
              </p>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#6c757d' }}>
                {new Date(edu.startDate).toLocaleDateString()} - 
                {edu.isCurrent ? ' Present' : new Date(edu.endDate!).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EducationEditor;
