import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import { Request } from "express";
import Subcategory from "../models/subcategoryModel.js";
import Category from "../models/categoryModel.js";
import Product from "../models/productModel.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../config/cloudinary.js";

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// @desc    Get all subcategories
// @route   GET /api/subcategories
// @access  Public
const getSubcategories = asyncHandler(async (req, res) => {
  try {
    const subcategories = await Subcategory.find({ isActive: true })
      .populate('parentCategory', 'name slug')
      .sort({ displayOrder: 1, name: 1 })
      .lean();

    // Update product counts
    const subcategoriesWithCount = await Promise.all(
      subcategories.map(async (subcategory) => {
        const productCount = await Product.countDocuments({ 
          category: { $regex: subcategory.name, $options: 'i' } 
        });
        
        return {
          ...subcategory,
          productCount
        };
      })
    );

    res.json(subcategoriesWithCount);
  } catch (error) {
    res.status(500);
    throw new Error('Error fetching subcategories');
  }
});

// @desc    Get subcategories for admin
// @route   GET /api/subcategories/admin
// @access  Private/Admin
const getSubcategoriesForAdmin = asyncHandler(async (req, res) => {
  try {
    const subcategories = await Subcategory.find({})
      .populate('parentCategory', 'name slug')
      .sort({ displayOrder: 1, name: 1 })
      .lean();

    // Update product counts
    const subcategoriesWithCount = await Promise.all(
      subcategories.map(async (subcategory) => {
        const productCount = await Product.countDocuments({ 
          category: { $regex: subcategory.name, $options: 'i' } 
        });
        
        return {
          ...subcategory,
          productCount
        };
      })
    );

    res.json(subcategoriesWithCount);
  } catch (error) {
    res.status(500);
    throw new Error('Error fetching subcategories for admin');
  }
});

// @desc    Get subcategories by parent category
// @route   GET /api/subcategories/parent/:parentId
// @access  Public
const getSubcategoriesByParent = asyncHandler(async (req, res) => {
  try {
    const { parentId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(parentId)) {
      res.status(400);
      throw new Error('Invalid parent category ID');
    }

    const subcategories = await Subcategory.find({ 
      parentCategory: parentId,
      isActive: true 
    })
      .sort({ displayOrder: 1, name: 1 })
      .lean();

    // Update product counts
    const subcategoriesWithCount = await Promise.all(
      subcategories.map(async (subcategory) => {
        const productCount = await Product.countDocuments({ 
          category: { $regex: subcategory.name, $options: 'i' } 
        });
        
        return {
          ...subcategory,
          productCount
        };
      })
    );

    res.json(subcategoriesWithCount);
  } catch (error) {
    res.status(500);
    throw new Error('Error fetching subcategories by parent');
  }
});

// @desc    Get subcategory by slug
// @route   GET /api/subcategories/:slug
// @access  Public
const getSubcategoryBySlug = asyncHandler(async (req, res) => {
  const subcategory = await Subcategory.findOne({ 
    slug: req.params.slug,
    isActive: true 
  }).populate('parentCategory', 'name slug');

  if (!subcategory) {
    res.status(404);
    throw new Error('Subcategory not found');
  }

  // Get product count for this subcategory
  const productCount = await Product.countDocuments({ 
    category: { $regex: subcategory.name, $options: 'i' } 
  });

  res.json({
    ...subcategory.toObject(),
    productCount
  });
});

// @desc    Create a new subcategory
// @route   POST /api/subcategories/admin/create
// @access  Private/Admin
const createSubcategory = asyncHandler(async (req: MulterRequest, res) => {
  const {
    name,
    description,
    parentCategoryId,
    displayOrder,
    imageUrl
  } = req.body;

  // Validate parent category exists
  if (!parentCategoryId || !mongoose.Types.ObjectId.isValid(parentCategoryId)) {
    res.status(400);
    throw new Error('Valid parent category ID is required');
  }

  // Check if parent exists in either Category or Subcategory models
  let parentCategory = await Category.findById(parentCategoryId);
  if (!parentCategory) {
    // If not found in Category, check if it's a subcategory
    parentCategory = await Subcategory.findById(parentCategoryId);
    if (!parentCategory) {
      res.status(404);
      throw new Error('Parent category not found');
    }
  }

  // Check if subcategory already exists under this parent
  const existingSubcategory = await Subcategory.findOne({ 
    name, 
    parentCategory: parentCategoryId 
  });
  if (existingSubcategory) {
    res.status(400);
    throw new Error('Subcategory with this name already exists under this parent category');
  }

  let finalImageUrl = imageUrl || "";
  let imagePublicId = "";

  // If imageUrl is provided, extract public_id from it
  if (finalImageUrl) {
    try {
      // Extract public_id from Cloudinary URL
      const urlParts = finalImageUrl.split('/');
      const publicIdWithExtension = urlParts[urlParts.length - 1];
      imagePublicId = publicIdWithExtension.split('.')[0];
    } catch (error) {
      console.error("Error extracting public_id:", error);
    }
  }

  const subcategoryData: any = {
    name,
    description,
    parentCategory: parentCategoryId,
    displayOrder: displayOrder ? parseInt(displayOrder) : 0,
    image: finalImageUrl,
    imagePublicId
  };

  const subcategory = new Subcategory(subcategoryData);
  const createdSubcategory = await subcategory.save();

  // Populate parent category info
  await createdSubcategory.populate('parentCategory', 'name slug');

  res.status(201).json(createdSubcategory);
});

