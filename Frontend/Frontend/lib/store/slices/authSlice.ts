import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginUser, registerUser, getUserProfile, setAuthToken } from '../../api/services/authService';

export interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  businessName?: string;
  phone?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Async thunks for API calls
export const loginAsync = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await loginUser(credentials);
      // Store token in localStorage
      localStorage.setItem('token', response.token);
      setAuthToken(response.token);
      return response;
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Login failed';
          return rejectWithValue(errorMessage);
        }
  }
);

export const registerAsync = createAsyncThunk(
  'auth/register',
  async (userData: { name: string; email: string; password: string; businessName?: string; phone?: string }, { rejectWithValue }) => {
    try {
      const response = await registerUser(userData);
      // Store token in localStorage
      localStorage.setItem('token', response.token);
      setAuthToken(response.token);
      return response;
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Registration failed';
          return rejectWithValue(errorMessage);
        }
  }
);

export const loadUserAsync = createAsyncThunk(
  'auth/loadUser',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
      setAuthToken(token);
      const user = await getUserProfile();
      return user;
        } catch (error: unknown) {
          // Clear invalid token
          localStorage.removeItem('token');
          setAuthToken(null);
          const errorMessage = error instanceof Error ? error.message : 'Failed to load user';
          return rejectWithValue(errorMessage);
        }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      localStorage.removeItem('token');
      setAuthToken(null);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Register
      .addCase(registerAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Load User
      .addCase(loadUserAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadUserAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loadUserAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
