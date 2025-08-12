import { useEffect, useState } from "react";
import Modal from "../Modal/Modal";
import axios from "../../api/axiosInstance";
import Loader from "../Loader/Loader";
import StateBanner from "../StateBanner/StateBanner";
import styles from "./FollowListModal.module.css";
import defaultAvatarImage from "../../../assets/default_avatar_image.png";
import { Link } from "react-router-dom";

const FollowListModal = ({ userId, type = "followers", onClose }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !type) return;

    const fetchList = async () => {
      try {
        const response = await axios.get(`/api/follow/${type}/${userId}`);
        setUsers(response.data);
      } catch (err) {
        console.error("Error loading list of subscriptions/subscribers", err);
      } finally {
        setLoading(false);
      }
    };

    fetchList();
  }, [userId, type]);

  return (
    <Modal close={onClose}>
      <div className={styles['follow-list']}>
        <div className={styles['follow-list__content']}>
          <div className={styles['follow-list__header']}>
            <div className={styles['follow-list__header-title']}>
              {type === "followers" ? "Followers" : "Following"}
            </div>
          </div>
          {loading ? (
            <Loader />
          ) : users.length === 0 ? (
            <StateBanner emptyState title={`No ${type}`} />
          ) : (
            <div className={styles['follow-list__list']}>
              {users.map((user) => (
                <div key={user.id || user._id} className={styles['follow-list__element']}>

                  <div className={styles['follow-list__user']}>
                    <div className={styles['follow-list__user-avatar']}>
                      <img
                        src={user.profile_image || defaultAvatarImage}
                        alt={user.username}
                        className={styles['follow-list__user-image']}
                      />
                    </div>
                    <div className={styles['follow-list__user-text']}>
                      <Link
                        to={`/profile/${user.id || user._id}`}
                        onClick={onClose}
                        className={styles['follow-list__user-user']}
                      >
                        {user.username}
                      </Link>
                    </div>
                  </div>

                </div>

              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default FollowListModal;