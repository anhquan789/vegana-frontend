import Link from 'next/link';
import React from 'react';

const NotFoundPage: React.FC = () => {
	return (
		<main className="min-h-screen bg-gradient-to-br from-white to-green-50 flex items-center justify-center p-6">
			<div className="max-w-4xl w-full bg-white shadow-lg rounded-lg overflow-hidden">
				<div className="md:flex">
					<div className="md:w-1/2 p-10 flex flex-col justify-center">
						<h1 className="text-4xl font-extrabold text-gray-900 mb-4">404</h1>
						<h2 className="text-2xl font-semibold text-gray-800 mb-3">Trang bạn tìm không tồn tại</h2>
						<p className="text-gray-600 mb-6">
							Có thể link đã bị thay đổi hoặc trang đã được xóa. Thử quay lại trang chủ hoặc tìm kiếm nội dung bạn cần.
						</p>

						<div className="flex space-x-3">
							<Link href="/" className="inline-block px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700">
								Về trang chủ
							</Link>
							<Link href="/courses" className="inline-block px-4 py-2 border border-gray-200 rounded hover:bg-gray-50">
								Tìm khóa học
							</Link>
						</div>
					</div>

					<div className="md:w-1/2 bg-green-50 flex items-center justify-center p-6">
						{/* Illustration */}
						<svg width="320" height="240" viewBox="0 0 320 240" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Not found illustration">
							<rect x="10" y="30" width="140" height="120" rx="8" fill="#F0FFF4" stroke="#C6F6D5" />
							<rect x="170" y="60" width="120" height="90" rx="8" fill="#F0FFF4" stroke="#C6F6D5" />
							<path d="M60 90c12-18 36-30 60-30s48 12 60 30" stroke="#34D399" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
							<circle cx="80" cy="70" r="6" fill="#10B981"/>
							<circle cx="120" cy="70" r="6" fill="#10B981"/>
							<path d="M220 120c6-8 18-12 30-12" stroke="#059669" strokeWidth="5" strokeLinecap="round"/>
							<text x="40" y="180" fill="#047857" fontSize="18" fontWeight="700">Không tìm thấy gì ở đây</text>
						</svg>
					</div>
				</div>
			</div>
		</main>
	);
};

export default NotFoundPage;