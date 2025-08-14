import { createSlice } from '@reduxjs/toolkit';
import { fetchCommentLikeStatus, toggleCommentLike } from './comment-like-thunks';

const commentLikeSlice = createSlice({
  name: 'commentLike',
  initialState: {
    byCommentId: {},
  },
  reducers: {
    setCommentLikesBatch(state, action) {
      action.payload.forEach(({ commentId, liked, likesCount }) => {
        state.byCommentId[commentId] = { liked, likesCount };
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCommentLikeStatus.fulfilled, (state, action) => {
        const { commentId, liked, likesCount } = action.payload;
        state.byCommentId[commentId] = { liked, likesCount };
      })
      .addCase(toggleCommentLike.fulfilled, (state, action) => {
        const { commentId, liked, likesCount } = action.payload;
        state.byCommentId[commentId] = { liked, likesCount };
      });
  },
});

export const { setCommentLikesBatch } = commentLikeSlice.actions;
export default commentLikeSlice.reducer;