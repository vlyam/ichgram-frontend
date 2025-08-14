import { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import styles from "./ViewPost.module.css";
import axios from "../../shared/api/axiosInstance";
import LikeButton from "../../shared/components/LikeButton/LikeButton";
import CommentButton from "../../shared/components/CommentButton/CommentButton";
import { selectUser } from "../../redux/auth/auth-selectors";
import PostComment from "./PostComment/PostComment";
import PostMenu from "./PostMenu/PostMenu";
import EditPost from "../EditPost/EditPost";
import Modal from "../../shared/components/Modal/Modal";
import Loader from "../../shared/components/Loader/Loader";
import FollowButton from "../../shared/components/FollowButton/FollowButton";
import StateBanner from "../../shared/components/StateBanner/StateBanner";
import defaultAvatarImage from "../../assets/default_avatar_image.png";
import { useUI } from "../../shared/context/UIContext";
import { fetchLikeStatus, toggleLike } from "../../redux/like/like-thunks";

const ViewPost = ({ postId: propPostId, onClose }) => {
    const { id: urlPostId } = useParams();
    const [showEditForm, setShowEditForm] = useState(false);
    const postId = propPostId || urlPostId;
    const [showPostMenu, setShowPostMenu] = useState(false);
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState("");
    const [comments, setComments] = useState([]);
    const user = useSelector(selectUser);
    const commentInputRef = useRef(null);
    const { focusOnCommentInput, setFocusOnCommentInput } = useUI();

    const dispatch = useDispatch();

    useEffect(() => {
        if (postId) {
            dispatch(fetchLikeStatus(postId));
        }
    }, [postId, dispatch]);

    const handleLikeToggle = () => {
        dispatch(toggleLike(postId));
    };

    // Загружаем пост и данные о лайках
    useEffect(() => {
        if (!postId) {
            setPost(null);
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                const [{ data: postData }, { data: fetchedComments }] = await Promise.all([
                    axios.get(`/api/posts/${postId}`),
                    axios.get(`/api/comments/${postId}`),
                ]);

                const fetchedPost = postData.post || postData;
                setPost(fetchedPost);
                const descriptionAsComment = {
                    _id: "post-description",
                    text: fetchedPost.description,
                    author: fetchedPost.author,
                    createdAt: fetchedPost.createdAt,
                    isDescription: true,
                };

                setComments([descriptionAsComment, ...(fetchedComments || [])]);
            } catch (err) {
                console.error("Error loading post:", err);
                setPost(null);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [postId]);

    useEffect(() => {
        if (focusOnCommentInput) {
            commentInputRef.current?.focus();
            setFocusOnCommentInput(false);
        }
    }, [focusOnCommentInput, setFocusOnCommentInput]);

    // Обработка лайка/дизлайка

    const { isLiked = false, likesCount = 0 } = useSelector(
        (state) => state.like.byPostId[postId] || {}
    );

    // Функция отправки комментария
    const handleSubmitComment = async () => {
        if (!commentText.trim()) return;

        try {
            const { data: newComment } = await axios.post("/api/comments", {
                postId,
                text: commentText.trim(),
            });

            setComments((prev) => [...prev, newComment]);
            setCommentText("");
        } catch (err) {
            console.error("Error sending comment:", err);
        }
    };

    if (loading) return <div className={styles["view-post"]}><div className={styles["view-post__content"]}><Loader /></div></div>;
    if (!post) return <div className={styles["view-post"]}><div className={styles["view-post__content"]}><StateBanner emptyState title="Post not found" subtitle="It may have been removed" /></div></div>;

    const isOwnPost = post.author._id === user?.id;

    return (
        <>
            <div className={styles["view-post"]}>
                <div className={styles["view-post__content"]}>
                    <div className={styles["view-post__image-container"]}>
                        <img
                            className={styles["view-post__image"]}
                            src={post.image}
                            alt=""
                        />
                    </div>
                    <div className={styles["view-post__information"]}>
                        <div className={styles["view-post__header"]}>
                            <div className={styles["view-post__autor"]}>
                                <div className={styles["view-post__autor-avatar"]}>
                                    <div className={styles["view-post__autor-avatar-content"]}>
                                        <img
                                            className={styles["view-post__autor-avatar-image"]}
                                            src={post?.author?.profile_image || defaultAvatarImage}
                                            alt=""
                                        />
                                    </div>
                                </div>
                                <Link
                                    to={`/profile/${post.author.id || post.author._id}`}
                                    target="_blank"
                                    className={styles["view-post__autor-title"]}
                                >
                                    {post.author.username}
                                </Link>
                                {
                                    !isOwnPost && (
                                        <div className={styles["view-post__autor-follow"]}>
                                            <FollowButton
                                                targetUserId={post.author._id || post.author.id}
                                                currentUserId={user?.id}
                                                linkButton
                                            />
                                        </div>
                                    )
                                }

                            </div>
                            {isOwnPost && (
                                <button
                                    className={styles["view-post__menu-btn"]}
                                    onClick={() => setShowPostMenu(true)}
                                ></button>
                            )}
                        </div>

                        <div className={styles["view-post__comments"]}>
                            <div className={styles["view-post__comments-list"]}>
                                {comments.map((comment) => (
                                    <PostComment
                                        key={comment._id}
                                        comment={comment}
                                        isAuthorOfPost={post.author._id || post.author.id}
                                        isDescription={comment.isDescription}
                                    />
                                ))}
                            </div>
                            <div className={styles["view-post__comments-actions"]}>
                                <div className={styles["view-post__comments-buttons"]}>
                                    <LikeButton liked={isLiked} onClick={handleLikeToggle} />
                                    <CommentButton onClick={() => commentInputRef.current?.focus()} />
                                </div>
                                <div className={styles["view-post__comments-likes"]}>
                                    {likesCount} likes
                                </div>
                                <div className={styles["view-post__comments-time"]}>1 day</div>
                            </div>
                            <div className={styles["view-post__comments-form"]}>
                                <input
                                    ref={commentInputRef}
                                    className={styles["view-post__comments-form-input"]}
                                    type="text"
                                    placeholder="Add comment"
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                />
                                <button className={styles["view-post__comments-form-smile"]}></button>
                                <button
                                    className={styles["view-post__comments-form-submit"]}
                                    onClick={handleSubmitComment}
                                    disabled={!commentText.trim()}
                                >
                                    Send
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showPostMenu && (
                <Modal close={() => setShowPostMenu(false)}>
                    <PostMenu
                        postId={post._id}
                        close={() => setShowPostMenu(false)}
                        onClosePostModal={onClose}
                        onEdit={() => {
                            setShowPostMenu(false);
                            setShowEditForm(true);
                        }}
                    />
                </Modal>
            )
            }
            {showEditForm && (
                <Modal close={() => setShowEditForm(false)}>
                    <EditPost
                        postId={post._id}
                        initialDescription={post.description}
                        initialImage={post.image}
                        onClose={() => {
                            setShowEditForm(false);
                            if (onClose) onClose();
                        }}
                    />
                </Modal>
            )}

        </>

    );
};

export default ViewPost;