import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedCategory: null,
  sortBy: 'title',
  sortOrder: 'asc',
  currentPage: 1,
  searchQuery: '',
  itemsPerPage: 10
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setCategory: (state, action) => {
      state.selectedCategory = action.payload;
      state.currentPage = 1; // Reset pagination when changing category
    },
    setSort: (state, action) => {
      const { sortBy, sortOrder } = action.payload;
      state.sortBy = sortBy;
      state.sortOrder = sortOrder;
    },
    setPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
      state.currentPage = 1; // Reset pagination when searching
    },
    setItemsPerPage: (state, action) => {
      state.itemsPerPage = action.payload;
      state.currentPage = 1;
    },
    resetFilters: (state) => {
      state.selectedCategory = null;
      state.searchQuery = '';
      state.currentPage = 1;
      state.sortBy = 'title';
      state.sortOrder = 'asc';
    }
  }
});

export const {
  setCategory,
  setSort,
  setPage,
  setSearchQuery,
  setItemsPerPage,
  resetFilters
} = productsSlice.actions;

export default productsSlice.reducer;

// Selectors
export const selectProductsFilters = (state) => state.products;
export const selectCurrentPage = (state) => state.products.currentPage;
export const selectSearchQuery = (state) => state.products.searchQuery;