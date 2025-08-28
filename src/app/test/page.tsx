'use client';
import React from 'react';
import SimpleTest from '../../components/test/SimpleTest';
import FirebaseTestAdvanced from '../../components/test/FirebaseTestAdvanced';

export default function TestPage() {
  return (
    <div>
      <SimpleTest />
      <hr style={{ margin: '40px 0' }} />
      <FirebaseTestAdvanced />
    </div>
  );
}