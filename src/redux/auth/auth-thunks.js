import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../shared/api/axiosInstance';

// Обработка ошибок API
const handleError = (error, defaultMsg) => {
  const data = error.response?.data;

  if (Array.isArray(data?.errors)) {
    return {
      message: data.message || defaultMsg,
      fieldErrors: data.errors,
    };
  }

  if (data?.field && data?.message) {
    return {
      message: data.message,
      fieldErrors: [{ field: data.field, message: data.message }],
    };
  }

  return {
    message: data?.message || data?.error || defaultMsg,
    fieldErrors: [],
  };
};

// Авторизация пользователя
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { data: loginData } = await axios.post('/api/auth/login', { email, password });
      localStorage.setItem('token', loginData.token);

      // Запрос профиля пользователя
      const { data: userProfile } = await axios.get('/api/users/profile');

      // Приводим id пользователя к единому виду
      const normalizedUser = {
        ...userProfile,
        id: userProfile.id || userProfile._id,
      };

      return {
        user: normalizedUser,
        token: loginData.token,
      };
    } catch (error) {
      return rejectWithValue(handleError(error, 'Login failed'));
    }
  }
);

// Регистрация пользователя
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async ({ email, fullname, username, password }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post('/api/auth/register', {
        email,
        fullname,
        username,
        password,
      });
      return data;
    } catch (error) {
      return rejectWithValue(handleError(error, 'Register failed'));
    }
  }
);

// Повторная отправка письма подтверждения
export const resendVerification = createAsyncThunk(
  'auth/resendVerification',
  async (email, { rejectWithValue }) => {
    try {
      const { data } = await axios.post('/api/auth/resend-verification', { email });
      return data;
    } catch (error) {
      return rejectWithValue(handleError(error, 'Resend failed'));
    }
  }
);

// Сброс пароля
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (email, { rejectWithValue }) => {
    try {
      const { data } = await axios.post("/api/auth/reset", { email });
      return data;
    } catch (error) {
      return rejectWithValue(handleError(error, "Reset failed"));
    }
  }
);

// Проверка авторизации по токену
export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return { user: null };
      const { data } = await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    } catch {
      return rejectWithValue(null);
    }
  }
);