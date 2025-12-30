// Локальное хранилище для продуктов (симуляция БД)

const LOCAL_STORAGE_KEY = 'local_products';

// Получить локальные продукты
export const getLocalProducts = () => {
  try {
    const localProducts = localStorage.getItem(LOCAL_STORAGE_KEY);
    return localProducts ? JSON.parse(localProducts) : [];
  } catch (error) {
    console.error('Error reading local products:', error);
    return [];
  }
};

// Сохранить локальные продукты
export const saveLocalProduct = (product) => {
  try {
    const localProducts = getLocalProducts();
    
    // Проверяем, есть ли уже продукт с таким ID
    const existingIndex = localProducts.findIndex(p => p.id === product.id);
    
    if (existingIndex >= 0) {
      // Обновляем существующий
      localProducts[existingIndex] = product;
    } else {
      // Добавляем новый
      localProducts.push(product);
    }
    
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localProducts));
    return product;
  } catch (error) {
    console.error('Error saving local product:', error);
    return null;
  }
};

// Удалить локальный продукт
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

// Очистить все локальные продукты
export const clearLocalProducts = () => {
  localStorage.removeItem(LOCAL_STORAGE_KEY);
};

// Генератор ID для локальных продуктов
export const generateLocalId = () => {
  return `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Пометить продукт как локальный
export const markAsLocal = (product) => ({
  ...product,
  isLocal: true,
  localId: product.id
});