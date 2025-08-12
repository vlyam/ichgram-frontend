import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import defaultAvatarImage from "../../../assets/default_avatar_image.png";
import FollowButton from "../../../shared/components/FollowButton/FollowButton";
import LikeButton from "../../../shared/components/LikeButton/LikeButton";
import CommentButton from "../../../shared/components/CommentButton/CommentButton";

import { toggleLike } from "../../../redux/like/like-thunks";

import styles from "./Article.module.css";

// Компонент отдельного поста
const Article = ({ post, authUserId, setModalPostId }) => {
  const dispatch = useDispatch();
  const isOwnPost = post.author._id === authUserId;

  const { isLiked = false, likesCount = 0 } = useSelector(
    (state) => state.like.byPostId[post._id] || {}
  );

  const handleLikeToggle = () => {
    dispatch(toggleLike(post._id));
  };

  return (
    <div className={styles["articles__element"]}>
      <div className={styles.article}>
        <div className={styles.article__head}>
          <div className={`${styles.article__avatar} ${isOwnPost ? styles["article__avatar--me"] : ""}`}>
            <div className={styles["article__avatar-content"]}>
              <img
                className={styles["article__avatar-image"]}
                src={post.author.profile_image || defaultAvatarImage}
                alt=""
              />
            </div>
          </div>
          <Link to={`/profile/${post.author._id}`} className={styles.article__title}>
            {post.author.username}
          </Link>
          <div className={styles.article__time}>{timeAgo(post.createdAt)}</div>
          <div className={styles.article__follow}>
            {!isOwnPost && (
              <FollowButton
                targetUserId={post.author._id}
                currentUserId={authUserId}
                linkButton
              />
            )}
          </div>
        </div>

        <div className={styles.article__body} onClick={() => setModalPostId(post._id)}>
          <img className={styles.article__image} src={post.image} alt="" />
        </div>

        {post.description && (
          <div className={styles.article__description}>{post.description}</div>
        )}

        <div className={styles.article__information}>
          <div className={styles.article__buttons}>
            <LikeButton liked={isLiked} onClick={handleLikeToggle} />
            <CommentButton
              onClick={() => setModalPostId(post._id)}
            />
          </div>
          <div className={styles.article__likes}>
            {likesCount.toLocaleString()} likes
          </div>

          <div className={styles.article__comments}>
            <div className={styles["article__comments-list"]}>
              {Array.isArray(post.comments) && post.comments.slice(-2).map((comment) => (
                <div key={comment._id} className={styles.article__comment}>
                  <span className={styles["article__comment-autor"]}>
                    {comment.author?.username}
                  </span>
                  <span className={styles["article__comment-text"]}>
                    {comment.text}
                  </span>
                </div>
              ))}
            </div>
            {Array.isArray(post.comments) && post.comments.length > 2 && (
              <div
                className={styles["article__view-all-comments-btn"]}
                onClick={() => setModalPostId(post._id)}
              >
                View all comments ({post.comments.length})
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Функция для отображения времени в формате "X time ago"
function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "week", seconds: 604800 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
    { label: "second", seconds: 1 },
  ];
  for (let i = 0; i < intervals.length; i++) {
    const interval = Math.floor(seconds / intervals[i].seconds);
    if (interval >= 1) {
      return `${interval} ${intervals[i].label}${interval !== 1 ? "s" : ""} ago`;
    }
  }
  return "just now";
}

export default Article;