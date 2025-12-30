import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Alert,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Snackbar,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import { selectIsAdmin } from '../features/auth/authSlice';
import ProductList from '../components/Product/ProductList';
import { useCreateProductMutation } from '../api/productsApi';

const ProductsPage = () => {
  const isAdmin = useSelector(selectIsAdmin);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'info',
    productId: null 
  });
  const [isCreating, setIsCreating] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    brand: ''
  });
  
  const [createProduct] = useCreateProductMutation();

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

  const handleCreateProduct = async () => {
    setIsCreating(true);
    
    try {
      const productData = {
        title: newProduct.title.trim(),
        description: newProduct.description.trim(),
        price: parseFloat(newProduct.price) || 0,
        category: newProduct.category,
        stock: parseInt(newProduct.stock) || 0,
        brand: newProduct.brand?.trim() || '',
        discountPercentage: 0,
        rating: 0,
        thumbnail: 'https://placehold.co/300x200/FFFFFF/CCCCCC?text=New+Product'
      };

      // Check required
      if (!productData.title || !productData.description || !productData.category || productData.price <= 0) {
        throw new Error('Please fill all required fields with valid data');
      }

      // Create local product
      const localProductId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const localProduct = {
        ...productData,
        id: localProductId,
        isLocal: true,
        isNewlyCreated: true,
        createdAt: new Date().toISOString()
      };

      // Save to localStorage
      const localProducts = JSON.parse(localStorage.getItem('local_products') || '[]');
      localProducts.unshift(localProduct);
      localStorage.setItem('local_products', JSON.stringify(localProducts));

      // Try to create with API (simulation)
      try {
        await createProduct(productData).unwrap();
        console.log('API product creation simulated');
      } catch (apiError) {
        console.log('API simulation failed, but local product created');
      }

      setSnackbar({
        open: true,
        message: '✅ Product created successfully!',
        severity: 'success',
        productId: localProductId
      });
      
      setCreateDialogOpen(false);
      setNewProduct({
        title: '',
        description: '',
        price: '',
        category: '',
        stock: '',
        brand: ''
      });
      
      window.dispatchEvent(new Event('localProductsUpdated'));
      
    } catch (error) {
      console.error('Create product error:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to create product. Please check the form data.',
        severity: 'error',
        productId: null
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
    
    if (snackbar.severity === 'success' && snackbar.productId) {
        window.location.href = `/products/${snackbar.productId}`;
    }
  };

  const handleRefresh = () => {
    window.dispatchEvent(new Event('refreshProducts'));
  };

  return (
    <Box>
      {/* Header and buttons */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4">
            Products Catalog
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>            
            {isAdmin && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setCreateDialogOpen(true)}
              >
                Add Product
              </Button>
            )}
          </Box>
        </Box>
        
        {isAdmin && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <strong>Admin Panel:</strong> You can create, edit, and delete products. 
            Note: DummyJSON only simulates these operations. Products are saved locally.
          </Alert>
        )}
      </Paper>

      {/* Product list*/}
      <ProductList />

      {/* Create product dialogue */}
      <Dialog 
        open={createDialogOpen} 
        onClose={() => !isCreating && setCreateDialogOpen(false)}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>➕ Create New Product</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Product will be saved locally in your browser.
          </Alert>
          
          <TextField
            autoFocus
            margin="dense"
            label="Product Title *"
            fullWidth
            value={newProduct.title}
            onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
            required
            disabled={isCreating}
          />
          
          <TextField
            margin="dense"
            label="Description *"
            fullWidth
            multiline
            rows={3}
            value={newProduct.description}
            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
            required
            disabled={isCreating}
          />
          
          <TextField
            margin="dense"
            label="Price ($) *"
            type="number"
            fullWidth
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
            required
            inputProps={{ min: 0, step: 0.01 }}
            disabled={isCreating}
          />
          
          <TextField
            select
            margin="dense"
            label="Category *"
            fullWidth
            value={newProduct.category}
            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
            required
            disabled={isCreating}
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
            margin="dense"
            label="Stock Quantity *"
            type="number"
            fullWidth
            value={newProduct.stock}
            onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
            required
            inputProps={{ min: 0 }}
            disabled={isCreating}
          />
          
          <TextField
            margin="dense"
            label="Brand (Optional)"
            fullWidth
            value={newProduct.brand}
            onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
            disabled={isCreating}
          />
        </DialogContent>
        
        <DialogActions>
          <Button 
            onClick={() => setCreateDialogOpen(false)} 
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateProduct}
            variant="contained"
            disabled={isCreating || !newProduct.title || !newProduct.description || !newProduct.price || !newProduct.category || !newProduct.stock}
            startIcon={isCreating ? <CircularProgress size={20} /> : <AddIcon />}
          >
            {isCreating ? 'Creating...' : 'Create Product'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
          {snackbar.severity === 'success' && snackbar.productId && (
            <Box sx={{ mt: 0.5, fontSize: '0.9em' }}>
              Redirecting to product details...
            </Box>
          )}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductsPage;