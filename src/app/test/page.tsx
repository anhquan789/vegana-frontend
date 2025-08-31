'use client';
import FirebaseTest from '../../components/FirebaseTest';
import VideoStorageTest from '../../components/VideoStorageTest';
import FirebaseTestAdvanced from '../../components/test/FirebaseTestAdvanced';
import SimpleTest from '../../components/test/SimpleTest';

export default function TestPage() {
  return (
    <div>
      <FirebaseTest />
      <hr style={{ margin: '40px 0' }} />
      <VideoStorageTest />
      <hr style={{ margin: '40px 0' }} />
      <SimpleTest />
      <hr style={{ margin: '40px 0' }} />
      <FirebaseTestAdvanced />
    </div>
  );
}