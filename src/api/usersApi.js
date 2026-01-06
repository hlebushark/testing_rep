import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL, TAGS, API_ENDPOINTS } from '../utils/constants';

export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.accessToken;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    }
  }),
  tagTypes: [TAGS.USER],
  endpoints: (builder) => ({
    // Registration of a new user
    registerUser: builder.mutation({
      query: (userData) => ({
        url: API_ENDPOINTS.USERS_ADD,
        method: 'POST',
        body: userData
      }),
      invalidatesTags: TAGS.USER
    }),
    
    // Getting information about the current user
    getCurrentUser: builder.query({
      query: () => API_ENDPOINTS.AUTH_ME,
      providesTags: TAGS.USER
    }),
    
    // User update
    updateUser: builder.mutation({
      query: ({ id, ...updates }) => ({
        url: `${API_ENDPOINTS.USERS}/${id}`,
        method: 'PUT',
        body: updates
      }),
      invalidatesTags: TAGS.USER
    }),
    
    // Getting a list of users (for admin)
    getUsers: builder.query({
      query: () => API_ENDPOINTS.USERS,
      providesTags: TAGS.USER
    }),
    
    // Delete user (for admin)
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `${API_ENDPOINTS.USERS}/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: TAGS.USER
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