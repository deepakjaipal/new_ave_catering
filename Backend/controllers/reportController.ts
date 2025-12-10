import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import User from '../models/userModel.js';
import Offer from '../models/offerModel.js';

// @desc    Get dashboard statistics
// @route   GET /api/reports/dashboard
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  const { period = '30' } = req.query;
  const days = parseInt(period as string);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Get basic counts
  const totalOrders = await Order.countDocuments();
  const totalProducts = await Product.countDocuments();
  const totalUsers = await User.countDocuments();
  const totalOffers = await Offer.countDocuments();

  // Get recent counts (within period)
  const recentOrders = await Order.countDocuments({
    createdAt: { $gte: startDate }
  });
  const recentUsers = await User.countDocuments({
    createdAt: { $gte: startDate }
  });

  // Get revenue data
  const totalRevenue = await Order.aggregate([
    { $group: { _id: null, total: { $sum: '$totalPrice' } } }
  ]);

  const periodRevenue = await Order.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    { $group: { _id: null, total: { $sum: '$totalPrice' } } }
  ]);

  // Get order status breakdown
  const orderStatusBreakdown = await Order.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  // Get top products by revenue
  const topProducts = await Order.aggregate([
    { $unwind: '$orderItems' },
    {
      $group: {
        _id: '$orderItems.name',
        totalRevenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
        totalQuantity: { $sum: '$orderItems.quantity' }
      }
    },
    { $sort: { totalRevenue: -1 } },
    { $limit: 10 }
  ]);

  // Get daily revenue for the period
  const dailyRevenue = await Order.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$totalPrice' },
        orders: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.json({
    overview: {
      totalOrders,
      totalProducts,
      totalUsers,
      totalOffers,
      recentOrders,
      recentUsers,
      totalRevenue: totalRevenue[0]?.total || 0,
      periodRevenue: periodRevenue[0]?.total || 0,
    },
    orderStatusBreakdown,
    topProducts,
    dailyRevenue,
  });
});

// @desc    Get sales report
// @route   GET /api/reports/sales
// @access  Private/Admin
const getSalesReport = asyncHandler(async (req, res) => {
  const { startDate, endDate, groupBy = 'day' } = req.query;

  let matchQuery: any = {};
  if (startDate && endDate) {
    matchQuery.createdAt = {
      $gte: new Date(startDate as string),
      $lte: new Date(endDate as string)
    };
  }

  let groupFormat: string;
  switch (groupBy) {
    case 'hour':
      groupFormat = '%Y-%m-%d %H:00:00';
      break;
    case 'day':
      groupFormat = '%Y-%m-%d';
      break;
    case 'week':
      groupFormat = '%Y-%U';
      break;
    case 'month':
      groupFormat = '%Y-%m';
      break;
    default:
      groupFormat = '%Y-%m-%d';
  }

  const salesData = await Order.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: { $dateToString: { format: groupFormat, date: '$createdAt' } },
        totalRevenue: { $sum: '$totalPrice' },
        totalOrders: { $sum: 1 },
        averageOrderValue: { $avg: '$totalPrice' }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Get product performance
  const productPerformance = await Order.aggregate([
    { $match: matchQuery },
    { $unwind: '$orderItems' },
    {
      $group: {
        _id: '$orderItems.name',
        totalRevenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
        totalQuantity: { $sum: '$orderItems.quantity' },
        orderCount: { $sum: 1 }
      }
    },
    { $sort: { totalRevenue: -1 } },
    { $limit: 20 }
  ]);

  res.json({
    salesData,
    productPerformance,
  });
});

// @desc    Get customer analytics
// @route   GET /api/reports/customers
// @access  Private/Admin
const getCustomerAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  let matchQuery: any = {};
  if (startDate && endDate) {
    matchQuery.createdAt = {
      $gte: new Date(startDate as string),
      $lte: new Date(endDate as string)
    };
  }

  // Get customer order statistics
  const customerStats = await Order.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$user',
        totalOrders: { $sum: 1 },
        totalSpent: { $sum: '$totalPrice' },
        averageOrderValue: { $avg: '$totalPrice' },
        lastOrderDate: { $max: '$createdAt' }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'userInfo'
      }
    },
    { $unwind: '$userInfo' },
    {
      $project: {
        customerName: '$userInfo.name',
        customerEmail: '$userInfo.email',
        totalOrders: 1,
        totalSpent: 1,
        averageOrderValue: 1,
        lastOrderDate: 1
      }
    },
    { $sort: { totalSpent: -1 } },
    { $limit: 50 }
  ]);

  // Get customer acquisition over time
  const customerAcquisition = await User.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        newCustomers: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.json({
    customerStats,
    customerAcquisition,
  });
});

// @desc    Get inventory report
// @route   GET /api/reports/inventory
// @access  Private/Admin
const getInventoryReport = asyncHandler(async (req, res) => {
  // Get low stock products
  const lowStockProducts = await Product.find({
    $expr: { $lte: ['$stockQuantity', '$minStock'] }
  }).select('name sku stockQuantity minStock price category');

  // Get out of stock products
  const outOfStockProducts = await Product.find({
    stockQuantity: 0
  }).select('name sku price category');

  // Get inventory value by category
  const inventoryByCategory = await Product.aggregate([
    {
      $group: {
        _id: '$category',
        totalValue: { $sum: { $multiply: ['$price', '$stockQuantity'] } },
        totalQuantity: { $sum: '$stockQuantity' },
        productCount: { $sum: 1 }
      }
    },
    { $sort: { totalValue: -1 } }
  ]);

  // Get top selling products
  const topSellingProducts = await Order.aggregate([
    { $unwind: '$orderItems' },
    {
      $group: {
        _id: '$orderItems.name',
        totalSold: { $sum: '$orderItems.quantity' },
        totalRevenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } }
      }
    },
    { $sort: { totalSold: -1 } },
    { $limit: 20 }
  ]);

  res.json({
    lowStockProducts,
    outOfStockProducts,
    inventoryByCategory,
    topSellingProducts,
  });
});

// @desc    Get offer performance report
// @route   GET /api/reports/offers
// @access  Private/Admin
const getOfferPerformance = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  let matchQuery: any = {};
  if (startDate && endDate) {
    matchQuery.createdAt = {
      $gte: new Date(startDate as string),
      $lte: new Date(endDate as string)
    };
  }

  // Get offer usage statistics
  const offerStats = await Offer.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalUsage: { $sum: '$usedCount' },
        totalRevenue: { $sum: '$totalRevenue' }
      }
    }
  ]);

  // Get top performing offers
  const topOffers = await Offer.find({})
    .sort({ totalRevenue: -1 })
    .limit(10)
    .select('code name discountType discountValue usedCount totalRevenue status');

  // Get offer usage over time
  const offerUsageOverTime = await Offer.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        offersCreated: { $sum: 1 },
        totalUsage: { $sum: '$usedCount' }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.json({
    offerStats,
    topOffers,
    offerUsageOverTime,
  });
});

export {
  getDashboardStats,
  getSalesReport,
  getCustomerAnalytics,
  getInventoryReport,
  getOfferPerformance,
};
