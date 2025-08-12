import { Link } from 'react-router-dom';
import styles from './Button.module.css';

const Button = ({
    children,
    to,
    onClick,
    type = 'button',
    fullWidth,
    accentColor,
    linkButton,
    loading,
    ...props
}) => {
    const classNames = [styles.button];

    if (fullWidth) {
        classNames.push(styles['button--full-width']);
    }

    if (accentColor) {
        classNames.push(styles['button--accent-color']);
    }

    if (linkButton) {
        classNames.push(styles['button--link-button']);
    }

    if (to) {
        return (
            <Link to={to} className={classNames.join(' ')} {...props}>
                {children}
            </Link>
        );
    }

    if (loading) {
        classNames.push(styles['button--loading']);
    }

    return (
        <button type={type} onClick={onClick} className={classNames.join(' ')} {...props}>
            {children}
        </button>
    );
};

export default Button;