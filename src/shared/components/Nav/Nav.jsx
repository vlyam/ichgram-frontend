import { useEffect } from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import { useUI } from "../../../shared/context/UIContext";
import { useSelector, useDispatch } from "react-redux";
import { logout as logoutAction } from "../../../redux/auth/auth-slice";
import { selectNotificationsUnreadCount, setNotifications } from "../../../redux/notifications/notifications-slice";
import { selectMessagesUnreadCount, setConversations } from '../../../redux/messages/messages-slice';
import axios from "../../api/axiosInstance";
import IchgramIcon from "../../icons/IchgramIcon/IchgramIcon";
import IchgramIconMob from "../../icons/IchgramIconMob/IchgramIconMob";
import styles from "./Nav.module.css";
import defaultAvatarImage from "../../../assets/default_avatar_image.png";

const Nav = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();

    const { setCreateModalOpen, setActiveMenu, activeMenu } = useUI();
    const user = useSelector((state) => state.auth.user);
    const messagesUnreadCount = useSelector(selectMessagesUnreadCount);
    const notificationsUnreadCount = useSelector(selectNotificationsUnreadCount);

    useEffect(() => {
        async function fetchData() {
            try {
                const [notificationsRes, conversationsRes] = await Promise.all([
                    axios.get("/api/notifications"),
                    axios.get("/api/messages/conversations")
                ]);
                dispatch(setNotifications(notificationsRes.data));
                dispatch(setConversations(conversationsRes.data));
            } catch (err) {
                console.error("Failed to load nav data", err);
            }
        }

        fetchData();
    }, [dispatch, location.pathname]);


    const handleClick = (item, e) => {
        const name = item.text;

        if (name === "Search" || name === "Notifications") {
            e.preventDefault();
            setActiveMenu(name);

            if (
                location.pathname.startsWith("/search") ||
                location.pathname.startsWith("/notifications")
            ) {
                const bg = location.state?.background || { pathname: "/" };
                navigate(bg.pathname || "/", { replace: true });
                setTimeout(() => {
                    navigate(item.to, { state: { background: bg } });
                });
            } else {
                navigate(item.to, { state: { background: location } });
            }

            return;
        }

        if (name === "Create") {
            e.preventDefault();
            setActiveMenu(name);
            setCreateModalOpen(true);
            return;
        }

        setActiveMenu(name);
    };

    const menuItems = [
        { to: "/", iconClass: "menu__item-icon--home", text: "Home" },
        { to: "/search", iconClass: "menu__item-icon--search", text: "Search" },
        { to: "/explore", iconClass: "menu__item-icon--explore", text: "Explore" },
        { to: "/messages", iconClass: "menu__item-icon--messages", text: "Messages" },

        { to: "/notifications", iconClass: "menu__item-icon--notifications", text: "Notifications" },
        { to: "/create", iconClass: "menu__item-icon--create", text: "Create" },
        { to: "/profile", text: "Profile" }, // всегда ведет на /profile (свой)
    ];

    const handleLogout = async () => {
        try {
            await axios.post("/api/auth/logout");
            localStorage.removeItem("token");
            dispatch(logoutAction());
            navigate("/login", { replace: true });
        } catch (err) {
            console.error("Logout error:", err);
            localStorage.removeItem("token");
            dispatch(logoutAction());
            navigate("/login", { replace: true });
        }
    };

    const isProfileActive = (path) => {
        return path === "/profile" || path.startsWith("/profile/edit");
    };

    return (
        <nav className={styles["sidebar"]}>
            <div className={styles["sidebar__container"]}>
                <div className={styles["sidebar__logo-container"]}>
                    <Link
                        to="/"
                        className={styles["sidebar__logo"]}
                        onClick={() => setActiveMenu("Home")}
                    >
                        <IchgramIcon />
                        <IchgramIconMob />
                    </Link>
                </div>

                <ul className={styles["menu"]}>
                    {menuItems.map((item) => {
                        // Логика для Profile
                        if (item.text === "Profile") {
                            const active = isProfileActive(location.pathname);
                            return (
                                <li key={item.text} className={styles["menu__item"]}>
                                    <NavLink
                                        to={item.to}
                                        onClick={(e) => handleClick(item, e)}
                                        className={`${styles["menu__item-link"]} ${active ? styles["active"] : ""}`}
                                    >
                                        <div className={styles["menu__item-avatar"]}>
                                            <img
                                                className={styles["menu__item-avatar-image"]}
                                                src={user?.profile_image || defaultAvatarImage}
                                                alt={item.text}
                                            />
                                        </div>
                                        <div className={styles["menu__item-text"]}>{item.text}</div>
                                    </NavLink>
                                </li>
                            );
                        }

                        // Логика для Messages
                        if (item.text === "Messages") {
                            const hasUnread = messagesUnreadCount > 0;
                            const unreadText = hasUnread ? ` (${messagesUnreadCount})` : "";
                            const classNames = [styles["menu__item-link"]];
                            if (hasUnread) classNames.push(styles["menu__item-link--has-unread"]);

                            return (
                                <li key={item.text} className={styles["menu__item"]}>
                                    <NavLink
                                        to={item.to}
                                        onClick={(e) => handleClick(item, e)}
                                        className={({ isActive }) =>
                                            `${classNames.join(" ")} ${isActive ? styles["active"] : ""}`
                                        }
                                    >
                                        <div className={`${styles["menu__item-icon"]} ${styles[item.iconClass]}`} />
                                        <div className={styles["menu__item-text"]}>{item.text + unreadText}</div>
                                    </NavLink>
                                </li>
                            );
                        }

                        // Логика для Notifications
                        if (item.text === "Notifications") {
                            const hasUnread = notificationsUnreadCount > 0;
                            const unreadText = hasUnread ? ` (${notificationsUnreadCount})` : "";
                            const classNames = [styles["menu__item-link"]];
                            if (hasUnread) classNames.push(styles["menu__item-link--has-unread"]);

                            return (
                                <li key={item.text} className={styles["menu__item"]}>
                                    <NavLink
                                        to={item.to}
                                        onClick={(e) => handleClick(item, e)}
                                        className={({ isActive }) =>
                                            `${classNames.join(" ")} ${isActive ? styles["active"] : ""}`
                                        }
                                    >
                                        <div className={`${styles["menu__item-icon"]} ${styles[item.iconClass]}`} />
                                        <div className={styles["menu__item-text"]}>{item.text + unreadText}</div>
                                    </NavLink>
                                </li>
                            );
                        }

                        // Для всех остальных пунктов меню (Search, Create, Explore, Home)
                        const panelItems = ["Search", "Notifications", "Create"];
                        const isPanelActive = panelItems.includes(activeMenu) && activeMenu === item.text;

                        return (
                            <li key={item.text} className={styles["menu__item"]}>
                                <NavLink
                                    to={item.to}
                                    onClick={(e) => handleClick(item, e)}
                                    className={({ isActive }) =>
                                        `${styles["menu__item-link"]} ${isPanelActive || isActive ? styles["active"] : ""}`
                                    }
                                >
                                    <div className={`${styles["menu__item-icon"]} ${styles[item.iconClass]}`} />
                                    <div className={styles["menu__item-text"]}>{item.text}</div>
                                </NavLink>
                            </li>
                        );
                    })}

                    <li className={styles["menu__item"]}>
                        <button
                            type="button"
                            className={styles["menu__item-link"]}
                            onClick={handleLogout}
                        >
                            <div className={`${styles["menu__item-icon"]} ${styles["menu__item-icon--logout"]}`} />
                            <div className={styles["menu__item-text"]}>Logout</div>
                        </button>
                    </li>
                </ul>

            </div>
        </nav>
    );
};

export default Nav;