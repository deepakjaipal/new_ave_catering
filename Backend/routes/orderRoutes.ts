import express from 'express';
const router = express.Router();
import { addOrderItems, getOrderById, getOrders, updateOrder, deleteOrder, getOrderStats } from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.route('/').post(protect, addOrderItems).get(protect, admin, getOrders);
router.route('/stats').get(protect, admin, getOrderStats);
router.route('/:id').get(protect, getOrderById).put(protect, admin, updateOrder).delete(protect, admin, deleteOrder);

export default router;
