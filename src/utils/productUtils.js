import { 
  deleteLocalProduct,
  getLocalProducts
} from './localProductsStore';

// Delete product
export const deleteProduct = async (productId, deleteApiMutation, onSuccess) => {
  const isLocal = productId.toString().startsWith('local_');
  
  if (isLocal) {
    // local delete
    const success = deleteLocalProduct(productId);
    if (success && onSuccess) {
      onSuccess();
    }
    return { success, isLocal: true };
  } else {
    // API delete
    try {
      await deleteApiMutation(productId).unwrap();
      // delete copy
      deleteLocalProduct(productId);
      if (onSuccess) {
        onSuccess();
      }
      return { success: true, isLocal: false };
    } catch (error) {
      console.error('Failed to delete product:', error);
      return { success: false, error, isLocal: false };
    }
  }
};

export const getProduct = async (productId, getApiQuery) => {
  const isLocal = productId.toString().startsWith('local_');
  
  if (isLocal) {
    const localProducts = getLocalProducts();
    return localProducts.find(p => p.id === productId) || null;
  } else {
    try {
      const result = await getApiQuery(productId);
      return result.data || null;
    } catch (error) {
      console.error('Failed to get product:', error);
      return null;
    }
  }
};