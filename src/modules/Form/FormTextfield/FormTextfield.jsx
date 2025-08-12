import FormErrorText from '../FormErrorText/FormErrorText';
import styles from './FormTextfield.module.css';

const FormTextfield = ({
  name,
  type,
  placeholder,
  required,
  pattern,
  register,
  error,
  disabled,
  label,
  profileTheme = false,
  link = false,
}) => {
  const isTextarea = type === 'textarea';

  const fieldClassNames = [
    styles['form__textfield'],
    profileTheme ? styles['form__textfield--profile-theme'] : '',
    link ? styles['form__textfield--link'] : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={fieldClassNames}>
      {label && <label htmlFor={name}>{label}</label>}

      {isTextarea ? (
        <textarea
          id={name}
          placeholder={placeholder}
          disabled={disabled}
          rows={5}
          {...register(name, {
            required: required && 'Required field',
            pattern,
          })}
        />
      ) : (
        <input
          id={name}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          {...register(name, {
            required: required && 'Required field',
            pattern,
          })}
        />
      )}

      {error && <FormErrorText>{error.message}</FormErrorText>}
    </div>
  );
};

export default FormTextfield;