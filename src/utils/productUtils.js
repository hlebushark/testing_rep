import { 
  deleteLocalProduct,
  getLocalProducts
} from './localProductsStore';

// Универсальная функция удаления продукта
export const deleteProduct = async (productId, deleteApiMutation, onSuccess) => {
  const isLocal = productId.toString().startsWith('local_');
  
  if (isLocal) {
    // Удаляем локальный продукт
    const success = deleteLocalProduct(productId);
    if (success && onSuccess) {
      onSuccess();
    }
    return { success, isLocal: true };
  } else {
    // Удаляем через API
    try {
      await deleteApiMutation(productId).unwrap();
      // Также удаляем локальную копию если есть
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

// Получить продукт (из API или локального хранилища)
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