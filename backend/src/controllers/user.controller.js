const User = require('../models/User');
const Referral = require('../models/Referral');
const { ROLES, REFERRAL_STATUS, PAGINATION } = require('../config/constants');

/**
 * @desc    Get current user's profile
 * @route   GET /api/users/me
 * @access  Auth
 */
const getProfile = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }
  res.json({ success: true, data: user });
};

/**
 * @desc    Update current user's profile
 * @route   PUT /api/users/me
 * @access  Auth
 */
const updateProfile = async (req, res) => {
  const { displayName, phone } = req.body;
  const updateData = {};

  if (displayName !== undefined) updateData.displayName = displayName;
  if (phone !== undefined) updateData.phone = phone;

  // Handle photo upload
  if (req.file) {
    updateData.photoURL = `/uploads/photos/${req.file.filename}`;
  }

  const user = await User.findByIdAndUpdate(req.user.id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  res.json({ success: true, message: 'Profile updated.', data: user });
};

/**
 * @desc    List all users (admin)
 * @route   GET /api/users
 * @access  Admin
 */
const listUsers = async (req, res) => {
  const {
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT,
    role,
    isApproved,
    search,
  } = req.query;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(parseInt(limit) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);

  const filter = {};
  if (role) filter.role = role;
  if (isApproved !== undefined) filter.isApproved = isApproved === 'true';
  if (search) {
    filter.$or = [
      { displayName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    User.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: users,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  });
};

/**
 * @desc    Approve a pending user
 * @route   PATCH /api/users/:id/approve
 * @access  Admin
 */
const approveUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  if (user.isApproved) {
    return res.status(400).json({ success: false, message: 'User is already approved.' });
  }

  user.isApproved = true;
  user.isActive = true;
  await user.save();

  // If this user was referred, activate the referral and update referrer's count
  if (user.referredBy) {
    const referral = await Referral.findOne({ referredId: user._id });
    if (referral && referral.status === REFERRAL_STATUS.PENDING) {
      referral.status = REFERRAL_STATUS.ACTIVE;
      await referral.save();

      await User.findByIdAndUpdate(referral.referrerId, {
        $inc: { referralCount: 1 },
      });
    }
  }

  res.json({ success: true, message: 'User approved.', data: user });
};

/**
 * @desc    Reject a pending user
 * @route   PATCH /api/users/:id/reject
 * @access  Admin
 */
const rejectUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: false, isApproved: false },
    { new: true }
  );

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  res.json({ success: true, message: 'User rejected.', data: user });
};

/**
 * @desc    Update current user's payment details
 * @route   PUT /api/users/me/payment
 * @access  Auth
 */
const updatePaymentDetails = async (req, res) => {
  const { paymentMethod, upiId, bankName, accountNumber, ifsc, accountHolder, qrImage } = req.body;
  const updateData = { paymentMethod, paymentStatus: 'Pending', paymentUpdatedAt: new Date() };

  if (paymentMethod === 'UPI') updateData.upiId = upiId;
  if (paymentMethod === 'BANK') {
    updateData.bankName = bankName;
    updateData.accountNumber = accountNumber;
    updateData.ifsc = ifsc;
    updateData.accountHolder = accountHolder;
  }
  if (paymentMethod === 'QR' && qrImage) {
    updateData.qrImage = qrImage;
  }

  const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true, runValidators: true });
  res.json({ success: true, message: 'Payment details updated.', data: user });
};

/**
 * @desc    Upload QR Image
 * @route   POST /api/users/me/payment/qr
 * @access  Auth
 */
const uploadQRImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image uploaded.' });
  }
  const qrImage = `/uploads/qr/${req.file.filename}`;
  res.json({ success: true, message: 'QR Image uploaded.', data: { qrImage } });
};

/**
 * @desc    List users with their payment details (Admin)
 * @route   GET /api/users/admin/payments
 * @access  Admin
 */
const listPaymentDetails = async (req, res) => {
  const users = await User.find({ paymentMethod: { $ne: 'NONE' } }).sort({ paymentUpdatedAt: -1 });
  res.json({ success: true, data: users });
};

/**
 * @desc    Verify/Approve/Reject user payment details (Admin)
 * @route   PUT /api/users/:id/payment/verify
 * @access  Admin
 */
const verifyPaymentDetails = async (req, res) => {
  const { status } = req.body; // 'Verified' or 'Rejected'
  if (!['Verified', 'Rejected'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { paymentStatus: status, paymentVerified: status === 'Verified' },
    { new: true }
  );

  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  res.json({ success: true, message: `Payment details ${status.toLowerCase()}.`, data: user });
};

module.exports = { 
  getProfile, updateProfile, listUsers, approveUser, rejectUser,
  updatePaymentDetails, uploadQRImage, listPaymentDetails, verifyPaymentDetails
};
