import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL, API_ENDPOINTS } from '../../utils/constants';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: API_BASE_URL,
    // Adding error handling
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    }
  }),
  endpoints: (builder) => ({
    // Login is the correct endpoint
    login: builder.mutation({
      query: (credentials) => ({
        url: API_ENDPOINTS.AUTH_LOGIN,
        method: 'POST',
        body: JSON.stringify(credentials),
        headers: {
          'Content-Type': 'application/json'
        }
      }),
      // Transform the response for our application
      transformResponse: (response) => {
        console.log('Login response:', response);
        return {
          ...response,
          accessToken: response.accessToken || response.token,
          isAdmin: response.username === 'admin' || response.role === 'admin'
        };
      }
    }),
    
    // Getting the current user's data
    getMe: builder.query({
      query: (token) => ({
        url: API_ENDPOINTS.AUTH_ME,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
    }),
    
    // Token renewal
    refreshToken: builder.mutation({
      query: (refreshToken) => ({
        url: API_ENDPOINTS.AUTH_REFRESH,
        method: 'POST',
        body: JSON.stringify({ refreshToken })
      })
    })
  })
});

export const { useLoginMutation, useGetMeQuery, useRefreshTokenMutation } = authApi;