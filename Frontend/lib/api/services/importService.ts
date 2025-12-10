import api from '../../api';

export interface ImportPreview {
  preview: any[];
  totalRows: number;
  columns: string[];
}

export interface ImportResult {
  message: string;
  created: number;
  existing: number;
  errors?: number;
  errorDetails?: string[];
  categories?: any[];
  products?: any[];
}

export interface ColumnMapping {
  name: string;
  category: string;
  brand: string;
  price: string;
  sku: string;
  description: string;
  packSize: string;
  unit: string;
  stockQuantity?: string;
  pricePerCase?: string;
}

// Upload Excel file
export const uploadExcelFile = async (file: File): Promise<{ data: any[]; totalRows: number; columns: string[] }> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/import/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Get import preview
export const getImportPreview = async (data: any[], type: 'categories' | 'products'): Promise<ImportPreview> => {
  const response = await api.post('/import/preview', { data, type });
  return response.data;
};

// Import categories
export const importCategories = async (data: any[], categoryColumn: string = 'Category'): Promise<ImportResult> => {
  const response = await api.post('/import/categories', { data, categoryColumn });
  return response.data;
};

// Import products
export const importProducts = async (data: any[], columnMapping: ColumnMapping): Promise<ImportResult> => {
  const response = await api.post('/import/products', { data, columnMapping });
  return response.data;
};
