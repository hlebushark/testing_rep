import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  IconButton,
  Tooltip,
  Snackbar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { selectIsAdmin } from '../../features/auth/authSlice';
import { 
  useCreateProductMutation, 
  useUpdateProductMutation, 
  useDeleteProductMutation 
} from '../../api/productsApi';

const ProductCRUD = ({ product, onSuccess }) => {
  const isAdmin = useSelector(selectIsAdmin);
  const [openDialog, setOpenDialog] = useState(false);
  const [mode, setMode] = useState('create'); // 'create' или 'edit'
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  
  const [formData, setFormData] = useState({
    title: product?.title || '',
    description: product?.description || '',
    price: product?.price || '',
    category: product?.category || '',
    stock: product?.stock || '',
    brand: product?.brand || '',
    discountPercentage: product?.discountPercentage || '',
    rating: product?.rating || ''
  });

  if (!isAdmin) return null;

  const handleOpenCreate = () => {
    setMode('create');
    setFormData({
      title: '',
      description: '',
      price: '',
      category: '',
      stock: '',
      brand: '',
      discountPercentage: '',
      rating: ''
    });
    setOpenDialog(true);
  };

  const handleOpenEdit = () => {
    setMode('edit');
    setFormData({
      title: product.title,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
      brand: product.brand || '',
      discountPercentage: product.discountPercentage || '',
      rating: product.rating || ''
    });
    setOpenDialog(true);
  };

  const handleDelete = async () => {
    if (window.confirm(`Delete product "${product.title}"? This is only a simulation.`)) {
      try {
        await deleteProduct(product.id).unwrap();
        setSnackbar({
          open: true,
          message: 'Product deleted (simulation)',
          severity: 'success'
        });
        if (onSuccess) onSuccess();
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'Error deleting product',
          severity: 'error'
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const productData = {
      title: formData.title,
      description: formData.description,
      price: parseFloat(formData.price),
      category: formData.category,
      stock: parseInt(formData.stock),
      brand: formData.brand || undefined,
      discountPercentage: formData.discountPercentage ? parseFloat(formData.discountPercentage) : undefined,
      rating: formData.rating ? parseFloat(formData.rating) : undefined
    };

    try {
      if (mode === 'create') {
        await createProduct(productData).unwrap();
        setSnackbar({
          open: true,
          message: 'Product created (simulation)',
          severity: 'success'
        });
      } else {
        await updateProduct({ id: product.id, ...productData }).unwrap();
        setSnackbar({
          open: true,
          message: 'Product updated (simulation)',
          severity: 'success'
        });
      }
      
      setOpenDialog(false);
      if (onSuccess) onSuccess();
      
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Error: ${error.data?.message || 'Unknown error'}`,
        severity: 'error'
      });
    }
  };

  const categories = [
    'smartphones', 'laptops', 'fragrances', 'skincare', 'groceries',
    'home-decoration', 'furniture', 'tops', 'womens-dresses', 'womens-shoes',
    'mens-shirts', 'mens-shoes', 'mens-watches', 'womens-watches',
    'womens-bags', 'womens-jewellery', 'sunglasses', 'automotive', 'motorcycle'
  ];

  return (
    <>
      {/* Кнопки действий */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
        >
          Add Product
        </Button>
        
        {product && (
          <>
            <Tooltip title="Edit">
              <IconButton color="primary" onClick={handleOpenEdit}>
                <EditIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Delete">
              <IconButton color="error" onClick={handleDelete} disabled={isDeleting}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Box>

      {/* Диалог создания/редактирования */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {mode === 'create' ? 'Create New Product' : 'Edit Product'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Alert severity="info" sx={{ mb: 2 }}>
              DummyJSON API only simulates CRUD operations. Changes are not saved on the server.
            </Alert>
            
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
              rows={3}
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
              inputProps={{ min: 0, max: 100, step: 0.01 }}
            />
          </DialogContent>
          
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button 
              type="submit" 
              variant="contained"
              disabled={isCreating || isUpdating}
            >
              {isCreating || isUpdating ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Снэкбар уведомлений */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ProductCRUD;