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
  
  // Для API продуктов
  const { data: apiProduct, isLoading: apiLoading, error: apiError } = 
    useGetProductQuery(isNew || isLocalProduct ? null : id);
  
  const [updateApiProduct, { isLoading: isUpdatingApi }] = useUpdateProductMutation();
  const [createApiProduct, { isLoading: isCreatingApi }] = useCreateProductMutation();
  
  // Состояние
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
  const [createdProductId, setCreatedProductId] = useState(null);

  // Категории
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

  // Загрузка данных
  useEffect(() => {
    if (isLocalProduct) {
      // Загружаем локальный продукт из localStorage
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
    } else if (apiProduct && !isNew) {
      // Загружаем API продукт
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
  }, [apiProduct, id, isNew, isLocalProduct]);

  // Если не админ
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

      let savedProductId = id;

      if (isNew) {
        // СОЗДАНИЕ нового продукта
        const newProduct = {
          ...productData,
          id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          isLocal: true,
          createdAt: new Date().toISOString()
        };

        // Сохраняем локально
        const localProducts = JSON.parse(localStorage.getItem('local_products') || '[]');
        localProducts.push(newProduct);
        localStorage.setItem('local_products', JSON.stringify(localProducts));
        
        savedProductId = newProduct.id;
        setCreatedProductId(savedProductId);

        // Пытаемся отправить на API (симуляция)
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
        
        // После показа уведомления переходим к продукту
        setTimeout(() => {
          navigate(`/products/${savedProductId}`);
        }, 1500);
        
      } else if (isLocalProduct) {
        // РЕДАКТИРОВАНИЕ локального продукта
        const updatedProduct = {
          ...localProduct,
          ...productData,
          updatedAt: new Date().toISOString()
        };

        // Обновляем в localStorage
        const localProducts = JSON.parse(localStorage.getItem('local_products') || '[]');
        const updatedProducts = localProducts.map(p => 
          p.id === id ? updatedProduct : p
        );
        localStorage.setItem('local_products', JSON.stringify(updatedProducts));
        
        setMessage({
          type: 'success',
          text: 'Product updated successfully!'
        });
        
        setSnackbarOpen(true);
        
        // После показа уведомления переходим к продукту
        setTimeout(() => {
          navigate(`/products/${id}`);
        }, 1500);
        
      } else {
        // РЕДАКТИРОВАНИЕ API продукта
        await updateApiProduct({ id, ...productData }).unwrap();
        
        // Также сохраняем локальную копию
        const apiProductCopy = {
          ...apiProduct,
          ...productData,
          isLocal: false
        };
        
        const localProducts = JSON.parse(localStorage.getItem('local_products') || '[]');
        const existingIndex = localProducts.findIndex(p => p.id === id);
        
        if (existingIndex >= 0) {
          localProducts[existingIndex] = apiProductCopy;
        } else {
          localProducts.push(apiProductCopy);
        }
        
        localStorage.setItem('local_products', JSON.stringify(localProducts));
        
        setMessage({
          type: 'success',
          text: 'Product updated successfully!'
        });
        
        setSnackbarOpen(true);
        
        // После показа уведомления переходим к продукту
        setTimeout(() => {
          navigate(`/products/${id}`);
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
          // Удаляем локальный продукт
          const localProducts = JSON.parse(localStorage.getItem('local_products') || '[]');
          const updatedProducts = localProducts.filter(p => p.id !== id);
          localStorage.setItem('local_products', JSON.stringify(updatedProducts));
          
          setMessage({
            type: 'success',
            text: 'Product deleted successfully!'
          });
          
          setSnackbarOpen(true);
          setTimeout(() => navigate('/products'), 1000);
          
        } else {
          // Удаляем через API (симуляция)
          setMessage({
            type: 'success',
            text: 'Product deletion simulated'
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

  if (apiLoading && !isNew && !isLocalProduct) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (apiError && !isNew && !isLocalProduct) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          {apiError?.data?.message || 'Product not found'}
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
        onClick={() => isNew ? navigate('/products') : navigate(`/products/${id}`)}
        sx={{ mb: 3 }}
      >
        Back to {isNew ? 'Products' : 'Product'}
      </Button>
      
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            {isNew ? 'Create New Product' : 'Edit Product'}
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
          severity={isLocalProduct ? "warning" : "info"} 
          sx={{ mb: 3 }}
        >
          {isLocalProduct ? (
            <strong>Editing local product:</strong> 
          ) : (
            <strong>Note:</strong>
          )}
          {isLocalProduct 
            ? ' Changes will be saved only in your browser.'
            : ' DummyJSON only simulates updates. Changes will be saved locally in your browser.'
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
              {isUpdatingApi || isCreatingApi ? 'Saving...' : (isNew ? 'Create Product' : 'Save Changes')}
            </Button>
            
            <Button
              variant="outlined"
              onClick={() => isNew ? navigate('/products') : navigate(`/products/${id}`)}
            >
              Cancel
            </Button>
          </Box>
        </form>
      </Paper>

      {/* Снэкбар для уведомлений */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={message.type || 'info'}
          sx={{ width: '100%' }}
        >
          {message.text}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default EditProductPage;