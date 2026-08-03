const RewardHistory = require('../models/RewardHistory');
const User = require('../models/User');
const { PAGINATION } = require('../config/constants');

/**
 * @desc    Get current user's reward history
 * @route   GET /api/rewards/history
 * @access  Auth
 */
const getHistory = async (req, res) => {
  const {
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT,
    status,
  } = req.query;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(parseInt(limit) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);

  const filter = { userId: req.user.id };
  if (status) filter.status = status;

  const [rewards, total] = await Promise.all([
    RewardHistory.find(filter)
      .sort({ awardedAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    RewardHistory.countDocuments(filter),
  ]);

  // Calculate summary
  const summary = await RewardHistory.aggregate([
    { $match: { userId: req.user.id } },
    {
      $group: {
        _id: '$status',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
  ]);

  // Convert ObjectId for aggregate match
  const mongoose = require('mongoose');
  const summaryResult = await RewardHistory.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(req.user.id) } },
    {
      $group: {
        _id: '$status',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
  ]);

  const summaryMap = {};
  summaryResult.forEach((s) => {
    summaryMap[s._id] = { total: s.total, count: s.count };
  });

  res.json({
    success: true,
    data: rewards,
    summary: summaryMap,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  });
};

/**
 * @desc    Get all rewards (admin)
 * @route   GET /api/rewards/admin/all
 * @access  Admin
 */
const adminGetAll = async (req, res) => {
  const {
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT,
    status,
    userId,
  } = req.query;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(parseInt(limit) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);

  const filter = {};
  if (status) filter.status = status;
  if (userId) filter.userId = userId;

  const [rewards, total] = await Promise.all([
    RewardHistory.find(filter)
      .sort({ awardedAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate('userId', 'displayName email photoURL'),
    RewardHistory.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: rewards,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  });
};

/**
 * @desc    Create a reward for a user (admin)
 * @route   POST /api/rewards/admin/create
 * @access  Admin
 */
const adminCreate = async (req, res) => {
  const { userId, amount, period, note } = req.body;

  // Verify user exists
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  const reward = await RewardHistory.create({
    userId,
    amount,
    period,
    note: note || '',
    status: 'pending',
    awardedAt: new Date(),
  });

  res.status(201).json({
    success: true,
    message: `Reward of ₹${amount} created for ${user.displayName}.`,
    data: reward,
  });
};

/**
 * @desc    Update reward status (admin)
 * @route   PATCH /api/rewards/admin/:id/status
 * @access  Admin
 */
const adminUpdateStatus = async (req, res) => {
  const { status } = req.body;

  const reward = await RewardHistory.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  ).populate('userId', 'displayName email');

  if (!reward) {
    return res.status(404).json({ success: false, message: 'Reward not found.' });
  }

  res.json({
    success: true,
    message: `Reward status updated to "${status}".`,
    data: reward,
  });
};

module.exports = { getHistory, adminGetAll, adminCreate, adminUpdateStatus };
