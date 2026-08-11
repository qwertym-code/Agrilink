import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import normalizePhone from '../utils/normalizePhone.js';

// Consumers have no farm. These fields are required only for retailers, so the
// validator reads the role off the document being saved.
function isRetailer() {
  return this.role === 'retailer';
}

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address'],
    },

    // Stored as bare 10 digits — see the pre('validate') hook below.
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'],
    },

    // `select: false` keeps the hash out of every incidental query. The login
    // controller is the one place that opts back in with .select('+password').
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },

    role: {
      type: String,
      required: [true, 'Please choose whether you are a consumer or a retailer'],
      // 'admin' is deliberately not obtainable through signup — the register
      // controller whitelists consumer/retailer. Admins are promoted only by
      // the make-admin script, which needs database credentials to run.
      enum: {
        values: ['consumer', 'retailer', 'admin'],
        message: 'Role must be either consumer or retailer',
      },
    },

    farmName: {
      type: String,
      trim: true,
      maxlength: [120, 'Farm name cannot exceed 120 characters'],
      required: [isRetailer, 'Farm / shop name is required for retailers'],
    },

    location: {
      type: String,
      trim: true,
      maxlength: [120, 'Location cannot exceed 120 characters'],
      required: [isRetailer, 'Location is required for retailers'],
    },
  },
  { timestamps: true }
);

// Normalize before validation so the format check and the unique index both
// see the canonical 10-digit form.
userSchema.pre('validate', function normalizePhoneField(next) {
  if (this.phone) this.phone = normalizePhone(this.phone);
  next();
});

// Guarded by isModified so later profile updates don't re-hash the hash.
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Last line of defence: even if a query selects the hash, it never serializes.
userSchema.set('toJSON', {
  transform(doc, ret) {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model('User', userSchema);
