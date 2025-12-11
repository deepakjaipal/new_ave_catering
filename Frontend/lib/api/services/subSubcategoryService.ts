import api from '../../api';

export interface SubSubcategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  imagePublicId?: string;
  parentSubcategory: {
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

export interface CreateSubSubcategoryRequest {
  name: string;
  description?: string;
  parentCategoryId: string; // This is actually the parentSubcategoryId
  displayOrder?: number;
}

export interface UpdateSubSubcategoryRequest extends Partial<CreateSubSubcategoryRequest> {
  isActive?: boolean;
}

// Get all sub-subcategories (Public)
export const getSubSubcategories = async (): Promise<SubSubcategory[]> => {
  const response = await api.get('/subsubcategories');
  return response.data;
};

// Get sub-subcategories for admin
export const getSubSubcategoriesForAdmin = async (): Promise<SubSubcategory[]> => {
  const response = await api.get('/subsubcategories/admin');
  return response.data;
};

// Get sub-subcategories by parent subcategory
export const getSubSubcategoriesByParent = async (parentId: string): Promise<SubSubcategory[]> => {
  const response = await api.get(`/subsubcategories/parent/${parentId}`);
  return response.data;
};

// Get sub-subcategory by slug
export const getSubSubcategoryBySlug = async (slug: string): Promise<SubSubcategory> => {
  const response = await api.get(`/subsubcategories/${slug}`);
  return response.data;
};

// Create sub-subcategory (Admin)
export const createSubSubcategory = async (subSubcategoryData: CreateSubSubcategoryRequest, imageUrl?: string): Promise<SubSubcategory> => {
  const formData = new FormData();
  
  // Append all sub-subcategory data
  Object.entries(subSubcategoryData).forEach(([key, value]) => {
    if (value !== undefined) {
      formData.append(key, value.toString());
    }
  });
  
  // Append image URL if provided
  if (imageUrl) {
    formData.append('imageUrl', imageUrl);
  }

  const response = await api.post('/subsubcategories/admin/create', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Update sub-subcategory (Admin)
export const updateSubSubcategory = async (id: string, subSubcategoryData: UpdateSubSubcategoryRequest, imageUrl?: string): Promise<SubSubcategory> => {
  const formData = new FormData();
  
  // Append all sub-subcategory data
  Object.entries(subSubcategoryData).forEach(([key, value]) => {
    if (value !== undefined) {
      formData.append(key, value.toString());
    }
  });
  
  // Append image URL if provided
  if (imageUrl) {
    formData.append('imageUrl', imageUrl);
  }

  const response = await api.put(`/subsubcategories/admin/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Delete sub-subcategory (Admin)
export const deleteSubSubcategory = async (id: string): Promise<{ message: string }> => {
  const response = await api.delete(`/subsubcategories/admin/${id}`);
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