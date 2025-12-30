import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Rating
} from '@mui/material';
import { useSelector } from 'react-redux';
import { selectIsAdmin } from '../features/auth/authSlice';
import { useGetProductQuery, useDeleteProductMutation } from '../api/productsApi';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isAdmin = useSelector(selectIsAdmin);
  const { data: product, isLoading, error } = useGetProductQuery(id);
  const [deleteProduct] = useDeleteProductMutation();

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id).unwrap();
        navigate('/products');
      } catch (error) {
        console.error('Failed to delete product:', error);
      }
    }
  };

  if (isLoading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />;
  if (error) return <Alert severity="error">Error loading product</Alert>;
  if (!product) return <Alert severity="info">Product not found</Alert>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">{product.title}</Typography>
        
        {isAdmin && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate(`/products/${id}/edit`)}
            >
              Edit
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </Box>
        )}
      </Box>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardMedia
              component="img"
              height="400"
              image={product.thumbnail || '/placeholder.jpg'}
              alt={product.title}
            />
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" color="primary" gutterBottom>
              ${product.price}
              {product.discountPercentage > 0 && (
                <Typography component="span" sx={{ ml: 1, color: 'error.main' }}>
                  ({product.discountPercentage}% off)
                </Typography>
              )}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Rating value={product.rating} readOnly precision={0.1} />
              <Typography sx={{ ml: 1 }}>
                {product.rating} ({product.reviews?.length || 0} reviews)
              </Typography>
            </Box>
            
            <Chip label={product.category} sx={{ mb: 2 }} />
            
            <Typography variant="body1" paragraph>
              {product.description}
            </Typography>
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="subtitle2">Brand</Typography>
              <Typography>{product.brand}</Typography>
            </Grid>
            
            <Grid item xs={6}>
              <Typography variant="subtitle2">Stock</Typography>
              <Typography color={product.stock > 0 ? 'success.main' : 'error.main'}>
                {product.stock} units
              </Typography>
            </Grid>
            
            <Grid item xs={6}>
              <Typography variant="subtitle2">SKU</Typography>
              <Typography>{product.sku}</Typography>
            </Grid>
            
            <Grid item xs={6}>
              <Typography variant="subtitle2">Weight</Typography>
              <Typography>{product.weight} kg</Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      
      {product.reviews && product.reviews.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Reviews ({product.reviews.length})
          </Typography>
          
          {product.reviews.map((review, index) => (
            <Card key={index} sx={{ mb: 2, p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle1">
                  {review.reviewerName}
                </Typography>
                <Rating value={review.rating} readOnly size="small" />
              </Box>
              <Typography variant="body2" color="text.secondary">
                {review.comment}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(review.date).toLocaleDateString()}
              </Typography>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default ProductDetailPage;