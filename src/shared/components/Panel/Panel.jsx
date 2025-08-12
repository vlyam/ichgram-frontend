import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import styles from './Panel.module.css';

const Panel = ({ children }) => {
    const navigate = useNavigate();
    const panelRef = useRef(null);
    const [animate, setAnimate] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    const handleBackgroundClick = (e) => {
        if (e.target === e.currentTarget) {
            // запускаем анимацию закрытия
            setIsClosing(true);

            // ждём 300 мс
            setTimeout(() => {
                navigate(-1);
            }, 300);
        }
    };

    // Анимация открытия
    useEffect(() => {
        requestAnimationFrame(() => {
            setAnimate(true);
        });
    }, []);

    // Автоматический пересчет высоты панели
    useEffect(() => {
        const updatePanelHeight = () => {
            const panel = panelRef.current;
            const main = document.querySelector('main');

            if (!panel || !main) return;

            const scrollY = window.scrollY || window.pageYOffset;
            const viewportHeight = window.innerHeight;
            const mainBottom = main.offsetTop + main.offsetHeight;
            const visibleBottom = Math.min(scrollY + viewportHeight, mainBottom);
            const newHeight = visibleBottom - scrollY;

            panel.style.height = `${newHeight}px`;
        };

        updatePanelHeight();
        window.addEventListener('load', updatePanelHeight);
        window.addEventListener('resize', updatePanelHeight);
        window.addEventListener('scroll', updatePanelHeight);

        return () => {
            window.removeEventListener('load', updatePanelHeight);
            window.removeEventListener('resize', updatePanelHeight);
            window.removeEventListener('scroll', updatePanelHeight);
        };
    }, []);;

    // CSS-классы для панели
    const contentClass = `
    ${styles['panel__content']}
    ${animate && !isClosing ? styles['panel__content--animate'] : ''}
    ${isClosing ? styles['panel__content--closing'] : ''}
  `;

    return (
        <div className={styles['panel']} onClick={handleBackgroundClick}>
            <div ref={panelRef} className={contentClass}>
                {children}
            </div>
        </div>
    );
};

export default Panel;