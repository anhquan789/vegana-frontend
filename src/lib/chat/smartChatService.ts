import { AUTO_REPLIES, QUICK_QUESTIONS } from '@/constants/smartChat';
import { AutoReply, ChatSuggestion, QuickQuestion } from '@/types/smartChat';

export class SmartChatService {
  private static instance: SmartChatService;

  static getInstance(): SmartChatService {
    if (!SmartChatService.instance) {
      SmartChatService.instance = new SmartChatService();
    }
    return SmartChatService.instance;
  }

  // Phân tích tin nhắn và tìm phản hồi tự động
  findAutoReply(message: string): AutoReply | null {
    const normalizedMessage = message.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .trim();

    // Tìm kiếm exact match trước
    for (const reply of AUTO_REPLIES) {
      for (const keyword of reply.keywords) {
        if (normalizedMessage.includes(keyword.toLowerCase())) {
          return reply;
        }
      }
    }

    // Nếu không tìm thấy, thử tìm kiếm fuzzy match
    return this.findFuzzyMatch(normalizedMessage);
  }

  // Tìm kiếm gần đúng dựa trên từ khóa
  private findFuzzyMatch(message: string): AutoReply | null {
    const words = message.split(' ');
    const scores: { reply: AutoReply; score: number }[] = [];

    for (const reply of AUTO_REPLIES) {
      let score = 0;
      for (const keyword of reply.keywords) {
        const keywordWords = keyword.toLowerCase().split(' ');
        for (const word of words) {
          for (const keywordWord of keywordWords) {
            if (this.similarityScore(word, keywordWord) > 0.7) {
              score += 1;
            }
          }
        }
      }
      if (score > 0) {
        scores.push({ reply, score });
      }
    }

    if (scores.length > 0) {
      scores.sort((a, b) => b.score - a.score);
      return scores[0].reply;
    }

    return null;
  }

  // Tính độ tương đồng giữa 2 từ (Levenshtein distance)
  private similarityScore(str1: string, str2: string): number {
    const matrix: number[][] = [];
    const len1 = str1.length;
    const len2 = str2.length;

    for (let i = 0; i <= len2; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= len1; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= len2; i++) {
      for (let j = 1; j <= len1; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    const distance = matrix[len2][len1];
    const maxLen = Math.max(len1, len2);
    return maxLen === 0 ? 1 : (maxLen - distance) / maxLen;
  }

  // Lấy câu hỏi gợi ý dựa trên context
  getSuggestions(lastMessage?: string, category?: string): ChatSuggestion[] {
    const suggestions: ChatSuggestion[] = [];

    // Nếu có tin nhắn cuối, gợi ý dựa trên nó
    if (lastMessage) {
      const autoReply = this.findAutoReply(lastMessage);
      if (autoReply?.followUpQuestions) {
        for (const question of autoReply.followUpQuestions) {
          suggestions.push({
            id: `followup_${question.id}`,
            text: question.text,
            type: 'question'
          });
        }
      }
    }

    // Thêm câu hỏi thường gặp
    if (suggestions.length < 3) {
      const quickQuestions = category 
        ? QUICK_QUESTIONS.filter(q => q.category === category)
        : QUICK_QUESTIONS;

      const remainingSlots = 3 - suggestions.length;
      const randomQuestions = quickQuestions
        .sort(() => Math.random() - 0.5)
        .slice(0, remainingSlots);

      for (const question of randomQuestions) {
        suggestions.push({
          id: `quick_${question.id}`,
          text: question.text,
          type: 'question'
        });
      }
    }

    return suggestions;
  }

  // Phân tích ý định người dùng
  analyzeIntent(message: string): string {
    const normalizedMessage = message.toLowerCase();

    // Định danh các intent cơ bản
    if (normalizedMessage.includes('đăng ký') || normalizedMessage.includes('register')) {
      return 'registration';
    }
    if (normalizedMessage.includes('thanh toán') || normalizedMessage.includes('payment')) {
      return 'payment';
    }
    if (normalizedMessage.includes('video') || normalizedMessage.includes('lỗi')) {
      return 'technical_support';
    }
    if (normalizedMessage.includes('chứng chỉ') || normalizedMessage.includes('certificate')) {
      return 'certification';
    }
    if (normalizedMessage.includes('tiến độ') || normalizedMessage.includes('progress')) {
      return 'progress';
    }

    return 'general';
  }

  // Tạo phản hồi thông minh dựa trên context
  generateSmartReply(message: string): string {
    // Tìm auto reply trước
    const autoReply = this.findAutoReply(message);
    if (autoReply) {
      return autoReply.response;
    }

    // Nếu không tìm thấy, tạo phản hồi general
    const intent = this.analyzeIntent(message);
    
    const generalReplies = {
      registration: 'Tôi hiểu bạn quan tâm đến việc đăng ký. Để hỗ trợ tốt nhất, bạn có thể cho tôi biết cụ thể bạn muốn đăng ký khóa học nào không?',
      payment: 'Về vấn đề thanh toán, tôi sẽ kết nối bạn với chuyên viên tài chính để được hỗ trợ chi tiết nhất.',
      technical_support: 'Tôi thấy bạn gặp vấn đề kỹ thuật. Hãy mô tả cụ thể lỗi bạn gặp phải để tôi có thể hỗ trợ tốt hơn.',
      certification: 'Về chứng chỉ, tôi có thể hướng dẫn bạn chi tiết. Bạn đã hoàn thành khóa học nào chưa?',
      progress: 'Tôi có thể giúp bạn theo dõi tiến độ học tập. Bạn muốn xem tiến độ của khóa học nào?',
      general: 'Cảm ơn bạn đã liên hệ! Tôi sẽ chuyển câu hỏi này đến nhân viên hỗ trợ để được trả lời chính xác nhất. Trong lúc chờ đợi, bạn có thể xem các câu hỏi thường gặp bên dưới.'
    };

    return generalReplies[intent as keyof typeof generalReplies] || generalReplies.general;
  }

  // Kiểm tra xem có nên hiển thị auto reply không
  shouldShowAutoReply(message: string): boolean {
    const autoReply = this.findAutoReply(message);
    return !!autoReply;
  }

  // Lấy danh mục câu hỏi
  getQuestionsByCategory(category: string): QuickQuestion[] {
    return QUICK_QUESTIONS.filter(q => q.category === category);
  }
}

export const smartChatService = SmartChatService.getInstance();
