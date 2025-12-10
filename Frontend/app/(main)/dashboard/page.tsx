'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/lib/store/hooks';
import { ShoppingBag, FileText, Package, User, Calendar, ChevronRight, TrendingUp, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { getUserOrders, Order as APIOrder } from '@/lib/api/services/orderService';
import { getUserProfile, User as APIUser } from '@/lib/api/services/authService';

interface Stat {
  title: string;
  value: string;
  icon: typeof ShoppingBag;
  description: string;
  color: string;
  bgColor: string;
}

export default function DashboardPage(): React.JSX.Element {
  const router = useRouter();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { items: cartItems } = useAppSelector((state) => state.cart);
  const [orders, setOrders] = useState<APIOrder[]>([]);
  const [userProfile, setUserProfile] = useState<APIUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [userOrders, profile] = await Promise.all([
          getUserOrders(),
          getUserProfile()
        ]);
        setOrders(userOrders);
        setUserProfile(profile);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return <></>;
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  // Calculate order stats
  const totalOrders = orders.length;
  const activeOrders = orders.filter(
    (o) => !o.isDelivered
  ).length;
  const totalSpent = orders.reduce((sum, order) => sum + order.totalPrice, 0);

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

  const stats: Stat[] = [
    {
      title: 'Total Orders',
      value: totalOrders.toString(),
      icon: ShoppingBag,
      description: 'All time',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Active Orders',
      value: activeOrders.toString(),
      icon: Package,
      description: 'In progress',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Total Spent',
      value: `$${totalSpent.toFixed(0)}`,
      icon: TrendingUp,
      description: 'All time',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Account Status',
      value: userProfile?.isAdmin ? 'Admin' : 'User',
      icon: User,
      description: userProfile?.businessName || 'N/A',
      color: userProfile?.isAdmin ? 'text-purple-600' : 'text-blue-600',
      bgColor: userProfile?.isAdmin ? 'bg-purple-100' : 'bg-blue-100',
    },
  ];

  // Get recent orders (last 3)
  const recentOrders = orders.slice(0, 3);

  return (
    <>
      
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">
              Welcome back, {userProfile?.name || user?.name}!
            </h1>
            <p className="text-muted-foreground">
              {userProfile?.businessName && `${userProfile.businessName} • `}
              Manage your wholesale account
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold mb-1">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">
                        {stat.description}
                      </p>
                    </div>
                    <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks and shortcuts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/products">
                  <Button variant="outline" className="w-full justify-start">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Browse Products
                  </Button>
                </Link>
                <Link href="/orders">
                  <Button variant="outline" className="w-full justify-start">
                    <Package className="mr-2 h-4 w-4" />
                    View Orders
                  </Button>
                </Link>
                <Link href="/checkout">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    disabled={cartItems.length === 0}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    {cartItems.length > 0 ? `Checkout (${cartItems.length} items)` : 'Cart is Empty'}
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Your business details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-sm">{userProfile?.email || user?.email}</p>
                </div>
                {userProfile?.businessName && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Business</p>
                    <p className="text-sm">{userProfile.businessName}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Account Type</p>
                  <p className="text-sm capitalize">{userProfile?.isAdmin ? 'Admin' : 'User'}</p>
                </div>
                <Button variant="outline" className="w-full">
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>
                  Your latest transactions
                </CardDescription>
              </div>
              {recentOrders.length > 0 && (
                <Link href="/orders">
                  <Button variant="ghost" size="sm">
                    View All
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              )}
            </CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No orders yet</p>
                  <Link href="/products">
                    <Button variant="outline" className="mt-4">
                      Start Shopping
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div 
                      key={order._id} 
                      className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => router.push(`/orders/${order._id}`)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="font-semibold">#{order._id.slice(-8)}</div>
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded border ${
                            order.isDelivered ? 'bg-green-100 text-green-800 border-green-200' :
                            order.isPaid ? 'bg-blue-100 text-blue-800 border-blue-200' :
                            'bg-yellow-100 text-yellow-800 border-yellow-200'
                          } capitalize`}>
                            {order.isDelivered ? 'delivered' : order.isPaid ? 'paid' : 'pending'}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-primary">${order.totalPrice.toFixed(2)}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(order.createdAt)}
                          </div>
                        </div>
                      </div>
                      
                      {/* Order Items Preview */}
                      <div className="flex gap-2 mb-3">
                        {order.orderItems.slice(0, 3).map((item) => (
                          <div 
                            key={item._id || item.product} 
                            className="relative h-12 w-12 flex-shrink-0 rounded-md overflow-hidden bg-gray-100"
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
                        {order.orderItems.length > 3 && (
                          <div className="h-12 w-12 flex-shrink-0 rounded-md bg-gray-100 flex items-center justify-center">
                            <span className="text-xs font-medium text-muted-foreground">
                              +{order.orderItems.length - 3}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 flex items-center">
                          <p className="text-sm text-muted-foreground">
                            {order.orderItems.length} item{order.orderItems.length > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>

                      <Button variant="outline" size="sm" className="w-full">
                        Track Order
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
