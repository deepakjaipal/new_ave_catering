import express from 'express';
const router = express.Router();
import { authUser, registerUser, getUserProfile, getUsers, updateUser, deleteUser, getUserStats } from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.route('/').post(registerUser).get(protect, admin, getUsers);
router.route('/stats').get(protect, admin, getUserStats);
router.post('/login', authUser);
router.route('/profile').get(protect, getUserProfile);
router.route('/:id').put(protect, admin, updateUser).delete(protect, admin, deleteUser);

export default router;
