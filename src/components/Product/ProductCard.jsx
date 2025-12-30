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

const ProductCard = ({ product, onEdit, onDelete }) => {
  const isAdmin = useSelector(selectIsAdmin);
  const [deleteProduct] = useDeleteProductMutation();

  const handleDelete = async () => {
    if (window.confirm(`Delete "${product.title}"? This is only a simulation.`)) {
      try {
        await deleteProduct(product.id).unwrap();
        if (onDelete) onDelete();
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
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
              onClick={() => onEdit && onEdit(product)}
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
        image={product.thumbnail || 'https://via.placeholder.com/300x200?text=No+Image'}
        alt={product.title}
        sx={{ objectFit: 'cover' }}
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