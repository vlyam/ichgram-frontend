import styles from "./PostComment.module.css";
import { useEffect, useState, useMemo } from "react";
import defaultAvatarImage from "../../../assets/default_avatar_image.png";
import LikeButton from "../../../shared/components/LikeButton/LikeButton";
import { Link } from "react-router-dom";
import axios from "../../../shared/api/axiosInstance";

const PostComment = ({ comment, isAuthorOfPost }) => {
    const { author, text, createdAt, _id, isDescription } = comment;
    const [likes, setLikes] = useState(0);
    const [liked, setLiked] = useState(false);
    useEffect(() => {
        if (isDescription) return;

        const fetchLikes = async () => {
            try {
                const [{ data: likeData }, { data: countData }] = await Promise.all([
                    axios.get(`/api/comment-likes/check?commentId=${_id}`),
                    axios.get(`/api/comment-likes/count?commentId=${_id}`)
                ]);
                setLiked(likeData.liked || false);
                setLikes(countData.count || 0);
            } catch (err) {
                console.error("Error getting comment likes:", err);
            }
        };

        fetchLikes();
    }, [_id, isDescription]);

    const handleLikeToggle = async () => {
        try {
            const { data } = await axios.post("/api/comment-likes", { commentId: _id });
            setLiked(data.liked);
            setLikes((prev) => prev + (data.liked ? 1 : -1));
        } catch (err) {
            console.error("Error getting comment likes:", err);
        }
    };

    // CSS-классы для комментария
    const classNames = [styles["post-comment"]];
    if (isAuthorOfPost && comment.author._id === isAuthorOfPost) {
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
                                {author?.username}
                            </Link>{" "}
                            {text}
                        </p>
                    </div>

                    <div className={styles["post-comment__information"]}>
                        <div className={styles["post-comment__time"]}>{timeAgo}</div>
                        {!isDescription && (
                            <div className={styles["post-comment__likes"]}>Likes: {likes}</div>
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