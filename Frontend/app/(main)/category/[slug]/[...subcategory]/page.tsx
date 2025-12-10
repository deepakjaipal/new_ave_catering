'use client';

import { useMemo, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchProductsAsync } from '@/lib/store/slices/productsSlice';
import ProductGrid from '@/components/shared/ProductGrid';
import { Package, Filter, ArrowLeft, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function SubcategoryPage(): React.JSX.Element {
  const dispatch = useAppDispatch();
  const params = useParams();
  const slug = params.slug as string;
  const subcategory = params.subcategory as string[];
  
  // Redux state
  const { items: products, isLoading: productsLoading } = useAppSelector((state) => state.products);
  
  // Load products on component mount
  useEffect(() => {
    dispatch(fetchProductsAsync({ category: slug, limit: 100 }));
  }, [dispatch, slug]);
  
  // Build breadcrumb path
  const fullPath = [slug, ...subcategory].join(' > ');
  const categoryName = fullPath.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');

  // Get parent category for filtering
  const parentCategory = slug.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');

  // Filter products by category and subcategory keywords
  const filteredProducts = useMemo(() => {
    const searchTerms = [slug, ...subcategory].map(term => term.toLowerCase());
    
    return products.filter(product => {
      const productName = product.name.toLowerCase();
      const productCategory = product.category.toLowerCase();
      const productBrand = product.brand?.toLowerCase() || '';
      
      // Check if any search term matches
      return searchTerms.some(term => 
        productCategory.includes(term) ||
        productName.includes(term) ||
        productBrand.includes(term) ||
        // Also check parent category
        productCategory.includes(parentCategory.toLowerCase())
      );
    });
  }, [slug, subcategory, parentCategory, products]);

  // Generate breadcrumb
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '), href: `/category/${slug}` },
    ...subcategory.map((sub, idx) => ({
      label: sub.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      href: `/category/${slug}/${subcategory.slice(0, idx + 1).join('/')}`,
    })),
  ];

  // Loading state
  if (productsLoading) {
    return (
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* Breadcrumb Navigation */}
          <nav className="mb-6">
            <ol className="flex items-center gap-2 text-sm flex-wrap">
              {breadcrumbs.map((crumb, index) => (
                <li key={index} className="flex items-center gap-2">
                  {index > 0 && <span className="text-muted-foreground">/</span>}
                  {index === breadcrumbs.length - 1 ? (
                    <span className="font-medium text-foreground">{crumb.label}</span>
                  ) : (
                    <Link href={crumb.href} className="text-muted-foreground hover:text-primary transition-colors">
                      {crumb.label}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>

          {/* Back Button */}
          <Link href={`/category/${slug}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to {slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
          </Link>

          {/* Category Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-3">{categoryName}</h1>
            <p className="text-lg text-muted-foreground mb-4">
              Browse our selection of {categoryName.toLowerCase()} products.
            </p>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} available
              </span>
            </div>
          </div>

          {/* Filters and Sort */}
          <Card className="mb-6">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Filters</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    Price: Low to High
                  </Button>
                  <Button variant="outline" size="sm">
                    Featured
                  </Button>
                  <Button variant="outline" size="sm">
                    Best Sellers
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <ProductGrid products={filteredProducts} />
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h2 className="text-2xl font-bold mb-2">No Products Found</h2>
                <p className="text-muted-foreground mb-6">
                  We couldn&apos;t find any products in this subcategory yet.
                </p>
                <Link href={`/category/${slug}`}>
                  <Button>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to {slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </>
  );
}

