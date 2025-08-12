import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../shared/api/axiosInstance';

// Получение статуса лайка и количества лайков
export const fetchLikeStatus = createAsyncThunk(
  'like/fetchStatus',
  async (postId) => {
    const [{ data: countData }, { data: likedData }] = await Promise.all([
      axios.get(`/api/likes/count?postId=${postId}`),
      axios.get(`/api/likes/check?postId=${postId}`),
    ]);
    return {
      postId,
      likesCount: countData.count || 0,
      isLiked: likedData.liked || false,
    };
  }
);

// Переключение лайка
export const toggleLike = createAsyncThunk(
  'like/toggle',
  async (postId, thunkAPI) => {
    const { data } = await axios.post("/api/likes", { postId });
    const state = thunkAPI.getState();
    const prev = state.like.byPostId[postId] || { likesCount: 0, isLiked: false };

    return {
      postId,
      isLiked: data.liked,
      likesCount: prev.likesCount + (data.liked ? 1 : -1),
    };
  }
);