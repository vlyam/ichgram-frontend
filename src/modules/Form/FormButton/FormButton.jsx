import styles from './FormButton.module.css';

const FormButton = ({ children, disabled, loading, submitted, autoWidth }) => (
  <button
    type="submit"
    className={`${styles['form__button']} ${
      autoWidth ? styles['form__button--width-auto'] : ''
    } ${loading ? styles['form__button--loading'] : ''} ${
      submitted ? styles['form__button--submitted'] : ''
    }`}
    disabled={disabled}
  >
    {children}
  </button>
);

export default FormButton;
