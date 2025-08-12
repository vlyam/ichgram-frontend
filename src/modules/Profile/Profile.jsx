import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectLastCreatedPost, selectLastUpdatedPost } from '../../redux/post/post-selectors';
import { clearLastCreatedPost, clearLastUpdatedPost } from '../../redux/post/post-slice';
import { useEffect, useState } from "react";
import { useUI } from "../../shared/context/UIContext";
import axios from "../../shared/api/axiosInstance";

import defaultAvatarImage from "../../assets/default_avatar_image.png";
import Button from "../../shared/components/Button/Button";
import StateBanner from "../../shared/components/StateBanner/StateBanner";
import FollowButton from "../../shared/components/FollowButton/FollowButton";
import FollowListModal from "../../shared/components/FollowListModal/FollowListModal";
import { fetchFollowers, fetchFollowing } from '../../redux/follow/follow-thunks';
import Loader from "../../shared/components/Loader/Loader";
import styles from "./Profile.module.css";

const Profile = () => {
    const { setModalPostId } = useUI();
    const { id } = useParams();
    const navigate = useNavigate();
    const authUser = useSelector((state) => state.auth.user);
    const isOwnProfile = !id;

    useEffect(() => {
        if (id && authUser?.id && id === authUser.id) {
            navigate("/profile", { replace: true });
        }
    }, [id, authUser, navigate]);

    const userId = isOwnProfile ? authUser?.id : id;

    const [userData, setUserData] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const lastCreatedPost = useSelector(selectLastCreatedPost);
    const lastUpdatedPost = useSelector(selectLastUpdatedPost);
    const followers = useSelector((state) => state.follow.followersByUserId?.[userId]?.length || 0);
    const following = useSelector((state) => state.follow.followingByUserId?.[userId]?.length || 0);
    const dispatch = useDispatch()

    const [showFollowersModal, setShowFollowersModal] = useState(false);
    const [showFollowingModal, setShowFollowingModal] = useState(false);

    const fetchUserProfile = async () => {
        if (!userId) return;

        setLoadingUser(true);
        try {
            let data;
            if (isOwnProfile) {
                const response = await axios.get("/api/users/profile");
                data = response.data;
            } else {
                const response = await axios.get(`/api/users/${userId}`);
                data = response.data;
            }

            setUserData(data);
        } catch (error) {
            console.error("Failed to load user profile", error);
            setUserData(null);
        } finally {
            setLoadingUser(false);
        }
    };

    useEffect(() => {
        fetchUserProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId, isOwnProfile]);

    useEffect(() => {
        if (userId) {
            dispatch(fetchFollowers(userId));
            dispatch(fetchFollowing(userId));
        }
    }, [dispatch, userId]);

    useEffect(() => {
        if (!userId) return;

        const fetchPosts = async () => {
            setLoading(true);
            try {
                const url = isOwnProfile ? '/api/posts/me' : `/api/posts/user/${userId}`;
                const response = await axios.get(url);
                setPosts(response.data);
            } catch (error) {
                console.error("Failed to load user posts", error);
                setPosts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
        dispatch(clearLastCreatedPost());
        dispatch(clearLastUpdatedPost());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId, isOwnProfile, lastCreatedPost, lastUpdatedPost]);

    if (loadingUser) {
        return <Loader />;
    }

    if (!userData) {
        return (
            <div className={styles.profile}>
                <StateBanner
                    emptyState
                    title="User profile not found"
                    subtitle="The user address was entered incorrectly."
                />
            </div>
        );
    }

    const username = userData.username || "";
    const fullname = userData.fullname || "";
    const bio = userData.bio || "";
    const profileImage = userData.profile_image || defaultAvatarImage;
    const website = userData.website || "";
    const postsCount = posts.length;

    const hasReachedEnd = posts.length > 0;


    return (
        <>
            <div className={styles.profile}>
                <div className={styles["profile__content"]}>
                    <div className={styles["profile__header"]}>
                        <div className={styles["profile__avatar"]}>
                            <div className={styles["profile__avatar-content"]}>
                                <img
                                    className={styles["profile__avatar-image"]}
                                    src={profileImage}
                                    alt=""
                                />
                            </div>
                        </div>
                        <div className={styles["profile__information"]}>
                            <div className={styles["profile__head"]}>
                                <div className={styles["profile__title"]}>{username}</div>
                                {fullname && (
                                    <div className={styles["profile__fullname"]}>{fullname}</div>
                                )}
                                <div className={styles["profile__buttons"]}>
                                    {isOwnProfile ? (
                                        <Button to="/profile/edit">Edit profile</Button>
                                    ) : (
                                        <>
                                            <FollowButton targetUserId={userId} currentUserId={authUser?.id} />
                                            <Button
                                                onClick={async () => {
                                                    try {
                                                        const { data } = await axios.post("/api/messages/conversations", {
                                                            userId
                                                        });
                                                        window.location.href = `/messages?open=${data.conversationId}`;
                                                    } catch (err) {
                                                        console.error("Failed to start conversation", err);
                                                    }
                                                }}
                                            >
                                                Message
                                            </Button>

                                        </>
                                    )}
                                </div>
                            </div>

                            <div className={styles["profile__statistics"]}>
                                <div className={styles["profile__statistics-element"]}>
                                    <span className={styles["profile__statistics-value"]}>
                                        {postsCount.toLocaleString()}
                                    </span>{" "}
                                    posts
                                </div>

                                <div
                                    className={[
                                        styles["profile__statistics-element"],
                                        followers > 0 && styles["profile__statistics-element--link"]
                                    ].filter(Boolean).join(" ")}
                                    onClick={() => followers > 0 && setShowFollowersModal(true)}
                                >
                                    <span className={styles["profile__statistics-value"]}>
                                        {followers.toLocaleString()}
                                    </span>{" "}
                                    followers
                                </div>

                                <div
                                    className={[
                                        styles["profile__statistics-element"],
                                        following > 0 && styles["profile__statistics-element--link"]
                                    ].filter(Boolean).join(" ")}
                                    onClick={() => following > 0 && setShowFollowingModal(true)}
                                >
                                    <span className={styles["profile__statistics-value"]}>
                                        {following.toLocaleString()}
                                    </span>{" "}
                                    following
                                </div>
                            </div>


                            <div
                                className={styles["profile__description"]}
                                style={{ whiteSpace: "pre-wrap" }}
                            >
                                {bio}
                            </div>

                            {website && (
                                <div className={styles["profile__site"]}>
                                    <div className={styles["profile__link-icon"]}></div>
                                    <a
                                        className={styles["profile__link"]}
                                        href={website}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        {website}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={styles["profile__posts"]}>
                        <div className={styles["profile__posts-list"]}>
                            {loading ? (
                                <Loader />
                            ) : posts.length === 0 ? (
                                <StateBanner
                                    emptyState
                                    title="No posts yet"
                                    subtitle="This user hasn't published anything"
                                />
                            ) : (
                                <>
                                    {posts.map((post) => (
                                        <div
                                            key={post._id || post.id}
                                            className={styles["profile__posts-element"]}
                                        >
                                            <div
                                                className={styles["profile-post"]}
                                                onClick={() => setModalPostId(post._id || post.id)}
                                                style={{ cursor: "pointer" }}
                                            >
                                                <img
                                                    className={styles["profile__post-image"]}
                                                    src={post.image}
                                                    alt=""
                                                />
                                            </div>
                                        </div>
                                    ))}

                                    {hasReachedEnd && (
                                        <StateBanner
                                            title="You've seen all the updates"
                                            subtitle="You have viewed all new publications"
                                        />
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>

            </div>

            {showFollowersModal && (
                <FollowListModal
                    userId={userId}
                    type="followers"
                    onClose={() => setShowFollowersModal(false)}
                />
            )}
            {showFollowingModal && (
                <FollowListModal
                    userId={userId}
                    type="following"
                    onClose={() => setShowFollowingModal(false)}
                />
            )}

        </>
    );
};

export default Profile;