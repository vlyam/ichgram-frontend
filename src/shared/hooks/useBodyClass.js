import { useEffect } from 'react';

// функция для простановки тегу body необходимых классов (нужно для модалки чтобы блокировать скролл)
const useBodyClass = (className, active) => {
    useEffect(() => {
        if (active) {
            document.body.classList.add(className);
        } else {
            document.body.classList.remove(className);
        }

        return () => {
            document.body.classList.remove(className);
        };
    }, [className, active]);
};

export default useBodyClass;