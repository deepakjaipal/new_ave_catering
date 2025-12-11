'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Save,
  Store,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Truck,
  Bell,
  Lock,
  Globe,
  Palette,
} from 'lucide-react';

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    // Store Settings
    storeName: 'Wholesale Market',
    storeEmail: 'admin@wholesale.com',
    storePhone: '(323) 250-3212',
    storeAddress: '123 Main Street, Los Angeles, CA 90001',
    
    // Shipping Settings
    freeShippingThreshold: '50',
    standardShipping: '15',
    expressShipping: '25',
    
    // Tax Settings
    taxRate: '8.5',
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    lowStockAlerts: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Settings Data:', formData);
    alert('Settings saved successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your store settings and preferences
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* Store Information */}
          <Card className="border-0 shadow-md">
            <CardHeader className="bg-gradient-to-r from-[#006e9d]/5 to-transparent">
              <CardTitle className="flex items-center gap-2 text-[#006e9d]">
                <Store className="h-5 w-5" />
                Store Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Store Name
                  </label>
                  <Input
                    name="storeName"
                    value={formData.storeName}
                    onChange={handleChange}
                    placeholder="Wholesale Market"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Email
                  </label>
                  <Input
                    name="storeEmail"
                    type="email"
                    value={formData.storeEmail}
                    onChange={handleChange}
                    placeholder="admin@wholesale.com"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Phone
                  </label>
                  <Input
                    name="storePhone"
                    value={formData.storePhone}
                    onChange={handleChange}
                    placeholder="(323) 250-3212"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Address
                  </label>
                  <Input
                    name="storeAddress"
                    value={formData.storeAddress}
                    onChange={handleChange}
                    placeholder="123 Main Street, Los Angeles, CA"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Settings */}
          <Card className="border-0 shadow-md">
            <CardHeader className="bg-gradient-to-r from-[#006e9d]/5 to-transparent">
              <CardTitle className="flex items-center gap-2 text-[#006e9d]">
                <Truck className="h-5 w-5" />
                Shipping Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Free Shipping Threshold ($)
                  </label>
                  <Input
                    name="freeShippingThreshold"
                    type="number"
                    step="0.01"
                    value={formData.freeShippingThreshold}
                    onChange={handleChange}
                    placeholder="50.00"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Orders over this amount get free shipping
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Standard Shipping ($)
                  </label>
                  <Input
                    name="standardShipping"
                    type="number"
                    step="0.01"
                    value={formData.standardShipping}
                    onChange={handleChange}
                    placeholder="15.00"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Express Shipping ($)
                  </label>
                  <Input
                    name="expressShipping"
                    type="number"
                    step="0.01"
                    value={formData.expressShipping}
                    onChange={handleChange}
                    placeholder="25.00"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tax Settings */}
          <Card className="border-0 shadow-md">
            <CardHeader className="bg-gradient-to-r from-[#006e9d]/5 to-transparent">
              <CardTitle className="flex items-center gap-2 text-[#006e9d]">
                <DollarSign className="h-5 w-5" />
                Tax Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Tax Rate (%)
                </label>
                <Input
                  name="taxRate"
                  type="number"
                  step="0.01"
                  value={formData.taxRate}
                  onChange={handleChange}
                  placeholder="8.5"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Default tax rate applied to orders
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          {/* <Card className="border-0 shadow-md">
            <CardHeader className="bg-gradient-to-r from-[#006e9d]/5 to-transparent">
              <CardTitle className="flex items-center gap-2 text-[#006e9d]">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="emailNotifications"
                    checked={formData.emailNotifications}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-gray-300 text-[#006e9d] focus:ring-[#006e9d]"
                  />
                  <div>
                    <p className="font-medium text-sm">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Receive email alerts for new orders and updates
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="smsNotifications"
                    checked={formData.smsNotifications}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-gray-300 text-[#006e9d] focus:ring-[#006e9d]"
                  />
                  <div>
                    <p className="font-medium text-sm">SMS Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Receive text messages for urgent updates
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="lowStockAlerts"
                    checked={formData.lowStockAlerts}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-gray-300 text-[#006e9d] focus:ring-[#006e9d]"
                  />
                  <div>
                    <p className="font-medium text-sm">Low Stock Alerts</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified when products are running low
                    </p>
                  </div>
                </label>
              </div>
            </CardContent>
          </Card> */}

          {/* Actions */}
          {/* <Card className="border-0 shadow-md"> */}
            <CardContent className="pt-6">
              <div className="flex items-center justify-end">
                <Button type="submit" className="gap-2 bg-[#006e9d] hover:bg-[#005580] text-white shadow-md">
                  <Save className="h-4 w-4" />
                  Save Settings
                </Button>
              </div>
            </CardContent>
          {/* </Card> */}
        </div>
      </form>
    </div>
  );
}

