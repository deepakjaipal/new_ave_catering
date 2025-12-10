'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Edit,
  Ban,
  CheckCircle,
  Mail,
  Phone,
  MapPin,
  Building,
  Calendar,
  DollarSign,
  ShoppingCart,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';

// Mock customer data
const mockCustomer = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  phone: '(323) 250-3212',
  business: 'John\'s Convenience Store',
  accountType: 'wholesaler',
  status: 'approved',
  address: {
    street: '123 Main Street',
    city: 'Los Angeles',
    state: 'CA',
    zip: '90001',
  },
  totalOrders: 45,
  totalSpent: 12450.50,
  averageOrder: 276.68,
  lastOrder: '2024-01-15',
  joinDate: '2023-06-15',
  taxId: 'TAX-123456',
  recentOrders: [
    { id: 'ORD-045', date: '2024-01-15', items: 8, total: 234.50, status: 'delivered' },
    { id: 'ORD-044', date: '2024-01-12', items: 12, total: 567.80, status: 'delivered' },
    { id: 'ORD-043', date: '2024-01-08', items: 5, total: 189.25, status: 'delivered' },
    { id: 'ORD-042', date: '2024-01-05', items: 15, total: 892.40, status: 'delivered' },
    { id: 'ORD-041', date: '2024-01-01', items: 10, total: 445.90, status: 'delivered' },
  ],
};

export default function CustomerDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [customer, setCustomer] = useState(mockCustomer);

  const handleApprove = () => {
    if (confirm(`Approve customer account for ${customer.name}?`)) {
      setCustomer({ ...customer, status: 'approved' });
      alert('Customer account approved successfully');
    }
  };

  const handleSuspend = () => {
    const reason = prompt(`Suspend account for ${customer.name}?\nEnter reason:`);
    if (reason) {
      setCustomer({ ...customer, status: 'suspended' });
      alert('Customer account suspended');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAccountTypeBadge = (type: string) => {
    return type === 'wholesaler' ? (
      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
        Wholesaler
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
        Retailer
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/customers">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{customer.name}</h1>
            <p className="text-muted-foreground mt-1">{customer.business}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/customers/${customer.id}/edit`}>
            <Button variant="outline" className="gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </Link>
          {customer.status === 'pending' && (
            <Button onClick={handleApprove} className="gap-2 bg-[#006e9d] hover:bg-[#005580] text-white shadow-md">
              <CheckCircle className="h-4 w-4" />
              Approve
            </Button>
          )}
          {customer.status !== 'suspended' && (
            <Button
              variant="outline"
              onClick={handleSuspend}
              className="gap-2 text-red-600 border-red-600 hover:bg-red-50"
            >
              <Ban className="h-4 w-4" />
              Suspend
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <ShoppingCart className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                    <p className="text-2xl font-bold">{customer.totalOrders}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Spent</p>
                    <p className="text-2xl font-bold">${customer.totalSpent.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Order</p>
                    <p className="text-2xl font-bold">${customer.averageOrder.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Orders</CardTitle>
                <Link href={`/admin/orders?customer=${customer.id}`}>
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {customer.recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/admin/orders/${order.id}`}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <p className="font-medium">{order.id}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.date).toLocaleDateString()} • {order.items} items
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${order.total.toFixed(2)}</p>
                      <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                        {order.status}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                <Badge variant="secondary" className={getStatusColor(customer.status)}>
                  {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                </Badge>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Account Type</p>
                {getAccountTypeBadge(customer.accountType)}
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p className="text-sm font-medium">
                    {new Date(customer.joinDate).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Last Order</p>
                  <p className="text-sm font-medium">
                    {new Date(customer.lastOrder).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <a href={`mailto:${customer.email}`} className="text-sm font-medium text-blue-600 hover:underline">
                    {customer.email}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <a href={`tel:${customer.phone}`} className="text-sm font-medium text-blue-600 hover:underline">
                    {customer.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="text-sm font-medium">
                    {customer.address.street}<br />
                    {customer.address.city}, {customer.address.state} {customer.address.zip}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Info */}
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Business Name</p>
                  <p className="text-sm font-medium">{customer.business}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Tax ID</p>
                <code className="text-sm font-medium bg-gray-100 px-2 py-1 rounded">
                  {customer.taxId}
                </code>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

