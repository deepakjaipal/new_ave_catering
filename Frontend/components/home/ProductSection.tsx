'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import ProductGrid from '@/components/shared/ProductGrid';
import { Product } from '@/lib/store/slices/productsSlice';

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllLink?: string;
  columns?: number;
}

export default function ProductSection({
  title,
  subtitle,
  products,
  viewAllLink,
  columns = 6,
}: ProductSectionProps): React.JSX.Element {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">{title}</h2>
            {subtitle && (
              <p className="text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {viewAllLink && (
            <Link href={viewAllLink}>
              <Button variant="ghost" className="gap-2 text-lg font-bold">
                View all
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          )}
        </div>

        {/* Products Grid */}
        <ProductGrid products={products} columns={columns} />
      </div>
    </section>
  );
}
