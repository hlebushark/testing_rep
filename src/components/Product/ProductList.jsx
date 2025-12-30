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
  Paper,
  Chip,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloudIcon from '@mui/icons-material/Cloud';
import StorageIcon from '@mui/icons-material/Storage';
import AllInboxIcon from '@mui/icons-material/AllInbox';
import { useGetProductsQuery, useGetCategoriesQuery } from '../../api/productsApi';
import ProductCard from './ProductCard';
import { useSelector } from 'react-redux';
import { selectIsAdmin } from '../../features/auth/authSlice';

const ProductList = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [order, setOrder] = useState('asc');
  const [productType, setProductType] = useState('all'); // 'all', 'api', 'local'
  const [localProducts, setLocalProducts] = useState([]);
  const isAdmin = useSelector(selectIsAdmin);
  
  const limit = 9;
  
  // Load local products
  useEffect(() => {
    const loadLocalProducts = () => {
      try {
        const storedProducts = localStorage.getItem('local_products');
        if (storedProducts) {
          const parsed = JSON.parse(storedProducts);
          setLocalProducts(parsed);
        }
      } catch (error) {
        console.error('Error loading local products:', error);
      }
    };
    
    loadLocalProducts();
    
    const handleStorageChange = (e) => {
      if (e.key === 'local_products') {
        loadLocalProducts();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Products Query
  const { data: apiData, isLoading, error, refetch } = useGetProductsQuery({
    limit: 100, 
    skip: 0,
    search: debouncedSearch,
    category: productType === 'api' ? category : '', 
    sortBy,
    order
  });

  const { data: categoriesData } = useGetCategoriesQuery();

  // Filter
  const getFilteredProducts = () => {
    let allProducts = [];
    
    if (apiData?.products) {
      const apiProducts = apiData.products.map(product => ({
        ...product,
        source: 'api',
        isLocal: false
      }));
      allProducts = [...allProducts, ...apiProducts];
    }
    
    if (localProducts.length > 0) {
      const filteredLocal = localProducts.filter(product => {
        // Find local
        if (searchTerm && !product.title?.toLowerCase().includes(searchTerm.toLowerCase()) && 
            !product.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false;
        }
        if (category && product.category !== category) {
          return false;
        }
        return true;
      });
      
      const localWithSource = filteredLocal.map(product => ({
        ...product,
        source: 'local',
        isLocal: true
      }));
      
      allProducts = [...allProducts, ...localWithSource];
    }
    
    // Type filter
    if (productType === 'api') {
      allProducts = allProducts.filter(p => p.source === 'api');
    } else if (productType === 'local') {
      allProducts = allProducts.filter(p => p.source === 'local');
    }
    
    // Sort
    allProducts.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'title') {
        aValue = aValue?.toLowerCase() || '';
        bValue = bValue?.toLowerCase() || '';
      }
      
      if (order === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    return allProducts;
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setDebouncedSearch(searchTerm);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setCategory('');
    setSortBy('title');
    setOrder('asc');
    setProductType('all');
    setPage(1);
  };

  const handleRefresh = () => {
    refetch();
    const storedProducts = localStorage.getItem('local_products');
    if (storedProducts) {
      setLocalProducts(JSON.parse(storedProducts));
    }
  };

  const handleClearLocalProducts = () => {
    if (window.confirm('Delete all local products?')) {
      localStorage.removeItem('local_products');
      setLocalProducts([]);
      alert('Local products cleared!');
      setTimeout(() => window.location.reload(), 500);
    }
  };

  if (isLoading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />;
  if (error) {
    console.error('Error loading products:', error);
    return <Alert severity="error">Error loading products: {error.message}</Alert>;
  }

  const allProducts = getFilteredProducts();
  const totalProducts = allProducts.length;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedProducts = allProducts.slice(startIndex, endIndex);
  const totalPages = Math.ceil(totalProducts / limit);

  const apiCount = apiData?.products?.length || 0;
  const localCount = localProducts.length;
  const hasFilters = searchTerm || category || sortBy !== 'title' || order !== 'asc' || productType !== 'all';

  return (
    <Box>
      {/* Statistics */}
      <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Chip 
              icon={<CloudIcon />} 
              label={`API: ${apiCount}`} 
              color="primary" 
              variant={productType === 'api' ? 'filled' : 'outlined'}
            />
            <Chip 
              icon={<StorageIcon />} 
              label={`Local: ${localCount}`} 
              color="warning" 
              variant={productType === 'local' ? 'filled' : 'outlined'}
            />
            <Chip 
              icon={<AllInboxIcon />} 
              label={`Total: ${totalProducts}`} 
              color="success" 
              variant="outlined"
            />
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleRefresh}
            >
              Refresh
            </Button>
            {localCount > 0 && isAdmin && (
              <Button
                variant="outlined"
                color="warning"
                size="small"
                onClick={handleClearLocalProducts}
              >
                Clear Local
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Filter panel */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Box component="form" onSubmit={handleSearchSubmit}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type product name, description..."
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
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
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(1);
                  }}
                >
                  <MenuItem value="title">Title</MenuItem>
                  <MenuItem value="price">Price</MenuItem>
                  <MenuItem value="rating">Rating</MenuItem>
                  <MenuItem value="stock">Stock</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Order</InputLabel>
                <Select
                  value={order}
                  label="Order"
                  onChange={(e) => {
                    setOrder(e.target.value);
                    setPage(1);
                  }}
                >
                  <MenuItem value="asc">Ascending</MenuItem>
                  <MenuItem value="desc">Descending</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={1}>
              <Button
                fullWidth
                variant="contained"
                type="submit"
                sx={{ height: '56px' }}
              >
                <SearchIcon />
              </Button>
            </Grid>
          </Grid>
          
          {/* Product type filter */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Filter by Source:
            </Typography>
            <ToggleButtonGroup
              value={productType}
              exclusive
              onChange={(e, newValue) => {
                if (newValue !== null) {
                  setProductType(newValue);
                  setPage(1);
                }
              }}
              aria-label="product source filter"
              size="small"
              fullWidth
            >
              <ToggleButton value="all" aria-label="all products">
                <AllInboxIcon sx={{ mr: 1 }} />
                All Products
              </ToggleButton>
              <ToggleButton value="api" aria-label="api products">
                <CloudIcon sx={{ mr: 1 }} />
                DummyJSON API
              </ToggleButton>
              <ToggleButton value="local" aria-label="local products">
                <StorageIcon sx={{ mr: 1 }} />
                Local Products
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
          
          {hasFilters && (
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Showing {paginatedProducts.length} of {totalProducts} products
                  {searchTerm && ` for "${searchTerm}"`}
                  {category && ` in ${category}`}
                  {productType === 'api' && ' (API only)'}
                  {productType === 'local' && ' (Local only)'}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<FilterListIcon />}
                  onClick={handleClearFilters}
                  size="small"
                >
                  Clear Filters
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Results */}
      {paginatedProducts.length === 0 ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          No products found. {productType === 'local' && localCount === 0 && 'You have no local products.'}
          Try changing filters or search term.
        </Alert>
      ) : (
        <>
          <Grid container spacing={3}>
            {paginatedProducts.map((product) => (
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
    </Box>
  );
};

export default ProductList;