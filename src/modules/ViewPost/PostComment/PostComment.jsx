import styles from "./PostComment.module.css";
import { useEffect, useMemo } from "react";
import defaultAvatarImage from "../../../assets/default_avatar_image.png";
import LikeButton from "../../../shared/components/LikeButton/LikeButton";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchCommentLikeStatus, toggleCommentLike } from "../../../redux/comment-like/comment-like-thunks";

const PostComment = ({ comment, isAuthorOfPost }) => {
    const { author, text, createdAt, _id, isDescription } = comment;
    const dispatch = useDispatch();

    // Получаем лайки из Redux
    const { liked, likesCount } = useSelector(
        (state) => state.commentLike.byCommentId[_id] || {}
    );

    // Загружаем лайки при монтировании (если это не описание)
    useEffect(() => {
        if (!isDescription) {
            dispatch(fetchCommentLikeStatus(_id));
        }
    }, [_id, isDescription, dispatch]);

    const handleLikeToggle = () => {
        if (!author?._id) return;
        dispatch(toggleCommentLike(_id));
    };

    // CSS-классы для комментария
    const classNames = [styles["post-comment"]];
    if (isAuthorOfPost && comment.author?._id === isAuthorOfPost) {
        classNames.push(styles["post-comment--autor"]);
    }

    // Время публикации
    const timeAgo = useMemo(() => {
        const now = new Date();
        const created = new Date(createdAt);
        const diffMs = now - created;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);
        return diffHours < 24 ? `${diffHours}h` : `${diffDays}d`;
    }, [createdAt]);

    return (
        <div className={styles["view-post__comments-element"]}>
            <div className={classNames.join(" ")}>
                <div className={styles["post-comment__avatar"]}>
                    <div className={styles["post-comment__avatar-content"]}>
                        <img
                            className={styles["post-comment__avatar-image"]}
                            src={author?.profile_image || defaultAvatarImage}
                            alt=""
                        />
                    </div>
                </div>
                <div className={styles["post-comment__content"]}>
                    <div className={styles["post-comment__text"]}>
                        <p>
                            <Link
                                className={styles["post-comment__autor-title"]}
                                to={`/profile/${author?._id}`}
                            >
                                {author?.username || "Deleted user"}
                            </Link>{" "}
                            {text}
                        </p>
                    </div>

                    <div className={styles["post-comment__information"]}>
                        <div className={styles["post-comment__time"]}>{timeAgo}</div>
                        {!isDescription && (
                            <div className={styles["post-comment__likes"]}>
                                Likes: {likesCount || 0}
                            </div>
                        )}
                    </div>
                </div>
                {!isDescription && (
                    <div className={styles["post-comment__buttons"]}>
                        <LikeButton small liked={liked} onClick={handleLikeToggle} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default PostComment;