import mongoose from "mongoose";

const subcategorySchema = new mongoose.Schema(
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
      required: true 
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
      default: 1
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
subcategorySchema.index({ slug: 1 });
subcategorySchema.index({ parentCategory: 1 });
subcategorySchema.index({ isActive: 1, displayOrder: 1 });
subcategorySchema.index({ level: 1 });
subcategorySchema.index({ path: 1 });

// Pre-save middleware to generate slug and calculate level/path
subcategorySchema.pre('save', async function(next) {
  if (this.isModified('name') || this.isNew) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .trim();
  }

  // Calculate level and path based on parent category
  if (this.parentCategory) {
    const parent = await mongoose.model('Category').findById(this.parentCategory);
    if (parent) {
      this.level = parent.level + 1;
      this.path = parent.path ? `${parent.path}/${parent.slug}` : parent.slug;
    }
  } else {
    this.level = 1;
    this.path = '';
  }

  next();
});

// Ensure slug is always generated
subcategorySchema.pre('validate', function(next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .trim();
  }
  next();
});

const Subcategory = mongoose.model("Subcategory", subcategorySchema);

export default Subcategory;