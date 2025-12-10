import express from "express";
const router = express.Router();
import {
  getSubcategories,
  getSubcategoriesForAdmin,
  getSubcategoriesByParent,
  getSubcategoryBySlug,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
} from "../controllers/subcategoryController.js";
import { uploadSingle } from "../middleware/uploadMiddleware.js";
// import { protect, admin } from '../middleware/authMiddleware.js'; // Uncomment when auth is needed

// Admin routes (protected) - must come before /:slug route
router.route("/admin").get(getSubcategoriesForAdmin); // Get all subcategories for admin
router.route("/admin/create").post(uploadSingle, createSubcategory); // Add auth: protect, admin, 
router.route("/admin/:id")
  .put(uploadSingle, updateSubcategory) // Add auth: protect, admin,
  .delete(deleteSubcategory); // Add auth: protect, admin,

// Public routes
router.route("/").get(getSubcategories);
router.route("/parent/:parentId").get(getSubcategoriesByParent);
router.route("/:slug").get(getSubcategoryBySlug);

export default router;