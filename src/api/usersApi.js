import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://dummyjson.com',
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.accessToken;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    }
  }),
  tagTypes: ['User'],
  endpoints: (builder) => ({
    // Registration of a new user
    registerUser: builder.mutation({
      query: (userData) => ({
        url: 'users/add',
        method: 'POST',
        body: userData
      }),
      invalidatesTags: ['User']
    }),
    
    // Getting information about the current user
    getCurrentUser: builder.query({
      query: () => 'auth/me',
      providesTags: ['User']
    }),
    
    // User update
    updateUser: builder.mutation({
      query: ({ id, ...updates }) => ({
        url: `users/${id}`,
        method: 'PUT',
        body: updates
      }),
      invalidatesTags: ['User']
    }),
    
    // Getting a list of users (for admin)
    getUsers: builder.query({
      query: () => 'users',
      providesTags: ['User']
    }),
    
    // Delete user (for admin)
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `users/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['User']
    })
  })
});

export const {
  useRegisterUserMutation,
  useGetCurrentUserQuery,
  useUpdateUserMutation,
  useGetUsersQuery,
  useDeleteUserMutation
} = usersApi;