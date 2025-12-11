'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Filter,
  MoreVertical,
  Eye,
  Truck,
  CheckCircle,
  XCircle,
  Download,
  Printer,
  Clock,
  DollarSign,
  ShoppingCart,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getAllOrders, updateOrder, deleteOrder, getOrderStats, Order, OrderStats } from '@/lib/api/services/orderService';

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <Clock className="h-4 w-4" />;
    case 'processing':
      return <AlertCircle className="h-4 w-4" />;
    case 'shipped':
      return <Truck className="h-4 w-4" />;
    case 'delivered':
      return <CheckCircle className="h-4 w-4" />;
    case 'cancelled':
      return <XCircle className="h-4 w-4" />;
    default:
      return null;
  }
};

const getStatusColor = (status: string) => {
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

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case 'paid':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'refunded':
      return 'bg-gray-100 text-gray-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [stats, setStats] = useState<OrderStats>({
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: 0,
    statusBreakdown: [],
  });

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, [page, searchQuery, filterStatus]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getAllOrders({
        search: searchQuery || undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        page,
        limit: 20,
      });
      
      setOrders(response.orders);
      setTotalPages(response.pagination.pages);
      setTotalOrders(response.pagination.total);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await getOrderStats();
      setStats(response);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateOrder(orderId, { status: newStatus });
      await fetchOrders();
      await fetchStats();
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Error updating order. Please try again.');
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      try {
        await deleteOrder(orderId);
        await fetchOrders();
        await fetchStats();
      } catch (error) {
        console.error('Error deleting order:', error);
        alert('Error deleting order. Please try again.');
      }
    }
  };

  const statuses = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
            <p className="text-muted-foreground mt-1">
              Manage and process customer orders
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading orders...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground mt-1">
            Manage and process customer orders
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">
                  {stats.statusBreakdown.find(s => s._id === 'pending')?.count || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#006e9d]/10">
                <ShoppingCart className="h-5 w-5 text-[#006e9d]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Processing</p>
                <p className="text-2xl font-bold">
                  {stats.statusBreakdown.find(s => s._id === 'processing')?.count || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Truck className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Shipped</p>
                <p className="text-2xl font-bold">
                  {stats.statusBreakdown.find(s => s._id === 'shipped')?.count || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search orders by ID, customer name, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Status: {filterStatus === 'all' ? 'All' : filterStatus}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {statuses.map((status) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() => setFilterStatus(status)}
                  >
                    {status === 'all' ? 'All Orders' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Orders table */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gradient-to-r from-[#006e9d]/5 to-transparent">
                <tr>
                  <th className="text-left p-4 font-semibold text-sm text-[#006e9d]">Order ID</th>
                  <th className="text-left p-4 font-semibold text-sm text-[#006e9d]">Customer</th>
                  <th className="text-left p-4 font-semibold text-sm text-[#006e9d]">Date</th>
                  <th className="text-left p-4 font-semibold text-sm text-[#006e9d]">Items</th>
                  <th className="text-left p-4 font-semibold text-sm text-[#006e9d]">Total</th>
                  <th className="text-left p-4 font-semibold text-sm text-[#006e9d]">Payment</th>
                  <th className="text-left p-4 font-semibold text-sm text-[#006e9d]">Status</th>
                  <th className="text-right p-4 font-semibold text-sm text-[#006e9d]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center p-8">
                      <div className="flex flex-col items-center gap-2">
                        <ShoppingCart className="h-12 w-12 text-muted-foreground" />
                        <p className="text-muted-foreground">No orders found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr
                      key={order._id}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4">
                        <code className="text-sm font-medium bg-gray-100 px-2 py-1 rounded">
                          {order._id.slice(-8).toUpperCase()}
                        </code>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-sm">{order.user.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {order.user.email}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-sm">{formatDate(order.createdAt)}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm">{order.orderItems.length} items</p>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-sm">
                          ${order.totalPrice.toFixed(2)}
                        </p>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant="secondary"
                          className={getPaymentStatusColor(order.isPaid ? 'paid' : 'pending')}
                        >
                          {order.isPaid ? 'paid' : 'pending'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant="outline"
                          className={`${getStatusColor(order.isDelivered ? 'delivered' : 'pending')} flex items-center gap-1 w-fit`}
                        >
                          {getStatusIcon(order.isDelivered ? 'delivered' : 'pending')}
                          {order.isDelivered ? 'delivered' : 'pending'}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/orders/${order._id}`} className="flex items-center cursor-pointer">
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                alert('Invoice printing functionality will be implemented');
                              }}
                            >
                              <Printer className="h-4 w-4 mr-2" />
                              Print Invoice
                            </DropdownMenuItem>
                            {!order.isDelivered && (
                              <DropdownMenuItem
                                onClick={() => {
                                  if (confirm(`Mark order as delivered?`)) {
                                    handleUpdateOrderStatus(order._id, 'delivered');
                                  }
                                }}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark as Delivered
                              </DropdownMenuItem>
                            )}
                            {!order.isDelivered && (
                              <DropdownMenuItem
                                onClick={() => {
                                  const tracking = prompt('Enter tracking number:');
                                  if (tracking) {
                                    handleUpdateOrderStatus(order._id, 'shipped');
                                  }
                                }}
                              >
                                <Truck className="h-4 w-4 mr-2" />
                                Mark as Shipped
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteOrder(order._id)}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Delete Order
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

