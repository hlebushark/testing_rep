import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const productsApi = createApi({
  reducerPath: 'productsApi',
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
  tagTypes: ['Product'],
  endpoints: (builder) => ({
    // Получение всех продуктов с сортировкой
    getProducts: builder.query({
      query: ({ 
        limit = 10, 
        skip = 0, 
        search = '', 
        category = '',
        sortBy = 'title',
        order = 'asc'
      }) => {
        let url = 'products';
        const params = new URLSearchParams();
        
        if (search) {
          url = 'products/search';
          params.append('q', search);
        } else if (category) {
          url = `products/category/${category}`;
        }
        
        if (limit > 0) {
          params.append('limit', limit);
          params.append('skip', skip);
        }
        
        // Добавляем параметры сортировки только если не поиск
        if (!search && sortBy && order) {
          params.append('sortBy', sortBy);
          params.append('order', order);
        }
        
        const queryString = params.toString();
        return queryString ? `${url}?${queryString}` : url;
      },
      providesTags: ['Product']
    }),
    
    // Остальные endpoint'ы остаются без изменений
    getProduct: builder.query({
      query: (id) => `products/${id}`,
      providesTags: (result, error, id) => [{ type: 'Product', id }]
    }),
    
    getCategories: builder.query({
      query: () => 'products/categories'
    }),
    
    createProduct: builder.mutation({
      query: (newProduct) => ({
        url: 'products/add',
        method: 'POST',
        body: newProduct,
        headers: {
          'Content-Type': 'application/json'
        }
      }),
      invalidatesTags: ['Product']
    }),
    
    updateProduct: builder.mutation({
      query: ({ id, ...updates }) => ({
        url: `products/${id}`,
        method: 'PUT',
        body: updates,
        headers: {
          'Content-Type': 'application/json'
        }
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Product', id }]
    }),
    
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `products/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Product']
    })
  })
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useGetCategoriesQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation
} = productsApi;