import { useState, useEffect } from 'react';
import { 
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation
} from '../api/productsApi';
import {
  getLocalProducts,
  saveLocalProduct,
  deleteLocalProduct,
  generateLocalId
} from '../utils/localProductsStore';

export const useProducts = (options = {}) => {
  const {
    limit = 10,
    skip = 0,
    search = '',
    category = '',
    sortBy = 'title',
    order = 'asc',
    enableLocalProducts = true
  } = options;

  // RTK Query 
  const {
    data: apiData,
    isLoading: apiLoading,
    error: apiError,
    refetch
  } = useGetProductsQuery({
    limit,
    skip,
    search,
    category,
    sortBy,
    order
  });

  // Mutations
  const [createApiProduct, { isLoading: creatingApi }] = useCreateProductMutation();
  const [updateApiProduct, { isLoading: updatingApi }] = useUpdateProductMutation();
  const [deleteApiProduct, { isLoading: deletingApi }] = useDeleteProductMutation();

  // Local products
  const [localProducts, setLocalProducts] = useState([]);
  const [combinedData, setCombinedData] = useState(null);

  // Load local products
  useEffect(() => {
    if (enableLocalProducts) {
      setLocalProducts(getLocalProducts());
    }
  }, [enableLocalProducts]);

  // Unite API and local
  useEffect(() => {
    if (apiData || localProducts.length > 0) {
      let products = [...(apiData?.products || [])];
      
      if (enableLocalProducts && localProducts.length > 0) {
        const filteredLocal = localProducts.filter(product => {
          if (search && !product.title.toLowerCase().includes(search.toLowerCase()) && 
              !product.description.toLowerCase().includes(search.toLowerCase())) {
            return false;
          }
          if (category && product.category !== category) {
            return false;
          }
          return true;
        });
        
        products = [...filteredLocal, ...products];
      }

      // Sort
      products.sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];
        
        if (sortBy === 'title') {
          aValue = aValue?.toLowerCase() || '';
          bValue = bValue?.toLowerCase() || '';
        }
        
        if (order === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });

      // Pagination
      const paginatedProducts = products.slice(skip, skip + limit);
      
      setCombinedData({
        products: paginatedProducts,
        total: products.length,
        skip,
        limit,
        hasLocalProducts: localProducts.length > 0
      });
    }
  }, [apiData, localProducts, search, category, sortBy, order, skip, limit, enableLocalProducts]);

  //  Create
  const createProduct = async (productData) => {
    const newProduct = {
      ...productData,
      id: generateLocalId(),
      isLocal: true,
      createdAt: new Date().toISOString()
    };

    // Save local
    saveLocalProduct(newProduct);
    setLocalProducts(prev => [...prev, newProduct]);

    // Send to API (simulation)
    try {
      await createApiProduct(productData).unwrap();
    } catch (error) {
      console.log('API creation failed, keeping local copy:', error);
    }

    return newProduct;
  };

  // Update
  const updateProduct = async ({ id, ...updates }) => {
    const isLocal = id.toString().startsWith('local_');
    
    if (isLocal) {
      // Update local
      const updatedProduct = { 
        ...localProducts.find(p => p.id === id), 
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      saveLocalProduct(updatedProduct);
      setLocalProducts(prev => 
        prev.map(p => p.id === id ? updatedProduct : p)
      );
      
      return updatedProduct;
    } else {
      // Update with API + local
      const apiProduct = apiData?.products?.find(p => p.id === id);
      if (apiProduct) {
        const updatedProduct = { ...apiProduct, ...updates };
        saveLocalProduct({ ...updatedProduct, isLocal: false });
      }
      
      await updateApiProduct({ id, ...updates }).unwrap();
      await refetch();
    }
  };

  // Delete
  const deleteProduct = async (id) => {
    const isLocal = id.toString().startsWith('local_');
    
    if (isLocal) {
      // Local delete
      deleteLocalProduct(id);
      setLocalProducts(prev => prev.filter(p => p.id !== id));
    } else {
      // API delete
      await deleteApiProduct(id).unwrap();
      
      deleteLocalProduct(id);
      await refetch();
    }
  };

  return {
    data: combinedData,
    isLoading: apiLoading,
    error: apiError,
    isCreating: creatingApi,
    isUpdating: updatingApi,
    isDeleting: deletingApi,
    hasLocalProducts: localProducts.length > 0,
    localProductsCount: localProducts.length,
    createProduct,
    updateProduct,
    deleteProduct,
    refetch
  };
};