import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../shared/api/axiosInstance';

// Получение подписчиков пользователя
export const fetchFollowers = createAsyncThunk(
  'follow/fetchFollowers',
  async (userId) => {
    const res = await axios.get(`/api/follow/followers/${userId}`);
    return res.data;
  }
);

// Получение списка подписок пользователя
export const fetchFollowing = createAsyncThunk(
  'follow/fetchFollowing',
  async (userId) => {
    const res = await axios.get(`/api/follow/following/${userId}`);
    return res.data;
  }
);

// Проверка подписки на пользователя
export const checkFollowStatus = createAsyncThunk(
  'follow/checkStatus',
  async (targetUserId) => {
    const res = await axios.get(`/api/follow/check/${targetUserId}`);
    return res.data.followed;
  }
);

// Подписка на пользователя
export const followUser = createAsyncThunk(
  'follow/followUser',
  async (targetUserId, thunkAPI) => {
    await axios.post(`/api/follow/follow/${targetUserId}`);

    // Обновляем списки подписчиков/подписок
    const state = thunkAPI.getState();
    const currentUserId = state.auth.user?.id;
    thunkAPI.dispatch(fetchFollowers(targetUserId));
    if (currentUserId) thunkAPI.dispatch(fetchFollowing(currentUserId));

    return targetUserId;
  }
);

// Отписка от пользователя
export const unfollowUser = createAsyncThunk(
  'follow/unfollowUser',
  async (targetUserId, thunkAPI) => {
    await axios.delete(`/api/follow/unfollow/${targetUserId}`);

    // Обновляем списки
    const state = thunkAPI.getState();
    const currentUserId = state.auth.user?.id;
    thunkAPI.dispatch(fetchFollowers(targetUserId));
    if (currentUserId) thunkAPI.dispatch(fetchFollowing(currentUserId));

    return targetUserId;
  }
);
