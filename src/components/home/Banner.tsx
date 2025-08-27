import styles from './Banner.module.css';

const Banner = () => {
  return (
    <section className={styles.banner}>
      <div className={styles['banner-content']}>
        <h2>Học HTML CSS cho người mới <span role="img" aria-label="crown">👑</span></h2>
        <p>Thực hành dự án với Figma, hàng trăm bài tập, hướng dẫn 100% bởi Sơn Đặng, tặng kèm Flashcards, v.v.</p>
        <button className={styles['btn-primary']}>HỌC THỬ MIỄN PHÍ</button>
      </div>
      <div className={styles['banner-image']}>
        {/* Place for banner image/slider */}
      </div>
    </section>
  );
};

export default Banner;
