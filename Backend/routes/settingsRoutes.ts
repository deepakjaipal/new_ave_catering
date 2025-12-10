import express from 'express';
const router = express.Router();
import {
  getSettings,
  updateSettings,
  resetSettings,
  getPublicSettings,
} from '../controllers/settingsController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

// Public route for frontend
router.route('/public').get(getPublicSettings);

// Admin routes
router.route('/').get(protect, admin, getSettings).put(protect, admin, updateSettings);
router.route('/reset').post(protect, admin, resetSettings);

export default router;
