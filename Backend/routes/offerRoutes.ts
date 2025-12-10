import express from 'express';
const router = express.Router();
import {
  getOffers,
  getOfferById,
  createOffer,
  updateOffer,
  deleteOffer,
  validateOfferCode,
  getOfferStats,
} from '../controllers/offerController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

// Public routes
router.post('/validate', validateOfferCode);

// Admin routes
router.route('/').get(protect, admin, getOffers).post(protect, admin, createOffer);
router.route('/stats').get(protect, admin, getOfferStats);
router
  .route('/:id')
  .get(protect, admin, getOfferById)
  .put(protect, admin, updateOffer)
  .delete(protect, admin, deleteOffer);

export default router;
