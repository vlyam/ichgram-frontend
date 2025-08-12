import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  checkFollowStatus,
  followUser,
  unfollowUser,
  fetchFollowers,
  fetchFollowing,
} from "../../../redux/follow/follow-thunks";
import Button from "../Button/Button";

const FollowButton = ({ targetUserId, currentUserId, linkButton = false }) => {
  const dispatch = useDispatch();

  const isFollowing = useSelector(
    (state) => state.follow.isFollowingByUserId?.[targetUserId]
  );
  const loading = useSelector((state) => state.follow.loading);

  useEffect(() => {
    if (targetUserId && currentUserId && targetUserId !== currentUserId) {
      dispatch(checkFollowStatus(targetUserId));
    }
  }, [dispatch, targetUserId, currentUserId]);

  if (!targetUserId || !currentUserId || targetUserId === currentUserId) {
    return null;
  }

  const handleToggleFollow = async () => {
    if (isFollowing) {
      await dispatch(unfollowUser(targetUserId));
    } else {
      await dispatch(followUser(targetUserId));
    }

    // Обновление списков
    dispatch(fetchFollowers(targetUserId));
    dispatch(fetchFollowing(currentUserId));
  };

  return (
    <Button
      onClick={handleToggleFollow}
      accentColor={!isFollowing}
      disabled={loading}
      linkButton={linkButton}
    >
      {isFollowing ? "Unfollow" : "Follow"}
    </Button>
  );
};

export default FollowButton;