'use client';
import FirebaseTestAdvanced from '../../components/test/FirebaseTestAdvanced';
import SimpleTest from '../../components/test/SimpleTest';

export default function TestPage() {
  return (
    <div>
      <SimpleTest />
      <hr style={{ margin: '40px 0' }} />
      <FirebaseTestAdvanced />
    </div>
  );
}