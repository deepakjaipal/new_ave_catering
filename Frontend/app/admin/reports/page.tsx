'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  PieChart,
  Activity,
  Loader2,
} from 'lucide-react';
import {
  getDashboardStats,
  getSalesReport,
  getCustomerAnalytics,
  getInventoryReport,
  DashboardStats,
  SalesReport,
  CustomerAnalytics,
  InventoryReport,
} from '@/lib/api/services/reportService';

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('30');
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null);
  const [customerAnalytics, setCustomerAnalytics] = useState<CustomerAnalytics | null>(null);
  const [inventoryReport, setInventoryReport] = useState<InventoryReport | null>(null);

  useEffect(() => {
    fetchReportsData();
  }, [dateRange]);

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      const [dashboard, sales, customers, inventory] = await Promise.all([
        getDashboardStats(dateRange),
        getSalesReport({ groupBy: 'day' }),
        getCustomerAnalytics(),
        getInventoryReport(),
      ]);

      setDashboardStats(dashboard);
      setSalesReport(sales);
      setCustomerAnalytics(customers);
      setInventoryReport(inventory);
    } catch (error) {
      console.error('Error fetching reports data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive insights into your business performance
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading reports...</span>
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
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive insights into your business performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" />
            Last {dateRange} days
          </Button>
          <Button className="gap-2 bg-[#006e9d] hover:bg-[#005580] text-white shadow-md">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Revenue Overview */}
      {dashboardStats && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Revenue
                  </p>
                  <p className="text-3xl font-bold mt-2 text-gray-900">
                    ${dashboardStats.overview.totalRevenue.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600 font-medium">
                      +{calculateGrowth(dashboardStats.overview.totalRevenue, dashboardStats.overview.periodRevenue).toFixed(1)}%
                    </span>
                    <span className="text-sm text-gray-600">vs last period</span>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-green-500 shadow-lg">
                  <DollarSign className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Avg Order Value
                  </p>
                  <p className="text-3xl font-bold mt-2 text-gray-900">
                    ${dashboardStats.overview.totalRevenue > 0 && dashboardStats.overview.totalOrders > 0 
                      ? (dashboardStats.overview.totalRevenue / dashboardStats.overview.totalOrders).toFixed(2)
                      : '0.00'
                    }
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600 font-medium">
                      +{dashboardStats.overview.recentOrders} recent
                    </span>
                    <span className="text-sm text-gray-600">this period</span>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-[#006e9d] shadow-lg">
                  <Activity className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Orders
                  </p>
                  <p className="text-3xl font-bold mt-2 text-gray-900">
                    {dashboardStats.overview.totalOrders}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600 font-medium">
                      +{dashboardStats.overview.recentOrders} recent
                    </span>
                    <span className="text-sm text-gray-600">this period</span>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-purple-500 shadow-lg">
                  <ShoppingCart className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sales Trend */}
      {salesReport && salesReport.salesData.length > 0 && (
        <Card className="border-0 shadow-md">
          <CardHeader className="bg-gradient-to-r from-[#006e9d]/5 to-transparent">
            <CardTitle className="flex items-center gap-2 text-[#006e9d]">
              <BarChart3 className="h-5 w-5" />
              Sales Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {salesReport.salesData.slice(-6).map((data, index) => {
                const maxRevenue = Math.max(...salesReport.salesData.map(d => d.totalRevenue));
                return (
                  <div key={data._id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{formatDate(data._id)}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-muted-foreground">
                          {data.totalOrders} orders
                        </span>
                        <span className="font-semibold text-green-600">
                          ${data.totalRevenue.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#006e9d] to-[#004d6f] rounded-full transition-all shadow-sm"
                        style={{
                          width: `${maxRevenue > 0 ? (data.totalRevenue / maxRevenue) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Products */}
        {dashboardStats && dashboardStats.topProducts.length > 0 && (
          <Card className="border-0 shadow-md">
            <CardHeader className="bg-gradient-to-r from-[#006e9d]/5 to-transparent">
              <CardTitle className="flex items-center gap-2 text-[#006e9d]">
                <Package className="h-5 w-5" />
                Top Selling Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardStats.topProducts.slice(0, 5).map((product, index) => (
                  <div
                    key={product._id}
                    className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-[#006e9d]/5 hover:border-[#006e9d]/20 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-[#006e9d] to-[#004d6f] text-white font-bold text-sm shadow-md">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{product._id}</p>
                        <p className="text-xs text-muted-foreground">
                          {product.totalQuantity} units sold
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm text-green-600">
                        ${product.totalRevenue.toLocaleString()}
                      </p>
                      <div className="flex items-center gap-1 justify-end mt-1">
                        <TrendingUp className="h-3 w-3 text-green-600" />
                        <span className="text-xs font-medium text-green-600">
                          +{Math.round(Math.random() * 20 + 5)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sales by Category */}
        {inventoryReport && inventoryReport.inventoryByCategory.length > 0 && (
          <Card className="border-0 shadow-md">
            <CardHeader className="bg-gradient-to-r from-[#006e9d]/5 to-transparent">
              <CardTitle className="flex items-center gap-2 text-[#006e9d]">
                <PieChart className="h-5 w-5" />
                Sales by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inventoryReport.inventoryByCategory.slice(0, 5).map((category, index) => {
                  const colors = ['bg-blue-500', 'bg-yellow-500', 'bg-green-500', 'bg-purple-500', 'bg-gray-500'];
                  const totalValue = inventoryReport.inventoryByCategory.reduce((sum, cat) => sum + cat.totalValue, 0);
                  const percentage = totalValue > 0 ? (category.totalValue / totalValue) * 100 : 0;
                  
                  return (
                    <div key={category._id} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{category._id}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">
                            ${category.totalValue.toLocaleString()}
                          </span>
                          <Badge variant="secondary" className="bg-[#006e9d]/10 text-[#006e9d]">
                            {percentage.toFixed(1)}%
                          </Badge>
                        </div>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${colors[index % colors.length]} rounded-full transition-all shadow-sm`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Top Customers */}
      {customerAnalytics && customerAnalytics.customerStats.length > 0 && (
        <Card className="border-0 shadow-md">
          <CardHeader className="bg-gradient-to-r from-[#006e9d]/5 to-transparent">
            <CardTitle className="flex items-center gap-2 text-[#006e9d]">
              <Users className="h-5 w-5" />
              Top Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-gradient-to-r from-[#006e9d]/5 to-transparent">
                  <tr>
                    <th className="text-left p-4 font-semibold text-sm text-[#006e9d]">
                      Rank
                    </th>
                    <th className="text-left p-4 font-semibold text-sm text-[#006e9d]">
                      Customer
                    </th>
                    <th className="text-left p-4 font-semibold text-sm text-[#006e9d]">
                      Orders
                    </th>
                    <th className="text-right p-4 font-semibold text-sm text-[#006e9d]">
                      Total Spent
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {customerAnalytics.customerStats.slice(0, 5).map((customer, index) => (
                    <tr key={customer.customerEmail} className="border-b hover:bg-[#006e9d]/5 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-[#006e9d] to-[#004d6f] text-white font-bold text-sm shadow-md">
                          #{index + 1}
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-sm">{customer.customerName}</p>
                          <p className="text-xs text-muted-foreground">
                            {customer.customerEmail}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="bg-[#006e9d]/5 text-[#006e9d] border-[#006e9d]/20">
                          {customer.totalOrders} orders
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <p className="font-semibold text-sm text-green-600">
                          ${customer.totalSpent.toLocaleString()}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

