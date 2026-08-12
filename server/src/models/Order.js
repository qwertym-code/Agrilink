import mongoose from 'mongoose';

export const PAYMENT_METHODS = ['cod', 'card'];
export const ORDER_STATUSES = ['placed', 'confirmed', 'out-for-delivery', 'delivered', 'cancelled'];

/**
 * A line item copies the product's name, price, and unit at the moment of
 * ordering. Referencing the live product instead would mean a retailer editing
 * a price silently rewrites what past customers were charged.
 */
const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    retailer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    unit: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    quantity: { type: Number, required: true, min: [1, 'Quantity must be at least 1'] },

    // Fulfilment is tracked per line, not per order, because one basket can
    // hold produce from several farms. A single order-level flag would let one
    // retailer mark another farm's items delivered.
    fulfilled: { type: Boolean, default: false },
    fulfilledAt: { type: Date },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    consumer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    items: {
      type: [orderItemSchema],
      validate: [(items) => items.length > 0, 'An order needs at least one item'],
    },

    // All three are computed on the server from database prices.
    subtotal: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },

    deliveryAddress: {
      line1: { type: String, required: [true, 'Delivery address is required'], trim: true },
      city: { type: String, required: [true, 'City is required'], trim: true },
      pincode: {
        type: String,
        required: [true, 'PIN code is required'],
        trim: true,
        match: [/^\d{6}$/, 'Enter a valid 6-digit PIN code'],
      },
    },

    paymentMethod: {
      type: String,
      required: true,
      enum: { values: PAYMENT_METHODS, message: 'Unsupported payment method' },
      default: 'cod',
    },

    /**
     * 'pending'   — cash on delivery, genuinely unpaid until handover.
     * 'simulated' — card/UPI demo. NOTHING was charged. Recorded explicitly so
     *               no report can mistake a demo order for a real payment.
     */
    paymentStatus: {
      type: String,
      enum: ['pending', 'simulated'],
      default: 'pending',
    },

    status: {
      type: String,
      enum: { values: ORDER_STATUSES, message: 'Unknown order status' },
      default: 'placed',
      index: true,
    },

    /**
     * Recorded, not just flagged. "Cancelled" without a reason leaves both
     * sides guessing — the buyer doesn't know whether to reorder, and the
     * farmer can't tell a stock problem from a change of mind.
     */
    cancellation: {
      reason: { type: String, trim: true, maxlength: [300, 'Keep the reason under 300 characters'] },
      at: { type: Date },
      by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      byRole: { type: String, enum: ['consumer', 'retailer', 'admin'] },
    },
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);
