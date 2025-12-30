import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Chip
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAdmin } from '../../features/auth/authSlice';
import { useDeleteProductMutation } from '../../api/productsApi';

const ProductCard = ({ product }) => {
  const isAdmin = useSelector(selectIsAdmin);
  const [deleteProduct] = useDeleteProductMutation();

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(product.id).unwrap();
      } catch (error) {
        console.error('Failed to delete product:', error);
      }
    }
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component="img"
        height="200"
        image={product.thumbnail || '/placeholder.jpg'}
        alt={product.title}
      />
      
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="div">
          {product.title}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {product.description?.substring(0, 100)}...
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" color="primary">
            ${product.price}
          </Typography>
          <Chip label={product.category} size="small" />
        </Box>
        
        <Typography variant="body2">
          Rating: {product.rating} ⭐
        </Typography>
        
        <Typography variant="body2">
          Stock: {product.stock}
        </Typography>
      </CardContent>
      
      <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
        <Button
          component={Link}
          to={`/products/${product.id}`}
          variant="outlined"
          size="small"
          fullWidth
        >
          View Details
        </Button>
        
        {isAdmin && (
          <>
            <Button
              component={Link}
              to={`/products/${product.id}/edit`}
              variant="contained"
              size="small"
              color="primary"
            >
              Edit
            </Button>
            
            <Button
              variant="contained"
              size="small"
              color="error"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </>
        )}
      </Box>
    </Card>
  );
};

export default ProductCard;