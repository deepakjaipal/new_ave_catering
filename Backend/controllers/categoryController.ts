import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import { Request } from "express";
import Category from "../models/categoryModel.js";
import Subcategory from "../models/subcategoryModel.js";
import SubSubcategory from "../models/subSubcategoryModel.js";
import Product from "../models/productModel.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../config/cloudinary.js";

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// @desc    Get all categories with hierarchical structure
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  try {
    // Get all categories and build tree structure
    const allCategories = await Category.find({ isActive: true })
      .sort({ level: 1, displayOrder: 1, name: 1 })
      .lean();

    // Build hierarchical tree
    const categoryMap = new Map();
    const rootCategories: any[] = [];

    // First pass: create map of all categories
    allCategories.forEach((category) => {
      categoryMap.set(category._id.toString(), {
        ...category,
        subcategories: [],
      });
    });

    // Second pass: build tree structure
    allCategories.forEach((category) => {
      const categoryObj = categoryMap.get(category._id.toString());

      if (category.parentCategory) {
        const parent = categoryMap.get(category.parentCategory.toString());
        if (parent) {
          parent.subcategories.push(categoryObj);
        }
      } else {
        rootCategories.push(categoryObj);
      }
    });

    // Update product counts recursively
    const updateProductCounts = async (categories: any[]): Promise<any[]> => {
      return Promise.all(
        categories.map(async (category) => {
          const productCount = await Product.countDocuments({
            category: { $regex: category.name, $options: "i" },
          });

          const subcategoriesWithCount = await updateProductCounts(
            category.subcategories
          );

          return {
            ...category,
            productCount,
            subcategories: subcategoriesWithCount,
          };
        })
      );
    };

    const categoriesWithCount = await updateProductCounts(rootCategories);
    res.json(categoriesWithCount);
  } catch (error) {
    res.status(500);
    throw new Error("Error fetching categories");
  }
});

// @desc    Get all categories with subcategories (common function for admin and public)
// @route   GET /api/categories/admin or /api/categories/public
// @access  Private/Admin or Public
const getCategoriesWithSubcategories = asyncHandler(async (req, res) => {
  try {

    // Determine if this is an admin request (includes inactive categories)
    const isAdminRequest = req.originalUrl.includes('/admin');
    const filter = isAdminRequest ? {} : { isActive: true };
    const logPrefix = isAdminRequest ? "admin" : "public";
    
    console.log(`📊 Fetching categories for ${logPrefix}...`);
    
    const allCategories = await Category.find(filter)
      .sort({ level: 1, displayOrder: 1, name: 1 })
      .lean()
      .maxTimeMS(10000);

    // Get subcategories with same filter
    const allSubcategories = await Subcategory.find(filter)
      .sort({ displayOrder: 1, name: 1 })
      .lean()
      .maxTimeMS(10000);

    // Get sub-subcategories with same filter
    const allSubSubcategories = await SubSubcategory.find(filter)
      .sort({ displayOrder: 1, name: 1 })
      .lean()
      .maxTimeMS(10000);

    // Group subcategories by parent category
    const subcategoriesByParent = new Map();
    allSubcategories.forEach((subcategory) => {
      const parentId = subcategory.parentCategory.toString();
      if (!subcategoriesByParent.has(parentId)) {
        subcategoriesByParent.set(parentId, []);
      }
      subcategoriesByParent.get(parentId).push(subcategory);
    });

    // Group sub-subcategories by parent subcategory
    const subSubcategoriesByParent = new Map();
    allSubSubcategories.forEach((subSubcategory) => {
      const parentId = subSubcategory.parentSubcategory.toString();
      if (!subSubcategoriesByParent.has(parentId)) {
        subSubcategoriesByParent.set(parentId, []);
      }
      subSubcategoriesByParent.get(parentId).push(subSubcategory);
    });

    // Update product counts and attach subcategories
    const categoriesWithCount = await Promise.all(
      allCategories.map(async (category) => {
        let productCount = 0;
        try {
          productCount = await Product.countDocuments({
            category: { $regex: category.name, $options: "i" },
          });
        } catch (productError) {
          console.error(
            "Error counting products for category:",
            category.name,
            productError
          );
        }

        // Get subcategories for this category
        const subcategories =
          subcategoriesByParent.get(category._id.toString()) || [];

        // Update product counts for subcategories and attach sub-subcategories
        const subcategoriesWithCount = await Promise.all(
          subcategories.map(async (subcategory: any) => {
            let subProductCount = 0;
            try {
              subProductCount = await Product.countDocuments({
                category: { $regex: subcategory.name, $options: "i" },
              });
            } catch (productError) {
              console.error(
                "Error counting products for subcategory:",
                subcategory.name,
                productError
              );
            }

            // Get sub-subcategories for this subcategory
            const subSubcategories =
              subSubcategoriesByParent.get(subcategory._id.toString()) || [];

            // Update product counts for sub-subcategories
            const subSubcategoriesWithCount = await Promise.all(
              subSubcategories.map(async (subSubcategory: any) => {
                let subSubProductCount = 0;
                try {
                  subSubProductCount = await Product.countDocuments({
                    category: { $regex: subSubcategory.name, $options: "i" },
                  });
                } catch (productError) {
                  console.error(
                    "Error counting products for sub-subcategory:",
                    subSubcategory.name,
                    productError
                  );
                }
                return {
                  ...subSubcategory,
                  productCount: subSubProductCount,
                };
              })
            );

            return {
              ...subcategory,
              productCount: subProductCount,
              subcategories: subSubcategoriesWithCount,
            };
          })
        );

        return {
          ...category,
          productCount,
          subcategories: subcategoriesWithCount,
        };
      })
    );

    console.log(
      `✅ Successfully fetched ${categoriesWithCount.length} categories for ${logPrefix}`
    );
    res.json(categoriesWithCount);
  } catch (error: any) {
    console.error("❌ Error in getCategoriesWithSubcategories:", error.message);
    console.error(error.stack);

    if (error.name === "MongooseError" || error.name === "MongoError") {
      res.status(503);
      throw new Error("Database query failed. Please try again.");
    }

    throw error;
  }
});

