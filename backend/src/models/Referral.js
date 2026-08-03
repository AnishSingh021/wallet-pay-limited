const mongoose = require('mongoose');
const { REFERRAL_STATUS } = require('../config/constants');

const referralSchema = new mongoose.Schema(
  {
    referrerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    referrerCode: {
      type: String,
      required: true,
    },
    referredId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    referredName: {
      type: String,
      required: true,
      trim: true,
    },
    referredEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(REFERRAL_STATUS),
      default: REFERRAL_STATUS.PENDING,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Referral', referralSchema);
