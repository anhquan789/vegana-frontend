# Hướng dẫn khởi động Firebase Emulator

## Điều kiện tiên quyết
- Node.js đã được cài đặt
- Firebase CLI đã được cài đặt (`npm install -g firebase-tools`)
- Đã đăng nhập Firebase (`firebase login`)

## Khởi động Firebase Emulator

### Cách 1: Sử dụng lệnh trực tiếp
```bash
cd "/Users/quanpham/Git resource/new-projects/vegana-frontend"
firebase emulators:start
```

### Cách 2: Sử dụng npm script (nếu có trong package.json)
```bash
npm run emulator
```

## Thông tin Emulator sau khi khởi động thành công

### Emulator UI Dashboard
- **URL**: http://127.0.0.1:4001/
- Tại đây bạn có thể quản lý dữ liệu, xem logs, và monitor các service

### Các service đang chạy:

| Service | Host:Port | Emulator UI |
|---------|-----------|-------------|
| Authentication | 127.0.0.1:9098 | http://127.0.0.1:4001/auth |
| Firestore | 127.0.0.1:8081 | http://127.0.0.1:4001/firestore |
| Storage | 127.0.0.1:9198 | http://127.0.0.1:4001/storage |

### Emulator Hub
- **Host**: 127.0.0.1
- **Port**: 4400
- **Reserved Ports**: 4500, 9150

## Kiểm tra trạng thái

### Dấu hiệu khởi động thành công:
- Thấy thông báo: `✔ All emulators ready! It is now safe to connect your app.`
- Có thể truy cập Emulator UI tại http://127.0.0.1:4001/
- Các service hiển thị trong bảng với đúng port

### Xử lý lỗi phổ biến:

#### Lỗi Storage Rules (Warning):
```
⚠ Missing 'match' keyword before path in storage.rules:5
```
**Giải pháp**: Kiểm tra và sửa file `storage.rules`

#### Port đã được sử dụng:
```
Error: Port XXXX is already in use
```
**Giải pháp**: 
- Tắt process đang sử dụng port
- Hoặc sử dụng port khác: `firebase emulators:start --only firestore --port 8082`

## Kết nối từ ứng dụng

### Trong file firebase config của app:
```typescript
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectStorageEmulator, getStorage } from 'firebase/storage';

// Chỉ kết nối emulator trong development
if (process.env.NODE_ENV === 'development') {
  const db = getFirestore();
  const auth = getAuth();
  const storage = getStorage();
  
  // Kết nối emulator (chỉ gọi một lần)
  if (!db._delegate._databaseId.projectId.includes('demo-')) {
    connectFirestoreEmulator(db, 'localhost', 8081);
    connectAuthEmulator(auth, 'http://localhost:9098');
    connectStorageEmulator(storage, 'localhost', 9198);
  }
}
```

## Dừng Emulator
- Nhấn `Ctrl + C` trong terminal đang chạy emulator
- Hoặc sử dụng: `firebase emulators:stop`

## Dữ liệu Emulator
- Dữ liệu emulator chỉ tồn tại trong session hiện tại
- Khi restart emulator, dữ liệu sẽ bị xóa
- Để persist dữ liệu: sử dụng `--import` và `--export-on-exit`

### Xuất dữ liệu:
```bash
firebase emulators:start --export-on-exit=./emulator-data
```

### Nhập dữ liệu:
```bash
firebase emulators:start --import=./emulator-data
```

## Lưu ý quan trọng
- **Chỉ sử dụng trong development**: Emulator không phải production environment
- **Dữ liệu test**: Không sử dụng dữ liệu thật trong emulator
- **Performance**: Emulator có thể chậm hơn Firebase production
- **Network**: Đảm bảo không có firewall chặn các port emulator

## Troubleshooting

### Kiểm tra Firebase CLI version:
```bash
firebase --version
```

### Kiểm tra project hiện tại:
```bash
firebase projects:list
firebase use
```

### Xem logs chi tiết:
- Firestore: `firestore-debug.log`
- Auth: `firebase-debug.log`

### Reset emulator:
```bash
firebase emulators:start --wipe-data
```
