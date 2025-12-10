import express from "express";
const router = express.Router();
import {
  getCategories,
  getCategoriesWithSubcategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryTree,
} from "../controllers/categoryController.js";
import { uploadSingle } from "../middleware/uploadMiddleware.js";
// import { protect, admin } from '../middleware/authMiddleware.js'; // Uncomment when auth is needed

// Admin routes (protected) - must come before /:slug route
router.route("/admin").get(getCategoriesWithSubcategories); // Get all categories for admin
router.route("/admin/create").post(uploadSingle, createCategory); // Add auth: protect, admin, 
router.route("/admin/:id")
  .put(uploadSingle, updateCategory) // Add auth: protect, admin,
  .delete(deleteCategory); // Add auth: protect, admin,

// Public routes
router.route("/").get(getCategories);
router.route("/public").get(getCategoriesWithSubcategories); // Get all categories for public listing
router.route("/tree").get(getCategoryTree);
router.route("/:slug").get(getCategoryBySlug);

export default router;
