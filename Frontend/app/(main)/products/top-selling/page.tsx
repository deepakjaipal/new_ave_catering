'use client';

import { useState, useEffect } from 'react';
import CategoryNav from '@/components/layout/CategoryNav';
import ProductSection from '@/components/home/ProductSection';
import { Product } from '@/lib/store/slices/productsSlice';
import { getTopSellingProducts } from '@/lib/api/services/productService';
import { Loader2 } from 'lucide-react';

export default function TopSellingPage(): React.JSX.Element {
  const [topSellingProducts, setTopSellingProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopSellingProducts = async () => {
      try {
        setLoading(true);
        const response = await getTopSellingProducts(20);
        setTopSellingProducts(response.products);
      } catch (error) {
        console.error('Error fetching top selling products:', error);
        setTopSellingProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopSellingProducts();
  }, []);

  if (loading) {
    return (
      <>
        <CategoryNav />
        <main className="container mx-auto px-4 py-8 min-h-screen">
          <div className="text-center py-20">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading top selling products...</span>
            </div>
          </div>
        </main>
      </>
    );
  }
  return (
    <>
      <CategoryNav />
      
      <main className="container mx-auto px-4 py-8 min-h-screen">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-primary">Top Selling Items</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover our most popular products that customers love. These top-selling items are 
            consistently in high demand and perfect for your business.
          </p>
        </div>

        {/* Top Selling Products Grid */}
        {topSellingProducts.length > 0 ? (
          <ProductSection
            title="🔥 Best Sellers"
            subtitle="Our most popular products based on sales data"
            products={topSellingProducts}
            columns={6}
          />
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">No Sales Data Yet</h3>
            <p className="text-muted-foreground mb-4">
              We don't have enough sales data to show top selling products yet. 
              Check back after some orders have been placed.
            </p>
            <a href="/products" className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors">
              Browse All Products
            </a>
          </div>
        )}

        {/* Additional Categories */}
        {topSellingProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-center mb-8">Top Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(() => {
                // Group products by category
                const categoryGroups = topSellingProducts.reduce((acc, product) => {
                  const category = product.category || 'Other';
                  if (!acc[category]) {
                    acc[category] = [];
                  }
                  acc[category].push(product);
                  return acc;
                }, {} as Record<string, Product[]>);

                // Get top 3 categories
                const topCategories = Object.entries(categoryGroups)
                  .sort(([,a], [,b]) => b.length - a.length)
                  .slice(0, 3);

                const categoryColors = [
                  { bg: 'from-blue-50 to-blue-100', text: 'text-blue-800', subtext: 'text-blue-600', items: 'text-blue-700' },
                  { bg: 'from-red-50 to-red-100', text: 'text-red-800', subtext: 'text-red-600', items: 'text-red-700' },
                  { bg: 'from-green-50 to-green-100', text: 'text-green-800', subtext: 'text-green-600', items: 'text-green-700' },
                ];

                return topCategories.map(([category, products], index) => {
                  const colors = categoryColors[index] || categoryColors[0];
                  return (
                    <div key={category} className={`bg-gradient-to-br ${colors.bg} p-6 rounded-lg`}>
                      <h3 className={`text-xl font-semibold ${colors.text} mb-2`}>{category}</h3>
                      <p className={`${colors.subtext} mb-4`}>
                        {products.length} top-selling {category.toLowerCase()} products
                      </p>
                      <div className={`text-sm ${colors.items}`}>
                        {products.slice(0, 3).map((product, idx) => (
                          <p key={idx}>• {product.name}</p>
                        ))}
                        {products.length > 3 && <p>• +{products.length - 3} more</p>}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 bg-primary/5 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Need Help Choosing?</h2>
          <p className="text-muted-foreground mb-6">
            Our top-selling items are perfect for businesses looking to stock popular products. 
            Contact us for bulk pricing and custom orders.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="tel:(323) 250-3212" 
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Call (323) 250-3212
            </a>
            <a 
              href="mailto:help@mercaso.com" 
              className="border border-primary text-primary px-6 py-3 rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              Email Us
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
