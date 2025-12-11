'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Users, 
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { getOrderStats } from '@/lib/api/services/orderService';
import { getUserStats } from '@/lib/api/services/authService';
import { getOfferStats } from '@/lib/api/services/offerService';
import { getProducts } from '@/lib/api/services/productService';
import { getAllOrders } from '@/lib/api/services/orderService';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  recentOrders: number;
  lowStockCount: number;
}

interface RecentOrder {
  _id: string;
  user: {
    name: string;
    email: string;
  };
  totalPrice: number;
  isDelivered: boolean;
  createdAt: string;
}

interface LowStockProduct {
  _id: string;
  name: string;
  countInStock: number;
  minStock: number;
  category: string;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <Clock className="h-4 w-4 text-yellow-600" />;
    case 'processing':
      return <AlertCircle className="h-4 w-4 text-blue-600" />;
    case 'shipped':
      return <TrendingUp className="h-4 w-4 text-purple-600" />;
    case 'delivered':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'cancelled':
      return <XCircle className="h-4 w-4 text-red-600" />;
    default:
      return null;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'processing':
      return 'bg-blue-100 text-blue-800';
    case 'shipped':
      return 'bg-purple-100 text-purple-800';
    case 'delivered':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    recentOrders: 0,
    lowStockCount: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all stats in parallel
      const [orderStats, userStats, productData, recentOrdersData] = await Promise.all([
        getOrderStats(),
        getUserStats(),
        getProducts({ limit: 1000 }), // Get all products to check stock
        getAllOrders({ limit: 5 }), // Get recent orders
      ]);

      // Calculate low stock products (map API Product -> LowStockProduct)
      const lowStock: LowStockProduct[] = productData.products
        .filter((product) => product.stockQuantity <= 10)
        .map((product) => ({
          _id: product._id,
          name: product.name,
          countInStock: product.stockQuantity,
          minStock: 10,
          category: product.category,
        }));

      setStats({
        totalRevenue: orderStats.totalRevenue,
        totalOrders: orderStats.totalOrders,
        totalProducts: productData.pagination.total,
        totalCustomers: userStats.totalUsers,
        recentOrders: orderStats.recentOrders,
        lowStockCount: lowStock.length,
      });

