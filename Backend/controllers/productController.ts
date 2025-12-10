
import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import { Request } from "express";
import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js";
import Subcategory from "../models/subcategoryModel.js";
import SubSubcategory from "../models/subSubcategoryModel.js";
import Order from "../models/orderModel.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../config/cloudinary.js";

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// @desc    Fetch all products with optional category filtering
// @route   GET /api/products?category=categoryName
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const { category, search, page = 1, limit = 20 } = req.query;

  // Build query object
  const query: any = {};

  // Add category filter if provided
  if (category) {
    query.category = { $regex: category, $options: "i" }; // Case-insensitive search
  }

  // Add search filter if provided
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { brand: { $regex: search, $options: "i" } },
      { sku: { $regex: search, $options: "i" } },
    ];
  }

  // Calculate pagination
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  // Get total count for pagination
  const total = await Product.countDocuments(query);

  // Fetch products with filters and pagination
  const products = await Product.find(query)
    .limit(limitNum)
    .skip(skip)
    .sort({ createdAt: -1 });

  res.json({
    products,
    pagination: {
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      hasNext: pageNum < Math.ceil(total / limitNum),
      hasPrev: pageNum > 1,
      total,
    },
  });
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(404);
    throw new Error("Product not found");
  }
  const product = await Product.findById(req.params.id);

  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req: MulterRequest, res) => {
  const {
    name,
    sku,
    category,
    subcategory,
    subSubcategory,
    brand,
    price,
    pricePerCase,
    packSize,
    unit,
    description,
    stockQuantity,
    minStock,
  } = req.body;

  // Check if product with this SKU already exists
  const existingProduct = await Product.findOne({ sku });
  if (existingProduct) {
    res.status(400);
    throw new Error("Product with this SKU already exists");
  }

  // Validate category exists in our category system
  let categoryName = category;
  let categoryId = null;
  let subcategoryId = null;
  let subSubcategoryId = null;

  // If subSubcategory is provided, validate the full hierarchy
  if (subSubcategory) {
    const subSubcategoryDoc = await SubSubcategory.findOne({ 
      name: { $regex: new RegExp(`^${subSubcategory}$`, 'i') },
      isActive: true 
    });
    
    if (!subSubcategoryDoc) {
      res.status(400);
      throw new Error(`Sub-subcategory "${subSubcategory}" not found or inactive`);
    }
    
    subSubcategoryId = subSubcategoryDoc._id;
    categoryName = subSubcategoryDoc.name;
    
    // Get parent subcategory
    const parentSubcategory = await Subcategory.findById(subSubcategoryDoc.parentSubcategory);
    if (parentSubcategory) {
      subcategoryId = parentSubcategory._id;
      
      // Get parent category
      const parentCategory = await Category.findById(parentSubcategory.parentCategory);
      if (parentCategory) {
        categoryId = parentCategory._id;
      }
    }
  }
  // If subcategory is provided, validate the hierarchy
  else if (subcategory) {
    const subcategoryDoc = await Subcategory.findOne({ 
      name: { $regex: new RegExp(`^${subcategory}$`, 'i') },
      isActive: true 
    });
    
    if (!subcategoryDoc) {
      res.status(400);
      throw new Error(`Subcategory "${subcategory}" not found or inactive`);
    }
    
    subcategoryId = subcategoryDoc._id;
    categoryName = subcategoryDoc.name;
    
    // Get parent category
    const parentCategory = await Category.findById(subcategoryDoc.parentCategory);
    if (parentCategory) {
      categoryId = parentCategory._id;
    }
  }
  // If only main category is provided, validate it
  else if (category) {
    const categoryDoc = await Category.findOne({ 
      name: { $regex: new RegExp(`^${category}$`, 'i') },
      isActive: true 
    });
    
    if (!categoryDoc) {
      res.status(400);
      throw new Error(`Category "${category}" not found or inactive`);
    }
    
    categoryId = categoryDoc._id;
    categoryName = categoryDoc.name;
  } else {
    res.status(400);
    throw new Error("Category is required");
  }

  let imageUrl = "";
  let imagePublicId = "";

  // Handle image upload to Cloudinary
  if (req.file && req.file.buffer && req.file.buffer.length > 0) {
    try {
      console.log(`Uploading image for product: ${name}, Size: ${req.file.buffer.length} bytes`);
      
      const uploadResult = await uploadToCloudinary(req.file.buffer, {
        folder: "ave-catering/products",
        public_id: `product_${sku}_${Date.now()}`,
        transformation: [
          { width: 800, height: 800, crop: "limit" },
          { quality: "auto" },
          { format: "auto" },
        ],
      });

      imageUrl = uploadResult.secure_url;
      imagePublicId = uploadResult.public_id;
      console.log(`Image uploaded successfully: ${imageUrl}`);
    } catch (error: any) {
      console.error("Cloudinary upload error:", error);
      res.status(400);
      throw new Error(`Image upload failed: ${error.message || 'Unknown error'}`);
    }
  } else {
    // Make image optional - use placeholder if no valid file provided
    console.log(`No valid image file for product: ${name}, using placeholder`);
    imageUrl = `https://placehold.co/400x400/8B5CF6/white?text=${encodeURIComponent(name)}&fontsize=16`;
    imagePublicId = "";
  }

  const product = new Product({
    name,
    sku,
    category: categoryName, // Store the actual category name for backward compatibility
    brand,
    price: parseFloat(price),
    pricePerCase: parseFloat(pricePerCase),
    packSize,
    unit,
    description,
    image: imageUrl,
    imagePublicId,
    stockQuantity: parseInt(stockQuantity) || 0,
    inStock: parseInt(stockQuantity) > 0,
    // Store category IDs for future reference
    categoryId,
    subcategoryId,
    subSubcategoryId,
  });

  const createdProduct = await product.save();
  
  // Update category product counts
  try {
    if (categoryId) {
      await Category.findByIdAndUpdate(categoryId, { $inc: { productCount: 1 } });
    }
    if (subcategoryId) {
      await Subcategory.findByIdAndUpdate(subcategoryId, { $inc: { productCount: 1 } });
    }
    if (subSubcategoryId) {
      await SubSubcategory.findByIdAndUpdate(subSubcategoryId, { $inc: { productCount: 1 } });
    }
  } catch (error) {
    console.error("Error updating category product counts:", error);
    // Don't fail the product creation if count update fails
  }

  res.status(201).json(createdProduct);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req: MulterRequest, res) => {
  const {
    name,
    sku,
    category,
    brand,
    price,
    pricePerCase,
    packSize,
    unit,
    description,
    stockQuantity,
  } = req.body;

  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Handle new image upload
  let imageUrl = product.image;
  let imagePublicId = product.imagePublicId;

  if (req.file) {
    try {
      // Delete old image from Cloudinary if it exists
      if (product.imagePublicId) {
        await deleteFromCloudinary(product.imagePublicId);
      }

      // Upload new image
      const uploadResult = await uploadToCloudinary(req.file.buffer, {
        folder: "ave-catering/products",
        public_id: `product_${sku || product.sku}_${Date.now()}`,
        transformation: [
          { width: 800, height: 800, crop: "limit" },
          { quality: "auto" },
          { format: "auto" },
        ],
      });

      imageUrl = uploadResult.secure_url;
      imagePublicId = uploadResult.public_id;
    } catch (error) {
      res.status(400);
      throw new Error("Image upload failed");
    }
  }

  product.name = name || product.name;
  product.sku = sku || product.sku;
  product.category = category || product.category;
  product.brand = brand || product.brand;
  product.price = price ? parseFloat(price) : product.price;
  product.pricePerCase = pricePerCase
    ? parseFloat(pricePerCase)
    : product.pricePerCase;
  product.packSize = packSize || product.packSize;
  product.unit = unit || product.unit;
  product.description = description || product.description;
  product.image = imageUrl;
  product.imagePublicId = imagePublicId;
  product.stockQuantity =
    stockQuantity !== undefined
      ? parseInt(stockQuantity)
      : product.stockQuantity;
  product.inStock = product.stockQuantity > 0;

  const updatedProduct = await product.save();
  res.json(updatedProduct);
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    // Store category IDs before deletion for count updates
    const categoryId = product.categoryId;
    const subcategoryId = product.subcategoryId;
    const subSubcategoryId = product.subSubcategoryId;

    // Delete image from Cloudinary
    if (product.imagePublicId) {
      try {
        await deleteFromCloudinary(product.imagePublicId);
      } catch (error) {
        console.error("Error deleting image from Cloudinary:", error);
        // Continue with product deletion even if image deletion fails
      }
    }

    // Delete the product
    await Product.findByIdAndDelete(req.params.id);

    // Update category product counts
    try {
      if (categoryId) {
        await Category.findByIdAndUpdate(categoryId, { $inc: { productCount: -1 } });
      }
      if (subcategoryId) {
        await Subcategory.findByIdAndUpdate(subcategoryId, { $inc: { productCount: -1 } });
      }
      if (subSubcategoryId) {
        await SubSubcategory.findByIdAndUpdate(subSubcategoryId, { $inc: { productCount: -1 } });
      }
    } catch (error) {
      console.error("Error updating category product counts:", error);
      // Don't fail the deletion if count update fails
    }

    console.log(`✅ Product "${product.name}" deleted successfully`);
    res.json({ 
      message: "Product deleted successfully",
      deletedProduct: {
        id: product._id,
        name: product.name,
        sku: product.sku
      }
    });
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    throw error;
  }
});

