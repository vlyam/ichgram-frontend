import { createSlice } from '@reduxjs/toolkit';
import {
  fetchFollowers,
  fetchFollowing,
  checkFollowStatus,
  followUser,
  unfollowUser,
} from './follow-thunks';

const followSlice = createSlice({
  name: 'follow',
  initialState: {
    followersByUserId: {}, // ключ: userId, значение: массив подписчиков
    followingByUserId: {}, // ключ: userId, значение: массив подписок
    isFollowingByUserId: {}, // статус подписки по targetUserId
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Загрузка подписчиков для конкретного userId
      .addCase(fetchFollowers.fulfilled, (state, action) => {
        const userId = action.meta.arg;
        state.followersByUserId[userId] = action.payload;
      })

      // Загрузка подписок для конкретного userId
      .addCase(fetchFollowing.fulfilled, (state, action) => {
        const userId = action.meta.arg;
        state.followingByUserId[userId] = action.payload;
      })

      // Проверка подписки (action.meta.arg — targetUserId)
      .addCase(checkFollowStatus.fulfilled, (state, action) => {
        const targetUserId = action.meta.arg;
        state.isFollowingByUserId[targetUserId] = action.payload;
      })

      // Подписка: ставим true в статус подписки
      .addCase(followUser.fulfilled, (state, action) => {
        const targetUserId = action.payload;
        state.isFollowingByUserId[targetUserId] = true;
        // Можно обновить followers/following после follow через отдельные диспатчи
      })

      // Отписка: ставим false
      .addCase(unfollowUser.fulfilled, (state, action) => {
        const targetUserId = action.payload;
        state.isFollowingByUserId[targetUserId] = false;
      });
  },
});

export default followSlice.reducer;