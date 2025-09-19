'use client';

import React from 'react';
import { CVTemplate, Project } from '../../../types/cv';

interface ProjectsEditorProps {
  projects: Project[];
  onUpdate: (updates: { projects: Project[] }) => void;
  template: CVTemplate;
}

const ProjectsEditor: React.FC<ProjectsEditorProps> = ({
  projects
}) => {
  return (
    <div>
      <h3>Projects</h3>
      <p style={{ color: '#6c757d', marginBottom: '20px' }}>
        Projects editor is coming soon. Currently showing {projects.length} project entries.
      </p>
      
      {projects.length > 0 && (
        <div>
          <h4>Current Projects:</h4>
          {projects.map((project, index) => (
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
              <h5 style={{ margin: '0 0 4px 0' }}>{project.name}</h5>
              <p style={{ margin: '0 0 8px 0', color: '#007bff', fontWeight: '500' }}>
                {project.role}
              </p>
              <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem' }}>
                {project.description}
              </p>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#6c757d' }}>
                Status: {project.status}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsEditor;
