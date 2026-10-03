import mongoose from 'mongoose';
import { ORDER_STATUSES, PAYMENT_METHODS, PAYMENT_STATUSES } from '../constants.js';
import { jsonPlugin } from '../utils/helpers.js';

const itemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String, slug: String, image: String,
    unitPrice: Number, quantity: Number, lineTotal: Number,
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    customer: {
      name: { type: String, required: true }, phone: { type: String, required: true }, email: { type: String, required: true },
      address: { type: String, required: true }, city: { type: String, required: true }, province: { type: String, required: true },
      postalCode: { type: String, default: '' },
    },
    items: { type: [itemSchema], required: true },
    subtotal: Number, deliveryFee: Number, total: Number,
    paymentMethod: { type: String, enum: PAYMENT_METHODS, required: true },
    paymentStatus: { type: String, enum: PAYMENT_STATUSES, default: 'Unpaid' },
    paymentRef: { type: String, default: '' },
    status: { type: String, enum: ORDER_STATUSES, default: 'Pending' },
    notes: { type: String, default: '' },
  },
  { timestamps: true },
);
orderSchema.index({ createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.plugin(jsonPlugin);

export const Order = mongoose.model('Order', orderSchema);
