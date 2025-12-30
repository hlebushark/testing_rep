import React from 'react';
import { Box, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAdmin } from '../features/auth/authSlice';
import ProductList from '../components/Product/ProductList';

const ProductsPage = () => {
  const isAdmin = useSelector(selectIsAdmin);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <h1>Products</h1>
        {isAdmin && (
          <Button
            component={Link}
            to="/products/new"
            variant="contained"
            color="primary"
          >
            Add New Product
          </Button>
        )}
      </Box>
      <ProductList />
    </Box>
  );
};

export default ProductsPage;