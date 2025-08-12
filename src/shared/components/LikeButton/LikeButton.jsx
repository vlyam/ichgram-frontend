import styles from './LikeButton.module.css';

const LikeButton = ({ small = false, liked = false, onClick}) => {
  const classNames = [styles['like-button']];

  if (small) classNames.push(styles['like-button--small']);
  if (liked) classNames.push(styles['like-button--liked']);

  return (
    <button className={classNames.join(' ')} onClick={onClick} aria-pressed={liked}></button>
  );
};

export default LikeButton;