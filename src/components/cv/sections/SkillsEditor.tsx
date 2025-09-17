'use client';

import React from 'react';
import { Skill, CVTemplate } from '../../../types/cv';

interface SkillsEditorProps {
  skills: Skill[];
  onUpdate: (updates: { skills: Skill[] }) => void;
  template: CVTemplate;
}

const SkillsEditor: React.FC<SkillsEditorProps> = ({
  skills,
  onUpdate
}) => {
  return (
    <div>
      <h3>Skills</h3>
      <p style={{ color: '#6c757d', marginBottom: '20px' }}>
        Skills editor is coming soon. Currently showing {skills.length} skills.
      </p>
      
      {skills.length > 0 && (
        <div>
          <h4>Current Skills:</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {skills.map((skill, index) => (
              <span
                key={index}
                style={{
                  padding: '6px 12px',
                  background: '#f8f9fa',
                  border: '1px solid #dee2e6',
                  borderRadius: '16px',
                  fontSize: '0.9rem'
                }}
              >
                {skill.name} ({skill.level})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillsEditor;
