'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import { removeFromCart, updateQuantity } from '@/lib/store/slices/cartSlice';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { ReactNode } from 'react';
import { useTranslation } from '@/lib/hooks/useTranslation';

interface CartSheetProps {
  children: ReactNode;
}

export default function CartSheet({ children }: CartSheetProps): React.JSX.Element {
  const dispatch = useAppDispatch();
  const { items, totalAmount } = useAppSelector((state) => state.cart);
  const { t } = useTranslation();

  const handleUpdateQuantity = (id: string, newQuantity: number): void => {
    if (newQuantity <= 0) {
      dispatch(removeFromCart(id));
    } else {
      dispatch(updateQuantity({ id, quantity: newQuantity }));
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col p-0">
        {/* Header with gradient background */}
        <SheetHeader className="px-6 py-5 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b">
          <SheetTitle className="text-2xl font-bold flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-primary" />
            {t('cart')}
            {items.length > 0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({items.length} {items.length === 1 ? 'item' : 'items'})
              </span>
            )}
          </SheetTitle>
        </SheetHeader>
        
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 py-12 px-6">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <ShoppingBag className="h-12 w-12 text-primary/60" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-sm">
              {t('emptyCart')}
            </p>
            <Link href="/products" className="w-full max-w-xs">
              <Button className="w-full bg-primary hover:bg-primary/90 gap-2 shadow-lg shadow-primary/20">
                {t('startShopping')}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.map((item, index) => (
                <div 
                  key={item.id} 
                  className="group relative bg-white rounded-xl p-4 border border-gray-100 hover:border-primary/30 hover:shadow-md transition-all duration-300"
                  style={{
                    animation: `slideIn 0.3s ease-out ${index * 0.1}s both`
                  }}
                >
                  {/* Remove button - top right */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-white border border-gray-200 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:border-red-200 z-10"
                    onClick={() => dispatch(removeFromCart(item.id))}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                  </Button>

                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="relative h-24 w-24 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 shadow-sm ring-1 ring-gray-100">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                        unoptimized={item.image.includes('placehold.co')}
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                        {item.name}
                      </h3>
                      <div className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium mb-3">
                        {item.packSize}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg p-1 border border-gray-200">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-md hover:bg-white hover:text-primary transition-colors"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </Button>
                          <span className="text-sm font-semibold min-w-[2rem] text-center bg-white px-2 py-1 rounded">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-md hover:bg-white hover:text-primary transition-colors"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          ${item.price.toFixed(2)} each
                        </span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex flex-col items-end justify-between">
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer with Total and Checkout */}
            <div className="px-6 py-5 border-t bg-gradient-to-t from-gray-50 to-white space-y-4">
              {/* Subtotal breakdown */}
              <div className="space-y-2 py-3">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">Calculated at checkout</span>
                </div>
                <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-2"></div>
                <div className="flex justify-between text-xl font-bold">
                  <span>{t('total')}</span>
                  <span className="text-primary">${totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Link href="/checkout" className="block">
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 gap-2 h-12 text-base font-semibold" 
                    size="lg"
                  >
                    {t('proceedToCheckout')}
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/products" className="block">
                  <Button 
                    variant="outline" 
                    className="w-full border-2 hover:bg-gray-50 hover:border-primary/50 transition-all duration-300 h-11 font-medium" 
                    size="lg"
                  >
                    {t('continueShopping')}
                  </Button>
                </Link>
              </div>
            </div>
          </>
        )}
      </SheetContent>

      <style jsx global>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </Sheet>
  );
}
