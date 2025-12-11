import api from '../../api';

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  imagePublicId?: string;
  parentCategory?: string;
  subcategories?: Category[];
  displayOrder: number;
  isActive: boolean;
  productCount?: number;
  level?: number;
  path?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  parentCategoryId?: string;
  displayOrder?: number;
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {
  isActive?: boolean;
}

// Get all categories with hierarchical structure
export const getCategories = async (): Promise<Category[]> => {
  const response = await api.get('/categories');
  return response.data;
};

// Get all categories for admin (includes inactive)
export const getCategoriesForAdmin = async (): Promise<Category[]> => {
  const response = await api.get('/categories/admin');
  return response.data;
};

// Get category tree structure
export const getCategoryTree = async (): Promise<Category[]> => {
  const response = await api.get('/categories/tree');
  return response.data;
};

// Get category by slug
export const getCategoryBySlug = async (slug: string): Promise<Category> => {
  const response = await api.get(`/categories/${slug}`);
  return response.data;
};

// Create new category (Admin)
export const createCategory = async (categoryData: CreateCategoryRequest, imageUrl?: string): Promise<Category> => {
  const formData = new FormData();
  
  // Append all category data
  Object.entries(categoryData).forEach(([key, value]) => {
    if (value !== undefined) {
      formData.append(key, value.toString());
    }
  });
  
  // Append image URL if provided
  if (imageUrl) {
    formData.append('imageUrl', imageUrl);
  }

  const response = await api.post('/categories/admin/create', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Update category (Admin)
export const updateCategory = async (id: string, categoryData: UpdateCategoryRequest, imageUrl?: string): Promise<Category> => {
  const formData = new FormData();
  
  // Append all category data
  Object.entries(categoryData).forEach(([key, value]) => {
    if (value !== undefined) {
      formData.append(key, value.toString());
    }
  });
  
  // Append image URL if provided
  if (imageUrl) {
    formData.append('imageUrl', imageUrl);
  }

  const response = await api.put(`/categories/admin/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Delete category (Admin)
export const deleteCategory = async (id: string): Promise<{ message: string }> => {
  const response = await api.delete(`/categories/admin/${id}`);
  return response.data;
};

// Upload image to Cloudinary
export const uploadImage = async (file: File): Promise<{ secure_url: string; public_id: string }> => {
  const formData = new FormData();
  formData.append('image', file);
  
  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};
