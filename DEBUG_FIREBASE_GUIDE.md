# Hướng dẫn Debug lỗi Firebase

## Đã sửa xong các lỗi phổ biến

### ✅ Lỗi Storage Upload - FIXED
**Lỗi**: `Permission denied because no Storage ruleset is currently loaded`
**Nguyên nhân**: Lỗi syntax trong `storage.rules`
**Giải pháp**: Đã sửa trong `/storage.rules`

### ✅ Lỗi Firestore Write - FIXED  
**Lỗi**: `PERMISSION_DENIED: false for 'create' @ L40, false for 'update' @ L40`
**Nguyên nhân**: Thiếu rules cho collections `videos`, `lessons`, `categories`
**Giải pháp**: Đã thêm rules cho development trong `/firestore.rules`

## Kiểm tra trạng thái hiện tại

### Firebase Emulator đang chạy:
- **Emulator UI**: http://127.0.0.1:4001/
- **Firestore**: 127.0.0.1:8081  
- **Storage**: 127.0.0.1:9198
- **Auth**: 127.0.0.1:9098

### Những gì đã hoạt động:
✅ Upload video lên Storage  
✅ Lưu metadata video vào Firestore  
✅ Tạo courses, categories, lessons  
✅ CRUD operations không cần authentication (development only)

## Cách test sau khi sửa

### 1. Test Video Upload:
```typescript
// Trong component video upload
const handleUpload = async (file) => {
  try {
    // Upload lên Storage - OK
    const url = await uploadVideoToStorage(file);
    
    // Lưu metadata vào Firestore - OK  
    await saveVideoMetadata({
      title: 'Test Video',
      url: url,
      courseId: 'test-course'
    });
    
    console.log('✅ Upload thành công!');
  } catch (error) {
    console.error('❌ Upload thất bại:', error);
  }
};
```

### 2. Test Course Management:
```typescript
// Tạo course mới
const newCourse = await createCourse({
  title: 'Test Course',
  description: 'Test Description',
  category: 'development'
});

// Tạo category mới  
const newCategory = await createCourseCategory('New Category');
```

### 3. Kiểm tra qua Emulator UI:
- Mở: http://127.0.0.1:4001/
- Kiểm tra **Firestore** tab để xem dữ liệu
- Kiểm tra **Storage** tab để xem files đã upload

## Nếu vẫn có lỗi

### Lỗi kết nối Emulator:
```
Error: Cannot connect to emulator
```
**Kiểm tra**: 
- Emulator có đang chạy không?
- Port có bị conflict không?

### Lỗi Authentication:
```
Error: User not authenticated
```
**Giải pháp tạm**: Rules hiện tại cho phép read/write mà không cần auth
**Giải pháp lâu dài**: Implement proper authentication

### Lỗi CORS:
```
Access to fetch blocked by CORS policy
```
**Kiểm tra**: App có đang chạy trên localhost:3000?

## Rules hiện tại (Development Only)

### Storage Rules - Cho phép upload:
```javascript
match /{allPaths=**} {
  allow read, write: if true; // Development only
}
```

### Firestore Rules - Cho phép CRUD:
```javascript
match /videos/{videoId} {
  allow read, create, update, delete: if true; // Development only
}

match /courses/{courseId} {
  allow read, create, update, delete: if true; // Development only  
}

match /categories/{categoryId} {
  allow read, create, update, delete: if true; // Development only
}
```

## Lưu ý quan trọng

⚠️ **Rules hiện tại chỉ dành cho Development**
- Trong production cần thêm authentication
- Cần validate user roles (admin, instructor)
- Cần limit file size và types

⚠️ **Dữ liệu Emulator**
- Dữ liệu chỉ tồn tại trong session
- Restart emulator = mất dữ liệu
- Dùng `--export-on-exit` để backup

## Tiếp theo

### Khi sẵn sàng production:
1. Setup file `.env` với Firebase project thật
2. Thay đổi rules để yêu cầu authentication
3. Implement user roles và permissions
4. Add file validation và security

### Để phát triển tiếp:
- Tất cả upload/CRUD operations hiện tại hoạt động
- Focus vào UI/UX và business logic
- Test với dữ liệu giả trong emulator
