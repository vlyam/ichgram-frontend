import { useState, useRef } from "react";
import styles from "./AddPost.module.css";
import { useSelector, useDispatch } from "react-redux";
import axios from "../../shared/api/axiosInstance";
import { postCreated } from '../../redux/post/post-slice';
import defaultAvatarImage from "../../assets/default_avatar_image.png";

const AddPost = () => {
  const dispatch = useDispatch();

  // состояние успешного создания поста
  const [isSuccess, setIsSuccess] = useState(false);
  // описание поста (текст)
  const [description, setDescription] = useState("");
  // счетчик символов в тексте
  const [charCount, setCharCount] = useState(0);
  // превью загруженного изображения
  const [imagePreview, setImagePreview] = useState(null);
  // уведомления об ошибках/успехе
  const [notification, setNotification] = useState(null);
  // индикатор загрузки (отправка формы)
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef(null);
  const user = useSelector((state) => state.auth.user);

  // Обработчик изменения textarea — обновляет описание и счетчик символов
  const handleTextareaChange = (e) => {
    const value = e.target.value;
    setDescription(value);
    setCharCount(value.length);
  };

  // Обработчик выбора файла — конвертирует изображение в base64 для превью
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Обработчик кнопки "Share" — загрузка изображения и создание поста
  const handleShare = async () => {
    const file = fileInputRef.current?.files[0];
    if (!file || !description.trim()) {
      setNotification({
        type: "error",
        message: "Please fill in the description and attach an image.",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Загружаем изображение на сервер и получаем base64
      const formData = new FormData();
      formData.append("image", file);
      const { data } = await axios.post("/api/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const imageBase64 = data.image;

      // Создаем пост с описанием и изображением
      const { data: createdPost } = await axios.post("/api/posts", {
        image: imageBase64,
        description: description.trim(),
      });

      dispatch(postCreated({ id: createdPost._id }));

      // Сбрасываем поля формы
      setDescription("");
      setCharCount(0);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      setNotification({
        type: "success",
        message: "Post successfully created!",
      });
      setIsSuccess(true);

      // Перезагрузка страницы через 3 секунды, пока так, но надо подумать
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (err) {
      console.error("Post creation error:", err);
      setNotification({
        type: "error",
        message: "Something went wrong. Please try again.",
      });
      setIsSubmitting(false);
    }
  };

  // Формируем css классы для формы и уведомления с учетом состояний
  const formClassNames = [styles["add-post__form"]];
  if (isSubmitting || isSuccess) {
    formClassNames.push(styles["add-post__form--disabled"]);
  }

  const notificationClassNames = [styles["add-post__notification"]];
  if (notification?.type) {
    notificationClassNames.push(
      styles[`add-post__notification--${notification.type}`]
    );
  }

  return (
    <div className={styles["add-post"]}>
      <div className={styles["add-post__content"]}>
        <div className={styles["add-post__header"]}>
          <div className={styles["add-post__header-title"]}>Create new post</div>
          <button
            className={styles["add-post__header-share"]}
            onClick={handleShare}
            disabled={isSubmitting}
            aria-disabled={isSubmitting}
          >
            Share
          </button>
        </div>

        {notification && (
          <div className={notificationClassNames.join(" ")}>
            <div className={styles["add-post__notification-content"]}>
              {notification.message}
            </div>
          </div>
        )}

        <div className={formClassNames.join(" ")}>
          <div className={styles["add-post__file-attach"]}>
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className={styles["add-post__file-attached-image"]}
              />
            )}
            <input
              type="file"
              accept="image/*"
              className={styles["add-post__file-attach-input"]}
              onChange={handleFileChange}
              ref={fileInputRef}
              disabled={isSubmitting}
            />
          </div>

          <div className={styles["add-post__textblock"]}>
            <div className={styles["add-post__textblock-header"]}>
              <div className={styles["add-post__textblock-header-avatar"]}>
                <img
                  className={styles["add-post__textblock-header-avatar-image"]}
                  src={user?.profile_image || defaultAvatarImage}
                  alt="User avatar"
                />
              </div>
              <div className={styles["add-post__textblock-header-title"]}>
                {user?.username}
              </div>
            </div>

            <div className={styles["add-post__textblock-field"]}>
              <textarea
                className={styles["add-post__textblock-textarea"]}
                value={description}
                onChange={handleTextareaChange}
                maxLength={2200}
                disabled={isSubmitting}
                placeholder="Enter the text"
              />
              <button
                type="button"
                className={styles["add-post__textblock-smile"]}
                disabled
                aria-hidden="true"
              />
              <div className={styles["add-post__textblock-counter"]}>
                {charCount}/2200
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPost;
