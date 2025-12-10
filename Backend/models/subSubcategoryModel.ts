import mongoose from "mongoose";

const subSubcategorySchema = new mongoose.Schema(
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
    parentSubcategory: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Subcategory", 
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
      default: 2
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
subSubcategorySchema.index({ slug: 1 });
subSubcategorySchema.index({ parentSubcategory: 1 });
subSubcategorySchema.index({ isActive: 1, displayOrder: 1 });
subSubcategorySchema.index({ level: 1 });
subSubcategorySchema.index({ path: 1 });

// Pre-save middleware to generate slug and calculate level/path
subSubcategorySchema.pre('save', async function(next) {
  if (this.isModified('name') || this.isNew) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .trim();
  }

  // Calculate level and path based on parent subcategory
  if (this.parentSubcategory) {
    const parent = await mongoose.model('Subcategory').findById(this.parentSubcategory);
    if (parent) {
      this.level = parent.level + 1;
      this.path = parent.path ? `${parent.path}/${parent.slug}` : parent.slug;
    }
  } else {
    // Sub-subcategories must have a parent subcategory
    this.level = 2; 
    this.path = '';
  }

  next();
});

// Ensure slug is always generated
subSubcategorySchema.pre('validate', function(next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .trim();
  }
  next();
});

const SubSubcategory = mongoose.model("SubSubcategory", subSubcategorySchema);

export default SubSubcategory;