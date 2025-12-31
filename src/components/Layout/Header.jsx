import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Snackbar,
  Alert,
  IconButton
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, selectCurrentUser, selectIsAdmin } from '../../features/auth/authSlice';
import RefreshIcon from '@mui/icons-material/Refresh';
import CreateIcon from '@mui/icons-material/Create';
import { useProducts } from '../../hooks/useProducts';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const isAdmin = useSelector(selectIsAdmin);
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    brand: ''
  });
  
  const { createProduct, isCreating } = useProducts();

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

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleCreateProduct = async () => {
    
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

      // Try to create using API (simulation)
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
      
      // Event to update products list
      window.dispatchEvent(new Event('localProductsUpdated'));
      
    } catch (error) {
      console.error('Create product error:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to create product. Please check the form data.',
        severity: 'error',
        productId: null
      });
    }
  };

  return (
    <>
      <AppBar position="fixed" sx={{zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'white' }}>
            Product Manager
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {user ? (
              <>
                <Button color="inherit" component={Link} to="/products">
                  Products
                </Button>
                
                {isAdmin && (
                  <>
                    <Button 
                      color="inherit" 
                      startIcon={<CreateIcon />}
                      onClick={() => setCreateDialogOpen(true)}
                      sx={{ minWidth: 'auto' }}
                    >
                      Add product
                    </Button>
                    
                    <Button 
                      color="inherit" 
                      startIcon={<RefreshIcon />}
                      onClick={handleRefresh}
                      sx={{ minWidth: 'auto' }}
                    >
                      REFRESH
                    </Button>
                  </>
                )}
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography sx={{ alignSelf: 'center' }}>
                    Hello, {user.firstName || user.username}!
                  </Typography>
                  
                  {isAdmin && (
                    <Chip 
                      label="Admin" 
                      size="small" 
                      color="secondary" 
                      sx={{ color: 'white', borderColor: 'white' }}
                      variant="outlined"
                    />
                  )}
                </Box>
                
                <Button color="inherit" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button color="inherit" component={Link} to="/login">
                  Login
                </Button>
                <Button color="inherit" component={Link} to="/register">
                  Register
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Create product dialogue */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Product</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            This is a simulation. The product won't be saved on DummyJSON server.
          </Alert>
          
          <TextField
            autoFocus
            margin="dense"
            label="Product Title"
            fullWidth
            value={newProduct.title}
            onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
            required
          />
          
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={newProduct.description}
            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
            required
          />
          
          <TextField
            margin="dense"
            label="Price ($)"
            type="number"
            fullWidth
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
            required
            inputProps={{ min: 0, step: 0.01 }}
          />
          
          <TextField
            select
            margin="dense"
            label="Category"
            fullWidth
            value={newProduct.category}
            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
            required
          >
            <MenuItem value="">Select Category</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </MenuItem>
            ))}
          </TextField>
          
          <TextField
            margin="dense"
            label="Stock Quantity"
            type="number"
            fullWidth
            value={newProduct.stock}
            onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
            required
            inputProps={{ min: 0 }}
          />
          
          <TextField
            margin="dense"
            label="Brand (Optional)"
            fullWidth
            value={newProduct.brand}
            onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
          />
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateProduct}
            variant="contained"
            disabled={isCreating || !newProduct.title || !newProduct.description || !newProduct.price || !newProduct.category || !newProduct.stock}
          >
            {isCreating ? 'Creating...' : 'Create Product'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Header;