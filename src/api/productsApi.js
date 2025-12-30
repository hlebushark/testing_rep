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
    // Получение всех продуктов
    getProducts: builder.query({
      query: ({ limit = 10, skip = 0, search = '', category = '' }) => {
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
        
        const queryString = params.toString();
        return queryString ? `${url}?${queryString}` : url;
      },
      providesTags: ['Product']
    }),
    
    // Получение одного продукта
    getProduct: builder.query({
      query: (id) => `products/${id}`,
      providesTags: (result, error, id) => [{ type: 'Product', id }]
    }),
    
    // Получение категорий
    getCategories: builder.query({
      query: () => 'products/categories'
    }),
    
    // ⚠️ ВАЖНО: DummyJSON НЕ сохраняет продукты на сервере!
    // Создание продукта - только имитация
    createProduct: builder.mutation({
      query: (newProduct) => ({
        url: 'products/add',
        method: 'POST',
        body: newProduct,
        headers: {
          'Content-Type': 'application/json'
        }
      }),
      // Оптимистичное обновление - продукт добавится локально
      onQueryStarted: async (newProduct, { dispatch, queryFulfilled }) => {
        // Генерируем временный ID
        const tempId = Date.now();
        const patchResult = dispatch(
          productsApi.util.updateQueryData('getProducts', {}, (draft) => {
            if (draft?.products) {
              draft.products.unshift({
                ...newProduct,
                id: tempId,
                isLocal: true // Маркер локального продукта
              });
              draft.total += 1;
            }
          })
        );
        
        try {
          const { data } = await queryFulfilled;
          // Заменяем временный ID на реальный
          dispatch(
            productsApi.util.updateQueryData('getProducts', {}, (draft) => {
              if (draft?.products) {
                const index = draft.products.findIndex(p => p.id === tempId);
                if (index !== -1) {
                  draft.products[index] = { ...data, isLocal: false };
                }
              }
            })
          );
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: ['Product']
    }),
    
    // Обновление продукта - тоже имитация
    updateProduct: builder.mutation({
      query: ({ id, ...updates }) => ({
        url: `products/${id}`,
        method: 'PUT',
        body: updates,
        headers: {
          'Content-Type': 'application/json'
        }
      }),
      // Оптимистичное обновление
      onQueryStarted: async ({ id, ...updates }, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          productsApi.util.updateQueryData('getProduct', id, (draft) => {
            Object.assign(draft, updates);
          })
        );
        
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (result, error, { id }) => [{ type: 'Product', id }]
    }),
    
    // Удаление продукта - имитация
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `products/${id}`,
        method: 'DELETE'
      }),
      // Оптимистичное удаление
      onQueryStarted: async (id, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          productsApi.util.updateQueryData('getProducts', {}, (draft) => {
            if (draft?.products) {
              const index = draft.products.findIndex(p => p.id === id);
              if (index !== -1) {
                draft.products.splice(index, 1);
                draft.total -= 1;
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