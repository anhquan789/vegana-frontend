'use client';
import React from 'react';

export default function SimpleTest() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>🔥 Firebase Test Page</h1>
      <p>This is a simple test component</p>
      <div style={{ 
        background: '#f0f0f0', 
        padding: '20px', 
        borderRadius: '8px', 
        margin: '20px 0' 
      }}>
        <h2>Connection Status</h2>
        <p>✅ Page loads successfully</p>
        <p>📋 Firebase emulators should be running at:</p>
        <ul style={{ textAlign: 'left', display: 'inline-block' }}>
          <li>Firestore: http://127.0.0.1:8080</li>
          <li>Storage: http://127.0.0.1:9199</li>
          <li>UI: http://127.0.0.1:4000</li>
        </ul>
        <button 
          style={{ 
            background: '#007bff', 
            color: 'white', 
            border: 'none', 
            padding: '10px 20px', 
            borderRadius: '4px', 
            cursor: 'pointer' 
          }}
          onClick={() => alert('Basic functionality working!')}
        >
          Test Click
        </button>
      </div>
    </div>
  );
}
