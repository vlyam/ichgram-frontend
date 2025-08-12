import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import postReducer from './post/post-slice';
import authReducer from './auth/auth-slice';
import followReducer from './follow/follow-slice';
import messagesReducer from './messages/messages-slice';
import notificationsReducer from "./notifications/notifications-slice";
import likeReducer from './like/like-slice';

// Корневой редьюсер
const rootReducer = combineReducers({
  auth: authReducer,
  post: postReducer,
  follow: followReducer,
  messages: messagesReducer,
  notifications: notificationsReducer,
  like: likeReducer,
});

// Конфигурация persist (сохраняем только auth)
const persistedReducer = persistReducer(
  {
    key: 'root',
    storage,
    whitelist: ['auth'],
  },
  rootReducer
);

// Конфигурация стора
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: import.meta.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);
export default store;