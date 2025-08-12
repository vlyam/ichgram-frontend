import { useEffect } from "react";
import { createPortal } from "react-dom";
import useBodyClass from "../../hooks/useBodyClass";
import styles from "./Modal.module.css";

const modalRoot = document.querySelector("#modal-root");

const Modal = ({ close, children }) => {
  const closeModal = (event) => {
    const { target, currentTarget } = event;
    if (target === currentTarget) {
      close();
    }
  };

  useEffect(() => {
    const handleEscape = ({ code }) => {
      if (code === "Escape") {
        close();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [close]);

  useBodyClass("body__no-scroll", true);

  return createPortal(
    <div onClick={closeModal} className={styles['modal']}>
      <div className={styles['modal__content']}>
        <div onClick={close} className={styles['modal__close']}></div>
        {children}
      </div>
    </div>,
    modalRoot
  );
};

export default Modal;