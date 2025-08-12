import { createSlice } from '@reduxjs/toolkit';
import { loginUser, registerUser, checkAuth } from './auth-thunks';

// Начальное состояние авторизации
const initialState = {
  user: null,
  token: null,
  isAuth: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Выход из системы
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuth = false;
      state.error = null;
    },
    // Обновление данных пользователя
    setUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // Проверка токена — при ошибке обнуляем пользователя
      .addCase(checkAuth.rejected, (state) => {
        state.user = null;
        state.isAuth = false;
      })

      // Логин
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuth = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Login error';
      })

      // Регистрация
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Register error';
      })

      // Успешная проверка токена
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.user = action.payload?.user || null;
        state.isAuth = !!action.payload?.user;
      });
  },
});

export const { logout, setUser } = authSlice.actions;
export default authSlice.reducer;