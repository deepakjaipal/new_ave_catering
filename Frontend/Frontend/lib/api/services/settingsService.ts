import api from '../../api';

export interface Settings {
  _id: string;
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  business: {
    name: string;
    taxId: string;
    licenseNumber: string;
  };
  shipping: {
    freeShippingThreshold: number;
    standardShippingRate: number;
    expressShippingRate: number;
    processingTime: number;
  };
  payment: {
    stripePublicKey: string;
    stripeSecretKey: string;
    paypalClientId: string;
    paypalSecret: string;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    orderNotifications: boolean;
    lowStockNotifications: boolean;
  };
  inventory: {
    lowStockThreshold: number;
    autoReorder: boolean;
    reorderQuantity: number;
  };
  features: {
    enableOffers: boolean;
    enableReviews: boolean;
    enableWishlist: boolean;
    enableNotifications: boolean;
  };
  social: {
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string[];
    googleAnalyticsId: string;
  };
  maintenance: {
    isMaintenanceMode: boolean;
    maintenanceMessage: string;
  };
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSettingsRequest {
  siteName?: string;
  siteDescription?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: Partial<Settings['address']>;
  business?: Partial<Settings['business']>;
  shipping?: Partial<Settings['shipping']>;
  payment?: Partial<Settings['payment']>;
  notifications?: Partial<Settings['notifications']>;
  inventory?: Partial<Settings['inventory']>;
  features?: Partial<Settings['features']>;
  social?: Partial<Settings['social']>;
  seo?: Partial<Settings['seo']>;
  maintenance?: Partial<Settings['maintenance']>;
}

// Get system settings (Admin)
export const getSettings = async (): Promise<Settings> => {
  const response = await api.get('/settings');
  return response.data;
};

// Update system settings (Admin)
export const updateSettings = async (settingsData: UpdateSettingsRequest): Promise<Settings> => {
  const response = await api.put('/settings', settingsData);
  return response.data;
};

// Reset settings to default (Admin)
export const resetSettings = async (): Promise<Settings> => {
  const response = await api.post('/settings/reset');
  return response.data;
};

// Get public settings (for frontend)
export const getPublicSettings = async (): Promise<Partial<Settings>> => {
  const response = await api.get('/settings/public');
  return response.data;
};
