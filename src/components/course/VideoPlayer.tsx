interface Course {
  id: string;
  title: string;
  thumbnail: string;
}

interface Lesson {
  id: string;
  title: string;
  videoUrl: string;
  description: string;
}

interface VideoPlayerProps {
  lesson: Lesson | null;
  course: Course;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ lesson }) => {
  const videoTitle = lesson ? lesson.title : 'Chọn bài học để xem video';
  
  return (
    <div className="relative bg-black aspect-video overflow-hidden">
      <div className="relative w-full h-full">
        {lesson ? (
          <>
            <div className="relative w-full h-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white">
              <div className="text-center z-10">
                <div className="mb-5 cursor-pointer transition-transform hover:scale-110">
                  <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                    <circle cx="40" cy="40" r="40" fill="rgba(255,255,255,0.9)"/>
                    <path d="M32 25L55 40L32 55V25Z" fill="#ff4444"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-5xl font-bold mb-2 leading-tight">{lesson.title}</h2>
                  <p className="text-2xl font-medium opacity-90">JavaScript (Nâng cao)</p>
                </div>
              </div>
              <div className="absolute bottom-5 right-5 text-lg font-medium opacity-80">
                <span>fullstack.edu.vn</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-800 text-white text-lg">
            <p>{videoTitle}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
