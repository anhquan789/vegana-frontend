'use client';

import React from 'react';
import { Summary, CVTemplate } from '../../../types/cv';

interface SummaryEditorProps {
  summary?: Summary;
  onUpdate: (updates: { summary: Summary }) => void;
  template: CVTemplate;
}

const SummaryEditor: React.FC<SummaryEditorProps> = ({
  summary,
  onUpdate
}) => {
  const currentSummary = summary || { content: '', keywords: [] };

  const handleContentChange = (content: string) => {
    onUpdate({
      summary: {
        ...currentSummary,
        content
      }
    });
  };

  return (
    <div>
      <h3>Professional Summary</h3>
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
          Summary Content
        </label>
        <textarea
          value={currentSummary.content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Write a brief professional summary highlighting your key skills and experience..."
          rows={6}
          style={{
            width: '100%',
            padding: '12px',
            border: '2px solid #e9ecef',
            borderRadius: '8px',
            fontSize: '1rem',
            resize: 'vertical',
            fontFamily: 'inherit'
          }}
        />
      </div>
      <p style={{ color: '#6c757d', fontSize: '0.9rem', margin: 0 }}>
        Tip: Keep it concise (2-3 sentences) and focus on your most relevant skills and achievements.
      </p>
    </div>
  );
};

export default SummaryEditor;
