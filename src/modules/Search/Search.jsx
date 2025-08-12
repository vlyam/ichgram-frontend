import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "../../shared/api/axiosInstance";
import StateBanner from "../../shared/components/StateBanner/StateBanner";
import Loader from "../../shared/components/Loader/Loader";
import defaultAvatarImage from "../../assets/default_avatar_image.png";
import styles from "./Search.module.css";

const RECENT_KEY = "recent_searches";

const Search = () => {
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [recent, setRecent] = useState([]);
  const [recentIds, setRecentIds] = useState([]);
  const [noResults, setNoResults] = useState(false);

  // Загружаем ID из localStorage
  const fetchRecentIds = () => {
    const stored = localStorage.getItem(RECENT_KEY);
    return stored ? JSON.parse(stored) : [];
  };

  // Сохраняем только ID
  const saveToRecent = (user) => {
    const updatedIds = [user._id, ...recentIds.filter(id => id !== user._id)].slice(0, 10);
    setRecentIds(updatedIds);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updatedIds));
  };

  // По ID загружаем данные пользователей
  const fetchRecentUsers = async (ids) => {
    try {
      const res = await axios.post(`/api/users/bulk`, { ids });
      setRecent(res.data);
    } catch (err) {
      console.error("Failed to load recent users:", err);
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await axios.get(`/api/users/search?q=${encodeURIComponent(query)}`);
      setResults(res.data);
      setNoResults(res.data.length === 0);
    } catch (err) {
      console.error("Search error:", err);
      setResults([]);
      setNoResults(true);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setNoResults(false);
  };

  const handleUserClick = (user) => {
    saveToRecent(user);
    clearSearch();
  };

  // Загружаем список ID и пользователей
  useEffect(() => {
    const ids = fetchRecentIds();
    setRecentIds(ids);
    if (ids.length > 0) {
      fetchRecentUsers(ids);
    }
  }, []);

  useEffect(() => {
    if (recentIds.length > 0) {
      fetchRecentUsers(recentIds);
    } else {
      setRecent([]);
    }
  }, [recentIds]);


  return (
    <div className={styles.search}>
      <div className={styles.search__title}>Search</div>

      <div className={styles.search__field}>
        <input
          className={styles.search__input}
          type="text"
          placeholder="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        {query && (
          <div className={styles.search__clear} onClick={clearSearch}></div>
        )}
      </div>

      {loading && <Loader />}

      {noResults && (
        <StateBanner
          emptyState
          title="No results found"
          subtitle="Try adjusting your search query."
        />
      )}

      {results.length > 0 && (
        <div className={styles.search__list}>
          {results.map((user) => (
            <div key={user._id} className={styles.search__element}>
              <div className={styles.searched}>
                <div className={styles.searched__avatar}>
                  <img
                    className={styles.searched__image}
                    src={user.profile_image || defaultAvatarImage}
                    alt=""
                  />
                </div>
                <div className={styles.searched__text}>
                  <Link
                    className={styles.searched__user}
                    to={`/profile/${user._id}`}
                    onClick={() => handleUserClick(user)}
                  >
                    {user.username}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {recent.length > 0 && (
        <>
          <div className={styles.search__subtitle}>Recent</div>
          <div className={styles.search__list}>
            {recent.map((user) => (
              <div key={user._id} className={styles.search__element}>
                <div className={styles.searched}>
                  <div className={styles.searched__avatar}>
                    <img
                      className={styles.searched__image}
                      src={user.profile_image || defaultAvatarImage}
                      alt=""
                    />
                  </div>
                  <div className={styles.searched__text}>
                    <Link
                      className={styles.searched__user}
                      to={`/profile/${user._id}`}
                      onClick={() => handleUserClick(user)}
                    >
                      {user.username}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Search;