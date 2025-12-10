import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req: any, res) => {
  const { orderItems, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  } else {
    const order = new Order({
      orderItems: orderItems.map((x: any) => ({ ...x, product: x._id, _id: undefined })),
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    const createdOrder = await order.save();

    res.status(201).json(createdOrder);
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req: any, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req: any, res: any) => {
  const { status, search, page = 1, limit = 20 } = req.query;

  // Build query object
  const query: any = {};

  // Add status filter if provided
  if (status && status !== 'all') {
    query.status = status;
  }

  // Add search filter if provided
  if (search) {
    query.$or = [
      { _id: { $regex: search, $options: 'i' } },
      { 'user.name': { $regex: search, $options: 'i' } },
      { 'user.email': { $regex: search, $options: 'i' } },
    ];
  }

  // Calculate pagination
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  // Get total count for pagination
  const total = await Order.countDocuments(query);

  // Fetch orders with filters and pagination
  const orders = await Order.find(query)
    .populate('user', 'id name email')
    .sort({ createdAt: -1 })
    .limit(limitNum)
    .skip(skip);

  res.json({
    orders,
    pagination: {
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      hasNext: pageNum < Math.ceil(total / limitNum),
      hasPrev: pageNum > 1,
      total,
    },
  });
});

// @desc    Update order status
// @route   PUT /api/orders/:id
// @access  Private/Admin
const updateOrder = asyncHandler(async (req: any, res: any) => {
  const { status, trackingNumber, notes } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Update order fields
  if (status) {
    order.status = status;
    
    // Set timestamps based on status
    if (status === 'processing') {
      order.processedAt = new Date();
    } else if (status === 'shipped') {
      order.shippedAt = new Date();
    } else if (status === 'delivered') {
      order.deliveredAt = new Date();
    } else if (status === 'cancelled') {
      order.cancelledAt = new Date();
    }
  }

  if (trackingNumber) {
    order.trackingNumber = trackingNumber;
  }

  if (notes) {
    order.notes = notes;
  }

  const updatedOrder = await order.save();
  
  // Populate user data for response
  await updatedOrder.populate('user', 'id name email');
  
  res.json(updatedOrder);
});

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
const deleteOrder = asyncHandler(async (req: any, res: any) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Only allow deletion of pending orders
  if (order.status !== 'pending') {
    res.status(400);
    throw new Error('Only pending orders can be deleted');
  }

  await Order.findByIdAndDelete(req.params.id);
  
  res.json({ 
    message: 'Order deleted successfully',
    deletedOrder: {
      id: order._id,
      orderNumber: order._id,
      totalPrice: order.totalPrice
    }
  });
});

// @desc    Get order statistics
// @route   GET /api/orders/stats
// @access  Private/Admin
const getOrderStats = asyncHandler(async (req: any, res: any) => {
  const stats = await Order.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalRevenue: { $sum: '$totalPrice' }
      }
    }
  ]);

  const totalOrders = await Order.countDocuments();
  const totalRevenue = await Order.aggregate([
    { $group: { _id: null, total: { $sum: '$totalPrice' } } }
  ]);

  // Get recent orders (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentOrders = await Order.countDocuments({
    createdAt: { $gte: thirtyDaysAgo }
  });

  res.json({
    totalOrders,
    totalRevenue: totalRevenue[0]?.total || 0,
    recentOrders,
    statusBreakdown: stats
  });
});

export { addOrderItems, getOrderById, getOrders, updateOrder, deleteOrder, getOrderStats };
