import { QuickQuestion, AutoReply } from '@/types/smartChat';

export const QUICK_QUESTIONS: QuickQuestion[] = [
  {
    id: 'course_info',
    text: 'Làm sao để đăng ký khóa học?',
    category: 'course',
    keywords: ['đăng ký', 'khóa học', 'course', 'register']
  },
  {
    id: 'payment_method',
    text: 'Các phương thức thanh toán nào được hỗ trợ?',
    category: 'payment',
    keywords: ['thanh toán', 'payment', 'tiền', 'momo', 'banking']
  },
  {
    id: 'certificate',
    text: 'Làm thế nào để nhận chứng chỉ?',
    category: 'course',
    keywords: ['chứng chỉ', 'certificate', 'hoàn thành']
  },
  {
    id: 'video_issue',
    text: 'Video không phát được, phải làm sao?',
    category: 'technical',
    keywords: ['video', 'phát', 'play', 'lỗi', 'error']
  },
  {
    id: 'progress_track',
    text: 'Làm sao để theo dõi tiến độ học tập?',
    category: 'course',
    keywords: ['tiến độ', 'progress', 'học tập', 'track']
  },
  {
    id: 'refund_policy',
    text: 'Chính sách hoàn tiền như thế nào?',
    category: 'payment',
    keywords: ['hoàn tiền', 'refund', 'hủy', 'cancel']
  }
];

export const AUTO_REPLIES: AutoReply[] = [
  {
    id: 'course_registration',
    keywords: ['đăng ký khóa học', 'register course', 'đăng ký', 'đk'],
    response: `Để đăng ký khóa học, bạn có thể:
1. Vào trang Khóa học và chọn khóa muốn học
2. Nhấn nút "Đăng ký ngay" 
3. Chọn phương thức thanh toán phù hợp
4. Hoàn tất thanh toán để bắt đầu học

Bạn có cần hỗ trợ thêm về bước nào không?`,
    category: 'course',
    followUpQuestions: [
      {
        id: 'payment_help',
        text: 'Hướng dẫn thanh toán',
        category: 'payment',
        keywords: ['thanh toán']
      },
      {
        id: 'course_recommend',
        text: 'Gợi ý khóa học phù hợp',
        category: 'course',
        keywords: ['gợi ý', 'khóa học']
      }
    ]
  },
  {
    id: 'payment_methods',
    keywords: ['thanh toán', 'payment', 'momo', 'banking', 'visa', 'mastercard'],
    response: `Chúng tôi hỗ trợ các phương thức thanh toán sau:
• Thẻ tín dụng/ghi nợ (Visa, MasterCard)
• Ví điện tử MoMo
• Chuyển khoản ngân hàng
• Ví ZaloPay

Tất cả đều được bảo mật 100% và xử lý nhanh chóng. Bạn muốn thanh toán bằng phương thức nào?`,
    category: 'payment'
  },
  {
    id: 'video_troubleshoot',
    keywords: ['video không phát', 'video lỗi', 'video error', 'không xem được'],
    response: `Để khắc phục lỗi video, bạn hãy thử:
1. Kiểm tra kết nối internet
2. Làm mới trang (F5)
3. Thử trình duyệt khác (Chrome, Firefox)
4. Tắt các extension chặn quảng cáo
5. Xóa cache trình duyệt

Video vẫn không phát được? Tôi sẽ kết nối bạn với kỹ thuật viên.`,
    category: 'technical'
  },
  {
    id: 'certificate_info',
    keywords: ['chứng chỉ', 'certificate', 'hoàn thành khóa học'],
    response: `Để nhận chứng chỉ, bạn cần:
✅ Hoàn thành 100% bài học
✅ Đạt điểm tối thiểu trong các bài quiz (70%)
✅ Hoàn thành dự án cuối khóa (nếu có)

Sau khi đủ điều kiện, chứng chỉ sẽ tự động xuất hiện trong mục "Chứng chỉ" của bạn.`,
    category: 'course'
  },
  {
    id: 'progress_tracking',
    keywords: ['tiến độ', 'progress', 'theo dõi học tập'],
    response: `Bạn có thể theo dõi tiến độ học tập tại:
📊 Dashboard - xem tổng quan tiến độ
📚 Trang khóa học - % hoàn thành từng khóa
📝 Lịch sử học tập - chi tiết thời gian học

Tiến độ được cập nhật tự động khi bạn hoàn thành mỗi bài học.`,
    category: 'course'
  },
  {
    id: 'refund_policy',
    keywords: ['hoàn tiền', 'refund', 'hủy khóa học', 'trả lại tiền'],
    response: `Chính sách hoàn tiền của chúng tôi:
• Trong 7 ngày đầu: Hoàn 100% nếu chưa học quá 20%
• Từ 8-30 ngày: Hoàn 50% nếu chưa hoàn thành khóa học
• Sau 30 ngày: Không hoàn tiền

Để yêu cầu hoàn tiền, vui lòng liên hệ với bộ phận hỗ trợ.`,
    category: 'payment'
  },
  {
    id: 'greeting',
    keywords: ['xin chào', 'hello', 'hi', 'chào bạn', 'help'],
    response: `Xin chào! Tôi là trợ lý ảo của Vegana 🌱

Tôi có thể giúp bạn:
• Thông tin về khóa học
• Hướng dẫn đăng ký và thanh toán  
• Giải đáp thắc mắc kỹ thuật
• Chính sách và quy định

Bạn cần hỗ trợ gì hôm nay?`,
    category: 'general'
  }
];

export const CATEGORY_COLORS = {
  course: 'bg-green-100 text-green-800',
  payment: 'bg-blue-100 text-blue-800', 
  technical: 'bg-red-100 text-red-800',
  general: 'bg-gray-100 text-gray-800'
};
