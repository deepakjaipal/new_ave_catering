import mongoose, { Document, Schema } from 'mongoose';

export interface IOffer extends Document {
  code: string;
  name: string;
  description: string;
  discountType: 'percentage' | 'fixed' | 'shipping';
  discountValue: number;
  minPurchase: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  validFrom: Date;
  validTo: Date;
  status: 'active' | 'scheduled' | 'expired' | 'disabled';
  applicableTo: 'all' | 'new_customers' | 'vip_customers' | 'specific_customers';
  specificCustomers?: string[];
  totalRevenue: number;
  createdAt: Date;
  updatedAt: Date;
}

const offerSchema = new Schema<IOffer>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed', 'shipping'],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    minPurchase: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    maxDiscount: {
      type: Number,
      min: 0,
    },
    usageLimit: {
      type: Number,
      min: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    validFrom: {
      type: Date,
      required: true,
    },
    validTo: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'scheduled', 'expired', 'disabled'],
      default: 'active',
    },
    applicableTo: {
      type: String,
      enum: ['all', 'new_customers', 'vip_customers', 'specific_customers'],
      default: 'all',
    },
    specificCustomers: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    totalRevenue: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
offerSchema.index({ code: 1 });
offerSchema.index({ status: 1 });
offerSchema.index({ validFrom: 1, validTo: 1 });

// Virtual for checking if offer is currently valid
offerSchema.virtual('isValid').get(function() {
  const now = new Date();
  return this.validFrom <= now && this.validTo >= now && this.status === 'active';
});

// Virtual for checking if offer has usage limit reached
offerSchema.virtual('isUsageLimitReached').get(function() {
  return this.usageLimit && this.usedCount >= this.usageLimit;
});

// Pre-save middleware to update status based on dates
offerSchema.pre('save', function(next) {
  const now = new Date();
  
  if (this.status !== 'disabled') {
    if (this.validTo < now) {
      this.status = 'expired';
    } else if (this.validFrom > now) {
      this.status = 'scheduled';
    } else {
      this.status = 'active';
    }
  }
  
  next();
});

const Offer = mongoose.model<IOffer>('Offer', offerSchema);

export default Offer;
