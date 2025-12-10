import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import Banner from '../models/bannerModel.js';

// @desc    Get all banners (public - only active ones)
// @route   GET /api/banners/public
// @access  Public
const getPublicBanners = asyncHandler(async (req, res) => {
  const now = new Date();
  
  const banners = await Banner.find({
    isActive: true,
    $and: [
      {
        $or: [
          { startDate: { $exists: false } },
          { startDate: { $lte: now } }
        ]
      },
      {
        $or: [
          { endDate: { $exists: false } },
          { endDate: { $gte: now } }
        ]
      }
    ]
  })
    .sort({ order: 1 })
    .select('-__v');

  res.json(banners);
});

// @desc    Get all banners (admin - all banners)
// @route   GET /api/banners
// @access  Private/Admin
const getBanners = asyncHandler(async (req, res) => {
  const { status, search, page = 1, limit = 20 } = req.query;

  // Build query object
  const query: any = {};

  // Add status filter if provided
  if (status === 'active') {
    query.isActive = true;
  } else if (status === 'inactive') {
    query.isActive = false;
  }

  // Add search filter if provided
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { subtitle: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { badge: { $regex: search, $options: 'i' } },
    ];
  }

  // Calculate pagination
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  // Get total count for pagination
  const total = await Banner.countDocuments(query);

  // Fetch banners with filters and pagination
  const banners = await Banner.find(query)
    .sort({ order: 1, createdAt: -1 })
    .limit(limitNum)
    .skip(skip);

  res.json({
    banners,
    pagination: {
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      hasNext: pageNum < Math.ceil(total / limitNum),
      hasPrev: pageNum > 1,
      total,
    },
  });
});

// @desc    Get single banner
// @route   GET /api/banners/:id
// @access  Private/Admin
const getBannerById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(404);
    throw new Error('Banner not found');
  }

  const banner = await Banner.findById(req.params.id);

  if (banner) {
    res.json(banner);
  } else {
    res.status(404);
    throw new Error('Banner not found');
  }
});

// @desc    Create new banner
// @route   POST /api/banners
// @access  Private/Admin
const createBanner = asyncHandler(async (req, res) => {
  const {
    title,
    subtitle,
    description,
    image,
    badge,
    link,
    buttonText,
    order,
    isActive,
    startDate,
    endDate,
  } = req.body;

  // Validate required fields
  if (!title || !image) {
    res.status(400);
    throw new Error('Title and image are required');
  }

  // Validate dates if provided
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      res.status(400);
      throw new Error('Start date must be before end date');
    }
  }

  const banner = new Banner({
    title,
    subtitle,
    description,
    image,
    badge,
    link,
    buttonText,
    order: order !== undefined ? parseInt(order) : undefined,
    isActive: isActive !== undefined ? isActive : true,
    startDate: startDate ? new Date(startDate) : undefined,
    endDate: endDate ? new Date(endDate) : undefined,
  });

  const createdBanner = await banner.save();
  res.status(201).json(createdBanner);
});

// @desc    Update banner
// @route   PUT /api/banners/:id
// @access  Private/Admin
const updateBanner = asyncHandler(async (req, res) => {
  const {
    title,
    subtitle,
    description,
    image,
    badge,
    link,
    buttonText,
    order,
    isActive,
    startDate,
    endDate,
  } = req.body;

  const banner = await Banner.findById(req.params.id);

  if (!banner) {
    res.status(404);
    throw new Error('Banner not found');
  }

  // Validate dates if provided
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      res.status(400);
      throw new Error('Start date must be before end date');
    }
  }

  // Update fields
  banner.title = title || banner.title;
  banner.subtitle = subtitle !== undefined ? subtitle : banner.subtitle;
  banner.description = description !== undefined ? description : banner.description;
  banner.image = image || banner.image;
  banner.badge = badge !== undefined ? badge : banner.badge;
  banner.link = link !== undefined ? link : banner.link;
  banner.buttonText = buttonText !== undefined ? buttonText : banner.buttonText;
  banner.order = order !== undefined ? parseInt(order) : banner.order;
  banner.isActive = isActive !== undefined ? isActive : banner.isActive;
  banner.startDate = startDate !== undefined ? (startDate ? new Date(startDate) : undefined) : banner.startDate;
  banner.endDate = endDate !== undefined ? (endDate ? new Date(endDate) : undefined) : banner.endDate;

  const updatedBanner = await banner.save();
  res.json(updatedBanner);
});

// @desc    Delete banner
// @route   DELETE /api/banners/:id
// @access  Private/Admin
const deleteBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);

  if (!banner) {
    res.status(404);
    throw new Error('Banner not found');
  }

  await Banner.findByIdAndDelete(req.params.id);
  
  res.json({ 
    message: 'Banner deleted successfully',
    deletedBanner: {
      id: banner._id,
      title: banner.title,
    }
  });
});

// @desc    Reorder banners
// @route   PUT /api/banners/reorder
// @access  Private/Admin
const reorderBanners = asyncHandler(async (req, res) => {
  const { banners } = req.body;

  if (!Array.isArray(banners)) {
    res.status(400);
    throw new Error('Banners must be an array');
  }

  // Update order for each banner
  const updatePromises = banners.map((banner: any, index: number) => {
    return Banner.findByIdAndUpdate(banner.id, { order: index }, { new: true });
  });

  await Promise.all(updatePromises);

  res.json({ message: 'Banners reordered successfully' });
});

// @desc    Get banner statistics
// @route   GET /api/banners/stats
// @access  Private/Admin
const getBannerStats = asyncHandler(async (req, res) => {
  const totalBanners = await Banner.countDocuments();
  const activeBanners = await Banner.countDocuments({ isActive: true });
  const inactiveBanners = await Banner.countDocuments({ isActive: false });

  const now = new Date();
  const scheduledBanners = await Banner.countDocuments({
    isActive: true,
    startDate: { $gt: now }
  });

  const expiredBanners = await Banner.countDocuments({
    isActive: true,
    endDate: { $lt: now }
  });

  res.json({
    totalBanners,
    activeBanners,
    inactiveBanners,
    scheduledBanners,
    expiredBanners,
  });
});

export {
  getPublicBanners,
  getBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
  reorderBanners,
  getBannerStats,
};

