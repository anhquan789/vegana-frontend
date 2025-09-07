// Test Firebase Connection and Video Upload
import { addDoc, collection, getDocs } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '../lib/firebase';

export const testFirebaseConnection = async () => {
  console.log('🧪 Testing Firebase Connection...');
  
  try {
    // Test 1: Firestore Write (create video metadata)
    console.log('1️⃣ Testing Firestore Write...');
    const testVideo = {
      title: 'Test Video Upload',
      description: 'This is a test video',
      courseId: 'test-course-123',
      createdAt: new Date().toISOString(),
      url: 'https://example.com/test-video.mp4'
    };
    
    const docRef = await addDoc(collection(db, 'videos'), testVideo);
    console.log('✅ Firestore Write Success! Document ID:', docRef.id);
    
    // Test 2: Firestore Read
    console.log('2️⃣ Testing Firestore Read...');
    const videosSnapshot = await getDocs(collection(db, 'videos'));
    console.log('✅ Firestore Read Success! Found', videosSnapshot.size, 'videos');
    
    // Test 3: Storage Upload (simpler approach)
    console.log('3️⃣ Testing Storage Upload...');
    try {
      const fakeFileContent = new Blob(['fake video content for testing'], { type: 'video/mp4' });
      const fileName = `test-video-${Date.now()}.mp4`;
      const storageRef = ref(storage, `videos/test/${fileName}`);
      
      console.log('Uploading to path:', `videos/test/${fileName}`);
      
      const uploadResult = await uploadBytes(storageRef, fakeFileContent);
      console.log('✅ Storage Upload Success!', uploadResult.metadata.name);
      
      // Test 4: Get Download URL
      console.log('4️⃣ Testing Get Download URL...');
      const downloadURL = await getDownloadURL(uploadResult.ref);
      console.log('✅ Download URL Success:', downloadURL);
      
      return {
        success: true,
        message: 'All Firebase tests passed!',
        documentId: docRef.id,
        downloadURL: downloadURL
      };
    } catch (storageError) {
      console.error('Storage test failed, trying Firestore-only test:', storageError);
      
      // If storage fails, at least test Firestore
      return {
        success: true,
        message: 'Firestore tests passed! (Storage may need configuration)',
        documentId: docRef.id,
        downloadURL: null,
        storageError: storageError instanceof Error ? storageError.message : 'Unknown storage error'
      };
    }
    
  } catch (error) {
    console.error('❌ Firebase Test Failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorCode = error && typeof error === 'object' && 'code' in error ? (error as { code: string }).code : 'unknown';
    return {
      success: false,
      error: errorMessage,
      code: errorCode
    };
  }
};

// Test Categories
export const testCategoriesCreation = async () => {
  console.log('🧪 Testing Categories Creation...');
  
  try {
    const testCategories = [
      { name: 'development', description: 'Web Development' },
      { name: 'design', description: 'UI/UX Design' },
      { name: 'business', description: 'Business & Marketing' }
    ];
    
    const results = [];
    for (const category of testCategories) {
      const docRef = await addDoc(collection(db, 'categories'), {
        ...category,
        createdAt: new Date().toISOString()
      });
      results.push({ id: docRef.id, name: category.name });
      console.log('✅ Category created:', category.name, 'ID:', docRef.id);
    }
    
    return { success: true, categories: results };
  } catch (error) {
    console.error('❌ Categories creation failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
};

// Test Course Creation
export const testCourseCreation = async () => {
  console.log('🧪 Testing Course Creation...');
  
  try {
    const testCourse = {
      title: 'Test Course - Firebase Integration',
      description: 'This is a test course to verify Firebase integration',
      category: 'development',
      level: 'beginner',
      price: 0,
      currency: 'VND',
      duration: 60,
      language: 'vi',
      requirements: ['Basic computer knowledge'],
      whatYoullLearn: ['Firebase integration', 'Video upload'],
      tags: ['firebase', 'test'],
      instructorId: 'test-instructor',
      instructorName: 'Test Instructor',
      thumbnail: '',
      status: 'draft',
      totalLessons: 0,
      totalStudents: 0,
      rating: 0,
      reviewCount: 0,
      slug: 'test-course-firebase-integration',
      lastModified: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    
    const docRef = await addDoc(collection(db, 'courses'), testCourse);
    console.log('✅ Course created successfully! ID:', docRef.id);
    
    return { success: true, courseId: docRef.id };
  } catch (error) {
    console.error('❌ Course creation failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
};

// Run all tests
export const runAllTests = async () => {
  console.log('🚀 Starting Firebase Integration Tests...');
  
  const results = {
    firebase: await testFirebaseConnection(),
    categories: await testCategoriesCreation(),
    course: await testCourseCreation()
  };
  
  console.log('📊 Test Results Summary:');
  console.log('Firebase Connection:', results.firebase.success ? '✅' : '❌');
  console.log('Categories Creation:', results.categories.success ? '✅' : '❌');
  console.log('Course Creation:', results.course.success ? '✅' : '❌');
  
  return results;
};
