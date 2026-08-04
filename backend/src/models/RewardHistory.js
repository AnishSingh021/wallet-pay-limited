const mongoose = require('mongoose');
const { REWARD_STATUS } = require('../config/constants');

const rewardHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Reward amount is required'],
      min: [0, 'Amount must be positive'],
    },
    period: {
      type: String,
      required: [true, 'Period is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(REWARD_STATUS),
      default: REWARD_STATUS.PENDING,
    },
    awardedAt: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      trim: true,
      default: '',
    },
    reason: {
      type: String,
      trim: true,
      default: 'Reward Earned',
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed'],
      default: 'Pending',
    },
    paymentMethod: {
      type: String,
      default: 'NONE',
    },
    paymentDate: {
      type: Date,
      default: null,
    },
    transactionId: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('RewardHistory', rewardHistorySchema);