// @desc    Get all unique product categories (for backward compatibility)
// @route   GET /api/products/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Product.distinct("category");
  const categoriesWithCount = await Promise.all(
    categories.map(async (category) => {
      const count = await Product.countDocuments({ category });
      return { name: category, count };
    })
  );

  res.json(categoriesWithCount);
});

// @desc    Get available categories for product creation
// @route   GET /api/products/categories/available
// @access  Public
const getAvailableCategories = asyncHandler(async (req, res) => {
  try {
    // Get all active categories with their subcategories
    const categories = await Category.find({ isActive: true })
      .sort({ displayOrder: 1, name: 1 })
      .lean();

    const subcategories = await Subcategory.find({ isActive: true })
      .sort({ displayOrder: 1, name: 1 })
      .lean();

    const subSubcategories = await SubSubcategory.find({ isActive: true })
      .sort({ displayOrder: 1, name: 1 })
      .lean();

    // Group subcategories by parent category
    const subcategoriesByParent = new Map();
    subcategories.forEach((subcategory) => {
      const parentId = subcategory.parentCategory.toString();
      if (!subcategoriesByParent.has(parentId)) {
        subcategoriesByParent.set(parentId, []);
      }
      subcategoriesByParent.get(parentId).push(subcategory);
    });

    // Group sub-subcategories by parent subcategory
    const subSubcategoriesByParent = new Map();
    subSubcategories.forEach((subSubcategory) => {
      const parentId = subSubcategory.parentSubcategory.toString();
      if (!subSubcategoriesByParent.has(parentId)) {
        subSubcategoriesByParent.set(parentId, []);
      }
      subSubcategoriesByParent.get(parentId).push(subSubcategory);
    });

    // Build the complete hierarchy
    const categoriesWithSubcategories = categories.map((category) => {
      const categorySubcategories = subcategoriesByParent.get(category._id.toString()) || [];
      
      const subcategoriesWithSubSubcategories = categorySubcategories.map((subcategory: any) => {
        const subSubcategories = subSubcategoriesByParent.get(subcategory._id.toString()) || [];
        return {
          ...subcategory,
          subcategories: subSubcategories,
        };
      });

      return {
        ...category,
        subcategories: subcategoriesWithSubSubcategories,
      };
    });

    res.json(categoriesWithSubcategories);
  } catch (error) {
    console.error("Error fetching available categories:", error);
    res.status(500);
    throw new Error("Error fetching available categories");
  }
});

