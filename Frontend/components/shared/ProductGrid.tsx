'use client';

import { lazy, Suspense } from 'react';
import { Product } from '@/lib/store/slices/productsSlice';
import { Skeleton } from '@/components/ui/skeleton';

const ProductCard = lazy(() => import('./ProductCard'));

interface ProductGridProps {
  products: Product[];
  columns?: number; // 1 means home-page mode (6 columns on desktop)
}

function ProductCardSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="aspect-square rounded-lg" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

export default function ProductGrid({ products, columns = 3 }: ProductGridProps) {
  // Grid configuration
  const gridCols: Record<number, string> = {
    1: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6', // ⭐ Home page: 6 columns desktop
    2: 'grid-cols-2',
    3: 'grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6',
  };

  // Select class
  const gridClass = gridCols[columns] || gridCols[6];

  return (
    <div className={`grid ${gridClass} gap-6`}>
      {products.map((product) => (
        <Suspense key={product._id} fallback={<ProductCardSkeleton />}>
          <ProductCard product={product} />
        </Suspense>
      ))}
    </div>
  );
}
