'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/lib/store/hooks';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Package, 
  ChevronRight,
  Calendar,
  ShoppingBag,
  Search,
  Filter,
  Loader2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { getUserOrders, Order as APIOrder } from '@/lib/api/services/orderService';

export default function OrdersPage(): React.JSX.Element {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [orders, setOrders] = useState<APIOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | 'all'>('all');

  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated) return;
      
      try {
        setLoading(true);
        const userOrders = await getUserOrders();
        setOrders(userOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated]);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredOrders = useMemo(() => {
    let filtered = [...orders];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((order) => {
        // Map API status to our status filter
        if (statusFilter === 'pending') return !order.isPaid;
        if (statusFilter === 'processing') return order.isPaid && !order.isDelivered;
        if (statusFilter === 'shipped') return order.isPaid && !order.isDelivered;
        if (statusFilter === 'delivered') return order.isDelivered;
        return true;
      });
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((order) => 
        order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.orderItems.some((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return filtered;
  }, [orders, statusFilter, searchQuery]);

  const orderStats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => !o.isPaid).length;
    const processing = orders.filter((o) => o.isPaid && !o.isDelivered).length;
    const shipped = orders.filter((o) => o.isPaid && !o.isDelivered).length;
    const delivered = orders.filter((o) => o.isDelivered).length;

    return { total, pending, processing, shipped, delivered };
  }, [orders]);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-3xl font-bold mb-4">Please Login</h1>
        <p className="text-muted-foreground mb-6">
          You need to be logged in to view your orders
        </p>
        <Link href="/auth/login">
          <Button>Login</Button>
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading orders...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">My Orders</h1>
            <p className="text-muted-foreground">Track and manage your orders</p>
          </div>

          {/* Order Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <Card 
              className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === 'all' ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              <CardContent className="pt-6 text-center">
                <p className="text-2xl font-bold">{orderStats.total}</p>
                <p className="text-sm text-muted-foreground">Total Orders</p>
              </CardContent>
            </Card>
            <Card 
              className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === 'pending' ? 'ring-2 ring-yellow-500' : ''}`}
              onClick={() => setStatusFilter('pending')}
            >
              <CardContent className="pt-6 text-center">
                <p className="text-2xl font-bold text-yellow-600">{orderStats.pending}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </CardContent>
            </Card>
            <Card 
              className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === 'processing' ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => setStatusFilter('processing')}
            >
              <CardContent className="pt-6 text-center">
                <p className="text-2xl font-bold text-blue-600">{orderStats.processing}</p>
                <p className="text-sm text-muted-foreground">Processing</p>
              </CardContent>
            </Card>
            <Card 
              className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === 'shipped' ? 'ring-2 ring-purple-500' : ''}`}
              onClick={() => setStatusFilter('shipped')}
            >
              <CardContent className="pt-6 text-center">
                <p className="text-2xl font-bold text-purple-600">{orderStats.shipped}</p>
                <p className="text-sm text-muted-foreground">Shipped</p>
              </CardContent>
            </Card>
            <Card 
              className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === 'delivered' ? 'ring-2 ring-green-500' : ''}`}
              onClick={() => setStatusFilter('delivered')}
            >
              <CardContent className="pt-6 text-center">
                <p className="text-2xl font-bold text-green-600">{orderStats.delivered}</p>
                <p className="text-sm text-muted-foreground">Delivered</p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by order number or product name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button
                  variant={statusFilter !== 'all' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('all')}
                  className="whitespace-nowrap"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  {statusFilter !== 'all' ? 'Clear Filter' : 'All Orders'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-2xl font-bold mb-2">
                  {orders.length === 0 ? 'No Orders Yet' : 'No Orders Found'}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {orders.length === 0 
                    ? 'Start shopping to create your first order' 
                    : 'Try adjusting your search or filter criteria'
                  }
                </p>
                {orders.length === 0 && (
                  <Link href="/products">
                    <Button>Browse Products</Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <Card key={order._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <div className="p-6">
                      {/* Order Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-xl font-bold">#{order._id.slice(-8)}</h3>
                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded border ${
                              order.isDelivered ? 'bg-green-100 text-green-800 border-green-200' :
                              order.isPaid ? 'bg-blue-100 text-blue-800 border-blue-200' :
                              'bg-yellow-100 text-yellow-800 border-yellow-200'
                            } capitalize`}>
                              {order.isDelivered ? 'delivered' : order.isPaid ? 'paid' : 'pending'}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDate(order.createdAt)}
                            </span>
                            <span>{order.orderItems.length} item{order.orderItems.length > 1 ? 's' : ''}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">${order.totalPrice.toFixed(2)}</p>
                        </div>
                      </div>

                      {/* Order Items Preview */}
                      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                        {order.orderItems.slice(0, 4).map((item) => (
                          <div 
                            key={item._id || item.product} 
                            className="relative h-16 w-16 flex-shrink-0 rounded-md overflow-hidden bg-gray-100"
                          >
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                              unoptimized={item.image.includes('placehold.co')}
                            />
                          </div>
                        ))}
                        {order.orderItems.length > 4 && (
                          <div className="h-16 w-16 flex-shrink-0 rounded-md bg-gray-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-muted-foreground">
                              +{order.orderItems.length - 4}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Order Actions */}
                      <div className="flex gap-3">
                        <Link href={`/orders/${order._id}`} className="flex-1">
                          <Button variant="default" className="w-full">
                            Track Order
                            <ChevronRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                        {order.isDelivered && (
                          <Button variant="outline">
                            Order Again
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

