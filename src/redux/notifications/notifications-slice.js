import { createSlice } from "@reduxjs/toolkit";

// Состояние уведомлений
const notificationsSlice = createSlice({
  name: "notifications",
  initialState: {
    notifications: [],
    unreadCount: 0,
  },
  reducers: {
    // Установка уведомлений
    setNotifications(state, action) {
      if (action.payload && Array.isArray(action.payload.notifications)) {
        state.notifications = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount ?? action.payload.notifications.length;
      } else if (Array.isArray(action.payload)) {
        state.notifications = action.payload;
        state.unreadCount = action.payload.length;
      } else {
        state.notifications = [];
        state.unreadCount = 0;
      }
    },

    // Очистка всех уведомлений
    clearNotifications(state) {
      state.notifications = [];
      state.unreadCount = 0;
    },

    // Пометка всех уведомлений как прочитанных
    markAllRead(state) {
      state.unreadCount = 0;
      state.notifications = state.notifications.map(n => ({ ...n, read: true }));
    },
  },
});

export const { setNotifications, clearNotifications, markAllRead } =
  notificationsSlice.actions;

export const selectNotifications = (state) => state.notifications.notifications;
export const selectNotificationsUnreadCount = (state) => state.notifications.unreadCount;

export default notificationsSlice.reducer;