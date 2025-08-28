import CourseCard, { CourseCardProps } from './CourseCard';
import styles from './CourseList.module.css';

const courses: CourseCardProps[] = [
  {
    title: 'HTML, CSS Pro',
    description: 'Cho người mới bắt đầu',
    price: '1.299.000đ',
    oldPrice: '2.500.000đ',
    time: '116h50p',
    students: 590,
    author: 'Sơn Đặng',
    color: 'blue',
    isNew: true,
  },
  {
    title: 'JavaScript Pro',
    description: 'Cho người mới bắt đầu',
    price: '1.399.000đ',
    oldPrice: '3.299.000đ',
    time: '47h11p',
    students: 241,
    author: 'Sơn Đặng',
    color: 'yellow',
  },
  {
    title: 'Ngôn ngữ Sass',
    description: 'Cho Frontend Developer',
    price: '299.000đ',
    oldPrice: '400.000đ',
    time: '6h18p',
    students: 27,
    author: 'Sơn Đặng',
    color: 'pink',
  },
];

const CourseList = () => {
  return (
    <section className={styles['course-list']}>
      <h3>Khóa học Pro <span className={styles['badge-new']}>MỚI</span></h3>
      <div className={styles['course-list-grid']}>
        {courses.map((course, idx) => (
          <CourseCard key={idx} {...course} />
        ))}
      </div>
    </section>
  );
};

export default CourseList;
