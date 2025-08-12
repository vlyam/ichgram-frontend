import { NavLink, useLocation } from "react-router-dom";
import styles from "./Footer.module.css";

const Footer = () => {
  const location = useLocation();

  const footerItems = [
    { to: "/", text: "Home" },
    { to: "/search", text: "Search" },
    { to: "/explore", text: "Explore" },
    { to: "/messages", text: "Messages" },
    { to: "/notifications", text: "Notifications" },
    { to: "/create", text: "Create" },
    { to: "/profile", text: "Profile" },
  ];

  const isProfileActive = (path) => {
    return path === "/profile" || path.startsWith("/profile/edit");
  };

  return (
    <footer className={styles["footer"]}>
      <div className={styles["footer__container"]}>
        <ul className={styles["footer__menu"]}>
          {footerItems.map(({ to, text }) => (
            <li key={text} className={styles["footer__menu-item"]}>
              <NavLink
                className={({ isActive }) => {
                  if (text === "Profile") {
                    const active = isProfileActive(location.pathname);
                    return `${styles["footer__menu-link"]} ${active ? styles["active"] : ""
                      }`;
                  }
                  return `${styles["footer__menu-link"]} ${isActive ? styles["active"] : ""
                    }`;
                }}
                to={to}
              >
                {text}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className={styles["footer__copyright"]}>
          © {new Date().getFullYear()} ICHgram
        </div>
      </div>
    </footer>
  );
};

export default Footer;