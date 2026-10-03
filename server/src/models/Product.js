import mongoose from 'mongoose';
import { CATEGORIES } from '../constants.js';
import { jsonPlugin, slugify } from '../utils/helpers.js';

const specSchema = new mongoose.Schema(
  { label: { type: String, required: true, trim: true, maxlength: 60 }, value: { type: String, required: true, trim: true, maxlength: 200 } },
  { _id: false },
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true },
    sku: { type: String, trim: true, maxlength: 40, default: '' },
    category: { type: String, enum: CATEGORIES, default: 'Vehicles' },
    shortDescription: { type: String, trim: true, maxlength: 200, default: '' },
    description: { type: String, trim: true, maxlength: 4000, default: '' },
    price: { type: Number, required: true, min: 0 }, // whole PKR
    image: { url: { type: String, default: '' }, publicId: { type: String, default: '' } },
    specifications: { type: [specSchema], default: [] },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);
productSchema.index({ isActive: 1, sortOrder: 1, createdAt: -1 });
productSchema.plugin(jsonPlugin);

productSchema.statics.uniqueSlug = async function (name, excludeId) {
  const base = slugify(name) || 'product';
  let slug = base;
  for (let i = 2; await this.exists({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) }); i++) slug = `${base}-${i}`;
  return slug;
};

export const Product = mongoose.model('Product', productSchema);
