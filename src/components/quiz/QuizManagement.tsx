'use client';

import { useState } from 'react';

interface SimpleQuiz {
  id: string;
  title: string;
  description: string;
  courseId: string;
  questionCount: number;
  passingScore: number;
  status: 'draft' | 'published';
  createdAt: string;
}

interface SimpleQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'essay';
  options?: string[];
  correctAnswer: string;
  points: number;
}

const QuizManagement = () => {
  const [quizzes] = useState<SimpleQuiz[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    courseId: '',
    passingScore: 70,
    allowRetake: true,
    timeLimit: 60
  });

  const [questionForm, setQuestionForm] = useState<SimpleQuestion>({
    id: '',
    question: '',
    type: 'multiple_choice',
    options: ['', '', '', ''],
    correctAnswer: '',
    points: 1
  });

  const [questions, setQuestions] = useState<SimpleQuestion[]>([]);

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Creating quiz:', { ...quizForm, questions });
      setShowCreateModal(false);
      resetForm();
      alert('Quiz đã được tạo thành công!');
    } catch (error) {
      console.error('Error creating quiz:', error);
      alert('Có lỗi xảy ra khi tạo quiz');
    }
  };

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    const newQuestion: SimpleQuestion = {
      ...questionForm,
      id: Date.now().toString(),
      options: questionForm.type === 'multiple_choice' 
        ? questionForm.options?.filter(opt => opt.trim()) 
        : undefined
    };

    setQuestions(prev => [...prev, newQuestion]);
    setShowQuestionModal(false);
    resetQuestionForm();
  };

  const resetForm = () => {
    setQuizForm({
      title: '',
      description: '',
      courseId: '',
      passingScore: 70,
      allowRetake: true,
      timeLimit: 60
    });
    setQuestions([]);
  };

  const resetQuestionForm = () => {
    setQuestionForm({
      id: '',
      question: '',
      type: 'multiple_choice',
      options: ['', '', '', ''],
      correctAnswer: '',
      points: 1
    });
  };

  const updateOption = (index: number, value: string) => {
    if (questionForm.options) {
      setQuestionForm(prev => ({
        ...prev,
        options: prev.options?.map((opt, i) => i === index ? value : opt)
      }));
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý Quiz</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Tạo quiz mới
        </button>
      </div>

      {/* Quiz List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Danh sách Quiz</h2>
        </div>
        
        {quizzes.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            Chưa có quiz nào. Hãy tạo quiz đầu tiên!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quiz</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khóa học</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Câu hỏi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Điểm đạt</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {quizzes.map((quiz) => (
                  <tr key={quiz.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{quiz.title}</div>
                      <div className="text-sm text-gray-500">{quiz.description}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{quiz.courseId}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{quiz.questionCount} câu</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{quiz.passingScore}%</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        quiz.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {quiz.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">Sửa</button>
                      <button className="text-green-600 hover:text-green-900">
                        {quiz.status === 'published' ? 'Ẩn' : 'Xuất bản'}
                      </button>
                      <button className="text-red-600 hover:text-red-900">Xóa</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Quiz Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-2xl font-bold">Tạo Quiz mới</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <form onSubmit={handleCreateQuiz} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tên quiz *</label>
                  <input
                    type="text"
                    required
                    value={quizForm.title}
                    onChange={(e) => setQuizForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Khóa học *</label>
                  <input
                    type="text"
                    required
                    value={quizForm.courseId}
                    onChange={(e) => setQuizForm(prev => ({ ...prev, courseId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                <textarea
                  rows={3}
                  value={quizForm.description}
                  onChange={(e) => setQuizForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Questions Section */}
              <div className="border-t pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Câu hỏi ({questions.length})</h3>
                  <button
                    type="button"
                    onClick={() => setShowQuestionModal(true)}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                  >
                    + Thêm câu hỏi
                  </button>
                </div>

                {questions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Chưa có câu hỏi nào. Hãy thêm câu hỏi đầu tiên!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {questions.map((question, index) => (
                      <div key={question.id} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-700">Câu {index + 1} ({question.points} điểm)</div>
                            <div className="text-sm text-gray-900 mt-1">{question.question}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setQuestions(prev => prev.filter(q => q.id !== question.id))}
                            className="text-red-600 hover:text-red-800 ml-2"
                          >
                            ✕
                          </button>
                        </div>
                        
                        {question.options && question.type === 'multiple_choice' && (
                          <div className="mt-2">
                            <div className="text-xs text-gray-500 mb-1">Các lựa chọn:</div>
                            <ul className="text-sm space-y-1">
                              {question.options.map((option, optIndex) => (
                                <li 
                                  key={optIndex} 
                                  className={`${
                                    option === question.correctAnswer 
                                      ? 'text-green-600 font-medium' 
                                      : 'text-gray-600'
                                  }`}
                                >
                                  {String.fromCharCode(65 + optIndex)}. {option}
                                  {option === question.correctAnswer && ' ✓'}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => { setShowCreateModal(false); resetForm(); }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={questions.length === 0}
                  className={`px-4 py-2 rounded-md ${
                    questions.length === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  Tạo Quiz
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Question Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold">Thêm câu hỏi</h3>
              <button onClick={() => setShowQuestionModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <form onSubmit={handleAddQuestion} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Loại câu hỏi</label>
                <select
                  value={questionForm.type}
                  onChange={(e) => setQuestionForm(prev => ({ 
                    ...prev, 
                    type: e.target.value as SimpleQuestion['type'],
                    options: e.target.value === 'multiple_choice' ? ['', '', '', ''] : undefined
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="multiple_choice">Trắc nghiệm</option>
                  <option value="true_false">Đúng/Sai</option>
                  <option value="essay">Tự luận</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Câu hỏi *</label>
                <textarea
                  required
                  rows={3}
                  value={questionForm.question}
                  onChange={(e) => setQuestionForm(prev => ({ ...prev, question: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {questionForm.type === 'multiple_choice' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Các lựa chọn</label>
                  {questionForm.options?.map((option, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`Lựa chọn ${String.fromCharCode(65 + index)}`}
                        required
                      />
                    </div>
                  ))}
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Câu trả lời đúng *</label>
                    <select
                      required
                      value={questionForm.correctAnswer}
                      onChange={(e) => setQuestionForm(prev => ({ ...prev, correctAnswer: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Chọn câu trả lời đúng</option>
                      {questionForm.options?.map((option, index) => (
                        option.trim() && (
                          <option key={index} value={option}>
                            {String.fromCharCode(65 + index)}. {option}
                          </option>
                        )
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {questionForm.type === 'true_false' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Câu trả lời đúng *</label>
                  <select
                    required
                    value={questionForm.correctAnswer}
                    onChange={(e) => setQuestionForm(prev => ({ ...prev, correctAnswer: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Chọn đáp án</option>
                    <option value="true">Đúng</option>
                    <option value="false">Sai</option>
                  </select>
                </div>
              )}

              {questionForm.type === 'essay' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gợi ý câu trả lời</label>
                  <textarea
                    rows={3}
                    value={questionForm.correctAnswer}
                    onChange={(e) => setQuestionForm(prev => ({ ...prev, correctAnswer: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Gợi ý hoặc câu trả lời mẫu"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Điểm số</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={questionForm.points}
                  onChange={(e) => setQuestionForm(prev => ({ ...prev, points: parseInt(e.target.value) || 1 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => { setShowQuestionModal(false); resetQuestionForm(); }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Thêm câu hỏi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizManagement;