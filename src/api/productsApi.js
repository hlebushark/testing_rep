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
        
        if (!search && sortBy && order) {
          params.append('sortBy', sortBy);
          params.append('order', order);
        }
        
        const queryString = params.toString();
        return queryString ? `${url}?${queryString}` : url;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.products.map(({ id }) => ({ type: 'Product', id })),
              { type: 'Product', id: 'LIST' },
            ]
          : [{ type: 'Product', id: 'LIST' }],
      keepUnusedDataFor: 60,
    }),
    
    getProduct: builder.query({
      query: (id) => `products/${id}`,
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),
    
    getCategories: builder.query({
      query: () => 'products/categories'
    }),
    
    // CREATE
    createProduct: builder.mutation({
      query: (newProduct) => ({
        url: 'products/add',
        method: 'POST',
        body: newProduct,
        headers: {
          'Content-Type': 'application/json'
        }
      }),
      // Update
      async onQueryStarted(newProduct, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          productsApi.util.updateQueryData('getProducts', {}, (draft) => {
            if (draft?.products) {
              draft.products.unshift({
                ...newProduct,
                id: Date.now(), // temp ID
                isLocal: true, 
              });
              draft.total += 1;
            }
          })
        );
        
        try {
          const { data } = await queryFulfilled;
          // Update with real ID from API
          dispatch(
            productsApi.util.updateQueryData('getProducts', {}, (draft) => {
              if (draft?.products) {
                const index = draft.products.findIndex(p => p.id === Date.now());
                if (index !== -1) {
                  draft.products[index] = { 
                    ...data, 
                    isLocal: false 
                  };
                }
              }
            })
          );
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),
    
    // UPDATE
    updateProduct: builder.mutation({
      query: ({ id, ...updates }) => ({
        url: `products/${id}`,
        method: 'PUT',
        body: updates,
        headers: {
          'Content-Type': 'application/json'
        }
      }),
      async onQueryStarted({ id, ...updates }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          productsApi.util.updateQueryData('getProduct', id, (draft) => {
            Object.assign(draft, updates);
          })
        );
        dispatch(
          productsApi.util.updateQueryData('getProducts', {}, (draft) => {
            if (draft?.products) {
              const product = draft.products.find(p => p.id === id);
              if (product) {
                Object.assign(product, updates);
              }
            }
          })
        );
        
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (result, error, { id }) => [{ type: 'Product', id }],
    }),
    
    // DELETE
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `products/${id}`,
        method: 'DELETE'
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        let deletedProduct = null;
        
        dispatch(
          productsApi.util.updateQueryData('getProducts', {}, (draft) => {
            if (draft?.products) {
              const index = draft.products.findIndex(p => p.id === id);
              if (index !== -1) {
                deletedProduct = draft.products[index];
                draft.products.splice(index, 1);
                draft.total -= 1;
              }
            }
          })
        );
        
        try {
          await queryFulfilled;
        } catch {
          // Recover if error
          if (deletedProduct) {
            dispatch(
              productsApi.util.updateQueryData('getProducts', {}, (draft) => {
                if (draft?.products) {
                  draft.products.unshift(deletedProduct);
                  draft.total += 1;
                }
              })
            );
          }
        }
      },
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
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