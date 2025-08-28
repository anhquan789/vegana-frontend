import Image from 'next/image';
import styles from './VideoPlayer.module.css';

const VideoPlayer = () => {
  return (
    <div className={styles.videoContainer}>
      <div className={styles.videoPlaceholder}>
        {/* Replace with actual video player component */}
        <Image src="https://i.ytimg.com/vi/M62l1G_sMYU/maxresdefault.jpg" alt="IIFE la gi?" width={1920} height={1080} layout="responsive" />
        <div className={styles.playButton}></div>
      </div>
    </div>
  );
};

export default VideoPlayer;
