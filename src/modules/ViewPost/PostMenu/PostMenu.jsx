import styles from "./PostMenu.module.css";
import { useNavigate } from "react-router-dom";
import axios from "../../../shared/api/axiosInstance";
import { useState } from "react";

const PostMenu = ({ postId, close, onEdit, onClosePostModal }) => {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      setIsDeleting(true);
      await axios.delete(`/api/posts/${postId}`);
      close(); // Закрываем модалку
      //navigate("/profile"); // Или navigate(-1) для возврата, не получилось нормально, пока просто перезагружаем
      window.location.reload();
      if (onClosePostModal) onClosePostModal();
    } catch (err) {
      console.error("Error deleting post:", err);
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    onEdit(); // Открыть форму редактирования
  };

  const handleGoToPost = () => {
    navigate(`/post/${postId}`);
    close();
    if (onClosePostModal) onClosePostModal();
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`);
      alert("Link copied!");
    } catch (err) {
      console.error("Error copying link:", err);
    }
  };

  return (
    <div className={styles["post-menu"]}>
      <button
        className={`${styles["post-menu-button"]} ${styles["post-menu-button--accent-color"]}`}
        onClick={handleDelete}
        disabled={isDeleting}
      >
        Delete
      </button>
      <button className={styles["post-menu-button"]} onClick={handleEdit}>
        Edit
      </button>
      <button className={styles["post-menu-button"]} onClick={handleGoToPost}>
        Go to post
      </button>
      <button className={styles["post-menu-button"]} onClick={handleCopyLink}>
        Copy link
      </button>
      <button className={styles["post-menu-button"]} onClick={close}>
        Cancel
      </button>
    </div>
  );
};

export default PostMenu;