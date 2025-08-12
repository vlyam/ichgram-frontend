import { createSlice } from '@reduxjs/toolkit';
import { fetchLikeStatus, toggleLike } from './like-thunks';

// Состояние лайков постов
const likeSlice = createSlice({
  name: 'like',
  initialState: {
    byPostId: {}, // { [postId]: { isLiked: bool, likesCount: number } }
  },
  reducers: {
    // Массовая установка лайков для постов
    setLikesBatch(state, action) {
      action.payload.forEach(({ postId, isLiked, likesCount }) => {
        state.byPostId[postId] = { isLiked, likesCount };
      });
    },
  },
  extraReducers: (builder) => {
    builder
      // Получение статуса лайка
      .addCase(fetchLikeStatus.fulfilled, (state, action) => {
        const { postId, isLiked, likesCount } = action.payload;
        state.byPostId[postId] = { isLiked, likesCount };
      })

      // Переключение лайка
      .addCase(toggleLike.fulfilled, (state, action) => {
        const { postId, isLiked, likesCount } = action.payload;
        state.byPostId[postId] = { isLiked, likesCount };
      });
  },
});

export const { setLikesBatch } = likeSlice.actions;
export default likeSlice.reducer;