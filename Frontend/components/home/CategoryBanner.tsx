'use client';

import { Card } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';

interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  productCount?: number;
}

interface CategoryBannerProps {
  categories: Category[];
}

export default function CategoryBanner({ categories }: CategoryBannerProps): React.JSX.Element {
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">
          Shop by Category
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {categories.map((category: Category) => (
            <Link key={category._id} href={`/category/${category.slug}`}>
              <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden">
                <div className="aspect-square relative bg-gradient-to-br from-primary/10 to-primary/5">
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                      <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                      {category.productCount && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {category.productCount}+ items
                        </p>
                      )}
                    </div>
                  )}
                  {/* Overlay for better text readability */}
                  <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center p-4 text-center">
                    <h3 className="font-semibold text-sm text-white group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    {category.productCount && (
                      <p className="text-xs text-white/80 mt-1">
                        {category.productCount}+ items
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
