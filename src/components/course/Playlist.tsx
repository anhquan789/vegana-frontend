'use client';

interface Lesson {
  id: string;
  title: string;
  duration: string;
  isLocked: boolean;
}

interface PlaylistProps {
  lessons: Lesson[];
  currentLesson: Lesson | null;
  onLessonSelect: (lesson: Lesson) => void;
}

const Playlist: React.FC<PlaylistProps> = ({ lessons, currentLesson, onLessonSelect }) => {
  const completedLessons = lessons.filter(lesson => !lesson.isLocked);
  const totalDuration = lessons.reduce((acc, lesson) => {
    // Simple duration calculation (assuming format like "23:57")
    const [minutes, seconds] = lesson.duration.split(':').map(Number);
    return acc + minutes + (seconds / 60);
  }, 0);
  
  const formatTotalDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`;
  };

  return (
    <aside className="w-80 bg-gray-50 border-l border-gray-200 h-screen overflow-y-auto">
      <div className="p-4 border-b border-gray-200 bg-white">
        <h3 className="text-lg font-bold mb-2">Nội dung khóa học</h3>
        <div className="flex justify-between text-sm text-gray-600">
          <span>{completedLessons.length}/{lessons.length} bài học</span>
          <span>{formatTotalDuration(totalDuration)}</span>
        </div>
      </div>
      
      <div>
        <div className="flex justify-between items-center font-bold p-3 bg-gray-100 cursor-pointer border-b border-gray-200">
          <span>1. IIFE, Scope, Closure</span>
          <span className="text-sm text-gray-600">▼</span>
        </div>
        <ul className="list-none p-0 m-0">
          {lessons.map((lesson, index) => (
            <li 
              key={lesson.id} 
              className={`
                flex items-center p-3 border-b border-gray-100 cursor-pointer transition-colors
                ${currentLesson?.id === lesson.id 
                  ? 'bg-orange-50 text-orange-600 border-l-4 border-l-orange-500' 
                  : 'hover:bg-gray-100'
                }
                ${lesson.isLocked ? 'cursor-not-allowed opacity-60' : ''}
              `}
              onClick={() => onLessonSelect(lesson)}
            >
              <div className="font-medium mr-2 min-w-[20px]">
                {index + 1}.
              </div>
              <div className="flex-grow flex flex-col gap-0.5">
                <span className="text-sm leading-tight">{lesson.title}</span>
                <span className="text-xs text-gray-600">{lesson.duration}</span>
              </div>
              <div className="ml-2">
                {!lesson.isLocked ? (
                  <span className="text-green-600 font-bold">✓</span>
                ) : (
                  <span className="text-gray-400 text-xs">🔒</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="p-4 flex gap-2 border-t border-gray-200 bg-white">
        <button className="flex-1 px-3 py-2 border border-gray-300 bg-white text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled>
          ← BÀI TRƯỚC
        </button>
        <button className="flex-1 px-3 py-2 border border-gray-300 bg-white text-xs font-medium transition-colors hover:bg-gray-50">
          BÀI TIẾP THEO →
        </button>
      </div>
    </aside>
  );
};

export default Playlist;
