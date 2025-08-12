import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import axios from "../../shared/api/axiosInstance";
import StateBanner from "../../shared/components/StateBanner/StateBanner";
import Loader from "../../shared/components/Loader/Loader";
import defaultAvatarImage from "../../assets/default_avatar_image.png";
import styles from "./Notifications.module.css";
import {
    setNotifications,
    clearNotifications,
    markAllRead,
    selectNotifications,
} from "../../redux/notifications/notifications-slice";

function timeAgo(dateString) {
    if (!dateString) return "";
    const diffMs = Date.now() - new Date(dateString).getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "just now";
    if (diffMin < 60) return `${diffMin} min ago`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH} hour${diffH > 1 ? "s" : ""} ago`;
    const diffD = Math.floor(diffH / 24);
    return `${diffD} day${diffD > 1 ? "s" : ""} ago`;
}

const Notifications = () => {
    const dispatch = useDispatch();
    const notifications = useSelector(selectNotifications);
    const [loading, setLoading] = useState(true);

    // При загрузке модуля — загружаем уведомления и сбрасываем счетчик
    useEffect(() => {
        let timerId;

        async function fetchNotifications() {
            try {
                setLoading(true);
                const { data } = await axios.get("/api/notifications");

                const notificationsArray = Array.isArray(data) ? data : (data.notifications || []);
                dispatch(setNotifications(data));

                if (notificationsArray.some(n => !n.read)) {
                    timerId = setTimeout(async () => {
                        try {
                            await axios.put("/api/notifications/read-all");
                            dispatch(markAllRead());
                        } catch (err) {
                            console.warn("Failed to mark notifications read on server", err);
                        }
                    }, 5000);
                }
            } catch (e) {
                console.error("Failed to load notifications", e);
            } finally {
                setLoading(false);
            }
        }

        fetchNotifications();

        return () => {
            clearTimeout(timerId);
            dispatch(clearNotifications());
        };
    }, [dispatch]);


    if (loading) {
        return <div className={styles.notifications}><Loader /></div>;
    }

    return (
        <div className={styles.notifications}>
            <div className={styles.notifications__title}>Notifications</div>
            <div className={styles.notifications__list}>
                {notifications.length === 0 ? (
                    <StateBanner emptyState title="No notifications" subtitle="You haven't had any events yet." />
                ) : (
                    notifications.map((n) => {
                        const user = n.user || {};
                        const post = n.post || null;

                        // Текст уведомления по типу
                        let text = "";
                        if (n.type === "follow") text = "started following.";
                        else if (n.type === "comment") text = "commented your photo.";
                        else if (n.type === "like") text = "liked your photo.";

                        return (
                            <div key={n._id} className={styles.notifications__element}>
                                <div
                                    className={[
                                        styles.notification,
                                        !n.read ? styles["notification--unread"] : ""
                                    ].filter(Boolean).join(" ")}
                                >
                                    <div className={styles.notification__avatar}>
                                        <img
                                            className={styles.notification__image}
                                            src={user.profile_image || defaultAvatarImage}
                                            alt={user.username || "User avatar"}
                                        />
                                    </div>
                                    <div className={styles.notification__text}>
                                        <Link
                                            className={styles.notification__user}
                                            to={`/profile/${user._id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {user.username}
                                        </Link>{" "}
                                        {text}{" "}
                                        <span className={styles.notification__time}>
                                            {timeAgo(n.createdAt)}
                                        </span>
                                    </div>

                                    {post && (
                                        <Link
                                            className={styles.notification__thumbnail}
                                            to={`/post/${post._id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <img
                                                className={styles.notification__image}
                                                src={post.image}
                                                alt="Post thumbnail"
                                            />
                                        </Link>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );


};

export default Notifications;