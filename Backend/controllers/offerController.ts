import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import Offer from '../models/offerModel.js';

// @desc    Get all offers
// @route   GET /api/offers
// @access  Private/Admin
const getOffers = asyncHandler(async (req, res) => {
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
      { code: { $regex: search, $options: 'i' } },
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  // Calculate pagination
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  // Get total count for pagination
  const total = await Offer.countDocuments(query);

  // Fetch offers with filters and pagination
  const offers = await Offer.find(query)
    .sort({ createdAt: -1 })
    .limit(limitNum)
    .skip(skip);

  res.json({
    offers,
    pagination: {
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      hasNext: pageNum < Math.ceil(total / limitNum),
      hasPrev: pageNum > 1,
      total,
    },
  });
});

// @desc    Get single offer
// @route   GET /api/offers/:id
// @access  Private/Admin
const getOfferById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(404);
    throw new Error('Offer not found');
  }

  const offer = await Offer.findById(req.params.id);

  if (offer) {
    res.json(offer);
  } else {
    res.status(404);
    throw new Error('Offer not found');
  }
});

// @desc    Create new offer
// @route   POST /api/offers
// @access  Private/Admin
const createOffer = asyncHandler(async (req, res) => {
  const {
    code,
    name,
    description,
    discountType,
    discountValue,
    minPurchase,
    maxDiscount,
    usageLimit,
    validFrom,
    validTo,
    applicableTo,
    specificCustomers,
  } = req.body;

  // Check if offer with this code already exists
  const existingOffer = await Offer.findOne({ code: code.toUpperCase() });
  if (existingOffer) {
    res.status(400);
    throw new Error('Offer with this code already exists');
  }

  // Validate dates
  const fromDate = new Date(validFrom);
  const toDate = new Date(validTo);
  
  if (fromDate >= toDate) {
    res.status(400);
    throw new Error('Valid from date must be before valid to date');
  }

  // Validate discount value
  if (discountType === 'percentage' && (discountValue < 0 || discountValue > 100)) {
    res.status(400);
    throw new Error('Percentage discount must be between 0 and 100');
  }

  if (discountType === 'fixed' && discountValue < 0) {
    res.status(400);
    throw new Error('Fixed discount must be positive');
  }

  const offer = new Offer({
    code: code.toUpperCase(),
    name,
    description,
    discountType,
    discountValue: parseFloat(discountValue),
    minPurchase: parseFloat(minPurchase) || 0,
    maxDiscount: maxDiscount ? parseFloat(maxDiscount) : undefined,
    usageLimit: usageLimit ? parseInt(usageLimit) : undefined,
    validFrom: fromDate,
    validTo: toDate,
    applicableTo,
    specificCustomers: specificCustomers || [],
  });

  const createdOffer = await offer.save();
  res.status(201).json(createdOffer);
});

// @desc    Update offer
// @route   PUT /api/offers/:id
// @access  Private/Admin
const updateOffer = asyncHandler(async (req, res) => {
  const {
    code,
    name,
    description,
    discountType,
    discountValue,
    minPurchase,
    maxDiscount,
    usageLimit,
    validFrom,
    validTo,
    status,
    applicableTo,
    specificCustomers,
  } = req.body;

  const offer = await Offer.findById(req.params.id);

  if (!offer) {
    res.status(404);
    throw new Error('Offer not found');
  }

  // Check if code is being changed and if new code already exists
  if (code && code.toUpperCase() !== offer.code) {
    const existingOffer = await Offer.findOne({ code: code.toUpperCase() });
    if (existingOffer) {
      res.status(400);
      throw new Error('Offer with this code already exists');
    }
  }

  // Validate dates if provided
  if (validFrom && validTo) {
    const fromDate = new Date(validFrom);
    const toDate = new Date(validTo);
    
    if (fromDate >= toDate) {
      res.status(400);
      throw new Error('Valid from date must be before valid to date');
    }
  }

  // Update fields
  offer.code = code ? code.toUpperCase() : offer.code;
  offer.name = name || offer.name;
  offer.description = description || offer.description;
  offer.discountType = discountType || offer.discountType;
  offer.discountValue = discountValue !== undefined ? parseFloat(discountValue) : offer.discountValue;
  offer.minPurchase = minPurchase !== undefined ? parseFloat(minPurchase) : offer.minPurchase;
  offer.maxDiscount = maxDiscount !== undefined ? parseFloat(maxDiscount) : offer.maxDiscount;
  offer.usageLimit = usageLimit !== undefined ? parseInt(usageLimit) : offer.usageLimit;
  offer.validFrom = validFrom ? new Date(validFrom) : offer.validFrom;
  offer.validTo = validTo ? new Date(validTo) : offer.validTo;
  offer.status = status || offer.status;
  offer.applicableTo = applicableTo || offer.applicableTo;
  offer.specificCustomers = specificCustomers || offer.specificCustomers;

  const updatedOffer = await offer.save();
  res.json(updatedOffer);
});

