import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  MenuItem,
  Grid,
  Card,
  CardMedia
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import { selectIsAdmin } from '../features/auth/authSlice';
import { useGetProductQuery, useUpdateProductMutation } from '../api/productsApi';

const EditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isAdmin = useSelector(selectIsAdmin);
  
  const { data: product, isLoading, error } = useGetProductQuery(id);
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    brand: '',
    discountPercentage: '',
    rating: ''
  });
  
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title || '',
        description: product.description || '',
        price: product.price || '',
        category: product.category || '',
        stock: product.stock || '',
        brand: product.brand || '',
        discountPercentage: product.discountPercentage || '',
        rating: product.rating || ''
      });
    }
  }, [product]);

  if (!isAdmin) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          You don't have permission to edit products. Admin access required.
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

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !product) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          {error?.data?.message || 'Product not found'}
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

  const categories = [
  'beauty',
  'fragrances', 
  'furniture',
  'groceries',
  'home-decoration',
  'kitchen-accessories',
  'laptops',
  'mens-shirts',
  'mens-shoes',
  'mens-watches',
  'mobile-accessories',
  'motorcycle',
  'skin-care',
  'smartphones',
  'sports-accessories',
  'sunglasses',
  'tablets',
  'tops',
  'vehicle',
  'womens-bags',
  'womens-dresses',
  'womens-jewellery',
  'womens-shoes',
  'womens-watches'
];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const updates = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        stock: parseInt(formData.stock),
        brand: formData.brand || undefined,
        discountPercentage: formData.discountPercentage ? parseFloat(formData.discountPercentage) : undefined,
        rating: formData.rating ? parseFloat(formData.rating) : undefined
      };

      await updateProduct({ id, ...updates }).unwrap();
      
      setMessage({
        type: 'success',
        text: 'Product updated successfully (simulated)'
      });
      
      // Перенаправляем через 2 секунды
      setTimeout(() => {
        navigate(`/products/${id}`);
      }, 2000);
      
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.data?.message || 'Failed to update product'
      });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(`/products/${id}`)}
        sx={{ mb: 3 }}
      >
        Back to Product
      </Button>
      
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Edit Product
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          <strong>Note:</strong> DummyJSON only simulates updates. Changes won't persist on the server.
        </Alert>
        
        {message.text && (
          <Alert severity={message.type} sx={{ mb: 3 }}>
            {message.text}
          </Alert>
        )}
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardMedia
                component="img"
                height="300"
                image={product.thumbnail || 'https://via.placeholder.com/400x300?text=Product+Image'}
                alt={product.title}
                sx={{ objectFit: 'contain', p: 2 }}
              />
            </Card>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Note: DummyJSON doesn't support image updates
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Product Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                margin="normal"
                required
              />
              
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                margin="normal"
                required
              />
              
              <TextField
                fullWidth
                label="Price ($)"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                margin="normal"
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
              
              <TextField
                select
                fullWidth
                label="Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                margin="normal"
                required
              >
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </MenuItem>
                ))}
              </TextField>
              
              <TextField
                fullWidth
                label="Stock Quantity"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                margin="normal"
                required
                inputProps={{ min: 0 }}
              />
              
              <TextField
                fullWidth
                label="Brand"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                margin="normal"
              />
              
              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </Button>
                
                <Button
                  variant="outlined"
                  onClick={() => navigate(`/products/${id}`)}
                >
                  Cancel
                </Button>
              </Box>
            </form>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default EditProductPage;