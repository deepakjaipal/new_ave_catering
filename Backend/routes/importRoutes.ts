import express from "express";
const router = express.Router();
import {
  upload,
  uploadExcelFile,
  importCategories,
  importProducts,
  getImportPreview,
} from "../controllers/importController.js";
import { protect, admin } from '../middleware/authMiddleware.js';

// All import routes are admin-only
router.route("/upload").post(protect, admin, upload.single('file'), uploadExcelFile);
router.route("/categories").post(protect, admin, importCategories);
router.route("/products").post(protect, admin, importProducts);
router.route("/preview").post(protect, admin, getImportPreview);

export default router;
