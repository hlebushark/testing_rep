import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { selectIsAdmin } from '../../features/auth/authSlice';
import { useDeleteProductMutation } from '../../api/productsApi';

// Альтернативно, можно использовать этот URL (работающий placeholder):
const PLACEHOLDER_IMAGE = 'https://placehold.co/300x200/FFFFFF/CCCCCC?text=No+Image';

const ProductCard = ({ product, onDelete }) => {
  const isAdmin = useSelector(selectIsAdmin);
  const [deleteApiProduct] = useDeleteProductMutation();

  // Проверяем тип продукта
  const isLocalProduct = product.id && product.id.toString().startsWith('local_');
  const isEditedApiProduct = product.isEditedApiProduct;

  const handleDelete = async () => {
    if (window.confirm(`Delete "${product.title}"?`)) {
      try {
        if (isLocalProduct) {
          // Удаляем локальный продукт из localStorage
          const localProducts = JSON.parse(localStorage.getItem('local_products') || '[]');
          const updatedProducts = localProducts.filter(p => p.id !== product.id);
          localStorage.setItem('local_products', JSON.stringify(updatedProducts));
          
          console.log('Local product deleted:', product.id);
        } else {
          // Удаляем через API (симуляция)
          await deleteApiProduct(product.id).unwrap();
          
          // Также удаляем локальную копию если есть
          const localProducts = JSON.parse(localStorage.getItem('local_products') || '[]');
          const updatedProducts = localProducts.filter(p => 
            !(p.originalApiId === product.id || p.id === `local_${product.id}`)
          );
          localStorage.setItem('local_products', JSON.stringify(updatedProducts));
        }
        
        // Вызываем колбэк для обновления UI
        if (onDelete) {
          onDelete();
        }
        
      } catch (error) {
        console.error('Delete error:', error);
        alert('Failed to delete product. Please try again.');
      }
    }
  };

  // Функция для безопасного получения изображения
  const getProductImage = () => {
    if (product.thumbnail && product.thumbnail.startsWith('http')) {
      return product.thumbnail;
    }
    if (product.image && product.image.startsWith('http')) {
      return product.image;
    }
    // Используем рабочий placeholder
    return PLACEHOLDER_IMAGE;
  };

  return (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      position: 'relative',
      transition: 'transform 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 6
      }
    }}>
      {isAdmin && (
        <Box sx={{ 
          position: 'absolute', 
          top: 8, 
          right: 8, 
          display: 'flex', 
          gap: 1,
          zIndex: 1
        }}>
          <Tooltip title="Edit">
            <IconButton 
              size="small" 
              component={Link}
              to={`/products/${product.id}/edit`}
              sx={{ 
                bgcolor: 'white',
                '&:hover': { bgcolor: 'primary.light', color: 'white' }
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Delete">
            <IconButton 
              size="small" 
              onClick={handleDelete}
              sx={{ 
                bgcolor: 'white',
                '&:hover': { bgcolor: 'error.light', color: 'white' }
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )}
      
      {/* Маркер типа продукта */}
      <Box sx={{ 
        position: 'absolute', 
        top: 8, 
        left: 8, 
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5
      }}>
        {isLocalProduct && !isEditedApiProduct && (
          <Chip 
            label="Local" 
            size="small" 
            color="warning" 
            sx={{ fontSize: '0.6rem', height: '20px' }}
          />
        )}
        
        {isEditedApiProduct && (
          <Chip 
            label="Edited API" 
            size="small" 
            color="info" 
            sx={{ fontSize: '0.6rem', height: '20px' }}
          />
        )}
        
        {product.originalApiId && (
          <Chip 
            label={`Original: #${product.originalApiId}`}
            size="small" 
            variant="outlined"
            sx={{ fontSize: '0.5rem', height: '16px' }}
          />
        )}
      </Box>
      
      <CardMedia
        component="img"
        height="200"
        image={getProductImage()}
        alt={product.title}
        sx={{ objectFit: 'cover' }}
        onError={(e) => {
          // Если изображение не загрузилось, заменяем на placeholder
          e.target.src = PLACEHOLDER_IMAGE;
        }}
      />
      
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="div" noWrap>
          {product.title || 'No Title'}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ 
          mb: 2,
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {product.description || 'No description'}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" color="primary">
            ${product.price || '0.00'}
            {product.discountPercentage > 0 && (
              <Typography component="span" variant="caption" color="error" sx={{ ml: 1 }}>
                -{product.discountPercentage}%
              </Typography>
            )}
          </Typography>
          {product.category && (
            <Chip 
              label={product.category} 
              size="small" 
              color="primary" 
              variant="outlined"
            />
          )}
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2">
            ⭐ {product.rating || '0'}
          </Typography>
          <Typography variant="body2" color={product.stock > 0 ? 'success.main' : 'error.main'}>
            Stock: {product.stock || 0}
          </Typography>
        </Box>
        
        {/* Дополнительная информация для отредактированных API продуктов */}
        {isEditedApiProduct && (
          <Box sx={{ mt: 1, pt: 1, borderTop: '1px dashed #e0e0e0' }}>
            <Typography variant="caption" color="text.secondary">
              📝 Edited locally from API product
            </Typography>
          </Box>
        )}
        
        {product.createdAt && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            Created: {new Date(product.createdAt).toLocaleDateString()}
          </Typography>
        )}
      </CardContent>
      
      <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
        <Button
          component={Link}
          to={`/products/${product.id}`}
          variant="outlined"
          fullWidth
        >
          View Details
        </Button>
        
        {isAdmin && (
          <Button
            variant="contained"
            component={Link}
            to={`/products/${product.id}/edit`}
            fullWidth
          >
            Edit
          </Button>
        )}
      </Box>
    </Card>
  );
};

export default ProductCard;