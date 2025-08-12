import { createSlice } from '@reduxjs/toolkit';

// Состояние постов
const initialState = {
  lastCreatedPost: null,
  lastUpdatedPost: null,
};

const postSlice = createSlice({
  name: 'post',
  initialState,
  reducers: {
    // Фиксация создания поста
    postCreated: (state, action) => {
      state.lastCreatedPost = {
        id: action.payload.id,
        timestamp: Date.now(),
      };
    },

    // Фиксация обновления поста
    postUpdated: (state, action) => {
      state.lastUpdatedPost = {
        id: action.payload.id,
        timestamp: Date.now(),
      };
    },

    // Очистка последнего созданного поста
    clearLastCreatedPost: (state) => {
      state.lastCreatedPost = null;
    },

    // Очистка последнего обновлённого поста
    clearLastUpdatedPost: (state) => {
      state.lastUpdatedPost = null;
    },
  },
});

export const {
  postCreated,
  postUpdated,
  clearLastCreatedPost,
  clearLastUpdatedPost,
} = postSlice.actions;

export default postSlice.reducer;