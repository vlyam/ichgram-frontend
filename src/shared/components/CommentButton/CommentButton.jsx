import styles from './CommentButton.module.css';

const CommentButton = ({ small = false, onClick }) => {
  const classNames = [styles['comment-button']];
  if (small) classNames.push(styles['comment-button--small']);

  return (
    <button className={classNames.join(' ')} onClick={onClick} aria-label="Comment"></button>
  );
};

export default CommentButton;