import { useForm } from 'react-hook-form';
import { useState } from 'react';
import FormTextfield from './FormTextfield/FormTextfield';
import FormButton from './FormButton/FormButton';
import FormNotification from './FormNotification/FormNotification';
import styles from './Form.module.css';

const Form = ({
    fields,
    buttonText,
    successText,
    errorText,
    onSuccess,
    dataToSend,
    profileTheme = false,
    buttonAutoWidth = false,
    defaultValues = {},
    disableFieldErrors = false,
    disableFieldsAfterSubmit = true,
}) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setError,
    } = useForm({ defaultValues });

    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [success, setSuccess] = useState(false);
    const [serverError, setServerError] = useState('');

    const isDisabled = submitting || (disableFieldsAfterSubmit && submitted && success);

    const onSubmit = async (data) => {
        setSubmitting(true);
        setSubmitted(false);
        setSuccess(false);
        setServerError('');

        try {
            const readyData = dataToSend ? dataToSend(data) : data;

            if (onSuccess) {
                await onSuccess(readyData, { setError });
            }

            setSuccess(true);
            setSubmitted(true);
            if (disableFieldsAfterSubmit) {
                reset();
            }
        } catch (error) {
            console.error('Form submission error:', error);

            if (typeof error === "object" && error !== null) {
                // Ошибки конкретных полей
                if (Array.isArray(error.fieldErrors)) {
                    error.fieldErrors.forEach(err => {
                        // ошибки для полей сохраняем, но показывать будем в зависимости от disableFieldErrors
                        setError(err.field, { type: "server", message: err.message });
                    });
                }

                // Общее сообщение
                setServerError(
                    error.message
                        ? "Please correct the errors and try again."
                        : errorText || 'Something went wrong. Please try again.'
                );
            } else {
                setServerError(errorText || 'Something went wrong. Please try again.');
            }

            setSuccess(false);
            setSubmitted(true);

        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form
            className={`${styles['form']} ${profileTheme ? styles['form--profile-theme'] : ''}`}
            onSubmit={handleSubmit(onSubmit)}
        >
            <div className={styles['form__textfields']}>
                {fields.map((field) => (
                    <FormTextfield
                        key={field.name}
                        {...field}
                        register={register}
                        error={disableFieldErrors ? undefined : errors[field.name]}
                        disabled={isDisabled}
                        profileTheme={profileTheme}
                    />
                ))}
            </div>

            <FormButton
                disabled={isDisabled}
                loading={submitting}
                submitted={disableFieldsAfterSubmit && submitted && success}
                autoWidth={buttonAutoWidth}
            >
                {disableFieldsAfterSubmit && submitted && success ? 'Request submitted' : buttonText}
            </FormButton>

            {submitted && !success && serverError && (
                <FormNotification type="error">
                    {serverError}
                </FormNotification>
            )}

            {submitted && success && (
                <FormNotification type="success">
                    {successText || 'Request submitted'}
                </FormNotification>
            )}
        </form>
    );
};

export default Form;