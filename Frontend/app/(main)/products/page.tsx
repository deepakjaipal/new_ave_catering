'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchProductsAsync, setFilters } from '@/lib/store/slices/productsSlice';
import { fetchCategoriesAsync } from '@/lib/store/slices/categoriesSlice';
import CategoryNav from '@/components/layout/CategoryNav';
import ProductGrid from '@/components/shared/ProductGrid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, SlidersHorizontal, Loader2 } from 'lucide-react';

export default function ProductsPage(): React.JSX.Element {
  const dispatch = useAppDispatch();
  const { items: products, isLoading: productsLoading, pagination, filters } = useAppSelector((state) => state.products);
  const { categories, isLoading: categoriesLoading } = useAppSelector((state) => state.categories);
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Load data on component mount
  useEffect(() => {
    dispatch(fetchProductsAsync({ limit: 20 }));
    dispatch(fetchCategoriesAsync());
  }, [dispatch]);

  // Update filters when search or category changes
  useEffect(() => {
    const newFilters = {
      ...filters,
      search: searchQuery || undefined,
      category: selectedCategory || undefined,
      page: 1, // Reset to first page when filters change
    };
    dispatch(setFilters(newFilters));
    dispatch(fetchProductsAsync(newFilters));
  }, [searchQuery, selectedCategory, dispatch]);

  // Get unique categories from products
  const productCategories = Array.from(new Set(products.map(p => p.category)));

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchQuery(e.target.value);
  };

  const handleCategoryClick = (category: string | null): void => {
    setSelectedCategory(category);
  };

  const clearFilters = (): void => {
    setSearchQuery('');
    setSelectedCategory(null);
  };

  const handlePageChange = (page: number): void => {
    const newFilters = { ...filters, page };
    dispatch(setFilters(newFilters));
    dispatch(fetchProductsAsync(newFilters));
  };

  return (
    <>
      <CategoryNav />
      
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">All Products</h1>
            <p className="text-muted-foreground">
              Browse our complete collection of wholesale products
            </p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </Button>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2 mt-4">
              <Button
                variant={selectedCategory === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleCategoryClick(null)}
              >
                All
              </Button>
              {productCategories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleCategoryClick(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              Showing {products.length} of {pagination.total} products
              {selectedCategory && ` in "${selectedCategory}"`}
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          </div>

          {/* Loading State */}
          {productsLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading products...</span>
            </div>
          ) : (
            <>
              {/* Products Grid */}
              {products.length > 0 ? (
                <>
                  <ProductGrid products={products} columns={4} />
                  
                  {/* Pagination */}
                  {pagination.pages > 1 && (
                    <div className="flex justify-center mt-8">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(pagination.page - 1)}
                          disabled={!pagination.hasPrev}
                        >
                          Previous
                        </Button>
                        <span className="px-4 py-2 text-sm text-muted-foreground">
                          Page {pagination.page} of {pagination.pages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(pagination.page + 1)}
                          disabled={!pagination.hasNext}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-20">
                  <p className="text-muted-foreground text-lg">No products found</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={clearFilters}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}