// @desc    Delete offer
// @route   DELETE /api/offers/:id
// @access  Private/Admin
const deleteOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.findById(req.params.id);

  if (!offer) {
    res.status(404);
    throw new Error('Offer not found');
  }

  await Offer.findByIdAndDelete(req.params.id);
  
  res.json({ 
    message: 'Offer deleted successfully',
    deletedOffer: {
      id: offer._id,
      code: offer.code,
      name: offer.name
    }
  });
});

// @desc    Validate offer code
// @route   POST /api/offers/validate
// @access  Public
const validateOfferCode = asyncHandler(async (req, res) => {
  const { code, customerId, orderTotal } = req.body;

  const offer = await Offer.findOne({ 
    code: code.toUpperCase(),
    status: 'active'
  });

  if (!offer) {
    res.status(404);
    throw new Error('Invalid offer code');
  }

  const now = new Date();
  
  // Check if offer is currently valid
  if (offer.validFrom > now || offer.validTo < now) {
    res.status(400);
    throw new Error('Offer is not currently valid');
  }

  // Check usage limit
  if (offer.usageLimit && offer.usedCount >= offer.usageLimit) {
    res.status(400);
    throw new Error('Offer usage limit reached');
  }

  // Check minimum purchase
  if (orderTotal < offer.minPurchase) {
    res.status(400);
    throw new Error(`Minimum purchase of $${offer.minPurchase} required`);
  }

  // Check applicability
  if (offer.applicableTo === 'new_customers' && customerId) {
    // This would need to check if customer is new - simplified for now
    res.status(400);
    throw new Error('This offer is only for new customers');
  }

  if (offer.applicableTo === 'specific_customers' && customerId) {
    if (!offer.specificCustomers?.includes(customerId)) {
      res.status(400);
      throw new Error('This offer is not applicable to your account');
    }
  }

  // Calculate discount
  let discountAmount = 0;
  if (offer.discountType === 'percentage') {
    discountAmount = (orderTotal * offer.discountValue) / 100;
    if (offer.maxDiscount) {
      discountAmount = Math.min(discountAmount, offer.maxDiscount);
    }
  } else if (offer.discountType === 'fixed') {
    discountAmount = Math.min(offer.discountValue, orderTotal);
  }

  res.json({
    valid: true,
    offer: {
      id: offer._id,
      code: offer.code,
      name: offer.name,
      discountType: offer.discountType,
      discountValue: offer.discountValue,
      discountAmount,
      maxDiscount: offer.maxDiscount,
    }
  });
});

// @desc    Get offer statistics
// @route   GET /api/offers/stats
// @access  Private/Admin
const getOfferStats = asyncHandler(async (req, res) => {
  const stats = await Offer.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalUsage: { $sum: '$usedCount' },
        totalRevenue: { $sum: '$totalRevenue' }
      }
    }
  ]);

  const totalOffers = await Offer.countDocuments();
  const activeOffers = await Offer.countDocuments({ status: 'active' });
  const totalUsage = await Offer.aggregate([
    { $group: { _id: null, total: { $sum: '$usedCount' } } }
  ]);
  const totalRevenue = await Offer.aggregate([
    { $group: { _id: null, total: { $sum: '$totalRevenue' } } }
  ]);

  res.json({
    totalOffers,
    activeOffers,
    totalUsage: totalUsage[0]?.total || 0,
    totalRevenue: totalRevenue[0]?.total || 0,
    statusBreakdown: stats
  });
});

export {
  getOffers,
  getOfferById,
  createOffer,
  updateOffer,
  deleteOffer,
  validateOfferCode,
  getOfferStats,
};
