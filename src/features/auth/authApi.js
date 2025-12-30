import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'https://dummyjson.com',
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
        url: '/auth/login',
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
        url: '/auth/me',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
    }),
    
    // Token renewal
    refreshToken: builder.mutation({
      query: (refreshToken) => ({
        url: '/auth/refresh',
        method: 'POST',
        body: JSON.stringify({ refreshToken })
      })
    })
  })
});

export const { useLoginMutation, useGetMeQuery, useRefreshTokenMutation } = authApi;