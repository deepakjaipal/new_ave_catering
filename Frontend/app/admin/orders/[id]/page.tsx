'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Printer,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Package,
  MapPin,
  CreditCard,
  User,
  Mail,
  Phone,
} from 'lucide-react';
import Link from 'next/link';

// Local type for order state
interface OrderState {
  id: string;
  orderNumber: string;
  customer: { name: string; email: string; phone: string; business: string };
  shippingAddress: { fullName: string; address: string; city: string; state: string; zip: string };
  items: Array<{ id: number; name: string; sku: string; quantity: number; price: number; total: number }>;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'paid' | 'unpaid';
  paymentMethod: string;
  shippingMethod: string;
  orderDate: string;
  estimatedDelivery: string;
  trackingNumber: string | null;
  notes: string;
}

// Mock order data
const mockOrder: OrderState = {
  id: 'ORD-001',
  orderNumber: 'AVE12345678',
  customer: {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '(323) 250-3212',
    business: 'John\'s Convenience Store',
  },
  shippingAddress: {
    fullName: 'John Doe',
    address: '123 Main Street',
    city: 'Los Angeles',
    state: 'CA',
    zip: '90001',
  },
  items: [
    {
      id: 1,
      name: 'Coca-Cola 24pk Cans',
      sku: 'BEV-001',
      quantity: 10,
      price: 12.99,
      total: 129.90,
    },
    {
      id: 2,
      name: 'Lay\'s Potato Chips Box',
      sku: 'SNK-002',
      quantity: 5,
      price: 15.99,
      total: 79.95,
    },
    {
      id: 3,
      name: 'Paper Towels 12pk',
      sku: 'HH-006',
      quantity: 3,
      price: 22.99,
      total: 68.97,
    },
  ],
  subtotal: 278.82,
  shipping: 15.00,
  tax: 23.68,
  total: 317.50,
  status: 'pending',
  paymentStatus: 'paid',
  paymentMethod: 'Credit Card',
  shippingMethod: 'Standard Shipping',
  orderDate: '2024-01-15T10:30:00',
  estimatedDelivery: '2024-01-20',
  trackingNumber: null,
  notes: 'Please deliver between 9 AM - 5 PM',
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <Clock className="h-5 w-5" />;
    case 'processing':
      return <AlertCircle className="h-5 w-5" />;
    case 'shipped':
      return <Truck className="h-5 w-5" />;
    case 'delivered':
      return <CheckCircle className="h-5 w-5" />;
    case 'cancelled':
      return <XCircle className="h-5 w-5" />;
    default:
      return null;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'processing':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'shipped':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'delivered':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [order, setOrder] = useState<OrderState>(mockOrder);

  const handleProcessOrder = () => {
    if (confirm('Process this order?')) {
      setOrder({ ...order, status: 'processing' });
      alert('Order status updated to Processing');
    }
  };

  const handleShipOrder = () => {
    const trackingNumber = prompt('Enter tracking number:');
    if (trackingNumber) {
      setOrder({ ...order, status: 'shipped', trackingNumber });
      alert(`Order marked as shipped with tracking: ${trackingNumber}`);
    }
  };

  const handleCancelOrder = () => {
    const reason = prompt('Enter cancellation reason:');
    if (reason) {
      setOrder({ ...order, status: 'cancelled' });
      alert('Order cancelled successfully');
    }
  };

  const handlePrintInvoice = () => {
    // In a real app, this would generate and print a PDF
    alert('Invoice printing functionality will be implemented');
    // You can use libraries like jsPDF or react-pdf
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Order Details</h1>
            <p className="text-muted-foreground mt-1">{order.id}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrintInvoice} className="gap-2">
            <Printer className="h-4 w-4" />
            Print Invoice
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Order Status</CardTitle>
                <Badge
                  variant="outline"
                  className={`${getStatusColor(order.status)} flex items-center gap-2 px-3 py-1`}
                >
                  {getStatusIcon(order.status)}
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {order.status === 'pending' && (
                  <Button onClick={handleProcessOrder} className="gap-2 bg-[#006e9d] hover:bg-[#005580] text-white shadow-md">
                    <CheckCircle className="h-4 w-4" />
                    Process Order
                  </Button>
                )}
                {order.status === 'processing' && (
                  <Button onClick={handleShipOrder} className="gap-2 bg-[#006e9d] hover:bg-[#005580] text-white shadow-md">
                    <Truck className="h-4 w-4" />
                    Mark as Shipped
                  </Button>
                )}
                {['pending', 'processing'].includes(order.status) && (
                  <Button
                    variant="outline"
                    onClick={handleCancelOrder}
                    className="gap-2 text-red-600 border-red-600 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4" />
                    Cancel Order
                  </Button>
                )}
                {order.trackingNumber && (
                  <div className="ml-auto">
                    <p className="text-sm text-muted-foreground">Tracking Number</p>
                    <code className="text-sm font-medium bg-gray-100 px-2 py-1 rounded">
                      {order.trackingNumber}
                    </code>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Package className="h-8 w-8 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                        <p className="text-sm text-muted-foreground">
                          ${item.price.toFixed(2)} × {item.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${item.total.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Total */}
              <div className="mt-6 pt-6 border-t space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>${order.shipping.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>${order.tax.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span className="text-primary">${order.total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Notes */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Order Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium">{order.customer.name}</p>
                <p className="text-sm text-muted-foreground">{order.customer.business}</p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${order.customer.email}`} className="text-blue-600 hover:underline">
                  {order.customer.email}
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${order.customer.phone}`} className="text-blue-600 hover:underline">
                  {order.customer.phone}
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1">
                <p className="font-medium">{order.shippingAddress.fullName}</p>
                <p className="text-muted-foreground">{order.shippingAddress.address}</p>
                <p className="text-muted-foreground">
                  {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                  {order.shippingAddress.zip}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge
                  variant="secondary"
                  className={
                    order.paymentStatus === 'paid'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }
                >
                  {order.paymentStatus}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Method</span>
                <span className="text-sm font-medium">{order.paymentMethod}</span>
              </div>
            </CardContent>
          </Card>

          {/* Order Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium">Order Placed</p>
                <p className="text-sm text-muted-foreground">{formatDate(order.orderDate)}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Estimated Delivery</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(order.estimatedDelivery).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Shipping Method</p>
                <p className="text-sm text-muted-foreground">{order.shippingMethod}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

