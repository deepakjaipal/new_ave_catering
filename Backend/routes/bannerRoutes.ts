import express from 'express';
const router = express.Router();
import {
  getPublicBanners,
  getBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
  reorderBanners,
  getBannerStats,
} from '../controllers/bannerController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

// Public routes
router.get('/public', getPublicBanners);

// Admin routes
router.route('/').get(protect, admin, getBanners).post(protect, admin, createBanner);
router.route('/stats').get(protect, admin, getBannerStats);
router.route('/reorder').put(protect, admin, reorderBanners);
router
  .route('/:id')
  .get(protect, admin, getBannerById)
  .put(protect, admin, updateBanner)
  .delete(protect, admin, deleteBanner);

export default router;

