import mongoose, { Document, Schema } from 'mongoose';

export interface IBanner extends Document {
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  badge?: string;
  link?: string;
  buttonText?: string;
  order: number;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const bannerSchema = new Schema<IBanner>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      required: true,
    },
    badge: {
      type: String,
      trim: true,
    },
    link: {
      type: String,
      trim: true,
    },
    buttonText: {
      type: String,
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
bannerSchema.index({ order: 1 });
bannerSchema.index({ isActive: 1 });
bannerSchema.index({ startDate: 1, endDate: 1 });

// Virtual for checking if banner is currently valid based on dates
bannerSchema.virtual('isValid').get(function() {
  const now = new Date();
  if (!this.isActive) return false;
  if (this.startDate && this.startDate > now) return false;
  if (this.endDate && this.endDate < now) return false;
  return true;
});

// Pre-save middleware to ensure at least one banner has order 0
bannerSchema.pre('save', async function(next) {
  if (this.isNew && this.order === 0) {
    const existingBanners = await mongoose.model('Banner').countDocuments();
    if (existingBanners > 0) {
      this.order = existingBanners;
    }
  }
  next();
});

const Banner = mongoose.model<IBanner>('Banner', bannerSchema);

export default Banner;

