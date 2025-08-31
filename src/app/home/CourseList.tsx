import CourseCard, { CourseCardProps } from './CourseCard';

const courses: CourseCardProps[] = [
  {
    title: 'Lập Trình JavaScript Nâng Cao',
    description: 'Cho người mới bắt đầu',
    price: 'Miễn phí',
    oldPrice: '2.500.000đ',
    time: '40h50p',
    students: 590,
    author: 'Sơn Đặng',
    color: 'blue',
    isNew: true,
    slug: 'javascript-nang-cao',
  },
  {
    title: 'ReactJS Cơ Bản',
    description: 'Cho Frontend Developer',
    price: 'Miễn phí',
    oldPrice: '3.299.000đ',
    time: '30h11p',
    students: 241,
    author: 'Sơn Đặng',
    color: 'yellow',
    slug: 'reactjs-co-ban',
  },
  {
    title: 'Node.js & Express',
    description: 'Cho Backend Developer',
    price: '299.000đ',
    oldPrice: '400.000đ',
    time: '25h18p',
    students: 127,
    author: 'Sơn Đặng',
    color: 'pink',
    slug: 'nodejs-express',
  },
];

const CourseList = () => {
  return (
    <section className="py-8 px-6">
      <h3 className="text-2xl font-bold mb-6">
        Khóa học Pro <span className="bg-orange-500 text-white text-sm font-semibold rounded-md px-2 py-1 ml-2">MỚI</span>
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course, idx) => (
          <CourseCard key={idx} {...course} />
        ))}
      </div>
    </section>
  );
};

export default CourseList;
