import React, { useState, useEffect } from 'react';
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
  Snackbar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import { selectIsAdmin } from '../features/auth/authSlice';
import ProductList from '../components/Product/ProductList';
import { useCreateProductMutation } from '../api/productsApi';

const ProductsPage = () => {
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
  
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();

  const categories = [
    'smartphones', 'laptops', 'fragrances', 'skincare', 'groceries',
    'home-decoration', 'furniture', 'tops', 'womens-dresses', 'womens-shoes',
    'mens-shirts', 'mens-shoes', 'mens-watches', 'womens-watches',
    'womens-bags', 'womens-jewellery', 'sunglasses', 'automotive', 'motorcycle'
  ];

  const handleCreateProduct = async () => {
    try {
      const productData = {
        title: newProduct.title,
        description: newProduct.description,
        price: parseFloat(newProduct.price),
        category: newProduct.category,
        stock: parseInt(newProduct.stock),
        brand: newProduct.brand || undefined,
        discountPercentage: 0,
        rating: 0
      };

      await createProduct(productData).unwrap();
      
      setSnackbar({
        open: true,
        message: 'Product created (simulated)',
        severity: 'success'
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
      
      // Обновляем список через 1 секунду
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Error: ${error.data?.message || 'Failed to create product'}`,
        severity: 'error'
      });
    }
  };

  return (
    <Box>
      {/* Заголовок и кнопки админа */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4">
            Products
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => window.location.reload()}
            >
              Refresh
            </Button>
            
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
            Note: DummyJSON only simulates these operations.
          </Alert>
        )}
      </Paper>

      {/* Список продуктов */}
      <ProductList />

      {/* Диалог создания продукта */}
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

      {/* Снэкбар уведомлений */}
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
    </Box>
  );
};

export default ProductsPage;