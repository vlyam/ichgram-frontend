import styles from './NotFound.module.css';
import notFoundImage from '../../assets/app.png';

const NotFound = () => {
    return (
        <div className={styles['not-found']}>
            <div className={styles['not-found__illustration']}>
                <img
                    className={styles['not-found__illustration-image']}
                    src={notFoundImage}
                    alt="Page Not Found"
                />
            </div>
            <div className={styles['not-found__text']}>
                <div className={styles['not-found__title']}>
                    Oops! Page Not Found (404 Error)
                </div>
                <div className={styles['not-found__subtitle']}>
                    We're sorry, but the page you're looking for doesn't seem to exist.
                    If you typed the URL manually, please double-check the spelling. If
                    you clicked on a link, it may be outdated or broken.
                </div>
            </div>
        </div>
    );
};

export default NotFound;
