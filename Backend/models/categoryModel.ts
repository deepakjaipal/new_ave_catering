import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true
    },
    slug: { 
      type: String, 
      required: true
    },
    description: { 
      type: String 
    },
    image: { 
      type: String 
    },
    imagePublicId: { 
      type: String 
    },
    parentCategory: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Category", 
      default: null 
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
    displayOrder: { 
      type: Number, 
      default: 0 
    },
    productCount: {
      type: Number,
      default: 0
    },
    level: {
      type: Number,
      default: 0
    },
    path: {
      type: String,
      default: ''
    }
  },
  { 
    timestamps: true 
  }
);

// Index for better query performance
categorySchema.index({ slug: 1 });
categorySchema.index({ parentCategory: 1 });
categorySchema.index({ isActive: 1, displayOrder: 1 });
categorySchema.index({ level: 1 });
categorySchema.index({ path: 1 });

// Pre-save middleware to generate slug and calculate level/path
categorySchema.pre('save', async function(next) {
  if (this.isModified('name') || this.isNew) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .trim();
  }

  // Calculate level and path based on parent category
  if (this.parentCategory) {
    const parent = await Category.findById(this.parentCategory);
    if (parent) {
      this.level = parent.level + 1;
      this.path = parent.path ? `${parent.path}/${parent.slug}` : parent.slug;
    }
  } else {
    this.level = 0;
    this.path = '';
  }

  next();
});

// Ensure slug is always generated
categorySchema.pre('validate', function(next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .trim();
  }
  next();
});

// Virtual for subcategories
categorySchema.virtual('subcategories', {
  ref: 'Subcategory',
  localField: '_id',
  foreignField: 'parentCategory'
});

// Ensure virtual fields are serialized
categorySchema.set('toJSON', { virtuals: true });
categorySchema.set('toObject', { virtuals: true });

const Category = mongoose.model("Category", categorySchema);

export default Category;
