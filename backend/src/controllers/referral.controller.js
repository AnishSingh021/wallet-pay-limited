const Referral = require('../models/Referral');
const User = require('../models/User');

/**
 * @desc    Get current user's referral code and stats
 * @route   GET /api/referrals/my-code
 * @access  Auth
 */
const getMyCode = async (req, res) => {
  const user = await User.findById(req.user.id).select('referralCode referralCount');
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  // Count referrals by status
  const [totalReferred, activeCount, pendingCount] = await Promise.all([
    Referral.countDocuments({ referrerId: req.user.id }),
    Referral.countDocuments({ referrerId: req.user.id, status: 'active' }),
    Referral.countDocuments({ referrerId: req.user.id, status: 'pending' }),
  ]);

  res.json({
    success: true,
    data: {
      referralCode: user.referralCode,
      stats: {
        totalReferred,
        activeCount,
        pendingCount,
      },
    },
  });
};

/**
 * @desc    List all referrals made by the current user
 * @route   GET /api/referrals/list
 * @access  Auth
 */
const listReferrals = async (req, res) => {
  const referrals = await Referral.find({ referrerId: req.user.id })
    .sort({ createdAt: -1 })
    .populate('referredId', 'displayName email photoURL isApproved');

  res.json({
    success: true,
    data: referrals,
  });
};

module.exports = { getMyCode, listReferrals };
