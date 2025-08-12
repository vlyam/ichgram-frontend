import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useUI } from "../../shared/context/UIContext";
import axios from "../../shared/api/axiosInstance";
import { setLikesBatch } from "../../redux/like/like-slice";

import StateBanner from "../../shared/components/StateBanner/StateBanner";
import Button from "../../shared/components/Button/Button";
import Loader from "../../shared/components/Loader/Loader";

import { selectLastCreatedPost, selectLastUpdatedPost } from "../../redux/post/post-selectors";

import Article from "./Article/Article";

import styles from "./Articles.module.css";

// Главный компонент ленты постов на Home
const Articles = () => {
  const dispatch = useDispatch();

  const { setModalPostId, setFocusOnCommentInput } = useUI();
  const authUser = useSelector((state) => state.auth.user);

  const lastCreatedPost = useSelector(selectLastCreatedPost);
  const lastUpdatedPost = useSelector(selectLastUpdatedPost);

  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  // Функция загрузки постов с сервера с учетом пагинации
  const fetchPosts = async (pageToFetch) => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const response = await axios.get(`/api/posts/feed?page=${pageToFetch}&limit=20`);
      const { posts: newPosts, hasMore: newHasMore } = response.data;

      // Формируем данные для обновления лайков в Redux
      const likesPayload = newPosts.map(post => ({
        postId: post._id,
        isLiked: post.isLiked ?? false,
        likesCount: post.likesCount ?? 0,
      }));

      dispatch(setLikesBatch(likesPayload));

      setPosts(prev => {
        const existingIds = new Set(prev.map(p => p._id));
        return [...prev, ...newPosts.filter(p => !existingIds.has(p._id))];
      });

      setHasMore(newHasMore);
    } catch (error) {
      console.error("Error loading posts:", error);
    } finally {
      setLoading(false);
    }
  };

  // Загрузка постов при смене страницы
  useEffect(() => {
    if (page > 1) {
      (async () => {
        await fetchPosts(page);
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // При появлении нового/обновленного поста сброс и загрузка заново
  useEffect(() => {
    setPosts([]);
    setHasMore(true);
    setPage(1);
    fetchPosts(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastCreatedPost, lastUpdatedPost]);

  const handleShowMore = () => {
    setPage(prev => prev + 1);
  };

  return (
    <div className={styles.articles}>
      <div className={styles["articles__list"]}>
        {posts.length === 0 && !loading && (
          <StateBanner
            emptyState
            title="No posts yet"
            subtitle="Nobody has published anything"
          />
        )}

        {posts.map((post) => (
          <Article
            key={post._id}
            post={post}
            authUserId={authUser?.id}
            setModalPostId={setModalPostId}
            setFocusOnCommentInput={setFocusOnCommentInput}
          />
        ))}
      </div>

      {loading && <Loader />}

      {!loading && posts.length > 0 && !hasMore && (
        <StateBanner
          title="You've seen all the updates"
          subtitle="You have viewed all new publications"
        />
      )}

      {hasMore && posts.length > 0 && (
        <div className={styles["articles__more-button"]}>
          <Button onClick={handleShowMore} loading={loading}>
            Show more posts
          </Button>
        </div>
      )}
    </div>
  );
};

export default Articles;