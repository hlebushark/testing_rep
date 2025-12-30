import React, { useState, useEffect } from 'react';
import {
  Grid,
  TextField,
  Pagination,
  Box,
  CircularProgress,
  Alert,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Paper
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useGetProductsQuery, useGetCategoriesQuery } from '../../api/productsApi';
import ProductCard from './ProductCard';

const ProductList = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [order, setOrder] = useState('asc');
  
  const limit = 9;
  
  // Search debounce (so as not to make a request for any keystroke)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Drop to the first page when searching
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Request products with all filters in mind
  const { data, isLoading, error, refetch } = useGetProductsQuery({
    limit,
    skip: (page - 1) * limit,
    search: debouncedSearch,
    category,
    sortBy,
    order
  });

  const { data: categoriesData } = useGetCategoriesQuery();

  // Handlers
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setCategory('');
    setSortBy('title');
    setOrder('asc');
    setPage(1);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setDebouncedSearch(searchTerm);
    setPage(1);
  };

  if (isLoading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />;
  if (error) {
    console.error('Error loading products:', error);
    return <Alert severity="error">Error loading products: {error.message}</Alert>;
  }

  const totalPages = Math.ceil((data?.total || 0) / limit);
  const hasFilters = searchTerm || category || sortBy !== 'title' || order !== 'asc';

  return (
    <Box>
      {/* Search and filter panel */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Box component="form" onSubmit={handleSearchSubmit} sx={{ mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Search products..."
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Type product name, description..."
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={category}
                  label="Category"
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setPage(1);
                  }}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categoriesData?.map((cat) => (
                    <MenuItem key={cat.slug} value={cat.slug}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  label="Sort By"
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <MenuItem value="title">Title</MenuItem>
                  <MenuItem value="price">Price</MenuItem>
                  <MenuItem value="rating">Rating</MenuItem>
                  <MenuItem value="stock">Stock</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={1}>
              <FormControl fullWidth>
                <InputLabel>Order</InputLabel>
                <Select
                  value={order}
                  label="Order"
                  onChange={(e) => setOrder(e.target.value)}
                >
                  <MenuItem value="asc">Asc</MenuItem>
                  <MenuItem value="desc">Desc</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={1}>
              <Button
                fullWidth
                variant="contained"
                type="submit"
                startIcon={<SearchIcon />}
              >
                Search
              </Button>
            </Grid>
          </Grid>
        </Box>
        
        {hasFilters && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Showing {data?.products?.length || 0} of {data?.total || 0} products
              {debouncedSearch && ` for "${debouncedSearch}"`}
              {category && ` in ${category}`}
            </Typography>
            
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={handleClearFilters}
              size="small"
            >
              Clear Filters
            </Button>
          </Box>
        )}
      </Paper>

      {/* Search results */}
      {data?.products?.length === 0 ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          No products found. Try a different search term or category.
        </Alert>
      ) : (
        <>
          <Grid container spacing={3}>
            {data?.products?.map((product) => (
              <Grid item xs={12} sm={6} md={4} key={product.id}>
                <ProductCard product={product} />
              </Grid>
            ))}
          </Grid>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      )}
      
      {/* Update button */}
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Button 
          variant="outlined" 
          onClick={refetch}
          size="small"
        >
          Refresh Data
        </Button>
      </Box>
    </Box>
  );
};

export default ProductList;