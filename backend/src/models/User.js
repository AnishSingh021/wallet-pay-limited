const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES } = require('../config/constants');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      select: false, // Never include in queries by default
    },
    displayName: {
      type: String,
      required: [true, 'Display name is required'],
      trim: true,
      minlength: 2,
      maxlength: 60,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    photoURL: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.MEMBER,
    },

    // ── Referral ──
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    referredBy: {
      type: String,
      default: '',
    },

    // ── Attendance Stats ──
    attendanceCount: { type: Number, default: 0, min: 0 },
    currentStreak: { type: Number, default: 0, min: 0 },
    longestStreak: { type: Number, default: 0, min: 0 },
    lastAttendance: { type: Date, default: null },

    // ── Referral Stats ──
    referralCount: { type: Number, default: 0, min: 0 },

    // ── Rewards ──
    rewardEligible: { type: Boolean, default: false },

    // ── Account Status ──
    isApproved: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    // ── Department ──
    department: { type: String, default: 'General' },

    // ── Payment Details ──
    paymentMethod: { type: String, enum: ['UPI', 'QR', 'BANK', 'NONE'], default: 'NONE' },
    upiId: { type: String, trim: true, default: '' },
    qrImage: { type: String, default: '' }, // URL or path
    bankName: { type: String, trim: true, default: '' },
    accountNumber: { type: String, trim: true, default: '' },
    ifsc: { type: String, trim: true, default: '' },
    accountHolder: { type: String, trim: true, default: '' },
    
    paymentVerified: { type: Boolean, default: false },
    paymentStatus: { type: String, enum: ['Pending', 'Verified', 'Rejected', 'None', 'Paid'], default: 'None' },
    paymentUpdatedAt: { type: Date },

    // ── Refresh Token (single-device approach) ──
    refreshToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.passwordHash;
        delete ret.refreshToken;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ── Pre-save: Hash password ──
userSchema.pre('save', async function () {
  if (!this.isModified('passwordHash')) return;
  const salt = await bcrypt.genSalt(12);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

// ── Instance method: Compare password ──
userSchema.methods.comparePassword = async function (candidatePassword) {
  // Need to explicitly select passwordHash since it's excluded by default
  const user = await mongoose.model('User').findById(this._id).select('+passwordHash');
  if (!user) return false;
  return bcrypt.compare(candidatePassword, user.passwordHash);
};

// ── Static: Find by email with password ──
userSchema.statics.findByEmailWithPassword = function (email) {
  return this.findOne({ email }).select('+passwordHash +refreshToken');
};

module.exports = mongoose.model('User', userSchema);
