import { useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  MenuItem,
  CircularProgress,
  Alert
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import {
  useCreateProductMutation,
  useUpdateProductMutation
} from '../../api/productsApi';
import { PRODUCT_CATEGORIES } from '../../utils/constants';
import { useNavigate, useParams } from 'react-router-dom';

const validationSchema = yup.object({
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
  price: yup.number().positive().required('Price is required'),
  category: yup.string().required('Category is required'),
  stock: yup.number().integer().min(0).required('Stock is required')
});

const ProductForm = ({ product }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: categories } = PRODUCT_CATEGORIES;
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  const formik = useFormik({
    initialValues: {
      title: product?.title || '',
      description: product?.description || '',
      price: product?.price || '',
      category: product?.category || '',
      stock: product?.stock || '',
      brand: product?.brand || '',
      discountPercentage: product?.discountPercentage || '',
      rating: product?.rating || ''
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (id) {
          await updateProduct({ id, ...values }).unwrap();
        } else {
          await createProduct(values).unwrap();
        }
        navigate('/products');
      } catch (error) {
        console.error('Failed to save product:', error);
      }
    }
  });

  const isLoading = isCreating || isUpdating;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {id ? 'Edit Product' : 'Create New Product'}
      </Typography>
      
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              name="title"
              label="Product Title"
              value={formik.values.title}
              onChange={formik.handleChange}
              error={formik.touched.title && Boolean(formik.errors.title)}
              helperText={formik.touched.title && formik.errors.title}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              name="price"
              label="Price"
              type="number"
              value={formik.values.price}
              onChange={formik.handleChange}
              error={formik.touched.price && Boolean(formik.errors.price)}
              helperText={formik.touched.price && formik.errors.price}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              name="description"
              label="Description"
              value={formik.values.description}
              onChange={formik.handleChange}
              error={formik.touched.description && Boolean(formik.errors.description)}
              helperText={formik.touched.description && formik.errors.description}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              select
              fullWidth
              name="category"
              label="Category"
              value={formik.values.category}
              onChange={formik.handleChange}
              error={formik.touched.category && Boolean(formik.errors.category)}
              helperText={formik.touched.category && formik.errors.category}
            >
              {categories?.map((category) => (
                <MenuItem key={category.slug} value={category.slug}>
                  {category.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              name="stock"
              label="Stock Quantity"
              type="number"
              value={formik.values.stock}
              onChange={formik.handleChange}
              error={formik.touched.stock && Boolean(formik.errors.stock)}
              helperText={formik.touched.stock && formik.errors.stock}
            />
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Save Product'}
          </Button>
          
          <Button
            variant="outlined"
            onClick={() => navigate('/products')}
          >
            Cancel
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default ProductForm;