import { useEffect, useState } from "react";
import axios from "../../shared/api/axiosInstance";
import { useUI } from "../../shared/context/UIContext";
import Button from "../../shared/components/Button/Button";
import StateBanner from "../../shared/components/StateBanner/StateBanner";
import Loader from "../../shared/components/Loader/Loader";
import styles from "./Explore.module.css";

function shuffleArray(array) {
  // Перемешивание Фишера-Йетса
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function Explore() {
  const { setModalPostId } = useUI();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchExplorePosts(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (page > 1) {
      fetchExplorePosts(page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    window.addEventListener("resize", arrangeExploreGallery);
    return () => {
      window.removeEventListener("resize", arrangeExploreGallery);
    };
  }, []);

  useEffect(() => {
    arrangeExploreGallery();
  }, [posts]);

  const fetchExplorePosts = async (pageToFetch) => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res = await axios.get(`/api/posts/explore?page=${pageToFetch}&limit=56`);
      const { posts: newPosts, hasMore: newHasMore } = res.data;

      // Перемешиваем новую порцию постов перед добавлением
      const shuffledNewPosts = shuffleArray([...newPosts]);

      setPosts((prev) => {
        const existingIds = new Set(prev.map((p) => p._id));
        const uniqueNew = shuffledNewPosts.filter((p) => !existingIds.has(p._id));
        return [...prev, ...uniqueNew];
      });

      setHasMore(newHasMore);
    } catch (error) {
      console.error("Error loading explore posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowMore = () => {
    setPage((prev) => prev + 1);
  };

  return (
    <div className={styles["explore"]}>
      <div className={styles["explore__gallery"]}>
        {posts.map((post) => (
          <div
            key={post._id}
            className={styles["explore__gallery-item"]}
            onClick={() => setModalPostId(post._id)}
          >
            <img src={post.image} alt="Post preview" />
          </div>
        ))}
      </div>

      {loading && <Loader />}

      {!loading && posts.length === 0 && (
        <StateBanner emptyState title="No posts to explore" subtitle="Try again later" />
      )}

      {!loading && !hasMore && posts.length > 0 && (
        <StateBanner
          title="You've seen all the updates"
          subtitle="You have viewed all available posts"
        />
      )}

      {hasMore && posts.length > 0 && (
        <div className={styles["explore__more-button"]}>
          <Button onClick={handleShowMore} loading={loading}>
            Show more posts
          </Button>
        </div>
      )}
    </div>
  );
}


// Галеря в стиле масонри
function arrangeExploreGallery() {
  const gallery = document.querySelector(`.${styles["explore__gallery"]}`);
  if (!gallery) return;

  const items = gallery.querySelectorAll(`.${styles["explore__gallery-item"]}`);

  // Если экран меньше или равен 992px — сбрасываем стили и выходим
  if (window.innerWidth <= 992) {
    items.forEach((el) => {
      el.classList.remove(styles["tall"]);
      el.style.gridColumn = "";
      el.style.gridRow = "";
    });
    return;
  }

  items.forEach((el) => {
    el.classList.remove(styles["tall"]);
    el.style.gridColumn = "";
    el.style.gridRow = "";
  });

  const columns = window.innerWidth <= 1440 ? 3 : 4;
  const squaresInRow = columns - 1;
  let index = 0;
  let row = 1;
  let right = true;

  while (index < items.length) {
    if (right) {
      for (let r = 0; r < 2; r++) {
        for (let c = 1; c <= squaresInRow; c++) {
          if (index >= items.length) break;
          const el = items[index++];
          el.style.gridColumn = c;
          el.style.gridRow = row + r;
        }
      }
      if (index < items.length) {
        const el = items[index++];
        el.classList.add(styles["tall"]);
        el.style.gridColumn = columns;
        el.style.gridRow = `${row} / span 2`;
      }
    } else {
      if (index < items.length) {
        const el = items[index++];
        el.classList.add(styles["tall"]);
        el.style.gridColumn = 1;
        el.style.gridRow = `${row} / span 2`;
      }
      for (let r = 0; r < 2; r++) {
        for (let c = 2; c <= columns; c++) {
          if (index >= items.length) break;
          const el = items[index++];
          el.style.gridColumn = c;
          el.style.gridRow = row + r;
        }
      }
    }
    row += 2;
    right = !right;
  }
}

export default Explore;