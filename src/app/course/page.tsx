import Link from 'next/link';

const CoursePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Danh sách khóa học
            </h1>
            <p className="text-gray-600 mb-6">
              Khám phá các khóa học lập trình chất lượng cao
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link 
                href="/course/javascript-nang-cao" 
                className="block bg-gray-50 p-6 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  JavaScript Nâng Cao
                </h3>
                <p className="text-gray-600 mb-4">
                  Học các khái niệm nâng cao trong JavaScript
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-600">Miễn phí</span>
                  <span className="text-sm text-gray-500">40 giờ</span>
                </div>
              </Link>
              
              <Link 
                href="/course/react-co-ban" 
                className="block bg-gray-50 p-6 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  React Cơ Bản
                </h3>
                <p className="text-gray-600 mb-4">
                  Làm quen với thư viện React của Facebook
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-600">Miễn phí</span>
                  <span className="text-sm text-gray-500">25 giờ</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePage;
