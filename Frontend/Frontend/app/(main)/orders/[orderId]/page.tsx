'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/lib/store/hooks';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Package, 
  Truck, 
  MapPin, 
  CreditCard, 
  Calendar, 
  CheckCircle2,
  Circle,
  Clock,
  XCircle,
  PackageCheck,
  ArrowLeft
} from 'lucide-react';
import { Order as APIOrder } from '@/lib/api/services/orderService';

interface StatusStep {
  status: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

interface OrderItemView {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  packSize: string;
}

interface ShippingAddressView {
  fullName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
}

interface OrderView {
  id: string;
  orderNumber: string;
  createdAt: string;
  estimatedDelivery: string;
  status: string;
  trackingNumber?: string | null;
  paymentMethod: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  items: OrderItemView[];
  shippingAddress: ShippingAddressView;
}

export default function OrderTrackingPage(): React.JSX.Element {
  const router = useRouter();
  const params = useParams();
  const orderId = params.orderId as string;
  const { orders } = useAppSelector((state) => state.orders);
  const [order, setOrder] = useState<OrderView | null>(null);

  useEffect(() => {
    const found = orders.find((o: APIOrder) => o._id === orderId);
    if (found) {
      const view: OrderView = {
        id: found._id,
        orderNumber: found._id.slice(-8).toUpperCase(),
        createdAt: found.createdAt,
        estimatedDelivery: new Date(new Date(found.createdAt).getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: found.isDelivered ? 'delivered' : 'pending',
        trackingNumber: undefined,
        paymentMethod: found.paymentMethod || 'N/A',
        subtotal: found.itemsPrice,
        shipping: found.shippingPrice,
        tax: found.taxPrice,
        total: found.totalPrice,
        items: found.orderItems.map((it) => ({
          id: it.product,
          name: it.name,
          image: it.image,
          price: it.price,
          quantity: it.quantity,
          packSize: it.packSize,
        })),
        shippingAddress: {
          fullName: found.user.name,
          address: found.shippingAddress.address,
          city: found.shippingAddress.city,
          state: found.shippingAddress.state,
          zip: found.shippingAddress.zipCode,
          phone: '',
        },
      };
      setOrder(view);
    }
  }, [orderId, orders]);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string): string => {
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

  const statusSteps: StatusStep[] = [
    {
      status: 'pending',
      label: 'Order Placed',
      icon: <Clock className="h-5 w-5" />,
      description: 'Your order has been received',
    },
    {
      status: 'processing',
      label: 'Processing',
      icon: <Package className="h-5 w-5" />,
      description: 'We are preparing your order',
    },
    {
      status: 'shipped',
      label: 'Shipped',
      icon: <Truck className="h-5 w-5" />,
      description: 'Your order is on its way',
    },
    {
      status: 'delivered',
      label: 'Delivered',
      icon: <PackageCheck className="h-5 w-5" />,
      description: 'Your order has been delivered',
    },
  ];

  const getStatusIndex = (status: string): number => {
    return statusSteps.findIndex((step) => step.status === status);
  };

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-3xl font-bold mb-4">Order Not Found</h1>
        <p className="text-muted-foreground mb-6">
          We couldn&apos;t find an order with that ID
        </p>
        <Link href="/orders">
          <Button>View All Orders</Button>
        </Link>
      </div>
    );
  }

  const currentStatusIndex = getStatusIndex(order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <>
      
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Back Button */}
          <Link href="/orders" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Link>

          {/* Order Header */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Order #{order.orderNumber}</h1>
                  <p className="text-sm text-muted-foreground">
                    Placed on {formatDateTime(order.createdAt)}
                  </p>
                </div>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${getStatusColor(order.status)}`}>
                  <span className="font-semibold capitalize">{order.status}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Tracking Timeline */}
          {!isCancelled ? (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Order Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {/* Progress Bar */}
                  <div className="absolute top-6 left-6 right-6 h-1 bg-gray-200">
                    <div 
                      className="h-full bg-primary transition-all duration-500"
                      style={{ 
                        width: `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%` 
                      }}
                    />
                  </div>

                  {/* Status Steps */}
                  <div className="relative grid grid-cols-4 gap-4">
                    {statusSteps.map((step, index) => {
                      const isComplete = index <= currentStatusIndex;
                      const isCurrent = index === currentStatusIndex;

                      return (
                        <div key={step.status} className="flex flex-col items-center">
                          <div 
                            className={`
                              relative z-10 w-12 h-12 rounded-full flex items-center justify-center
                              transition-all duration-300
                              ${isComplete 
                                ? 'bg-primary text-white' 
                                : 'bg-white border-2 border-gray-300 text-gray-400'
                              }
                              ${isCurrent ? 'ring-4 ring-primary/20 scale-110' : ''}
                            `}
                          >
                            {isComplete ? (
                              isCurrent ? step.icon : <CheckCircle2 className="h-6 w-6" />
                            ) : (
                              <Circle className="h-5 w-5" />
                            )}
                          </div>
                          <div className="text-center mt-3">
                            <p className={`text-sm font-medium ${isComplete ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {step.label}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Estimated Delivery */}
                {order.status !== 'delivered' && (
                  <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-900">Estimated Delivery</p>
                        <p className="text-sm text-blue-700">{formatDate(order.estimatedDelivery)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tracking Number */}
                {order.trackingNumber && (
                  <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Truck className="h-5 w-5 text-gray-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Tracking Number</p>
                        <p className="text-sm text-gray-700 font-mono">{order.trackingNumber}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <XCircle className="h-6 w-6 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-900">Order Cancelled</p>
                    <p className="text-sm text-red-700 mt-1">
                      This order has been cancelled. If you have any questions, please contact our customer service.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="h-5 w-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="font-medium">{order.shippingAddress.fullName}</p>
                  <p className="text-sm text-muted-foreground">{order.shippingAddress.address}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
                  </p>
                  <p className="text-sm text-muted-foreground">{order.shippingAddress.phone}</p>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CreditCard className="h-5 w-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium capitalize mb-1">{order.paymentMethod}</p>
                <p className="text-sm text-muted-foreground">Total Amount: ${order.total.toFixed(2)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Order Items */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b last:border-b-0">
                    <div className="relative h-20 w-20 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        unoptimized={item.image.includes('placehold.co')}
                      />
                    </div>
                    <div className="flex-1">
                      <Link href={`/product/${item.id}`} className="hover:text-primary">
                        <h3 className="font-medium line-clamp-2">{item.name}</h3>
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1">{item.packSize}</p>
                      <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">${item.price.toFixed(2)} each</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="mt-6 pt-6 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span className={order.shipping === 0 ? 'text-green-600 font-medium' : ''}>
                    {order.shipping === 0 ? 'FREE' : `$${order.shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>${order.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span className="text-primary">${order.total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Help Section */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="font-semibold mb-2">Need Help?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  If you have any questions about your order, our customer service team is here to help.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button variant="outline">
                    Contact Support
                  </Button>
                  <Link href="/orders">
                    <Button variant="outline">
                      View All Orders
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}

