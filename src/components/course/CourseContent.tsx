interface Course {
  id: string;
  title: string;
  description: string;
  publishedDate: string;
  socialLinks: {
    fanpage?: string;
    group?: string;
    youtube?: string;
    sonDang?: string;
  };
}

interface Lesson {
  id: string;
  title: string;
  description: string;
}

interface CourseContentProps {
  course: Course;
  currentLesson: Lesson | null;
}

const CourseContent: React.FC<CourseContentProps> = ({ course, currentLesson }) => {
  return (
    <div className="p-6 bg-white">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        {currentLesson ? currentLesson.title : course.title}
      </h2>
      <p className="text-gray-500 mb-4">{course.publishedDate}</p>
      <button className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg mb-4 hover:bg-blue-200 transition-colors">
        + Thêm ghi chú tại 00:00
      </button>
      <p className="text-gray-700 mb-4 leading-relaxed">{course.description}</p>
      {Object.keys(course.socialLinks).length > 0 && (
        <ul className="mb-6 space-y-2">
          {course.socialLinks.fanpage && (
            <li>
              <span className="font-medium">Fanpage:</span>{' '}
              <a 
                href={course.socialLinks.fanpage} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                {course.socialLinks.fanpage}
              </a>
            </li>
          )}
          {course.socialLinks.group && (
            <li>
              <span className="font-medium">Group:</span>{' '}
              <a 
                href={course.socialLinks.group} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                {course.socialLinks.group}
              </a>
            </li>
          )}
          {course.socialLinks.youtube && (
            <li>
              <span className="font-medium">Youtube:</span>{' '}
              <a 
                href={course.socialLinks.youtube} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                {course.socialLinks.youtube}
              </a>
            </li>
          )}
          {course.socialLinks.sonDang && (
            <li>
              <span className="font-medium">Sơn Đặng:</span>{' '}
              <a 
                href={course.socialLinks.sonDang} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                {course.socialLinks.sonDang}
              </a>
            </li>
          )}
        </ul>
      )}
      <div>
        <button className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors">
          Hỏi đáp
        </button>
      </div>
    </div>
  );
};

export default CourseContent;
