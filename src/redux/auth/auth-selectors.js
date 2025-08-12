// Возвращает статус авторизации
export const selectIsAuth = (state) => state.auth.isAuth;

// Возвращает объект пользователя
export const selectUser = (state) => state.auth.user;

// Возвращает статус загрузки
export const selectAuthLoading = (state) => state.auth.loading;

// Возвращает ошибку авторизации
export const selectAuthError = (state) => state.auth.error;