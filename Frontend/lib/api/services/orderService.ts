import api from '../../api';

export interface OrderItem {
  _id?: string;
  product: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  packSize: string;
  unit: string;
}

export interface ShippingAddress {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Order {
  _id: string;
  orderItems: OrderItem[];
  user: {
    _id: string;
    name: string;
    email: string;
  };
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
}

// Create new order
export const createOrder = async (orderData: CreateOrderRequest): Promise<Order> => {
  const response = await api.post('/orders', orderData);
  return response.data;
};

// Get order by ID
export const getOrderById = async (id: string): Promise<Order> => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

export interface OrderFilters {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface OrdersResponse {
  orders: Order[];
  pagination: {
    page: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
    total: number;
  };
}

export interface UpdateOrderRequest {
  status?: string;
  trackingNumber?: string;
  notes?: string;
}

export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  recentOrders: number;
  statusBreakdown: Array<{
    _id: string;
    count: number;
    totalRevenue: number;
  }>;
}

// Get all orders (Admin)
export const getAllOrders = async (filters: OrderFilters = {}): Promise<OrdersResponse> => {
  const params = new URLSearchParams();
  
  if (filters.status) params.append('status', filters.status);
  if (filters.search) params.append('search', filters.search);
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());

  const response = await api.get(`/orders?${params.toString()}`);
  return response.data;
};

// Update order (Admin)
export const updateOrder = async (id: string, orderData: UpdateOrderRequest): Promise<Order> => {
  const response = await api.put(`/orders/${id}`, orderData);
  return response.data;
};

// Delete order (Admin)
export const deleteOrder = async (id: string): Promise<{ message: string }> => {
  const response = await api.delete(`/orders/${id}`);
  return response.data;
};

// Get order statistics (Admin)
export const getOrderStats = async (): Promise<OrderStats> => {
  const response = await api.get('/orders/stats');
  return response.data;
};

// Get user's orders
export const getUserOrders = async (): Promise<Order[]> => {
  const response = await api.get('/orders/user');
  return response.data;
};
