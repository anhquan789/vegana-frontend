# Vegana E-Learning Platform

Một nền tảng học tập trực tuyến hiện đại được xây dựng với Next.js 15, Firebase và TypeScript, cung cấp các tính năng học tập toàn diện.

## 🌟 Tính năng chính

### 📚 Hệ thống khóa học
- Quản lý khóa học và bài giảng
- Video streaming và tài liệu học tập
- Theo dõi tiến độ học tập

### 📝 Quiz & Assignments với Auto-grading
- **Nhiều loại câu hỏi**: Multiple choice, True/False, Fill in blank, Essay
- **Tự động chấm điểm**: Fuzzy matching cho câu trả lời văn bản
- **Giới hạn thời gian**: Auto-submit khi hết thời gian
- **Nhiều lần làm bài**: Tracking attempts và best score
- **Kết quả chi tiết**: Review từng câu với giải thích

### 🏆 Certificates & Completion Badges
- **Tự động tạo chứng chỉ**: PDF generation với verification code
- **Hệ thống huy hiệu**: Achievement badges cho các milestone
- **Portfolio view**: Hiển thị tất cả certificates và badges
- **Xác thực công khai**: Verification system cho certificates

### 💬 Discussions / Q&A Forums
- **Threaded discussions**: Phân loại theo category
- **Q&A format**: Mark accepted answers
- **File attachments**: Upload tài liệu và hình ảnh
- **Moderation tools**: Report content, admin controls
- **Real-time updates**: Live notifications

### 🔧 Tính năng kỹ thuật
- **Firebase Integration**: Firestore, Storage, Authentication
- **Real-time updates**: onSnapshot listeners
- **TypeScript**: Type-safe development
- **Responsive design**: Mobile-first approach
- **PDF generation**: Client-side certificate creation

## 🚀 Demo Features

Truy cập `/demo/learning-features` để xem demo tất cả tính năng:
- Quiz system với auto-grading
- Results analysis và feedback
- Discussion forum với moderation
- Certificates và badges gallery

## 📁 Cấu trúc dự án

```
src/
├── app/                    # Next.js 15 App Router
├── components/             # React components
│   ├── quiz/              # Quiz system components
│   ├── certificate/       # Certificate & badge components
│   ├── discussion/        # Discussion forum components
│   └── ...
├── lib/                   # Business logic & services
│   ├── quiz/             # Quiz service với auto-grading
│   ├── certificate/      # Certificate generation service
│   ├── discussion/       # Discussion service với moderation
│   └── ...
├── types/                 # TypeScript type definitions
│   ├── quiz.ts           # Quiz & attempt types
│   ├── certificate.ts    # Certificate & badge types
│   ├── discussion.ts     # Discussion & moderation types
│   └── ...
└── utils/                # Helper functions
```

## 🛠️ Cài đặt và chạy

### Prerequisites
- Node.js 18+
- Firebase CLI
- Git

### Setup

1. **Clone repository**
```bash
git clone <repository-url>
cd vegana-frontend
```

2. **Cài đặt dependencies**
```bash
npm install
```

3. **Setup Firebase**
```bash
firebase login
firebase init
```

4. **Khởi động Firebase Emulators**
```bash
firebase emulators:start
```

5. **Chạy development server**
```bash
npm run dev
```

6. **Truy cập ứng dụng**
- Frontend: [http://localhost:3000](http://localhost:3000)
- Firebase UI: [http://localhost:4000](http://localhost:4000)
- Demo: [http://localhost:3000/demo/learning-features](http://localhost:3000/demo/learning-features)

## 📊 Database Schema

### Quiz System
```typescript
// Collection: quizzes
Quiz {
  id, courseId, title, description
  timeLimit, attempts, passingScore
  questions: QuizQuestion[]
  status: 'draft' | 'published'
}

// Collection: quizAttempts  
QuizAttempt {
  id, quizId, studentId
  answers: QuizAnswer[]
  score, maxScore, passed
  startedAt, completedAt, timeSpent
}
```

### Certificate System
```typescript
// Collection: certificates
Certificate {
  id, userId, courseId, templateId
  studentName, courseName
  completionDate, verificationCode
  pdfUrl, issuedBy
}

// Collection: userBadges
UserBadge {
  id, userId, badgeId
  awardedAt, criteria, progress
}
```

### Discussion System
```typescript
// Collection: discussions
Discussion {
  id, courseId, authorId
  title, content, category
  attachments, tags
  likesCount, repliesCount
}

// Subcollection: discussionReplies
Reply {
  id, discussionId, authorId
  content, parentReplyId
  isAcceptedAnswer
}
```

## 🧪 Testing

### Firebase Emulator
```bash
# Khởi động emulators
firebase emulators:start

# Test với UI
http://localhost:4000
```

### Component Testing
```bash
# Chạy tests
npm test

# Test coverage
npm run test:coverage
```

## 🔐 Authentication & Security

### Firebase Rules
- **Firestore Rules**: Role-based access control
- **Storage Rules**: File upload permissions  
- **Security**: Input validation và sanitization

### User Roles
- **Student**: Take quizzes, join discussions, view certificates
- **Instructor**: Create content, moderate discussions
- **Admin**: Full system access và management

## 📱 Responsive Design

- **Mobile-first**: Thiết kế tối ưu cho mobile
- **Tablet support**: Layout responsive cho tablet
- **Desktop**: Full-featured desktop experience
- **PWA ready**: Progressive Web App capabilities

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Deploy to Vercel
vercel --prod
```

### Firebase Hosting
```bash
# Build và deploy
npm run build
firebase deploy --only hosting
```

## 📈 Performance Optimization

- **Code splitting**: Dynamic imports
- **Image optimization**: Next.js Image component
- **Caching**: Firebase caching strategies
- **Bundle analysis**: webpack-bundle-analyzer

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

- 📧 Email: support@vegana-learning.com
- 💬 Discord: [Community Server](https://discord.gg/vegana)
- 📖 Docs: [Documentation](https://docs.vegana-learning.com)

---

**Vegana E-Learning Platform** - Empowering education through technology 🌱
