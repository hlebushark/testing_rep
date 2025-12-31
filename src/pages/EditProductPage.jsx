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
  Snackbar
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import { selectIsAdmin } from '../features/auth/authSlice';
import { 
  useGetProductQuery, 
  useUpdateProductMutation, 
  useCreateProductMutation 
} from '../api/productsApi';

const EditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isAdmin = useSelector(selectIsAdmin);
  const isNew = id === 'new';
  
  const isLocalProduct = id && id.toString().startsWith('local_');
  const isApiProduct = !isNew && !isLocalProduct;
  
  const { data: apiProduct, isLoading: apiLoading, error: apiError } = 
    useGetProductQuery(isApiProduct ? id : null);
  
  const [updateApiProduct, { isLoading: isUpdatingApi }] = useUpdateProductMutation();
  const [createApiProduct, { isLoading: isCreatingApi }] = useCreateProductMutation();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    brand: '',
    discountPercentage: '',
    rating: '',
    thumbnail: ''
  });
  
  const [localProduct, setLocalProduct] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [newProductId, setNewProductId] = useState(null);

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

  // Load
  useEffect(() => {
    if (isLocalProduct) {
      // Load localStorage products 
      const localProducts = JSON.parse(localStorage.getItem('local_products') || '[]');
      const product = localProducts.find(p => p.id === id);
      if (product) {
        setLocalProduct(product);
        setFormData({
          title: product.title || '',
          description: product.description || '',
          price: product.price || '',
          category: product.category || '',
          stock: product.stock || '',
          brand: product.brand || '',
          discountPercentage: product.discountPercentage || '',
          rating: product.rating || '',
          thumbnail: product.thumbnail || ''
        });
      }
    } else if (apiProduct && isApiProduct) {
      // Load API products
      setFormData({
        title: apiProduct.title || '',
        description: apiProduct.description || '',
        price: apiProduct.price || '',
        category: apiProduct.category || '',
        stock: apiProduct.stock || '',
        brand: apiProduct.brand || '',
        discountPercentage: apiProduct.discountPercentage || '',
        rating: apiProduct.rating || '',
        thumbnail: apiProduct.thumbnail || ''
      });
    }
  }, [apiProduct, id, isNew, isLocalProduct, isApiProduct]);

  if (!isAdmin) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          Admin access required.
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const productData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price) || 0,
        category: formData.category,
        stock: parseInt(formData.stock) || 0,
        brand: formData.brand || '',
        discountPercentage: formData.discountPercentage ? parseFloat(formData.discountPercentage) : 0,
        rating: formData.rating ? parseFloat(formData.rating) : 0,
        thumbnail: formData.thumbnail || 'https://placehold.co/300x200/FFFFFF/CCCCCC?text=Product+Image'
      };

      if (isNew) {
        // ========== Create new product ==========
        const newProductId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newProduct = {
          ...productData,
          id: newProductId,
          isLocal: true,
          createdAt: new Date().toISOString()
        };

        // Save local
        const localProducts = JSON.parse(localStorage.getItem('local_products') || '[]');
        localProducts.push(newProduct);
        localStorage.setItem('local_products', JSON.stringify(localProducts));
        
        setNewProductId(newProductId);

        // Respond to API (simulation)
        try {
          await createApiProduct(productData).unwrap();
        } catch (apiError) {
          console.log('API creation failed, keeping local copy');
        }

        setMessage({
          type: 'success',
          text: 'Product created successfully!'
        });
        
        setSnackbarOpen(true);
        
        setTimeout(() => {
          navigate(`/products/${newProductId}`);
        }, 1500);
        
      } else if (isLocalProduct) {
        // ========== Edit local product ==========
        const updatedProduct = {
          ...localProduct,
          ...productData,
          updatedAt: new Date().toISOString()
        };

        // Update to localStorage
        const localProducts = JSON.parse(localStorage.getItem('local_products') || '[]');
        const updatedProducts = localProducts.map(p => 
          p.id === id ? updatedProduct : p
        );
        localStorage.setItem('local_products', JSON.stringify(updatedProducts));
        
        setMessage({
          type: 'success',
          text: 'Local product updated successfully!'
        });
        
        setSnackbarOpen(true);
        
        setTimeout(() => {
          navigate(`/products/${id}`);
        }, 1500);
        
      } else if (isApiProduct) {
        // ========== Edit API product ==========
        // 1. Create local copy with updates
        const updatedLocalProduct = {
          ...productData,
          id: `local_${id}`, // New copy ID
          originalApiId: id, // API ID
          isLocal: true,
          isEditedApiProduct: true,
          originalUpdatedAt: apiProduct.updatedAt,
          updatedAt: new Date().toISOString()
        };

        // 2. Get local products
        const localProducts = JSON.parse(localStorage.getItem('local_products') || '[]');
        
        // 3. Delete old copy
        const filteredProducts = localProducts.filter(p => 
          !(p.originalApiId === id || p.id === `local_${id}`)
        );
        
        // 4. Add new version
        filteredProducts.push(updatedLocalProduct);
        localStorage.setItem('local_products', JSON.stringify(filteredProducts));
        
        // 5. API update (simulation)
        try {
          await updateApiProduct({ id, ...productData }).unwrap();
        } catch (apiError) {
          console.log('API update failed, keeping local copy');
        }

        setNewProductId(updatedLocalProduct.id);
        
        setMessage({
          type: 'success',
          text: 'API product edited and saved locally! The original API product remains unchanged.'
        });
        
        setSnackbarOpen(true);
        
        // 6. New local copy
        setTimeout(() => {
          navigate(`/products/${updatedLocalProduct.id}`);
        }, 1500);
      }
      
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.data?.message || `Failed to ${isNew ? 'create' : 'update'} product`
      });
      setSnackbarOpen(true);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Delete this product? ${isLocalProduct ? '(Local product will be removed)' : '(Simulation)'}`)) {
      try {
        if (isLocalProduct) {
          const localProducts = JSON.parse(localStorage.getItem('local_products') || '[]');
          const updatedProducts = localProducts.filter(p => p.id !== id);
          localStorage.setItem('local_products', JSON.stringify(updatedProducts));
          
          setMessage({
            type: 'success',
            text: 'Local product deleted!'
          });
          
          setSnackbarOpen(true);
          setTimeout(() => navigate('/products'), 1000);
          
        } else if (isApiProduct) {
          const localProducts = JSON.parse(localStorage.getItem('local_products') || '[]');
          const updatedProducts = localProducts.filter(p => 
            !(p.originalApiId === id || p.id === `local_${id}`)
          );
          localStorage.setItem('local_products', JSON.stringify(updatedProducts));
          
          setMessage({
            type: 'success',
            text: 'Local copies of this API product removed. Original API product remains.'
          });
          
          setSnackbarOpen(true);
          setTimeout(() => navigate('/products'), 1000);
        }
        
      } catch (error) {
        setMessage({
          type: 'error',
          text: 'Failed to delete product'
        });
        setSnackbarOpen(true);
      }
    }
  };

  if (apiLoading && isApiProduct) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (apiError && isApiProduct) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          {apiError?.data?.message || 'API Product not found'}
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

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => {
          if (isNew) {
            navigate('/products');
          } else if (isLocalProduct) {
            navigate(`/products/${id}`);
          } else if (isApiProduct) {
            navigate(`/products/${id}`);
          }
        }}
        sx={{ mb: 3 }}
      >
        Back to {isNew ? 'Products' : 'Product'}
      </Button>
      
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            {isNew ? 'Create New Product' : 'Edit Product'}
            {isApiProduct && ' (API Product)'}
            {isLocalProduct && ' (Local Product)'}
          </Typography>
          
          {!isNew && (
            <Button
              variant="outlined"
              color="error"
              onClick={handleDelete}
            >
              Delete
            </Button>
          )}
        </Box>
        
        <Alert 
          severity={isLocalProduct ? "warning" : isApiProduct ? "info" : "success"} 
          sx={{ mb: 3 }}
        >
          {isLocalProduct ? (
            <strong>Editing local product:</strong> 
          ) : isApiProduct ? (
            <strong>Editing API product:</strong>
          ) : (
            <strong>Creating new product:</strong>
          )}
          
          {isLocalProduct 
            ? ' Changes will be saved only in your browser.'
            : isApiProduct
            ? ' Changes will create a local copy. The original API product remains unchanged.'
            : ' Product will be saved locally in your browser.'
          }
        </Alert>
        
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
            <MenuItem value="">Select Category</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat.split('-').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
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
            label="Brand (Optional)"
            value={formData.brand}
            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            margin="normal"
          />
          
          <TextField
            fullWidth
            label="Discount % (Optional)"
            type="number"
            value={formData.discountPercentage}
            onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
            margin="normal"
            inputProps={{ min: 0, max: 100, step: 0.1 }}
          />
          
          <TextField
            fullWidth
            label="Rating (0-5, Optional)"
            type="number"
            value={formData.rating}
            onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
            margin="normal"
            inputProps={{ min: 0, max: 5, step: 0.1 }}
          />
          
          <TextField
            fullWidth
            label="Image URL (Optional)"
            value={formData.thumbnail}
            onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
            margin="normal"
            placeholder="https://example.com/image.jpg"
            helperText="Leave empty for default placeholder"
          />
          
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={isUpdatingApi || isCreatingApi}
            >
              {isUpdatingApi || isCreatingApi ? 'Saving...' : 
               isNew ? 'Create Product' : 
               isApiProduct ? 'Save as Local Copy' : 'Save Changes'}
            </Button>
            
            <Button
              variant="outlined"
              onClick={() => {
                if (isNew) {
                  navigate('/products');
                } else {
                  navigate(`/products/${id}`);
                }
              }}
            >
              Cancel
            </Button>
          </Box>
        </form>
      </Paper>

      {/* Notification snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={message.type || 'info'}
          sx={{ width: '100%' }}
        >
          {message.text}
          {newProductId && (
            <Box sx={{ mt: 1, fontSize: '0.9em' }}>
              Redirecting to product details...
            </Box>
          )}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default EditProductPage;