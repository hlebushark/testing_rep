import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
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
  Container,
  Paper
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { selectIsAdmin } from '../features/auth/authSlice';
import { useGetProductQuery, useDeleteProductMutation } from '../api/productsApi';
import { DEFAULT_IMAGES } from '../utils/constants';


const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isAdmin = useSelector(selectIsAdmin);
  
  const isLocalProduct = id && id.toString().startsWith('local_');
  
  const { data: apiProduct, isLoading: apiLoading, error: apiError } = 
    useGetProductQuery(isLocalProduct ? null : id);
  
  const [deleteApiProduct] = useDeleteProductMutation();
  const [localProduct, setLocalProduct] = useState(null);
  const [isLoadingLocal, setIsLoadingLocal] = useState(false);

  useEffect(() => {
    if (isLocalProduct) {
      setIsLoadingLocal(true);
      const localProducts = JSON.parse(localStorage.getItem('local_products') || '[]');
      const product = localProducts.find(p => p.id === id);
      setLocalProduct(product);
      setIsLoadingLocal(false);
    }
  }, [id, isLocalProduct]);

  const handleDelete = async () => {
    if (window.confirm(`Delete this product? ${isLocalProduct ? '(Local product will be removed)' : '(Simulation)'}`)) {
      try {
        if (isLocalProduct) {
          // delete local
          const localProducts = JSON.parse(localStorage.getItem('local_products') || '[]');
          const updatedProducts = localProducts.filter(p => p.id !== id);
          localStorage.setItem('local_products', JSON.stringify(updatedProducts));
          
          alert('Product deleted successfully!');
          navigate('/products');
        } else {
          // delete api (simulation)
          await deleteApiProduct(id).unwrap();
          alert('Product deletion simulated');
          navigate('/products');
        }
      } catch (error) {
        console.error('Delete error:', error);
        alert('Failed to delete product');
      }
    }
  };

  const product = isLocalProduct ? localProduct : apiProduct;
  const isLoading = isLocalProduct ? isLoadingLocal : apiLoading;
  const error = isLocalProduct ? null : apiError;

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || (isLocalProduct && !localProduct)) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 4 }}>
          {error?.message || 'Product not found'}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/products')}
          sx={{ mt: 2 }}
        >
          Back to Products
        </Button>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container maxWidth="md">
        <Alert severity="warning" sx={{ mt: 4 }}>
          Product not found
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/products')}
          sx={{ mt: 2 }}
        >
          Back to Products
        </Button>
      </Container>
    );
  }

  const PLACEHOLDER_IMAGE = DEFAULT_IMAGES.PRODUCT_DETAIL;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/products')}
        >
          Back to Products
        </Button>
        
        {isAdmin && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              startIcon={<EditIcon />}
              variant="contained"
              onClick={() => navigate(`/products/${id}/edit`)}
            >
              Edit
            </Button>
            <Button
              startIcon={<DeleteIcon />}
              variant="outlined"
              color="error"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </Box>
        )}
      </Box>
      
      {isLocalProduct && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <strong>Local Product:</strong> This product is saved only in your browser.
        </Alert>
      )}
      
      <Paper elevation={3} sx={{ p: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardMedia
                component="img"
                height="400"
                image={product.thumbnail || PLACEHOLDER_IMAGE}
                alt={product.title}
                sx={{ objectFit: 'contain', p: 2 }}
                onError={(e) => {
                  e.target.src = PLACEHOLDER_IMAGE;
                }}
              />
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h4" gutterBottom>
                {product.title}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Chip label={product.category} />
                {product.brand && (
                  <Chip label={`Brand: ${product.brand}`} variant="outlined" />
                )}
                {isLocalProduct && (
                  <Chip label="Local" color="warning" size="small" />
                )}
              </Box>
              
              <Typography variant="h3" color="primary" gutterBottom>
                ${product.price}
                {product.discountPercentage > 0 && (
                  <Typography component="span" variant="h6" color="error" sx={{ ml: 2 }}>
                    Save {product.discountPercentage}%
                  </Typography>
                )}
              </Typography>
              
              <Typography variant="body1" paragraph sx={{ mt: 2, whiteSpace: 'pre-line' }}>
                {product.description}
              </Typography>
            </Box>
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Rating
                  </Typography>
                  <Typography variant="h5">
                    {product.rating} ⭐
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Stock
                  </Typography>
                  <Typography 
                    variant="h5" 
                    color={product.stock > 0 ? 'success.main' : 'error.main'}
                  >
                    {product.stock} units
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
            
            <Button
              variant="contained"
              size="large"
              fullWidth
              disabled={product.stock === 0}
              sx={{ mt: 2 }}
            >
              {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default ProductDetailPage;