// @desc    Get category by slug
// @route   GET /api/categories/:slug
// @access  Public
const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await Category.findOne({
    slug: req.params.slug,
    isActive: true,
  }).populate({
    path: "subcategories",
    match: { isActive: true },
    options: { sort: { displayOrder: 1, name: 1 } },
  });

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  // Get product count for this category
  const productCount = await Product.countDocuments({
    category: { $regex: category.name, $options: "i" },
  });

  res.json({
    ...category.toObject(),
    productCount,
  });
});

// @desc    Create a new category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req: MulterRequest, res) => {
  const { name, description, parentCategoryId, displayOrder, imageUrl } =
    req.body;

  // Check if category already exists
  const existingCategory = await Category.findOne({ name });
  if (existingCategory) {
    res.status(400);
    throw new Error("Category with this name already exists");
  }

  let finalImageUrl = imageUrl || "";
  let imagePublicId = "";

  // If imageUrl is provided, extract public_id from it
  if (finalImageUrl) {
    try {
      // Extract public_id from Cloudinary URL
      const urlParts = finalImageUrl.split("/");
      const publicIdWithExtension = urlParts[urlParts.length - 1];
      imagePublicId = publicIdWithExtension.split(".")[0];
    } catch (error) {
      console.error("Error extracting public_id:", error);
    }
  }

  const categoryData: any = {
    name,
    description,
    displayOrder: displayOrder ? parseInt(displayOrder) : 0,
    image: finalImageUrl,
    imagePublicId,
  };

  // If parent category is specified, set it
  if (parentCategoryId && parentCategoryId.trim() !== "") {
    if (!mongoose.Types.ObjectId.isValid(parentCategoryId)) {
      res.status(400);
      throw new Error("Invalid parent category ID");
    }

    const parentCategory = await Category.findById(parentCategoryId);
    if (!parentCategory) {
      res.status(404);
      throw new Error("Parent category not found");
    }

    categoryData.parentCategory = parentCategoryId;
  }

  const category = new Category(categoryData);
  const createdCategory = await category.save();

  // If this is a subcategory, add it to parent's subcategories array
  if (parentCategoryId) {
    await Category.findByIdAndUpdate(parentCategoryId, {
      $addToSet: { subcategories: createdCategory._id },
    });
  }

  res.status(201).json(createdCategory);
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = asyncHandler(async (req: MulterRequest, res) => {
  const { name, description, displayOrder, isActive, imageUrl } = req.body;

  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  // Handle new image URL
  let finalImageUrl = category.image;
  let finalImagePublicId = category.imagePublicId;

  if (imageUrl) {
    // Delete old image from Cloudinary if it exists
    if (category.imagePublicId) {
      try {
        await deleteFromCloudinary(category.imagePublicId);
      } catch (error) {
        console.error("Error deleting old image:", error);
      }
    }

    finalImageUrl = imageUrl;

    // Extract public_id from Cloudinary URL
    try {
      const urlParts = imageUrl.split("/");
      const publicIdWithExtension = urlParts[urlParts.length - 1];
      finalImagePublicId = publicIdWithExtension.split(".")[0];
    } catch (error) {
      console.error("Error extracting public_id:", error);
    }
  }

  category.name = name || category.name;
  category.description = description || category.description;
  category.displayOrder =
    displayOrder !== undefined ? parseInt(displayOrder) : category.displayOrder;
  category.isActive = isActive !== undefined ? isActive : category.isActive;
  category.image = finalImageUrl;
  category.imagePublicId = finalImagePublicId;

  const updatedCategory = await category.save();
  res.json(updatedCategory);
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
  try {
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      res.status(503);
      throw new Error("Database not connected");
    }

    const category = await Category.findById(req.params.id).maxTimeMS(5000);

    if (!category) {
      res.status(404);
      throw new Error("Category not found");
    }

    // Check if category has products
    let productCount = 0;
    try {
      productCount = await Product.countDocuments({
        category: { $regex: category.name, $options: "i" },
      }).maxTimeMS(5000);
    } catch (error) {
      console.error("Error counting products:", error);
      // Continue with deletion if product count fails
    }

    if (productCount > 0) {
      res.status(400);
      throw new Error("Cannot delete category with existing products");
    }

    // Check if category has subcategories
    let subcategoriesCount = 0;
    try {
      subcategoriesCount = await Subcategory.countDocuments({
        parentCategory: category._id,
      }).maxTimeMS(5000);
    } catch (error) {
      console.error("Error counting subcategories:", error);
      // Continue with deletion if subcategory count fails
    }

    if (subcategoriesCount > 0) {
      res.status(400);
      throw new Error("Cannot delete category with subcategories");
    }

    // Delete image from Cloudinary
    if (category.imagePublicId) {
      try {
        await deleteFromCloudinary(category.imagePublicId);
      } catch (error) {
        console.error("Error deleting image from Cloudinary:", error);
      }
    }

    // Remove from parent category's subcategories array if it's a subcategory
    if (category.parentCategory) {
      try {
        await Category.findByIdAndUpdate(category.parentCategory, {
          $pull: { subcategories: category._id },
        }).maxTimeMS(5000);
      } catch (error) {
        console.error("Error updating parent category:", error);
      }
    }

    await Category.findByIdAndDelete(req.params.id).maxTimeMS(5000);
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error in deleteCategory:", error);
    throw error;
  }
});

// @desc    Get category tree structure
// @route   GET /api/categories/tree
// @access  Public
const getCategoryTree = asyncHandler(async (req, res) => {
  try {
    // Get all categories
    const allCategories = await Category.find({ isActive: true }).sort({
      displayOrder: 1,
      name: 1,
    });

    // Build tree structure
    const categoryMap = new Map();
    const rootCategories: any[] = [];

    // First pass: create map of all categories
    allCategories.forEach((category) => {
      categoryMap.set(category._id.toString(), {
        ...category.toObject(),
        subcategories: [],
      });
    });

    // Second pass: build tree structure
    allCategories.forEach((category) => {
      const categoryObj = categoryMap.get(category._id.toString());

      if (category.parentCategory) {
        const parent = categoryMap.get(category.parentCategory.toString());
        if (parent) {
          parent.subcategories.push(categoryObj);
        }
      } else {
        rootCategories.push(categoryObj);
      }
    });

    res.json(rootCategories);
  } catch (error) {
    res.status(500);
    throw new Error("Error building category tree");
  }
});


export {
  getCategories,
  getCategoriesWithSubcategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryTree,
};