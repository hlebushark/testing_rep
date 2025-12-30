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
import { deleteProduct } from '../../utils/productUtils';

// Локальная заглушка для изображения (Base64 или локальный путь)
const DEFAULT_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRkZGRkZGIiBzdHJva2U9IiNFRUVFRUUiIHN0cm9rZS13aWR0aD0iMiIvPgo8dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5OTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gSW1hZ2U8L3RleHQ+Cjx0ZXh0IHg9IjUwJSIgeT0iNjAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiNDQ0NDQ0MiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Qcm9kdWN0IFByZXZpZXc8L3RleHQ+Cjwvc3ZnPgo=';

// Альтернативно, можно использовать этот URL (работающий placeholder):
const PLACEHOLDER_IMAGE = 'https://placehold.co/300x200/FFFFFF/CCCCCC?text=No+Image';

const ProductCard = ({ product, onEdit, onDelete }) => {
  const isAdmin = useSelector(selectIsAdmin);
  const [deleteApiProduct] = useDeleteProductMutation();

  const handleDelete = async () => {
    if (window.confirm(`Delete "${product.title}"?`)) {
      const result = await deleteProduct(
        product.id, 
        deleteApiProduct,
        () => {
          if (onDelete) onDelete();
        }
      );
      
      if (!result.success) {
        alert('Failed to delete product');
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