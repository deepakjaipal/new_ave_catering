import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { getProducts, getProductById, ProductFilters } from '../../api/services/productService';

export interface Product {
  _id: string;
  name: string;
  sku: string;
  category: string;
  brand: string;
  price: number;
  pricePerCase: number;
  packSize: string;
  unit: string;
  description: string;
  image: string;
  imagePublicId?: string;
  stockQuantity: number;
  inStock: boolean;
  isFeatured?: boolean;
  isOnOffer?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsState {
  items: Product[];
  currentProduct: Product | null;
  pagination: {
    page: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
    total: number;
  };
  filters: ProductFilters;
  isLoading: boolean;
  error: string | null;
}

const initialState: ProductsState = {
  items: [],
  currentProduct: null,
  pagination: {
    page: 1,
    pages: 1,
    hasNext: false,
    hasPrev: false,
    total: 0,
  },
  filters: {
    page: 1,
    limit: 20,
  },
  isLoading: false,
  error: null,
};

// Async thunks for API calls
export const fetchProductsAsync = createAsyncThunk(
  'products/fetchProducts',
  async (filters: ProductFilters = {}, { rejectWithValue }) => {
    try {
      const response = await getProducts(filters);
      return response;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch products';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchProductByIdAsync = createAsyncThunk(
  'products/fetchProductById',
  async (id: string, { rejectWithValue }) => {
    try {
      const product = await getProductById(id);
      return product;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch product';
      return rejectWithValue(errorMessage);
    }
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<ProductFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProductsAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.products;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchProductsAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Product by ID
      .addCase(fetchProductByIdAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductByIdAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProduct = action.payload;
        state.error = null;
      })
      .addCase(fetchProductByIdAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setFilters, clearError, clearCurrentProduct } = productsSlice.actions;
export default productsSlice.reducer;
