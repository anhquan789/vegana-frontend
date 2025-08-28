import React from 'react';
import styles from './CourseCard.module.css';

export interface CourseCardProps {
  title: string;
  description: string;
  price: string;
  oldPrice?: string;
  time: string;
  students: number;
  author: string;
  color: string;
  isNew?: boolean;
}

const CourseCard: React.FC<CourseCardProps> = ({ title, description, price, oldPrice, time, students, author, color, isNew }) => {
  return (
    <div className={`${styles['course-card']} ${styles[color] || ''}`}>
      <div className={styles['course-card-header']}>
        <span className={styles['course-card-title']}>
          {title} {isNew && <span className={styles['badge-new']}>MỚI</span>}
        </span>
      </div>
      <div className={styles['course-card-desc']}>{description}</div>
      <div className={styles['course-card-pricing']}>
        {oldPrice && <span className={styles['old-price']}>{oldPrice}</span>}
        <span className={styles['price']}>{price}</span>
      </div>
      <div className={styles['course-card-meta']}>
        <span>{author}</span>
        <span>{students} học viên</span>
        <span>{time}</span>
      </div>
    </div>
  );
};

export default CourseCard;
