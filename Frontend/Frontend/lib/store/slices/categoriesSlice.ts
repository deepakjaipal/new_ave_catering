import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { getCategories, getCategoryTree, getCategoryBySlug } from '../../api/services/categoryService';

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
  createdAt: string;
  updatedAt: string;
}

export interface CategoriesState {
  categories: Category[];
  categoryTree: Category[];
  currentCategory: Category | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: CategoriesState = {
  categories: [],
  categoryTree: [],
  currentCategory: null,
  isLoading: false,
  error: null,
};

// Async thunks for API calls
export const fetchCategoriesAsync = createAsyncThunk(
  'categories/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const categories = await getCategories();
      return categories;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch categories';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchCategoryTreeAsync = createAsyncThunk(
  'categories/fetchCategoryTree',
  async (_, { rejectWithValue }) => {
    try {
      const categoryTree = await getCategoryTree();
      return categoryTree;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch category tree';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchCategoryBySlugAsync = createAsyncThunk(
  'categories/fetchCategoryBySlug',
  async (slug: string, { rejectWithValue }) => {
    try {
      const category = await getCategoryBySlug(slug);
      return category;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch category';
      return rejectWithValue(errorMessage);
    }
  }
);

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    setCurrentCategory: (state, action: PayloadAction<Category | null>) => {
      state.currentCategory = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentCategory: (state) => {
      state.currentCategory = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Categories
      .addCase(fetchCategoriesAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategoriesAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload;
        state.error = null;
      })
      .addCase(fetchCategoriesAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Category Tree
      .addCase(fetchCategoryTreeAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategoryTreeAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categoryTree = action.payload;
        state.error = null;
      })
      .addCase(fetchCategoryTreeAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Category by Slug
      .addCase(fetchCategoryBySlugAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategoryBySlugAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentCategory = action.payload;
        state.error = null;
      })
      .addCase(fetchCategoryBySlugAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCurrentCategory, clearError, clearCurrentCategory } = categoriesSlice.actions;
export default categoriesSlice.reducer;
