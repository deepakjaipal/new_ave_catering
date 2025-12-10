import api from '../../api';

export interface Banner {
  _id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  badge?: string;
  link?: string;
  buttonText?: string;
  order: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBannerRequest {
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  badge?: string;
  link?: string;
  buttonText?: string;
  order?: number;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface UpdateBannerRequest extends Partial<CreateBannerRequest> {
  _id: string;
}

export interface BannerFilters {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface BannersResponse {
  banners: Banner[];
  pagination: {
    page: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
    total: number;
  };
}

export interface BannerStats {
  totalBanners: number;
  activeBanners: number;
  inactiveBanners: number;
  scheduledBanners: number;
  expiredBanners: number;
}

// Get public banners (active only)
export const getPublicBanners = async (): Promise<Banner[]> => {
  const response = await api.get('/banners/public');
  return response.data;
};

// Get all banners (admin)
export const getBanners = async (filters: BannerFilters = {}): Promise<BannersResponse> => {
  const params = new URLSearchParams();
  
  if (filters.status) params.append('status', filters.status);
  if (filters.search) params.append('search', filters.search);
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());

  const response = await api.get(`/banners?${params.toString()}`);
  return response.data;
};

// Get single banner by ID
export const getBannerById = async (id: string): Promise<Banner> => {
  const response = await api.get(`/banners/${id}`);
  return response.data;
};

// Create new banner
export const createBanner = async (bannerData: CreateBannerRequest): Promise<Banner> => {
  const response = await api.post('/banners', bannerData);
  return response.data;
};

// Update banner
export const updateBanner = async (id: string, bannerData: Partial<CreateBannerRequest>): Promise<Banner> => {
  const response = await api.put(`/banners/${id}`, bannerData);
  return response.data;
};

// Delete banner
export const deleteBanner = async (id: string): Promise<{ message: string }> => {
  const response = await api.delete(`/banners/${id}`);
  return response.data;
};

// Reorder banners
export const reorderBanners = async (banners: Array<{ id: string; order: number }>): Promise<{ message: string }> => {
  const response = await api.put('/banners/reorder', { banners });
  return response.data;
};

// Get banner statistics
export const getBannerStats = async (): Promise<BannerStats> => {
  const response = await api.get('/banners/stats');
  return response.data;
};

