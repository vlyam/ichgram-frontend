import styles from './FormErrorText.module.css';

const FormErrorText = ({ children }) => (
  <p className={styles['form__error-text']}>
    {children}
  </p>
);

export default FormErrorText;