// @desc    Update subcategory
// @route   PUT /api/subcategories/admin/:id
// @access  Private/Admin
const updateSubcategory = asyncHandler(async (req: MulterRequest, res) => {
  const {
    name,
    description,
    displayOrder,
    isActive,
    imageUrl,
    parentCategoryId
  } = req.body;

  const subcategory = await Subcategory.findById(req.params.id);

  if (!subcategory) {
    res.status(404);
    throw new Error("Subcategory not found");
  }

  // If changing parent category, validate it exists
  if (parentCategoryId && parentCategoryId !== subcategory.parentCategory.toString()) {
    if (!mongoose.Types.ObjectId.isValid(parentCategoryId)) {
      res.status(400);
      throw new Error('Invalid parent category ID');
    }
    
    const parentCategory = await Category.findById(parentCategoryId);
    if (!parentCategory) {
      res.status(404);
      throw new Error('Parent category not found');
    }

    // Check if subcategory with same name exists under new parent
    const existingSubcategory = await Subcategory.findOne({ 
      name: name || subcategory.name, 
      parentCategory: parentCategoryId,
      _id: { $ne: subcategory._id }
    });
    if (existingSubcategory) {
      res.status(400);
      throw new Error('Subcategory with this name already exists under the new parent category');
    }
  }

  // Handle new image URL
  let finalImageUrl = subcategory.image;
  let finalImagePublicId = subcategory.imagePublicId;

  if (imageUrl) {
    // Delete old image from Cloudinary if it exists
    if (subcategory.imagePublicId) {
      try {
        await deleteFromCloudinary(subcategory.imagePublicId);
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

  subcategory.name = name || subcategory.name;
  subcategory.description = description || subcategory.description;
  subcategory.displayOrder = displayOrder !== undefined ? parseInt(displayOrder) : subcategory.displayOrder;
  subcategory.isActive = isActive !== undefined ? isActive : subcategory.isActive;
  subcategory.image = finalImageUrl;
  subcategory.imagePublicId = finalImagePublicId;
  
  if (parentCategoryId) {
    subcategory.parentCategory = parentCategoryId;
  }

  const updatedSubcategory = await subcategory.save();
  await updatedSubcategory.populate('parentCategory', 'name slug');
  
  res.json(updatedSubcategory);
});

// @desc    Delete subcategory
// @route   DELETE /api/subcategories/admin/:id
// @access  Private/Admin
const deleteSubcategory = asyncHandler(async (req, res) => {
  const subcategory = await Subcategory.findById(req.params.id);

  if (!subcategory) {
    res.status(404);
    throw new Error("Subcategory not found");
  }

  // Check if subcategory has products
  const productCount = await Product.countDocuments({ 
    category: { $regex: subcategory.name, $options: 'i' } 
  });

  if (productCount > 0) {
    res.status(400);
    throw new Error("Cannot delete subcategory with existing products");
  }

  // Delete image from Cloudinary
  if (subcategory.imagePublicId) {
    try {
      await deleteFromCloudinary(subcategory.imagePublicId);
    } catch (error) {
      console.error("Error deleting image from Cloudinary:", error);
    }
  }

  await Subcategory.findByIdAndDelete(req.params.id);
  res.json({ message: "Subcategory deleted successfully" });
});

export {
  getSubcategories,
  getSubcategoriesForAdmin,
  getSubcategoriesByParent,
  getSubcategoryBySlug,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
};