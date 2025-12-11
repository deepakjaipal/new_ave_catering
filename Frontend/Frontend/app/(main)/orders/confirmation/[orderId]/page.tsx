'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/lib/store/hooks';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2, Package, Truck, MapPin, CreditCard, Calendar, ArrowRight } from 'lucide-react';
import { Order as APIOrder } from '@/lib/api/services/orderService';

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
  email: string;
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
  paymentMethod: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  items: OrderItemView[];
  shippingAddress: ShippingAddressView;
}

export default function OrderConfirmationPage(): React.JSX.Element {
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
          email: found.user.email,
          address: found.shippingAddress.address,
          city: found.shippingAddress.city,
          state: found.shippingAddress.state,
          zip: found.shippingAddress.zipCode,
          phone: '',
        },
      };
      setOrder(view);
    } else {
      // Order not found, redirect to orders page
      setTimeout(() => {
        router.push('/orders');
      }, 3000);
    }
  }, [orderId, orders, router]);

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Order Not Found</h1>
        <p className="text-muted-foreground mb-6">Redirecting to orders page...</p>
      </div>
    );
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <>
      
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold mb-2">Order Confirmed!</h1>
            <p className="text-xl text-muted-foreground">
              Thank you for your order, {order.shippingAddress.fullName}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              We&apos;ve sent a confirmation email to {order.shippingAddress.email}
            </p>
          </div>

          {/* Order Number */}
          <Card className="mb-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Order Number</p>
                <p className="text-3xl font-bold text-primary">{order.orderNumber}</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* Estimated Delivery */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="h-5 w-5" />
                  Estimated Delivery
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{formatDate(order.estimatedDelivery)}</p>
                <p className="text-sm text-muted-foreground mt-1">Standard delivery (5 business days)</p>
              </CardContent>
            </Card>

            {/* Order Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Package className="h-5 w-5" />
                  Order Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium capitalize">
                    {order.status}
                  </span>
                </div>
                <Link href={`/orders/${order.id}`} className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2">
                  Track your order
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Shipping Address */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
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
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium capitalize">{order.paymentMethod}</p>
              <p className="text-sm text-muted-foreground">Payment will be processed</p>
            </CardContent>
          </Card>

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
                      <h3 className="font-medium line-clamp-2">{item.name}</h3>
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

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Link href={`/orders/${order.id}`} className="flex-1">
              <Button className="w-full" size="lg" variant="default">
                <Truck className="mr-2 h-5 w-5" />
                Track Order
              </Button>
            </Link>
            <Link href="/products" className="flex-1">
              <Button className="w-full" size="lg" variant="outline">
                Continue Shopping
              </Button>
            </Link>
          </div>

          {/* Help Text */}
          <div className="text-center text-sm text-muted-foreground">
            <p>Need help? Contact our customer service at support@avecatering.com</p>
          </div>
        </div>
      </main>
    </>
  );
}

