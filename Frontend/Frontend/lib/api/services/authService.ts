import api from '../../api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  businessName?: string;
  phone?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  businessName?: string;
  phone?: string;
}

export interface AuthResponse {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  token: string;
}

// Login user
export const loginUser = async (credentials: LoginRequest): Promise<AuthResponse> => {
  const response = await api.post('/users/login', credentials);
  return response.data;
};

// Register user
export const registerUser = async (userData: RegisterRequest): Promise<AuthResponse> => {
  const response = await api.post('/users', userData);
  return response.data;
};

// Get user profile
export const getUserProfile = async (): Promise<User> => {
  const response = await api.get('/users/profile');
  return response.data;
};

export interface UserFilters {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
    total: number;
  };
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  businessName?: string;
  phone?: string;
  role?: string;
  status?: string;
}

export interface UserStats {
  totalUsers: number;
  adminUsers: number;
  regularUsers: number;
  recentUsers: number;
  roleBreakdown: Array<{
    _id: string;
    count: number;
  }>;
}

// Get all users (Admin only)
export const getAllUsers = async (filters: UserFilters = {}): Promise<UsersResponse> => {
  const params = new URLSearchParams();
  
  if (filters.status) params.append('status', filters.status);
  if (filters.search) params.append('search', filters.search);
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());

  const response = await api.get(`/users?${params.toString()}`);
  return response.data;
};

// Update user (Admin only)
export const updateUser = async (id: string, userData: UpdateUserRequest): Promise<User> => {
  const response = await api.put(`/users/${id}`, userData);
  return response.data;
};

// Delete user (Admin only)
export const deleteUser = async (id: string): Promise<{ message: string }> => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

// Get user statistics (Admin only)
export const getUserStats = async (): Promise<UserStats> => {
  const response = await api.get('/users/stats');
  return response.data;
};

// Set auth token in headers
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};
