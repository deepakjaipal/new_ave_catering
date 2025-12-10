import asyncHandler from "express-async-handler";
import multer from "multer";
import * as XLSX from 'xlsx';
import { Request, Response } from "express";
import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js";
import { uploadToCloudinary } from "../config/cloudinary.js";

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// Configure multer for Excel file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// @desc    Upload Excel file for data import
// @route   POST /api/import/upload
// @access  Private/Admin
const uploadExcelFile = asyncHandler(async (req: MulterRequest, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }

  try {
    // Parse Excel file
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    res.json({
      message: 'File uploaded successfully',
      data: jsonData.slice(0, 10), // Return first 10 rows for preview
      totalRows: jsonData.length,
      columns: Object.keys(jsonData[0] || {})
    });
  } catch (error) {
    res.status(400);
    throw new Error('Error parsing Excel file: ' + (error instanceof Error ? error.message : String(error)));
  }
});

// @desc    Import categories from Excel data
// @route   POST /api/import/categories
// @access  Private/Admin
const importCategories = asyncHandler(async (req, res) => {
  const { data, categoryColumn = 'Category' } = req.body;

  if (!data || !Array.isArray(data)) {
    res.status(400);
    throw new Error('Invalid data format');
  }

  try {
    // Extract unique categories
    const categories = [...new Set(data.map(row => row[categoryColumn]).filter(Boolean))];
    
    const createdCategories = [];
    const existingCategories = [];

    for (const categoryName of categories) {
      // Check if category already exists
      const existingCategory = await Category.findOne({ name: categoryName });
      
      if (existingCategory) {
        existingCategories.push(existingCategory);
      } else {
        // Create new category
        const newCategory = await Category.create({
          name: categoryName,
          description: `Imported category: ${categoryName}`,
          slug: categoryName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          isActive: true
        });
        createdCategories.push(newCategory);
      }
    }

    res.json({
      message: 'Categories imported successfully',
      created: createdCategories.length,
      existing: existingCategories.length,
      categories: [...createdCategories, ...existingCategories]
    });
  } catch (error) {
    res.status(400);
    throw new Error('Error importing categories: ' + (error instanceof Error ? error.message : String(error)));
  }
});

// @desc    Import products from Excel data
// @route   POST /api/import/products
// @access  Private/Admin
const importProducts = asyncHandler(async (req, res) => {
  const { 
    data, 
    columnMapping = {
      name: 'Product Name',
      category: 'Category',
      brand: 'Brand',
      price: 'Price',
      sku: 'SKU',
      description: 'Description',
      packSize: 'Pack Size',
      unit: 'Unit'
    }
  } = req.body;

  if (!data || !Array.isArray(data)) {
    res.status(400);
    throw new Error('Invalid data format');
  }

  try {
    const createdProducts = [];
    const existingProducts = [];
    const errors = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      try {
        // Map Excel columns to product fields
        const productData = {
          name: row[columnMapping.name] || '',
          category: row[columnMapping.category] || '',
          brand: row[columnMapping.brand] || '',
          price: parseFloat(row[columnMapping.price]) || 0,
          pricePerCase: parseFloat(row[columnMapping.pricePerCase]) || parseFloat(row[columnMapping.price]) || 0,
          sku: row[columnMapping.sku] || '',
          description: row[columnMapping.description] || '',
          packSize: row[columnMapping.packSize] || '1 unit',
          unit: row[columnMapping.unit] || 'ea',
          stockQuantity: parseInt(row[columnMapping.stockQuantity]) || 0,
          inStock: true,
          isFeatured: false,
          isOnOffer: false,
          image: 'https://placehold.co/400x400/006e9d/white?text=' + encodeURIComponent(row[columnMapping.name] || 'Product')
        };

        // Validate required fields
        if (!productData.name || !productData.category || !productData.brand) {
          errors.push(`Row ${i + 1}: Missing required fields (name, category, brand)`);
          continue;
        }

        // Check if product already exists (by SKU or name)
        const existingProduct = await Product.findOne({
          $or: [
            { sku: productData.sku },
            { name: productData.name }
          ]
        });

        if (existingProduct) {
          existingProducts.push(existingProduct);
        } else {
          // Create new product
          const newProduct = await Product.create(productData);
          createdProducts.push(newProduct);
        }
      } catch (error) {
        errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    res.json({
      message: 'Products import completed',
      created: createdProducts.length,
      existing: existingProducts.length,
      errors: errors.length,
      errorDetails: errors.slice(0, 10), // Return first 10 errors
      products: [...createdProducts, ...existingProducts]
    });
  } catch (error) {
    res.status(400);
    throw new Error('Error importing products: ' + (error instanceof Error ? error.message : String(error)));
  }
});

// @desc    Get import preview
// @route   POST /api/import/preview
// @access  Private/Admin
const getImportPreview = asyncHandler(async (req, res) => {
  const { data, type = 'products' } = req.body;

  if (!data || !Array.isArray(data)) {
    res.status(400);
    throw new Error('Invalid data format');
  }

  try {
    let preview: any[] = [];
    
    if (type === 'categories') {
      const categories = [...new Set(data.map(row => row.Category || row.category).filter(Boolean))];
      preview = categories.map(category => ({
        name: category,
        slug: category.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        description: `Imported category: ${category}`,
        isActive: true
      }));
    } else if (type === 'products') {
      preview = data.slice(0, 10).map((row, index) => ({
        name: row['Product Name'] || row.name || '',
        category: row.Category || row.category || '',
        brand: row.Brand || row.brand || '',
        price: parseFloat(row.Price || row.price) || 0,
        sku: row.SKU || row.sku || '',
        description: row.Description || row.description || '',
        packSize: row['Pack Size'] || row.packSize || '1 unit',
        unit: row.Unit || row.unit || 'ea',
        stockQuantity: parseInt(row['Stock Quantity'] || row.stockQuantity) || 0
      }));
    }

    res.json({
      message: 'Preview generated successfully',
      preview,
      totalRows: data.length,
      columns: Object.keys(data[0] || {})
    });
  } catch (error) {
    res.status(400);
    throw new Error('Error generating preview: ' + (error instanceof Error ? error.message : String(error)));
  }
});

export {
  upload,
  uploadExcelFile,
  importCategories,
  importProducts,
  getImportPreview
};