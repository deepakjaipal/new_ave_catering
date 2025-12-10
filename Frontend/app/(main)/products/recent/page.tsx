'use client';

import { useState, useEffect } from 'react';
import CategoryNav from '@/components/layout/CategoryNav';
import ProductSection from '@/components/home/ProductSection';
import { Product } from '@/lib/store/slices/productsSlice';
import { getUserOrders, Order } from '@/lib/api/services/orderService';
import { useAppSelector } from '@/lib/store/hooks';
import { Loader2 } from 'lucide-react';

export default function RecentProductsPage(): React.JSX.Element {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserOrders = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userOrders = await getUserOrders();
        setOrders(userOrders);
      } catch (error) {
        console.error('Error fetching user orders:', error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserOrders();
  }, [isAuthenticated]);

  // Extract recent products from orders
  const recentProducts: Product[] = orders
    .flatMap(order => order.orderItems)
    .reduce((unique: Product[], item) => {
      // Check if product already exists in unique array
      const exists = unique.find(p => p._id === item.product);
      if (!exists) {
        unique.push({
          _id: item.product,
          name: item.name,
          sku: '',
          category: 'Recent', // We don't have category in order items
          price: item.price,
          pricePerCase: item.price * 12, // Estimate case price
          unit: item.unit,
          packSize: item.packSize,
          image: item.image,
          description: `Recently purchased ${item.name}`,
          brand: 'Recent',
          stockQuantity: 0,
          inStock: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isFeatured: false,
          isOnOffer: false,
        });
      }
      return unique;
    }, [])
    .slice(0, 12); // Limit to 12 recent products

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (isDelivered: boolean, isPaid: boolean): string => {
    if (isDelivered) return 'bg-green-100 text-green-800';
    if (isPaid) return 'bg-blue-100 text-blue-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const getStatusText = (isDelivered: boolean, isPaid: boolean): string => {
    if (isDelivered) return 'Delivered';
    if (isPaid) return 'Processing';
    return 'Pending';
  };

  if (!isAuthenticated) {
    return (
      <>
        <CategoryNav />
        <main className="container mx-auto px-4 py-8 min-h-screen">
          <div className="text-center py-20">
            <h1 className="text-4xl font-bold mb-4 text-primary">Please Login</h1>
            <p className="text-lg text-muted-foreground mb-6">
              You need to be logged in to view your recent orders
            </p>
            <a href="/auth/login" className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors">
              Login
            </a>
          </div>
        </main>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <CategoryNav />
        <main className="container mx-auto px-4 py-8 min-h-screen">
          <div className="text-center py-20">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading your recent orders...</span>
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
          <h1 className="text-4xl font-bold mb-4 text-primary">Buy Again</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Quickly reorder your recently purchased items. These products were part of your 
            recent orders and are ready for quick reordering.
          </p>
        </div>

        {/* Recent Products Grid */}
        <ProductSection
          title="🔄 Recently Purchased"
          subtitle="Items from your recent orders"
          products={recentProducts}
          columns={6}
        />

        {/* Quick Reorder Section */}
        <div className="mt-16 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Quick Reorder Options</h2>
            <p className="text-muted-foreground">
              Save time by quickly reordering your most frequently purchased items
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📦</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Last Order</h3>
                <p className="text-muted-foreground mb-4">Reorder everything from your most recent purchase</p>
                <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                  Reorder All
                </button>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⭐</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Favorites</h3>
                <p className="text-muted-foreground mb-4">Reorder your most frequently purchased items</p>
                <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                  View Favorites
                </button>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🛒</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Saved Lists</h3>
                <p className="text-muted-foreground mb-4">Access your saved shopping lists</p>
                <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                  View Lists
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Order History */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">Recent Order History</h2>
          {orders.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold mb-2">No Orders Yet</h3>
              <p className="text-muted-foreground mb-4">
                You haven't placed any orders yet. Start shopping to see your order history here.
              </p>
              <a href="/products" className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors">
                Start Shopping
              </a>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.slice(0, 10).map((order) => (
                      <tr key={order._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{order._id.slice(-8)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.orderItems.length} items
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${order.totalPrice.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.isDelivered, order.isPaid)}`}>
                            {getStatusText(order.isDelivered, order.isPaid)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <a 
                            href={`/orders/${order._id}`}
                            className="text-primary hover:text-primary/80"
                          >
                            View Details
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
