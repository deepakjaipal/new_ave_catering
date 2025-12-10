// Export all API services
export * from './authService';
export * from './productService';
export * from './categoryService';
export * from './orderService';

// Re-export the main API instance
export { default as api } from '../../api';
