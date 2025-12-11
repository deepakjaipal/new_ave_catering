import api from '../../api';

export interface Offer {
  _id: string;
  code: string;
  name: string;
  description: string;
  discountType: 'percentage' | 'fixed' | 'shipping';
  discountValue: number;
  minPurchase: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  validFrom: string;
  validTo: string;
  status: 'active' | 'scheduled' | 'expired' | 'disabled';
  applicableTo: 'all' | 'new_customers' | 'vip_customers' | 'specific_customers';
  specificCustomers?: string[];
  totalRevenue: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOfferRequest {
  code: string;
  name: string;
  description: string;
  discountType: 'percentage' | 'fixed' | 'shipping';
  discountValue: number;
  minPurchase: number;
  maxDiscount?: number;
  usageLimit?: number;
  validFrom: string;
  validTo: string;
  applicableTo: 'all' | 'new_customers' | 'vip_customers' | 'specific_customers';
  specificCustomers?: string[];
}

export interface UpdateOfferRequest extends Partial<CreateOfferRequest> {
  _id: string;
  status?: 'active' | 'scheduled' | 'expired' | 'disabled';
}

export interface OfferFilters {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface OffersResponse {
  offers: Offer[];
  pagination: {
    page: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
    total: number;
  };
}

export interface OfferStats {
  totalOffers: number;
  activeOffers: number;
  totalUsage: number;
  totalRevenue: number;
  statusBreakdown: Array<{
    _id: string;
    count: number;
    totalUsage: number;
    totalRevenue: number;
  }>;
}

// Get all offers
export const getOffers = async (filters: OfferFilters = {}): Promise<OffersResponse> => {
  const params = new URLSearchParams();
  
  if (filters.status) params.append('status', filters.status);
  if (filters.search) params.append('search', filters.search);
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());

  const response = await api.get(`/offers?${params.toString()}`);
  return response.data;
};

// Get single offer by ID
export const getOfferById = async (id: string): Promise<Offer> => {
  const response = await api.get(`/offers/${id}`);
  return response.data;
};

// Create new offer
export const createOffer = async (offerData: CreateOfferRequest): Promise<Offer> => {
  const response = await api.post('/offers', offerData);
  return response.data;
};

// Update offer
export const updateOffer = async (id: string, offerData: Partial<CreateOfferRequest>): Promise<Offer> => {
  const response = await api.put(`/offers/${id}`, offerData);
  return response.data;
};

// Delete offer
export const deleteOffer = async (id: string): Promise<{ message: string }> => {
  const response = await api.delete(`/offers/${id}`);
  return response.data;
};

// Validate offer code
export const validateOfferCode = async (code: string, customerId?: string, orderTotal?: number) => {
  const response = await api.post('/offers/validate', {
    code,
    customerId,
    orderTotal,
  });
  return response.data;
};

// Get offer statistics
export const getOfferStats = async (): Promise<OfferStats> => {
  const response = await api.get('/offers/stats');
  return response.data;
};
