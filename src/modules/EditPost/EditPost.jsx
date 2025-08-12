import { useState, useRef } from "react";
import styles from "./EditPost.module.css";
import { useSelector, useDispatch } from "react-redux";
import axios from "../../shared/api/axiosInstance";
import { postUpdated } from "../../redux/post/post-slice";
import defaultAvatarImage from "../../assets/default_avatar_image.png";

const EditPost = ({ postId, initialDescription, initialImage }) => {
  const dispatch = useDispatch();

  // состояние успешного обновления поста
  const [isSuccess, setIsSuccess] = useState(false);
  // описание поста (текст)
  const [description, setDescription] = useState(initialDescription || "");
  // счетчик символов в тексте
  const [charCount, setCharCount] = useState(initialDescription?.length || 0);
  // превью изображения
  const [imagePreview, setImagePreview] = useState(initialImage || null);
  // уведомления об ошибках/успехе
  const [notification, setNotification] = useState(null);
  // индикатор загрузки (отправка формы)
  const [isSubmitting, setIsSubmitting] = useState(false);
  // новое загруженное изображение
  const [newImageFile, setNewImageFile] = useState(null);

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
    setNewImageFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Обработчик кнопки "Save" — загружает новое изображение (если есть) и обновляет пост
  const handleSave = async () => {
    if (!description.trim()) {
      setNotification({
        type: "error",
        message: "Description cannot be empty.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      let imageBase64 = initialImage;

      // Загружаем новое изображение, если оно выбрано
      if (newImageFile) {
        const formData = new FormData();
        formData.append("image", newImageFile);
        const { data } = await axios.post("/api/upload/image", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        imageBase64 = data.image;
      }

      // Отправляем обновлённые данные поста
      await axios.put(`/api/posts/${postId}`, {
        image: imageBase64,
        description: description.trim(),
      });

      dispatch(postUpdated({ id: postId }));

      setNotification({
        type: "success",
        message: "Post successfully updated!",
      });
      setIsSuccess(true);

      // Перезагрузка страницы через 3 секунды, пока так, но надо подумать
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (err) {
      console.error("Post update error:", err);
      setNotification({
        type: "error",
        message: "Something went wrong. Please try again.",
      });
      setIsSubmitting(false);
    }
  };

  // Формируем css классы для формы с учетом состояний
  const formClassNames = [styles["edit-post__form"]];
  if (isSubmitting || isSuccess) {
    formClassNames.push(styles["edit-post__form--disabled"]);
  }

  // Формируем css классы для уведомления с учетом типа
  const notificationClassNames = [styles["edit-post__notification"]];
  if (notification?.type) {
    notificationClassNames.push(
      styles[`edit-post__notification--${notification.type}`]
    );
  }

  return (
    <div className={styles["edit-post"]}>
      <div className={styles["edit-post__content"]}>
        <div className={styles["edit-post__header"]}>
          <div className={styles["edit-post__header-title"]}>Edit post</div>
          <button
            className={styles["edit-post__header-save"]}
            onClick={handleSave}
            disabled={isSubmitting}
          >
            Save
          </button>
        </div>

        {notification && (
          <div className={notificationClassNames.join(" ")}>
            <div className={styles["edit-post__notification-content"]}>
              {notification.message}
            </div>
          </div>
        )}

        <div className={formClassNames.join(" ")}>
          <div className={styles["edit-post__file-attach"]}>
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className={styles["edit-post__file-attached-image"]}
              />
            )}
            <input
              type="file"
              accept="image/*"
              className={styles["edit-post__file-attach-input"]}
              onChange={handleFileChange}
              ref={fileInputRef}
              disabled={isSubmitting}
            />
          </div>

          <div className={styles["edit-post__textblock"]}>
            <div className={styles["edit-post__textblock-header"]}>
              <div className={styles["edit-post__textblock-header-avatar"]}>
                <img
                  className={styles["edit-post__textblock-header-avatar-image"]}
                  src={user?.profile_image || defaultAvatarImage}
                  alt="User avatar"
                />
              </div>
              <div className={styles["edit-post__textblock-header-title"]}>
                {user?.username}
              </div>
            </div>

            <div className={styles["edit-post__textblock-field"]}>
              <textarea
                className={styles["edit-post__textblock-textarea"]}
                value={description}
                onChange={handleTextareaChange}
                maxLength={2200}
                disabled={isSubmitting}
                placeholder="Enter the text"
              />
              <div className={styles["edit-post__textblock-counter"]}>
                {charCount}/2200
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPost;
