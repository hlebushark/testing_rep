import { configureStore } from '@reduxjs/toolkit';
import { productsApi } from '../api/productsApi';
import { usersApi } from '../api/usersApi';
import { authApi } from '../features/auth/authApi';
import authReducer from '../features/auth/authSlice';
import productsReducer from '../features/products/productsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productsReducer,
    [productsApi.reducerPath]: productsApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [authApi.reducerPath]: authApi.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      productsApi.middleware,
      usersApi.middleware,
      authApi.middleware
    )
});