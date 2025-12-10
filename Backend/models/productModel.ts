import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true }, // Store category name for backward compatibility
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" }, // Reference to main category
    subcategoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Subcategory" }, // Reference to subcategory
    subSubcategoryId: { type: mongoose.Schema.Types.ObjectId, ref: "SubSubcategory" }, // Reference to sub-subcategory
    price: { type: Number, required: true },
    pricePerCase: { type: Number, required: true },
    unit: { type: String, required: true },
    packSize: { type: String, required: true },
    image: { type: String, required: true },
    imagePublicId: { type: String }, // Store Cloudinary public ID for deletion
    description: { type: String, required: true },
    inStock: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    isOnOffer: { type: Boolean, default: false },
    brand: { type: String, required: true },
    sku: { type: String, required: true, unique: true },
    stockQuantity: { type: Number, default: 0, required: true },
    reviews: [reviewSchema],
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
