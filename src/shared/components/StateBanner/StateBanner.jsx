import styles from "./StateBanner.module.css";

const StateBanner = ({ emptyState = false, title, subtitle }) => {
    const classNames = [styles["state-banner"]];

    // Модификатор для пустого состояния
    if (emptyState) {
        classNames.push(styles["state-banner--empty-state"]);
    }

    return (
        <div className={classNames.join(' ')}>
            <div className={styles["state-banner__icon"]}></div>
            <div className={styles["state-banner__title"]}>{title}</div>
            <div className={styles["state-banner__subtitle"]}>{subtitle}</div>
        </div>
    );
};

export default StateBanner;
