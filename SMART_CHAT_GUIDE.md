# Hệ thống Chat Thông minh - Vegana Frontend

## Tổng quan

Hệ thống chat thông minh được thiết kế để cung cấp trải nghiệm hỗ trợ khách hàng tự động và thông minh với các tính năng:

- 🤖 **Trả lời tự động**: Nhận diện và phản hồi câu hỏi phổ biến
- 💡 **Gợi ý thông minh**: Đưa ra câu hỏi và phản hồi phù hợp
- ⚡ **Real-time**: Chat trực tiếp với hiệu ứng typing
- 🎯 **Phân tích ý định**: Hiểu ngữ cảnh và mục đích người dùng

## Cấu trúc hệ thống

### 1. Types & Interfaces
```typescript
// src/types/smartChat.ts
- QuickQuestion: Câu hỏi gợi ý
- AutoReply: Phản hồi tự động  
- ChatSuggestion: Gợi ý chat
- SmartChatState: Trạng thái chat thông minh
```

### 2. Dữ liệu & Constants
```typescript
// src/constants/smartChat.ts
- QUICK_QUESTIONS: 6 câu hỏi thường gặp
- AUTO_REPLIES: 7 phản hồi tự động thông dụng
- CATEGORY_COLORS: Màu sắc theo danh mục
```

### 3. Smart Chat Service
```typescript
// src/lib/chat/smartChatService.ts
- findAutoReply(): Tìm phản hồi tự động
- generateSmartReply(): Tạo phản hồi thông minh  
- getSuggestions(): Lấy gợi ý câu hỏi
- analyzeIntent(): Phân tích ý định người dùng
```

### 4. Components

#### ChatWidget (Enhanced)
```typescript
// src/components/chat/ChatWidget.tsx
- Tích hợp smart suggestions
- Auto-reply với typing indicator
- Quick question buttons
- Context-aware suggestions
```

#### QuickSuggestions
```typescript
// src/components/chat/QuickSuggestions.tsx
- Hiển thị câu hỏi gợi ý
- Phân loại theo type
- Click để điền vào input
```

#### TypingIndicator
```typescript
// src/components/chat/TypingIndicator.tsx
- Hiệu ứng "đang nhập..."
- Animation bouncing dots
- Customizable sender name
```

## Tính năng chính

### 1. Trả lời tự động thông minh

**Keyword Matching:**
- Exact match: Tìm từ khóa chính xác
- Fuzzy matching: Tìm kiếm gần đúng (Levenshtein distance)
- Intent analysis: Phân tích ý định dựa trên ngữ cảnh

**Danh mục được hỗ trợ:**
- `course`: Khóa học, đăng ký, chứng chỉ
- `payment`: Thanh toán, hoàn tiền
- `technical`: Lỗi video, kỹ thuật
- `general`: Câu hỏi chung

### 2. Gợi ý thông minh

**Context-aware suggestions:**
- Dựa trên tin nhắn cuối cùng
- Follow-up questions sau auto-reply
- Random quick questions khi không có context

**Types:**
- `question`: Câu hỏi thường gặp
- `quick_reply`: Phản hồi nhanh
- `action`: Hành động cụ thể

### 3. Auto-reply Examples

**Đăng ký khóa học:**
```
Trigger: "đăng ký khóa học", "register course"
Response: Hướng dẫn 4 bước đăng ký với follow-up options
```

**Thanh toán:**
```
Trigger: "thanh toán", "payment", "momo"
Response: Danh sách 4 phương thức thanh toán được hỗ trợ
```

**Lỗi video:**
```
Trigger: "video không phát", "video lỗi"
Response: 5 bước troubleshooting cơ bản
```

## Cách sử dụng

### 1. Basic Integration

```typescript
import { smartChatService } from '@/lib/chat/smartChatService';

// Kiểm tra auto-reply
const shouldReply = smartChatService.shouldShowAutoReply(message);

// Tạo phản hồi
const reply = smartChatService.generateSmartReply(message);

// Lấy suggestions
const suggestions = smartChatService.getSuggestions(lastMessage);
```

### 2. Component Usage

```tsx
import ChatWidget from '@/components/chat/ChatWidget';
import QuickSuggestions from '@/components/chat/QuickSuggestions';
import TypingIndicator from '@/components/chat/TypingIndicator';

// ChatWidget đã tích hợp sẵn tất cả tính năng thông minh
<ChatWidget position="bottom-right" />
```

## Demo & Testing

**URL Demo:** `http://localhost:3001/demo/chat`

Trang demo cho phép:
- Test các message patterns
- Xem phản hồi tự động
- Kiểm tra suggestions
- Thử tất cả quick questions

## Workflow

### 1. User gửi tin nhắn
```mermaid
User Input → Keyword Analysis → Auto-reply Check → Generate Response
```

### 2. Auto-reply process  
```mermaid
Message → findAutoReply() → Typing Indicator → Send Reply → Update Suggestions
```

### 3. Suggestions update
```mermaid
Last Message → Context Analysis → Generate Suggestions → Display to User
```

## Cấu hình & Tùy chỉnh

### 1. Thêm câu hỏi mới
```typescript
// src/constants/smartChat.ts
QUICK_QUESTIONS.push({
  id: 'new_question',
  text: 'Câu hỏi mới?',
  category: 'general',
  keywords: ['từ', 'khóa']
});
```

### 2. Thêm auto-reply mới
```typescript
AUTO_REPLIES.push({
  id: 'new_reply',
  keywords: ['trigger1', 'trigger2'],
  response: 'Phản hồi tự động...',
  category: 'general',
  followUpQuestions: [...]
});
```

### 3. Tùy chỉnh thuật toán
```typescript
// Thay đổi threshold cho fuzzy matching
private similarityScore(str1: string, str2: string): number {
  // Current threshold: 0.7
  // Giảm để matching rộng hơn, tăng để chính xác hơn
}
```

## Performance & Optimization

- **Singleton Pattern**: SmartChatService sử dụng singleton
- **Lazy Loading**: Suggestions chỉ load khi cần
- **Debounced Typing**: Typing indicator với delay ngẫu nhiên
- **Context-aware**: Chỉ update khi có thay đổi thực sự

## Security

- **Input Sanitization**: Normalize input trước khi xử lý
- **Rate Limiting**: Có thể thêm để tránh spam
- **Content Filtering**: Có thể mở rộng để filter nội dung không phù hợp

## Future Enhancements

1. **Machine Learning**: Tích hợp ML model cho phân tích sentiment
2. **Analytics**: Tracking effectiveness của auto-replies
3. **A/B Testing**: Test different reply strategies
4. **Multilingual**: Hỗ trợ nhiều ngôn ngữ
5. **Voice Integration**: Tích hợp speech-to-text
6. **Rich Media**: Hỗ trợ images, files trong responses

## Troubleshooting

### Common Issues:

1. **Auto-reply không hoạt động:**
   - Kiểm tra keywords trong AUTO_REPLIES
   - Verify shouldShowAutoReply() logic

2. **Suggestions không hiển thị:**
   - Check showSuggestions state
   - Verify getSuggestions() return values

3. **Typing indicator stuck:**
   - Check setTimeout cleanup
   - Verify isTyping state management
