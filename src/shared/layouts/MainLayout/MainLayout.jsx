import styles from "./MainLayout.module.css";

const MainLayout = ({ children }) => {
    return <main className={styles.main}>{children}</main>;
};

export default MainLayout;
