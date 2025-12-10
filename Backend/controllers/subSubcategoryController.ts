import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import { Request } from "express";
import SubSubcategory from "../models/subSubcategoryModel.js";
import Subcategory from "../models/subcategoryModel.js";
import Product from "../models/productModel.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../config/cloudinary.js";

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// @desc    Get all sub-subcategories (Public)
// @route   GET /api/subsubcategories
// @access  Public
const getSubSubcategories = asyncHandler(async (req, res) => {
  const subSubcategories = await SubSubcategory.find({ isActive: true })
    .populate('parentSubcategory', 'name slug')
    .sort({ displayOrder: 1, name: 1 });
  res.json(subSubcategories);
});

// @desc    Get all sub-subcategories for admin
// @route   GET /api/subsubcategories/admin
// @access  Private/Admin
const getSubSubcategoriesForAdmin = asyncHandler(async (req, res) => {
  const subSubcategories = await SubSubcategory.find({})
    .populate('parentSubcategory', 'name slug')
    .sort({ displayOrder: 1, name: 1 });
  res.json(subSubcategories);
});

// @desc    Get sub-subcategories by parent subcategory
// @route   GET /api/subsubcategories/parent/:parentId
// @access  Public
const getSubSubcategoriesByParent = asyncHandler(async (req, res) => {
  const { parentId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(parentId)) {
    res.status(400);
    throw new Error('Invalid parent subcategory ID');
  }

  const subSubcategories = await SubSubcategory.find({ parentSubcategory: parentId, isActive: true })
    .populate('parentSubcategory', 'name slug')
    .sort({ displayOrder: 1, name: 1 });
  res.json(subSubcategories);
});

// @desc    Get sub-subcategory by slug
// @route   GET /api/subsubcategories/:slug
// @access  Public
const getSubSubcategoryBySlug = asyncHandler(async (req, res) => {
  const subSubcategory = await SubSubcategory.findOne({ slug: req.params.slug, isActive: true })
    .populate('parentSubcategory', 'name slug');

  if (!subSubcategory) {
    res.status(404);
    throw new Error('Sub-subcategory not found');
  }

  // Get product count for this sub-subcategory
  const productCount = await Product.countDocuments({ 
    category: { $regex: subSubcategory.name, $options: 'i' } 
  });

  res.json({
    ...subSubcategory.toObject(),
    productCount
  });
});

// @desc    Create a new sub-subcategory
// @route   POST /api/subsubcategories/admin/create
// @access  Private/Admin
const createSubSubcategory = asyncHandler(async (req: MulterRequest, res) => {
  const {
    name,
    description,
    parentCategoryId,
    displayOrder,
    imageUrl
  } = req.body;

  // Check if sub-subcategory already exists under this parent
  const existingSubSubcategory = await SubSubcategory.findOne({ name, parentSubcategory: parentCategoryId });
  if (existingSubSubcategory) {
    res.status(400);
    throw new Error('Sub-subcategory with this name already exists under this parent subcategory');
  }

  if (!mongoose.Types.ObjectId.isValid(parentCategoryId)) {
    res.status(400);
    throw new Error('Invalid parent subcategory ID');
  }
  
  const parentSubcategory = await Subcategory.findById(parentCategoryId);
  if (!parentSubcategory) {
    res.status(404);
    throw new Error('Parent subcategory not found');
  }

  let finalImageUrl = imageUrl || "";
  let imagePublicId = "";

  if (finalImageUrl) {
    try {
      const urlParts = finalImageUrl.split('/');
      const publicIdWithExtension = urlParts[urlParts.length - 1];
      imagePublicId = publicIdWithExtension.split('.')[0];
    } catch (error) {
      console.error("Error extracting public_id:", error);
    }
  }

  const subSubcategoryData: any = {
    name,
    description,
    parentSubcategory: parentCategoryId,
    displayOrder: displayOrder ? parseInt(displayOrder) : 0,
    image: finalImageUrl,
    imagePublicId
  };

  const subSubcategory = new SubSubcategory(subSubcategoryData);
  const createdSubSubcategory = await subSubcategory.save();

  res.status(201).json(createdSubSubcategory);
});

// @desc    Update sub-subcategory
// @route   PUT /api/subsubcategories/admin/:id
// @access  Private/Admin
const updateSubSubcategory = asyncHandler(async (req: MulterRequest, res) => {
  const {
    name,
    description,
    parentCategoryId,
    displayOrder,
    isActive,
    imageUrl
  } = req.body;

  const subSubcategory = await SubSubcategory.findById(req.params.id);

  if (!subSubcategory) {
    res.status(404);
    throw new Error("Sub-subcategory not found");
  }

  // Handle new image URL
  let finalImageUrl = subSubcategory.image;
  let finalImagePublicId = subSubcategory.imagePublicId;

  if (imageUrl) {
    // Delete old image from Cloudinary if it exists
    if (subSubcategory.imagePublicId) {
      try {
        await deleteFromCloudinary(subSubcategory.imagePublicId);
      } catch (error) {
        console.error("Error deleting old image:", error);
      }
    }

    finalImageUrl = imageUrl;
    
    // Extract public_id from Cloudinary URL
    try {
      const urlParts = imageUrl.split('/');
      const publicIdWithExtension = urlParts[urlParts.length - 1];
      finalImagePublicId = publicIdWithExtension.split('.')[0];
    } catch (error) {
      console.error("Error extracting public_id:", error);
    }
  }

  subSubcategory.name = name || subSubcategory.name;
  subSubcategory.description = description || subSubcategory.description;
  subSubcategory.parentSubcategory = parentCategoryId || subSubcategory.parentSubcategory;
  subSubcategory.displayOrder = displayOrder !== undefined ? parseInt(displayOrder) : subSubcategory.displayOrder;
  subSubcategory.isActive = isActive !== undefined ? isActive : subSubcategory.isActive;
  subSubcategory.image = finalImageUrl;
  subSubcategory.imagePublicId = finalImagePublicId;

  const updatedSubSubcategory = await subSubcategory.save();
  res.json(updatedSubSubcategory);
});

// @desc    Delete sub-subcategory
// @route   DELETE /api/subsubcategories/admin/:id
// @access  Private/Admin
const deleteSubSubcategory = asyncHandler(async (req, res) => {
  const subSubcategory = await SubSubcategory.findById(req.params.id);

  if (!subSubcategory) {
    res.status(404);
    throw new Error("Sub-subcategory not found");
  }

  // Check if sub-subcategory has products
  const productCount = await Product.countDocuments({ 
    category: { $regex: subSubcategory.name, $options: 'i' } 
  });

  if (productCount > 0) {
    res.status(400);
    throw new Error("Cannot delete sub-subcategory with existing products");
  }

  // Delete image from Cloudinary
  if (subSubcategory.imagePublicId) {
    try {
      await deleteFromCloudinary(subSubcategory.imagePublicId);
    } catch (error) {
      console.error("Error deleting image from Cloudinary:", error);
    }
  }

  await SubSubcategory.findByIdAndDelete(req.params.id);
  res.json({ message: "Sub-subcategory deleted successfully" });
});

export {
  getSubSubcategories,
  getSubSubcategoriesForAdmin,
  getSubSubcategoriesByParent,
  getSubSubcategoryBySlug,
  createSubSubcategory,
  updateSubSubcategory,
  deleteSubSubcategory,
};