'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import { clearCart } from '@/lib/store/slices/cartSlice';
import { createOrderAsync } from '@/lib/store/slices/ordersSlice';
import { CreateOrderRequest } from '@/lib/api/services/orderService';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import { CreditCard, Truck, ShoppingBag } from 'lucide-react';

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  paymentMethod: string;
}

export default function CheckoutPage(): React.JSX.Element {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { items, totalAmount } = useAppSelector((state) => state.cart);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  
  const [formData, setFormData] = useState<FormData>({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    paymentMethod: 'card',
  });
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const shippingCost: number = totalAmount > 50 ? 0 : 9.99;
  const tax: number = totalAmount * 0.08;
  const grandTotal: number = totalAmount + shippingCost + tax;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (): Promise<void> => {
    if (!isAuthenticated) {
      toast.error('Please login to complete your order');
      router.push('/auth/login');
      return;
    }

    // Validate form
    if (!formData.fullName || !formData.email || !formData.phone || 
        !formData.address || !formData.city || !formData.state || !formData.zip) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsProcessing(true);

    // Simulate order processing
    setTimeout(() => {
      // Generate order details
      const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const orderNumber = `AVE${Date.now().toString().slice(-8)}`;
      const createdAt = new Date().toISOString();
      const estimatedDeliveryDate = new Date();
      estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 5);

      const order: CreateOrderRequest = {
        orderItems: items.map((it) => ({
          product: it.id,
          name: it.name,
          image: it.image,
          price: it.price,
          quantity: it.quantity,
          packSize: it.packSize,
          unit: it.unit,
        })),
        shippingAddress: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zip,
          country: 'US',
        },
        paymentMethod: formData.paymentMethod,
        itemsPrice: totalAmount,
        taxPrice: tax,
        shippingPrice: shippingCost,
        totalPrice: grandTotal,
      };

      // Create order in Redux store
      dispatch(createOrderAsync(order));
      
      // Clear cart
      dispatch(clearCart());
      
      toast.success('Order placed successfully!');
      setIsProcessing(false);
      
      // Redirect to order confirmation
      router.push(`/orders/confirmation/${orderId}`);
    }, 2000);
  };

  const handlePaymentMethodChange = (method: string): void => {
    setFormData({ ...formData, paymentMethod: method });
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
        <p className="text-muted-foreground mb-6">Add some products to continue</p>
        <Link href="/products">
          <Button>Browse Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-8">Checkout</h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Forms */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Shipping Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Full Name *</label>
                        <Input
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Email *</label>
                        <Input
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Phone *</label>
                      <Input
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Address *</label>
                      <Input
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">City *</label>
                        <Input
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">State *</label>
                        <Input
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">ZIP *</label>
                        <Input
                          name="zip"
                          value={formData.zip}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        variant={formData.paymentMethod === 'card' ? 'default' : 'outline'}
                        onClick={() => handlePaymentMethodChange('card')}
                      >
                        Credit Card
                      </Button>
                      <Button
                        type="button"
                        variant={formData.paymentMethod === 'paypal' ? 'default' : 'outline'}
                        onClick={() => handlePaymentMethodChange('paypal')}
                      >
                        PayPal
                      </Button>
                      <Button
                        type="button"
                        variant={formData.paymentMethod === 'zelle' ? 'default' : 'outline'}
                        onClick={() => handlePaymentMethodChange('zelle')}
                      >
                        Zelle
                      </Button>
                    </div>
                    
                    {formData.paymentMethod === 'card' && (
                      <div className="bg-gray-50 p-4 rounded-md text-sm text-muted-foreground">
                        Card payment processing will be available at the final step
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Items */}
                  <div className="max-h-64 overflow-y-auto space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-3 pb-3 border-b">
                        <div className="relative h-16 w-16 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            unoptimized={item.image.includes('placehold.co')}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-2">{item.name}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                          <p className="text-sm font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>${totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span className={shippingCost === 0 ? 'text-green-600 font-medium' : ''}>
                        {shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax (8%)</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                      <span>Total</span>
                      <span className="text-primary">${grandTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {totalAmount < 50 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-xs text-blue-900">
                      Add ${(50 - totalAmount).toFixed(2)} more to get FREE shipping!
                    </div>
                  )}

                  <Button
                    className="w-full bg-primary hover:bg-primary/90"
                    size="lg"
                    onClick={handleSubmit}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : `Place Order - $${grandTotal.toFixed(2)}`}
                  </Button>

                  <Link href="/products">
                    <Button variant="outline" className="w-full" size="sm">
                      Continue Shopping
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
