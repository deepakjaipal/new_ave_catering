'use client';

import { lazy, Suspense, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchProductsAsync } from '@/lib/store/slices/productsSlice';
import { fetchCategoriesAsync } from '@/lib/store/slices/categoriesSlice';
import CategoryNav from '@/components/layout/CategoryNav';

const ProductSection = lazy(() => import('@/components/home/ProductSection'));
const CategoryBanner = lazy(() => import('@/components/home/CategoryBanner'));
const TopCarousel = lazy(() => import('@/components/home/TopCarousel'));
const FlashDealsBanner = lazy(() => import('@/components/home/FlashDealsBanner'));

export default function HomePage(): React.JSX.Element {
  const dispatch = useAppDispatch();
  const { items: products, isLoading: productsLoading } = useAppSelector((state) => state.products);
  const { categories, isLoading: categoriesLoading } = useAppSelector((state) => state.categories);

  // Load products and categories on component mount
  useEffect(() => {
    dispatch(fetchProductsAsync({ limit: 20 }));
    dispatch(fetchCategoriesAsync());
  }, [dispatch]);

  // Filter products for different sections
  const dealsProducts = products.filter(p => p.isOnOffer).slice(0, 6);
  const featuredProducts = products.filter(p => p.isFeatured).slice(0, 6);
  const newProducts = products.slice(0, 6);
  const topSelling = products.slice(6, 12);
  
  // Use real categories for CategoryBanner
  const featuredCategories = categories.slice(0, 6);

  return (
            <>
              <CategoryNav />
              
              <main className="min-h-screen">
                <Suspense fallback={<div className="h-96 animate-pulse bg-gray-100" />}>
                  <TopCarousel />
                </Suspense>
                
                <Suspense fallback={<div className="h-64 animate-pulse bg-gray-100" />}>
                  <FlashDealsBanner />
                </Suspense>
                

        <Suspense fallback={<div className="h-96 animate-pulse bg-gray-100" />}>
          <ProductSection
            title="Wow! Deals"
            subtitle="Limited time offers on popular products"
            products={dealsProducts}
            viewAllLink="/category/deals"
          />
        </Suspense>

        <Suspense fallback={<div className="h-96 animate-pulse bg-gray-100" />}>
          <CategoryBanner categories={featuredCategories} />
        </Suspense>

        <Suspense fallback={<div className="h-96 animate-pulse bg-gray-100" />}>
          <ProductSection
            title="Featured Products"
            subtitle="Handpicked items for your business"
            products={featuredProducts}
            viewAllLink="/products/featured"
          />
        </Suspense>

        <Suspense fallback={<div className="h-96 animate-pulse bg-gray-100" />}>
          <ProductSection
            title="New & Exciting"
            subtitle="Discover our latest arrivals"
            products={newProducts}
            viewAllLink="/category/new-exciting"
          />
        </Suspense>

        <Suspense fallback={<div className="h-96 animate-pulse bg-gray-100" />}>
          <ProductSection
            title="Top Selling"
            subtitle="Most popular items this month"
            products={topSelling}
            viewAllLink="/products/top-selling"
          />
        </Suspense>
      </main>
    </>
  );
}
