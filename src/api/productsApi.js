import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL, TAGS, API_ENDPOINTS } from '../utils/constants';

export const productsApi = createApi({
  reducerPath: 'productsApi',
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
  tagTypes: [TAGS.PRODUCT],
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
        let url = API_ENDPOINTS.PRODUCTS;
        const params = new URLSearchParams();
        
        if (search) {
          url = API_ENDPOINTS.PRODUCTS_SEARCH;
          params.append('q', search);
        } else if (category) {
          url = `${API_ENDPOINTS.PRODUCTS_CATEGORY}/${category}`;
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
              ...result.products.map(({ id }) => ({ type: TAGS.PRODUCT, id })),
              { type: TAGS.PRODUCT, id: 'LIST' },
            ]
          : [{ type: TAGS.PRODUCT, id: 'LIST' }],
      keepUnusedDataFor: 60,
    }),
    
    getProduct: builder.query({
      query: (id) => `${API_ENDPOINTS.PRODUCTS}/${id}`,
      providesTags: (result, error, id) => [{ type: TAGS.PRODUCT, id }],
    }),
    
    getCategories: builder.query({
      query: () => API_ENDPOINTS.PRODUCTS_CATEGORIES
    }),
    
    createProduct: builder.mutation({
      query: (newProduct) => ({
        url: `${API_ENDPOINTS.PRODUCTS}/add`,
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
      invalidatesTags: [{ type: TAGS.PRODUCT, id: 'LIST' }],
    }),
    
    updateProduct: builder.mutation({
      query: ({ id, ...updates }) => ({
        url: `${API_ENDPOINTS.PRODUCTS}/${id}`,
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
      invalidatesTags: (result, error, { id }) => [{ type: TAGS.PRODUCT, id }],
    }),
    
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `${API_ENDPOINTS.PRODUCTS}/${id}`,
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
      invalidatesTags: [{ type: TAGS.PRODUCT, id: 'LIST' }],
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