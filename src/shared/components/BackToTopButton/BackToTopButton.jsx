// КНОПКА ПРОКРУТКИ НАВЕРХ: поддерживает CSS-позиционирование через пропсы
import { useEffect, useState } from 'react';
import styles from './BackToTopButton.module.css';

const BackToTopButton = ({ position }) => {
    const [visible, setVisible] = useState(false); // в useState сохраняем состояние, показывать ли кнопку

    useEffect(() => {
        const handleScroll = () => { // проверка насколько прокрутили
            setVisible(window.scrollY > 300); // если больше 300px - показываем
        };

        window.addEventListener('scroll', handleScroll); // подписка на событие прокрутки

        return () => window.removeEventListener('scroll', handleScroll); // отписка при размонтировании
    }, []); // массив зависимостей пустой, запускается только при первом рендере

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' }); // плавно крутим вверх
    };

    if (!visible) return null; // не рендерим если visible false

    // вычисляем модификатор позиции
    const getPositionModifier = () => {
        switch (position) {
            case 'BottomRight':
                return styles['back-to-top--bottom-right'];
            case 'BottomLeft':
                return styles['back-to-top--bottom-left'];
            case 'TopRight':
                return styles['back-to-top--top-right'];
            case 'TopLeft':
                return styles['back-to-top--top-left'];
            default:
                return '';
        }
    };

    const classNames = `${styles['back-to-top']} ${getPositionModifier()}`;

    return (
        <button className={classNames} onClick={scrollToTop}></button>
    );
};

export default BackToTopButton;