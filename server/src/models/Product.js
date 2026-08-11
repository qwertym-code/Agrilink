import mongoose from 'mongoose';

export const CATEGORIES = ['vegetables', 'fruits', 'dairy', 'bakery', 'other'];

// Badges shown as corner labels on the product cards.
export const TAGS = ['organic', 'local', 'sale', 'fresh-today', 'new'];

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [120, 'Name cannot exceed 120 characters'],
    },

    description: { type: String, trim: true, maxlength: [1000, 'Description is too long'] },

    // Rupees. Stored as a plain number: this marketplace deals in whole and
    // half rupees, so float precision is not a concern at these magnitudes.
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },

    // Free text because produce is sold every which way: "250g / Bunch",
    // "1 bunch (approx. 1lb)", "per head". An enum here would fight reality.
    unit: { type: String, trim: true, default: '1 unit', maxlength: 60 },

    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: { values: CATEGORIES, message: 'Unknown category' },
      index: true,
    },

    imageUrl: { type: String, trim: true, default: '' },

    tags: [{ type: String, enum: { values: TAGS, message: 'Unknown tag' } }],

    stock: { type: Number, default: 0, min: [0, 'Stock cannot be negative'] },

    retailer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    rating: { type: Number, default: 0, min: 0, max: 5 },

    // Soft delete. Orders reference products, so removing a row outright would
    // leave past orders pointing at nothing.
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

// Backs the search box on the home screen.
productSchema.index({ name: 'text', description: 'text' });

export default mongoose.model('Product', productSchema);