      setRecentOrders(recentOrdersData.orders);
      setLowStockProducts(lowStock.slice(0, 4)); // Show top 4 low stock items
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return date.toLocaleDateString();
  };

  const getOrderStatus = (isDelivered: boolean) => {
    return isDelivered ? 'delivered' : 'pending';
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's what's happening with your store today.
          </p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  const statsData = [
    {
      name: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      change: `+${stats.recentOrders} recent`,
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-gradient-to-br from-green-50 to-green-100',
      iconBg: 'bg-green-500',
    },
    {
      name: 'Orders',
      value: stats.totalOrders.toString(),
      change: `${stats.recentOrders} recent`,
      trend: 'up',
      icon: ShoppingCart,
      color: 'text-[#006e9d]',
      bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
      iconBg: 'bg-[#006e9d]',
    },
    {
      name: 'Products',
      value: stats.totalProducts.toString(),
      change: `${stats.lowStockCount} low stock`,
      trend: stats.lowStockCount > 0 ? 'warning' : 'up',
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-gradient-to-br from-purple-50 to-purple-100',
      iconBg: 'bg-purple-500',
    },
    {
      name: 'Customers',
      value: stats.totalCustomers.toString(),
      change: 'Active users',
      trend: 'up',
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-gradient-to-br from-orange-50 to-orange-100',
      iconBg: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here's what's happening with your store today.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat) => (
          <Card key={stat.name} className={`${stat.bgColor} border-0 shadow-md hover:shadow-xl transition-all duration-300`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.name}
                  </p>
                  <p className="text-3xl font-bold mt-2 text-gray-900">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {stat.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : stat.trend === 'down' ? (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                    )}
                    <span className={`text-xs font-medium ${
                      stat.trend === 'up' ? 'text-green-600' : 
                      stat.trend === 'down' ? 'text-red-600' : 
                      'text-yellow-600'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className={`p-4 rounded-2xl ${stat.iconBg} shadow-lg`}>
                  <stat.icon className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent orders */}
        <Card className="lg:col-span-1 border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-[#006e9d]/5 to-transparent">
            <div>
              <CardTitle className="text-[#006e9d]">Recent Orders</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Latest orders from your customers
              </p>
            </div>
            <Link href="/admin/orders">
              <Button variant="ghost" size="sm" className="gap-1 text-[#006e9d] hover:bg-[#006e9d]/10">
                View All
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No recent orders</p>
                </div>
              ) : (
                recentOrders.map((order) => (
                  <div
                    key={order._id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center justify-center">
                        {getStatusIcon(getOrderStatus(order.isDelivered))}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{order._id.slice(-8).toUpperCase()}</p>
                          <Badge
                            variant="secondary"
                            className={`text-xs ${getStatusColor(getOrderStatus(order.isDelivered))}`}
                          >
                            {getOrderStatus(order.isDelivered)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {order.user.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">
                        {formatCurrency(order.totalPrice)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Low stock alert */}
        <Card className="lg:col-span-1 border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-yellow-50 to-transparent">
            <div>
              <CardTitle className="flex items-center gap-2 text-yellow-700">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                Low Stock Alert
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Products that need restocking
              </p>
            </div>
            <Link href="/admin/products?filter=low-stock">
              <Button variant="ghost" size="sm" className="gap-1 text-yellow-700 hover:bg-yellow-50">
                View All
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStockProducts.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-muted-foreground">All products are well stocked!</p>
                </div>
              ) : (
                lowStockProducts.map((product) => (
                  <div
                    key={product._id}
                    className="flex items-center justify-between p-4 rounded-lg border border-yellow-200 bg-yellow-50"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.category}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden max-w-[100px]">
                          <div
                            className="h-full bg-yellow-500"
                            style={{
                              width: `${Math.min((product.countInStock / product.minStock) * 100, 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs font-medium text-yellow-700">
                          {product.countInStock} left
                        </span>
                      </div>
                    </div>
                    <Link href={`/admin/products/${product._id}`}>
                      <Button size="sm" variant="outline">
                        Restock
                      </Button>
                    </Link>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-md">
        <CardHeader className="bg-gradient-to-r from-[#006e9d]/5 to-transparent">
          <CardTitle className="text-[#006e9d]">Quick Actions</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Common administrative tasks
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/admin/products/new">
              <Card className="border border-gray-200 hover:border-[#006e9d] hover:shadow-md transition-all cursor-pointer">
                <CardContent className="p-4 text-center">
                  <Package className="h-8 w-8 text-[#006e9d] mx-auto mb-2" />
                  <p className="font-medium text-sm">Add Product</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/admin/offers/new">
              <Card className="border border-gray-200 hover:border-[#006e9d] hover:shadow-md transition-all cursor-pointer">
                <CardContent className="p-4 text-center">
                  <DollarSign className="h-8 w-8 text-[#006e9d] mx-auto mb-2" />
                  <p className="font-medium text-sm">Create Offer</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/admin/reports">
              <Card className="border border-gray-200 hover:border-[#006e9d] hover:shadow-md transition-all cursor-pointer">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 text-[#006e9d] mx-auto mb-2" />
                  <p className="font-medium text-sm">View Reports</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/admin/settings">
              <Card className="border border-gray-200 hover:border-[#006e9d] hover:shadow-md transition-all cursor-pointer">
                <CardContent className="p-4 text-center">
                  <AlertCircle className="h-8 w-8 text-[#006e9d] mx-auto mb-2" />
                  <p className="font-medium text-sm">Settings</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

