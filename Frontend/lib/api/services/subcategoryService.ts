import api from '../../api';

export interface Subcategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  imagePublicId?: string;
  parentCategory: {
    _id: string;
    name: string;
    slug: string;
  };
  isActive: boolean;
  displayOrder: number;
  productCount: number;
  level: number;
  path: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubcategoryRequest {
  name: string;
  description?: string;
  parentCategoryId: string;
  displayOrder?: number;
}

export interface UpdateSubcategoryRequest extends Partial<CreateSubcategoryRequest> {
  isActive?: boolean;
}

// Get all subcategories (Public)
export const getSubcategories = async (): Promise<Subcategory[]> => {
  const response = await api.get('/subcategories');
  return response.data;
};

// Get subcategories for admin
export const getSubcategoriesForAdmin = async (): Promise<Subcategory[]> => {
  const response = await api.get('/subcategories/admin');
  return response.data;
};

// Get subcategories by parent category
export const getSubcategoriesByParent = async (parentId: string): Promise<Subcategory[]> => {
  const response = await api.get(`/subcategories/parent/${parentId}`);
  return response.data;
};

// Get subcategory by slug
export const getSubcategoryBySlug = async (slug: string): Promise<Subcategory> => {
  const response = await api.get(`/subcategories/${slug}`);
  return response.data;
};

// Create subcategory (Admin)
export const createSubcategory = async (subcategoryData: CreateSubcategoryRequest, imageUrl?: string): Promise<Subcategory> => {
  const formData = new FormData();
  
  // Append all subcategory data
  Object.entries(subcategoryData).forEach(([key, value]) => {
    if (value !== undefined) {
      formData.append(key, value.toString());
    }
  });
  
  // Append image URL if provided
  if (imageUrl) {
    formData.append('imageUrl', imageUrl);
  }

  const response = await api.post('/subcategories/admin/create', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Update subcategory (Admin)
export const updateSubcategory = async (id: string, subcategoryData: UpdateSubcategoryRequest, imageUrl?: string): Promise<Subcategory> => {
  const formData = new FormData();
  
  // Append all subcategory data
  Object.entries(subcategoryData).forEach(([key, value]) => {
    if (value !== undefined) {
      formData.append(key, value.toString());
    }
  });
  
  // Append image URL if provided
  if (imageUrl) {
    formData.append('imageUrl', imageUrl);
  }

  const response = await api.put(`/subcategories/admin/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Delete subcategory (Admin)
export const deleteSubcategory = async (id: string): Promise<{ message: string }> => {
  const response = await api.delete(`/subcategories/admin/${id}`);
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