import api from '../../api';

// Types for report data
export interface DashboardStats {
  overview: {
    totalOrders: number;
    totalProducts: number;
    totalUsers: number;
    totalOffers: number;
    recentOrders: number;
    recentUsers: number;
    totalRevenue: number;
    periodRevenue: number;
  };
  orderStatusBreakdown: Array<{
    _id: string;
    count: number;
  }>;
  topProducts: Array<{
    _id: string;
    totalRevenue: number;
    totalQuantity: number;
  }>;
  dailyRevenue: Array<{
    _id: string;
    revenue: number;
    orders: number;
  }>;
}

export interface SalesReport {
  salesData: Array<{
    _id: string;
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
  }>;
  productPerformance: Array<{
    _id: string;
    totalRevenue: number;
    totalQuantity: number;
    orderCount: number;
  }>;
}

export interface CustomerAnalytics {
  customerStats: Array<{
    customerName: string;
    customerEmail: string;
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    lastOrderDate: string;
  }>;
  customerAcquisition: Array<{
    _id: string;
    newCustomers: number;
  }>;
}

export interface InventoryReport {
  lowStockProducts: Array<{
    _id: string;
    name: string;
    sku: string;
    stockQuantity: number;
    minStock: number;
    price: number;
    category: string;
  }>;
  outOfStockProducts: Array<{
    _id: string;
    name: string;
    sku: string;
    price: number;
    category: string;
  }>;
  inventoryByCategory: Array<{
    _id: string;
    totalValue: number;
    totalQuantity: number;
    productCount: number;
  }>;
  topSellingProducts: Array<{
    _id: string;
    totalSold: number;
    totalRevenue: number;
  }>;
}

export interface OfferPerformance {
  offerStats: Array<{
    _id: string;
    count: number;
    totalUsage: number;
    totalRevenue: number;
  }>;
  topOffers: Array<{
    _id: string;
    code: string;
    name: string;
    discountType: string;
    discountValue: number;
    usedCount: number;
    totalRevenue: number;
    status: string;
  }>;
  offerUsageOverTime: Array<{
    _id: string;
    offersCreated: number;
    totalUsage: number;
  }>;
}

// API service functions
export const getDashboardStats = async (period: string = '30'): Promise<DashboardStats> => {
  const response = await api.get(`/reports/dashboard?period=${period}`);
  return response.data;
};

export const getSalesReport = async (params: {
  startDate?: string;
  endDate?: string;
  groupBy?: 'hour' | 'day' | 'week' | 'month';
} = {}): Promise<SalesReport> => {
  const queryParams = new URLSearchParams();
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);
  if (params.groupBy) queryParams.append('groupBy', params.groupBy);

  const response = await api.get(`/reports/sales?${queryParams.toString()}`);
  return response.data;
};

export const getCustomerAnalytics = async (params: {
  startDate?: string;
  endDate?: string;
} = {}): Promise<CustomerAnalytics> => {
  const queryParams = new URLSearchParams();
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);

  const response = await api.get(`/reports/customers?${queryParams.toString()}`);
  return response.data;
};

export const getInventoryReport = async (): Promise<InventoryReport> => {
  const response = await api.get('/reports/inventory');
  return response.data;
};

export const getOfferPerformance = async (params: {
  startDate?: string;
  endDate?: string;
} = {}): Promise<OfferPerformance> => {
  const queryParams = new URLSearchParams();
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);

  const response = await api.get(`/reports/offers?${queryParams.toString()}`);
  return response.data;
};