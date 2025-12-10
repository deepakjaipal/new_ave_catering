import express from 'express';
const router = express.Router();
import {
  getDashboardStats,
  getSalesReport,
  getCustomerAnalytics,
  getInventoryReport,
  getOfferPerformance,
} from '../controllers/reportController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

// All report routes are admin-only
router.route('/dashboard').get(protect, admin, getDashboardStats);
router.route('/sales').get(protect, admin, getSalesReport);
router.route('/customers').get(protect, admin, getCustomerAnalytics);
router.route('/inventory').get(protect, admin, getInventoryReport);
router.route('/offers').get(protect, admin, getOfferPerformance);

export default router;
