// Local storage (DB simulation)

const LOCAL_STORAGE_KEY = 'local_products';

// Get local products
export const getLocalProducts = () => {
  try {
    const localProducts = localStorage.getItem(LOCAL_STORAGE_KEY);
    return localProducts ? JSON.parse(localProducts) : [];
  } catch (error) {
    console.error('Error reading local products:', error);
    return [];
  }
};

// Save local products
export const saveLocalProduct = (product) => {
  try {
    const localProducts = getLocalProducts();
    
    const existingIndex = localProducts.findIndex(p => p.id === product.id);
    
    if (existingIndex >= 0) {
      localProducts[existingIndex] = product;
    } else {
      localProducts.push(product);
    }
    
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localProducts));
    return product;
  } catch (error) {
    console.error('Error saving local product:', error);
    return null;
  }
};

// Delete local product
export const deleteLocalProduct = (id) => {
  try {
    let localProducts = getLocalProducts();
    const initialLength = localProducts.length;
    
    localProducts = localProducts.filter(p => p.id !== id);
    
    if (localProducts.length !== initialLength) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localProducts));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting local product:', error);
    return false;
  }
};

// Clear all
export const clearLocalProducts = () => {
  localStorage.removeItem(LOCAL_STORAGE_KEY);
};

// ID generator
export const generateLocalId = () => {
  return `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Mark as local
export const markAsLocal = (product) => ({
  ...product,
  isLocal: true,
  localId: product.id
});