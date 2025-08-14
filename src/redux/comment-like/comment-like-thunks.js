import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../shared/api/axiosInstance';

// Получение статуса лайка и количества лайков для комментария
export const fetchCommentLikeStatus = createAsyncThunk(
  'commentLike/fetchStatus',
  async (commentId) => {
    const [{ data: likedData }, { data: countData }] = await Promise.all([
      axios.get(`/api/comment-likes/check?commentId=${commentId}`),
      axios.get(`/api/comment-likes/count?commentId=${commentId}`)
    ]);

    return {
      commentId,
      liked: likedData.liked || false,
      likesCount: countData.count || 0,
    };
  }
);

// Переключение лайка для комментария
export const toggleCommentLike = createAsyncThunk(
  'commentLike/toggle',
  async (commentId, thunkAPI) => {
    const { data } = await axios.post("/api/comment-likes", { commentId });
    const state = thunkAPI.getState();
    const prev = state.commentLike.byCommentId[commentId] || { likesCount: 0, liked: false };

    return {
      commentId,
      liked: data.liked,
      likesCount: prev.likesCount + (data.liked ? 1 : -1),
    };
  }
);