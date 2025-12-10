'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useAppDispatch } from '@/lib/store/hooks';
import { addToCart } from '@/lib/store/slices/cartSlice';
import { Product } from '@/lib/store/slices/productsSlice';
import { toast } from 'sonner';
import { useTranslation } from '@/lib/hooks/useTranslation';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps): React.JSX.Element {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    dispatch(addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      pricePerCase: product.pricePerCase,
      quantity: 1,
      image: product.image,
      unit: product.unit,
      packSize: product.packSize,
    }));
    toast.success(t('addToCart'));
  };

  return (
    <Link href={`/product/${product._id}`}>
      <Card className="group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full rounded-2xl border border-gray-100 bg-white shadow-lg">
        <CardContent className="p-4 flex flex-col h-full">
          {/* Image Container */}
          <div className="relative aspect-4/3 mb-3 rounded-xl overflow-hidden bg-gray-50">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              unoptimized={product.image.includes('placehold.co')}
            />
            {product.isOnOffer && (
              <Badge className="absolute top-2 left-2 bg-red-500/90 text-white shadow-sm px-2 py-0.5 rounded-md">
                {t('deals')}
              </Badge>
            )}
            {!product.inStock && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                <Badge variant="secondary">{t('outOfStock')}</Badge>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-between grow space-y-2">
            <h3 className="font-semibold text-sm sm:text-base text-gray-800 line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            
            <p className="text-xs text-muted-foreground mt-1">
              {product.packSize}
            </p>

            {/* Pricing */}
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-primary font-semibold text-sm sm:text-base">
                ${product.price?.toFixed(2)}/{product.unit}
              </span>
              <div className="text-sm text-muted-foreground">
              ${product.pricePerCase?.toFixed(2)}/case
            </div>
            </div>
            
            

            {/* Add to Cart Button */}
            <Button
              className="w-full mt-3 bg-primary hover:bg-primary/90 rounded-lg text-sm font-medium transition-transform active:scale-95"
              size="sm"
              onClick={handleAddToCart}
              disabled={!product.inStock}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {t('addToCart')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