// @desc    Get top selling products
// @route   GET /api/products/top-selling
// @access  Public
const getTopSellingProducts = asyncHandler(async (req, res) => {
  const { limit = 20 } = req.query;

  // Get top selling products from order data
  const topSellingProducts = await Order.aggregate([
    { $unwind: '$orderItems' },
    {
      $group: {
        _id: '$orderItems.product',
        productName: { $first: '$orderItems.name' },
        productImage: { $first: '$orderItems.image' },
        productPrice: { $first: '$orderItems.price' },
        productPackSize: { $first: '$orderItems.packSize' },
        productUnit: { $first: '$orderItems.unit' },
        totalSold: { $sum: '$orderItems.quantity' },
        totalRevenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
        orderCount: { $sum: 1 }
      }
    },
    { $sort: { totalSold: -1 } },
    { $limit: parseInt(limit as string) }
  ]);

  // Get full product details for top selling products
  const productIds = topSellingProducts.map(item => item._id);
  const products = await Product.find({ _id: { $in: productIds } });

  // Merge order data with product details
  const topSellingWithDetails = topSellingProducts.map(orderData => {
    const product = products.find(p => p._id.toString() === orderData._id.toString());
    return {
      _id: orderData._id,
      name: orderData.productName,
      image: orderData.productImage,
      price: orderData.productPrice,
      packSize: orderData.productPackSize,
      unit: orderData.productUnit,
      category: product?.category || 'Unknown',
      brand: product?.brand || 'Unknown',
      description: product?.description || '',
      inStock: product?.inStock || true,
      isFeatured: product?.isFeatured || false,
      isOnOffer: product?.isOnOffer || false,
      stockQuantity: product?.stockQuantity || 0,
      // Sales data
      totalSold: orderData.totalSold,
      totalRevenue: orderData.totalRevenue,
      orderCount: orderData.orderCount
    };
  });

  res.json({
    products: topSellingWithDetails,
    total: topSellingWithDetails.length
  });
});

export {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getAvailableCategories,
  getTopSellingProducts,
};
